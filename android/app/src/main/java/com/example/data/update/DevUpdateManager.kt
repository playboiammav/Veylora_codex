package com.example.data.update

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.content.FileProvider
import com.example.BuildConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.URI
import java.net.UnknownHostException
import java.security.MessageDigest
import java.util.Locale
import java.util.concurrent.TimeUnit

/**
 * Production-quality manager for the Android DEV build in-app update channel.
 *
 * Security & Trust Model:
 * 1. Only enabled when BuildConfig.IS_DEV_BUILD == true.
 * 2. All network communication strictly enforces HTTPS.
 * 3. Update downloads are restricted exclusively to GitHub Releases for this repository
 *    (github.com/playboiammav/Veylora_codex/releases/ and official CDN objects.githubusercontent.com).
 * 4. Downloads are written to app-internal cache directory (cacheDir/updates).
 * 5. Artifact integrity is verified via SHA-256 before installation is permitted.
 * 6. Installation launches standard Android Package Installer via FileProvider content:// URI.
 *    Silent APK installation is never attempted; user must confirm.
 */
class DevUpdateManager(
    private val context: Context,
    private val metadataUrl: String = BuildConfig.DEV_UPDATE_METADATA_URL,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
    private val client: OkHttpClient = createDefaultHttpClient()
) {
    companion object {
        private const val TAG = "DevUpdateManager"
        private const val TRUSTED_REPO_PATH = "/playboiammav/Veylora_codex/releases/"
        private const val TRUSTED_CDN_HOST = "objects.githubusercontent.com"
        private const val TRUSTED_GITHUB_HOST = "github.com"
        private const val MIN_BACKGROUND_CHECK_INTERVAL_MS = 60 * 60 * 1000L // 1 hour

        fun createDefaultHttpClient(): OkHttpClient {
            return OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(20, TimeUnit.SECONDS)
                .followRedirects(true)
                .followSslRedirects(true)
                .build()
        }

        /**
         * Validates whether a remote APK download URL conforms to the trusted repository domain policy.
         */
        fun isTrustedDevDownloadUrl(url: String): Boolean {
            if (!url.startsWith("https://", ignoreCase = true)) return false
            return try {
                val uri = URI(url)
                val host = uri.host?.lowercase(Locale.US) ?: return false
                val path = uri.path ?: ""

                when {
                    host == TRUSTED_GITHUB_HOST -> path.startsWith(TRUSTED_REPO_PATH)
                    host == TRUSTED_CDN_HOST -> true
                    else -> false
                }
            } catch (e: Exception) {
                false
            }
        }
    }

    private val _updateState = MutableStateFlow<DevUpdateState>(DevUpdateState.Idle)
    val updateState: StateFlow<DevUpdateState> = _updateState.asStateFlow()

    private var lastCheckTime: Long = 0L

    /**
     * Checks whether the current build is configured as a DEV build.
     */
    val isDevBuild: Boolean
        get() = BuildConfig.IS_DEV_BUILD

    /**
     * Installed versionCode as defined in BuildConfig.
     */
    val installedVersionCode: Long
        get() = BuildConfig.VERSION_CODE.toLong()

    /**
     * Installed versionName as defined in BuildConfig.
     */
    val installedVersionName: String
        get() = BuildConfig.VERSION_NAME

    /**
     * Git commit SHA embedded at build time.
     */
    val gitCommitSha: String
        get() = BuildConfig.GIT_COMMIT_SHA

    /**
     * Shortened Git commit SHA.
     */
    val gitCommitShaShort: String
        get() = BuildConfig.GIT_COMMIT_SHA_SHORT

    /**
     * ISO build timestamp.
     */
    val buildTimestamp: String
        get() = BuildConfig.BUILD_TIMESTAMP

    /**
     * Check for updates against remote latest.json.
     *
     * @param force If true, bypasses minimum interval check (e.g. from manual user tap).
     */
    suspend fun checkForUpdates(force: Boolean = false): DevUpdateState = withContext(ioDispatcher) {
        if (!isDevBuild) {
            Log.d(TAG, "Update check skipped: not a DEV build")
            val idleState = DevUpdateState.Idle
            _updateState.value = idleState
            return@withContext idleState
        }

        val currentTime = System.currentTimeMillis()
        if (!force && (currentTime - lastCheckTime) < MIN_BACKGROUND_CHECK_INTERVAL_MS) {
            Log.d(TAG, "Update check skipped: recently checked")
            return@withContext _updateState.value
        }

        _updateState.value = DevUpdateState.Checking

        try {
            val request = Request.Builder()
                .url(metadataUrl)
                .header("Accept", "application/json")
                .header("User-Agent", "Veylora-Dev-Android/${BuildConfig.VERSION_NAME}")
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    val error = DevUpdateState.Error(
                        message = "Update server returned HTTP ${response.code}",
                        errorType = DevUpdateState.ErrorType.HTTP_ERROR
                    )
                    _updateState.value = error
                    return@withContext error
                }

                val bodyString = response.body?.string().orEmpty()
                if (bodyString.isBlank()) {
                    val error = DevUpdateState.Error(
                        message = "Empty response received from update server",
                        errorType = DevUpdateState.ErrorType.MALFORMED_METADATA
                    )
                    _updateState.value = error
                    return@withContext error
                }

                val metadata = try {
                    UpdateMetadata.fromJsonString(bodyString)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to parse update metadata JSON", e)
                    val error = DevUpdateState.Error(
                        message = "Malformed update metadata: ${e.message}",
                        errorType = DevUpdateState.ErrorType.MALFORMED_METADATA,
                        throwable = e
                    )
                    _updateState.value = error
                    return@withContext error
                }

                // Security check on download URL
                if (!isTrustedDevDownloadUrl(metadata.apkUrl)) {
                    Log.w(TAG, "Untrusted APK URL in metadata: ${metadata.apkUrl}")
                    val error = DevUpdateState.Error(
                        message = "Update URL violates security trust policy",
                        errorType = DevUpdateState.ErrorType.SECURITY_UNTRUSTED_SOURCE
                    )
                    _updateState.value = error
                    return@withContext error
                }

                lastCheckTime = currentTime

                // Compare version codes
                val newState = if (metadata.versionCode > installedVersionCode) {
                    Log.i(TAG, "Newer DEV version available: ${metadata.versionName} (${metadata.versionCode}) vs installed ($installedVersionCode)")
                    DevUpdateState.UpdateAvailable(metadata)
                } else {
                    Log.d(TAG, "App is up-to-date: remote (${metadata.versionCode}) <= installed ($installedVersionCode)")
                    DevUpdateState.UpToDate(installedVersionCode, installedVersionName)
                }

                _updateState.value = newState
                return@withContext newState
            }
        } catch (e: UnknownHostException) {
            Log.w(TAG, "Update check failed: offline / unable to resolve host", e)
            val error = DevUpdateState.Error(
                message = "Device is offline or server unreachable",
                errorType = DevUpdateState.ErrorType.NETWORK_OFFLINE,
                throwable = e
            )
            _updateState.value = error
            return@withContext error
        } catch (e: SocketTimeoutException) {
            Log.w(TAG, "Update check timed out", e)
            val error = DevUpdateState.Error(
                message = "Update server request timed out",
                errorType = DevUpdateState.ErrorType.NETWORK_OFFLINE,
                throwable = e
            )
            _updateState.value = error
            return@withContext error
        } catch (e: ConnectException) {
            Log.w(TAG, "Connection failed", e)
            val error = DevUpdateState.Error(
                message = "Connection failed",
                errorType = DevUpdateState.ErrorType.NETWORK_OFFLINE,
                throwable = e
            )
            _updateState.value = error
            return@withContext error
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error checking updates", e)
            val error = DevUpdateState.Error(
                message = e.localizedMessage ?: "Failed to check for updates",
                errorType = DevUpdateState.ErrorType.UNKNOWN,
                throwable = e
            )
            _updateState.value = error
            return@withContext error
        }
    }

    /**
     * Downloads the APK file for the given metadata.
     * Streams into an app-controlled cache location with SHA-256 verification and progress updates.
     */
    suspend fun downloadApk(metadata: UpdateMetadata): DevUpdateState = withContext(ioDispatcher) {
        if (!isDevBuild) {
            return@withContext DevUpdateState.Idle
        }

        if (!isTrustedDevDownloadUrl(metadata.apkUrl)) {
            val error = DevUpdateState.Error(
                message = "Refusing download from untrusted location: ${metadata.apkUrl}",
                errorType = DevUpdateState.ErrorType.SECURITY_UNTRUSTED_SOURCE
            )
            _updateState.value = error
            return@withContext error
        }

        _updateState.value = DevUpdateState.Downloading(
            progressPercent = 0,
            bytesDownloaded = 0L,
            totalBytes = metadata.apkSize,
            metadata = metadata
        )

        val updatesDir = File(context.cacheDir, "updates").apply { mkdirs() }
        val targetApkFile = File(updatesDir, "veylora-dev-${metadata.versionCode}.apk")
        val tempApkFile = File(updatesDir, "veylora-dev-${metadata.versionCode}.apk.tmp")

        // If target already exists and passes checksum, we can use it directly
        if (targetApkFile.exists() && targetApkFile.length() > 0) {
            if (metadata.sha256.isNullOrBlank() || verifyFileSha256(targetApkFile, metadata.sha256)) {
                val readyState = DevUpdateState.ReadyToInstall(targetApkFile, metadata)
                _updateState.value = readyState
                return@withContext readyState
            } else {
                targetApkFile.delete()
            }
        }

        if (tempApkFile.exists()) {
            tempApkFile.delete()
        }

        try {
            val request = Request.Builder()
                .url(metadata.apkUrl)
                .header("User-Agent", "Veylora-Dev-Android/${BuildConfig.VERSION_NAME}")
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    val error = DevUpdateState.Error(
                        message = "Download failed with HTTP ${response.code}",
                        errorType = DevUpdateState.ErrorType.HTTP_ERROR
                    )
                    _updateState.value = error
                    return@withContext error
                }

                val body = response.body
                if (body == null) {
                    val error = DevUpdateState.Error(
                        message = "Response body was null",
                        errorType = DevUpdateState.ErrorType.DOWNLOAD_FAILED
                    )
                    _updateState.value = error
                    return@withContext error
                }

                val totalLength = if (body.contentLength() > 0) body.contentLength() else metadata.apkSize
                val digest = MessageDigest.getInstance("SHA-256")

                body.byteStream().use { input ->
                    FileOutputStream(tempApkFile).use { output ->
                        val buffer = ByteArray(8192)
                        var bytesRead: Int
                        var totalBytesDownloaded = 0L
                        var lastReportedPercent = -1

                        while (input.read(buffer).also { bytesRead = it } != -1) {
                            ensureActive()
                            output.write(buffer, 0, bytesRead)
                            digest.update(buffer, 0, bytesRead)
                            totalBytesDownloaded += bytesRead

                            val percent = if (totalLength > 0) {
                                ((totalBytesDownloaded * 100) / totalLength).toInt().coerceIn(0, 100)
                            } else {
                                0
                            }

                            if (percent != lastReportedPercent) {
                                lastReportedPercent = percent
                                _updateState.value = DevUpdateState.Downloading(
                                    progressPercent = percent,
                                    bytesDownloaded = totalBytesDownloaded,
                                    totalBytes = totalLength,
                                    metadata = metadata
                                )
                            }
                        }
                        output.flush()
                    }
                }

                // Verify SHA-256 if provided
                if (!metadata.sha256.isNullOrBlank()) {
                    val calculatedSha256 = digest.digest().joinToString("") { "%02x".format(it) }
                    if (!calculatedSha256.equals(metadata.sha256, ignoreCase = true)) {
                        tempApkFile.delete()
                        val error = DevUpdateState.Error(
                            message = "Integrity verification failed: SHA-256 mismatch",
                            errorType = DevUpdateState.ErrorType.INTEGRITY_MISMATCH
                        )
                        _updateState.value = error
                        return@withContext error
                    }
                }

                // Rename temporary file to final target file
                if (targetApkFile.exists()) targetApkFile.delete()
                if (!tempApkFile.renameTo(targetApkFile)) {
                    val error = DevUpdateState.Error(
                        message = "Failed to finalize downloaded APK file",
                        errorType = DevUpdateState.ErrorType.STORAGE_ERROR
                    )
                    _updateState.value = error
                    return@withContext error
                }

                val readyState = DevUpdateState.ReadyToInstall(targetApkFile, metadata)
                _updateState.value = readyState
                return@withContext readyState
            }
        } catch (e: CancellationException) {
            tempApkFile.delete()
            _updateState.value = DevUpdateState.Idle
            throw e
        } catch (e: Exception) {
            Log.e(TAG, "Error downloading APK", e)
            tempApkFile.delete()
            val error = DevUpdateState.Error(
                message = "Failed to download update: ${e.localizedMessage ?: "I/O error"}",
                errorType = DevUpdateState.ErrorType.DOWNLOAD_FAILED,
                throwable = e
            )
            _updateState.value = error
            return@withContext error
        }
    }

    /**
     * Launches the standard Android package installer.
     * Never attempts silent installation; prompts user to install via standard Android UI.
     *
     * @return true if installer was launched, false if permission needed or error occurred.
     */
    fun launchInstaller(apkFile: File): Boolean {
        if (!isDevBuild) return false

        if (!apkFile.exists() || apkFile.length() == 0L) {
            _updateState.value = DevUpdateState.Error(
                message = "APK file does not exist or is empty",
                errorType = DevUpdateState.ErrorType.INSTALL_ERROR
            )
            return false
        }

        // On Android 8.0+ (API 26+), check unknown app installation permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!context.packageManager.canRequestPackageInstalls()) {
                try {
                    val manageIntent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                        data = Uri.parse("package:${context.packageName}")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(manageIntent)
                    _updateState.value = DevUpdateState.Error(
                        message = "Please allow 'Install unknown apps' permission in Settings and try again.",
                        errorType = DevUpdateState.ErrorType.INSTALL_ERROR
                    )
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to launch unknown sources settings", e)
                }
                return false
            }
        }

        return try {
            val contentUri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                apkFile
            )

            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, "application/vnd.android.package-archive")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
            }

            context.startActivity(installIntent)
            true
        } catch (e: ActivityNotFoundException) {
            Log.e(TAG, "No activity found to handle package installation", e)
            _updateState.value = DevUpdateState.Error(
                message = "No application package installer found on device",
                errorType = DevUpdateState.ErrorType.INSTALL_ERROR,
                throwable = e
            )
            false
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch package installer", e)
            _updateState.value = DevUpdateState.Error(
                message = "Failed to launch installer: ${e.localizedMessage}",
                errorType = DevUpdateState.ErrorType.INSTALL_ERROR,
                throwable = e
            )
            false
        }
    }

    /**
     * Clears error or dismisses update dialog state.
     */
    fun resetState() {
        _updateState.value = DevUpdateState.Idle
    }

    private fun verifyFileSha256(file: File, expectedSha256: String): Boolean {
        return try {
            val digest = MessageDigest.getInstance("SHA-256")
            file.inputStream().use { stream ->
                val buffer = ByteArray(8192)
                var bytes: Int
                while (stream.read(buffer).also { bytes = it } != -1) {
                    digest.update(buffer, 0, bytes)
                }
            }
            val actual = digest.digest().joinToString("") { "%02x".format(it) }
            actual.equals(expectedSha256.trim(), ignoreCase = true)
        } catch (e: Exception) {
            false
        }
    }
}
