package com.example.data.update

import java.io.File

/**
 * Represents the current lifecycle state of the DEV in-app update system.
 */
sealed interface DevUpdateState {
    /** Initial idle state */
    object Idle : DevUpdateState

    /** Actively checking remote update metadata */
    object Checking : DevUpdateState

    /** A newer versionCode was detected remotely */
    data class UpdateAvailable(val metadata: UpdateMetadata) : DevUpdateState

    /** Installed build is current or newer than remote */
    data class UpToDate(val installedVersionCode: Long, val installedVersionName: String) : DevUpdateState

    /** Actively downloading the APK artifact with byte progress */
    data class Downloading(
        val progressPercent: Int,
        val bytesDownloaded: Long,
        val totalBytes: Long,
        val metadata: UpdateMetadata
    ) : DevUpdateState

    /** APK download verified and ready for standard package installer launch */
    data class ReadyToInstall(
        val apkFile: File,
        val metadata: UpdateMetadata
    ) : DevUpdateState

    /** Error state with user-friendly message and category */
    data class Error(
        val message: String,
        val errorType: ErrorType = ErrorType.UNKNOWN,
        val throwable: Throwable? = null
    ) : DevUpdateState

    enum class ErrorType {
        NETWORK_OFFLINE,
        HTTP_ERROR,
        MALFORMED_METADATA,
        SECURITY_UNTRUSTED_SOURCE,
        DOWNLOAD_FAILED,
        INTEGRITY_MISMATCH,
        STORAGE_ERROR,
        INSTALL_ERROR,
        UNKNOWN
    }
}
