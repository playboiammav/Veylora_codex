import com.google.gms.googleservices.GoogleServicesPlugin.MissingGoogleServicesStrategy
import java.io.File
import java.security.MessageDigest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.TimeUnit

plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.kotlin.compose)
  alias(libs.plugins.google.devtools.ksp)
  alias(libs.plugins.roborazzi)
  alias(libs.plugins.secrets)
  alias(libs.plugins.google.services)
}

fun determineGitCommitCount(): Int {
  val envCode = providers.environmentVariable("DEV_VERSION_CODE").orNull?.toIntOrNull()
  if (envCode != null) return envCode - 1000
  return try {
    providers.exec {
      commandLine("git", "rev-list", "--count", "HEAD")
      isIgnoreExitValue = true
    }.standardOutput.asText.map { it.trim().toIntOrNull() ?: 15 }.getOrElse(15)
  } catch (_: Exception) {
    15
  }
}

fun determineGitCommitSha(): String {
  val envSha = providers.environmentVariable("GIT_COMMIT_SHA").orNull?.trim()
  if (!envSha.isNullOrBlank() && envSha.length == 40) return envSha
  return try {
    providers.exec {
      commandLine("git", "rev-parse", "HEAD")
      isIgnoreExitValue = true
    }.standardOutput.asText.map {
      val sha = it.trim()
      if (sha.length == 40) sha else "unknown"
    }.getOrElse("unknown")
  } catch (_: Exception) {
    "unknown"
  }
}

val gitCommitCount = determineGitCommitCount()
val gitCommitSha = determineGitCommitSha()
val gitCommitShaShort = if (gitCommitSha.length >= 7) gitCommitSha.substring(0, 7) else gitCommitSha

val devVersionCode = (providers.environmentVariable("DEV_VERSION_CODE").orNull?.toIntOrNull()
  ?: providers.gradleProperty("devVersionCode").orNull?.toIntOrNull()
  ?: (1000 + gitCommitCount))

val devVersionName = (providers.environmentVariable("DEV_VERSION_NAME").orNull
  ?: providers.gradleProperty("devVersionName").orNull
  ?: "1.1.${devVersionCode}-dev")

val backendBaseUrl = providers.environmentVariable("BACKEND_BASE_URL").orNull
  ?: providers.gradleProperty("backendBaseUrl").orNull
  ?: "https://veylora-codex.vercel.app/"

val devUpdateMetadataUrl = providers.environmentVariable("DEV_UPDATE_METADATA_URL").orNull
  ?: providers.gradleProperty("devUpdateMetadataUrl").orNull
  ?: "https://github.com/playboiammav/Veylora_codex/releases/download/dev-latest/latest.json"

val buildTimestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
  timeZone = TimeZone.getTimeZone("UTC")
}.format(Date())

val isCi = providers.environmentVariable("CI").orNull?.equals("true", ignoreCase = true) == true
  || providers.environmentVariable("GITHUB_ACTIONS").orNull?.equals("true", ignoreCase = true) == true

val isDevSigningRequired = providers.environmentVariable("DEV_SIGNING_REQUIRED").orNull?.equals("true", ignoreCase = true) == true
  || providers.gradleProperty("devSigningRequired").orNull?.equals("true", ignoreCase = true) == true
  || isCi

val devKeystorePath = providers.environmentVariable("DEV_KEYSTORE_PATH").orNull
  ?: providers.gradleProperty("devKeystorePath").orNull
  ?: (listOf(file("${rootDir}/dev-release.jks"), file("${rootDir}/dev.keystore")).firstOrNull { it.exists() }?.absolutePath
      ?: "${rootDir}/dev-release.jks")

val devKeystorePassword = providers.environmentVariable("DEV_KEYSTORE_PASSWORD").orNull
  ?: providers.environmentVariable("DEV_STORE_PASSWORD").orNull
  ?: providers.gradleProperty("devKeystorePassword").orNull

val devKeyAlias = providers.environmentVariable("DEV_KEY_ALIAS").orNull
  ?: providers.gradleProperty("devKeyAlias").orNull
  ?: "dev"

val devKeyPassword = providers.environmentVariable("DEV_KEY_PASSWORD").orNull
  ?: providers.gradleProperty("devKeyPassword").orNull
  ?: devKeystorePassword

val hasDevSigning = file(devKeystorePath).exists() &&
  !devKeystorePassword.isNullOrBlank() &&
  !devKeyAlias.isNullOrBlank()

android {
  namespace = "com.example"
  compileSdk { version = release(36) { minorApiLevel = 1 } }

  defaultConfig {
    applicationId = "com.aistudio.cinemahub.ba90"
    minSdk = 24
    targetSdk = 36
    versionCode = 2
    versionName = "1.1.0"

    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  }

  flavorDimensions += "environment"

  signingConfigs {
    val defaultDebugKeystore = file("${System.getProperty("user.home")}/.android/debug.keystore")
    val localDebugKeystore = listOf(file("${rootDir}/debug.keystore"), defaultDebugKeystore).firstOrNull { it.exists() }
      ?: defaultDebugKeystore

    val debugSigning = create("debugConfig") {
      storeFile = localDebugKeystore
      storePassword = "android"
      keyAlias = "androiddebugkey"
      keyPassword = "android"
    }

    create("devSigning") {
      if (hasDevSigning) {
        storeFile = file(devKeystorePath)
        storePassword = devKeystorePassword
        keyAlias = devKeyAlias
        keyPassword = devKeyPassword
      } else if (!isDevSigningRequired) {
        // Safe local fallback for developers building assembleDevRelease locally without CI secrets
        storeFile = debugSigning.storeFile
        storePassword = debugSigning.storePassword
        keyAlias = debugSigning.keyAlias
        keyPassword = debugSigning.keyPassword
      } else {
        // In CI or when DEV_SIGNING_REQUIRED is set: do NOT fall back to ephemeral debug key.
        // Pointing to the expected keystore path will trigger validation failure if missing.
        storeFile = file(devKeystorePath)
        storePassword = devKeystorePassword ?: ""
        keyAlias = devKeyAlias
        keyPassword = devKeyPassword ?: ""
      }
    }

    val prodKeystorePath = providers.environmentVariable("PROD_KEYSTORE_PATH").orNull
      ?: providers.environmentVariable("KEYSTORE_PATH").orNull
      ?: "${rootDir}/my-upload-key.jks"

    val prodSigning = create("prodRelease") {
      if (file(prodKeystorePath).exists()) {
        storeFile = file(prodKeystorePath)
        storePassword = providers.environmentVariable("PROD_STORE_PASSWORD").orNull
          ?: providers.environmentVariable("STORE_PASSWORD").orNull
        keyAlias = providers.environmentVariable("PROD_KEY_ALIAS").orNull
          ?: providers.environmentVariable("KEY_ALIAS").orNull
          ?: "upload"
        keyPassword = providers.environmentVariable("PROD_KEY_PASSWORD").orNull
          ?: providers.environmentVariable("KEY_PASSWORD").orNull
      } else if (!isCi) {
        // Safe local fallback for developers building assembleProdRelease locally without prod secrets
        storeFile = debugSigning.storeFile
        storePassword = debugSigning.storePassword
        keyAlias = debugSigning.keyAlias
        keyPassword = debugSigning.keyPassword
      } else {
        storeFile = file(prodKeystorePath)
        storePassword = providers.environmentVariable("PROD_STORE_PASSWORD").orNull
          ?: providers.environmentVariable("STORE_PASSWORD").orNull
        keyAlias = providers.environmentVariable("PROD_KEY_ALIAS").orNull
          ?: providers.environmentVariable("KEY_ALIAS").orNull
          ?: "upload"
        keyPassword = providers.environmentVariable("PROD_KEY_PASSWORD").orNull
          ?: providers.environmentVariable("KEY_PASSWORD").orNull
      }
    }

    // Keep "release" config for backward compatibility with existing prod build scripts
    create("release") {
      storeFile = prodSigning.storeFile
      storePassword = prodSigning.storePassword
      keyAlias = prodSigning.keyAlias
      keyPassword = prodSigning.keyPassword
    }
  }

  productFlavors {
    create("dev") {
      dimension = "environment"
      versionCode = devVersionCode
      versionName = devVersionName
      signingConfig = signingConfigs.getByName("devSigning")
      buildConfigField("boolean", "IS_DEV_BUILD", "true")
      buildConfigField("String", "DEV_UPDATE_METADATA_URL", "\"$devUpdateMetadataUrl\"")
      buildConfigField("String", "GIT_COMMIT_SHA", "\"$gitCommitSha\"")
      buildConfigField("String", "GIT_COMMIT_SHA_SHORT", "\"$gitCommitShaShort\"")
      buildConfigField("String", "BUILD_TIMESTAMP", "\"$buildTimestamp\"")
      buildConfigField("String", "BACKEND_BASE_URL", "\"$backendBaseUrl\"")
    }
    create("prod") {
      dimension = "environment"
      signingConfig = signingConfigs.getByName("prodRelease")
      buildConfigField("boolean", "IS_DEV_BUILD", "false")
      buildConfigField("String", "DEV_UPDATE_METADATA_URL", "\"\"")
      buildConfigField("String", "GIT_COMMIT_SHA", "\"$gitCommitSha\"")
      buildConfigField("String", "GIT_COMMIT_SHA_SHORT", "\"$gitCommitShaShort\"")
      buildConfigField("String", "BUILD_TIMESTAMP", "\"$buildTimestamp\"")
      buildConfigField("String", "BACKEND_BASE_URL", "\"$backendBaseUrl\"")
    }
  }

  buildTypes {
    release {
      isCrunchPngs = false
      isMinifyEnabled = false
      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
      // signingConfig is determined by product flavors: dev uses devSigning, prod uses prodRelease
    }
    debug { signingConfig = signingConfigs.getByName("debugConfig") }
  }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
  }
  buildFeatures {
    compose = true
    buildConfig = true
  }
  testOptions { unitTests { isIncludeAndroidResources = true } }
  dependenciesInfo {
    includeInApk = false
    includeInBundle = true
  }
}

// Configure the Secrets Gradle Plugin to use .env and .env.example files
// to match the convention used in Web projects.
secrets {
  propertiesFileName = ".env"
  defaultPropertiesFileName = ".env.example"
  ignoreList.add("FIREBASE_APPCHECK_DEBUG_TOKEN")
}

googleServices { missingGoogleServicesStrategy = MissingGoogleServicesStrategy.WARN }

// Some unused dependencies are commented out below instead of being removed.
// This makes it easy to add them back in the future if needed.
dependencies {
  implementation(platform(libs.androidx.compose.bom))
  implementation(platform(libs.firebase.bom))
  implementation(libs.androidx.appcompat)
  implementation("androidx.palette:palette-ktx:1.0.0")
  implementation("com.pierfrancescosoffritti.androidyoutubeplayer:core:12.1.0")
  // implementation(libs.accompanist.permissions)
  implementation(libs.androidx.activity.compose)
  // implementation(libs.androidx.camera.camera2)
  // implementation(libs.androidx.camera.core)
  // implementation(libs.androidx.camera.lifecycle)
  // implementation(libs.androidx.camera.view)
  implementation(libs.androidx.compose.material.icons.core)
  implementation(libs.androidx.compose.material.icons.extended)
  implementation(libs.androidx.compose.material3)
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.graphics)
  implementation(libs.androidx.compose.ui.tooling.preview)
  implementation(libs.androidx.core.ktx)
  implementation(libs.androidx.datastore.preferences)
  implementation(libs.androidx.lifecycle.runtime.compose)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.lifecycle.viewmodel.compose)
  implementation(libs.androidx.navigation.compose)
  implementation(libs.androidx.room.ktx)
  implementation(libs.androidx.room.runtime)
  implementation(libs.coil.compose)
  implementation(libs.coil.svg)
  implementation(libs.converter.moshi)
  implementation(libs.converter.gson)
  implementation(libs.gson)
  implementation(libs.firebase.analytics)
  implementation(libs.firebase.ai)
  // Uncomment to use Firestore:
  implementation(libs.firebase.firestore)

  // Uncomment ALL FOUR of the following dependencies together to use Firebase Auth and Google
  // Sign-In via Credential Manager:
  implementation(libs.firebase.auth)
  implementation(libs.androidx.credentials)
  implementation(libs.androidx.credentials.play.services)
  implementation(libs.googleid)
  implementation(libs.facebook.login)
  implementation(libs.firebase.appcheck.recaptcha)
  implementation(libs.firebase.appcheck.debug)
  implementation(libs.kotlinx.coroutines.android)
  implementation(libs.kotlinx.coroutines.core)
  implementation(libs.logging.interceptor)
  implementation(libs.moshi.kotlin)
  implementation(libs.okhttp)
  // implementation(libs.play.services.location)
  implementation(libs.retrofit)
  testImplementation(libs.androidx.compose.ui.test.junit4)
  testImplementation(libs.androidx.core)
  testImplementation(libs.androidx.junit)
  testImplementation(libs.junit)
  testImplementation(libs.kotlinx.coroutines.test)
  testImplementation(libs.robolectric)
  testImplementation(libs.roborazzi)
  testImplementation(libs.roborazzi.compose)
  testImplementation(libs.roborazzi.junit.rule)
  androidTestImplementation(platform(libs.androidx.compose.bom))
  androidTestImplementation(libs.androidx.compose.ui.test.junit4)
  androidTestImplementation(libs.androidx.espresso.core)
  androidTestImplementation(libs.androidx.junit)
  androidTestImplementation(libs.androidx.runner)
  debugImplementation(libs.androidx.compose.ui.test.manifest)
  debugImplementation(libs.androidx.compose.ui.tooling)
  "ksp"(libs.androidx.room.compiler)
  "ksp"(libs.moshi.kotlin.codegen)
}

tasks.register("generateDevUpdateMetadata") {
  notCompatibleWithConfigurationCache("Ad-hoc metadata generation task accessing script context")
  group = "publishing"
  description = "Generates latest.json update contract metadata from built DEV APK"
  doLast {
    val apkDir = layout.buildDirectory.dir("outputs/apk/dev/release").get().asFile
    val fallbackDir = layout.buildDirectory.dir("outputs/apk/dev/debug").get().asFile
    val apkFile = (apkDir.listFiles() ?: emptyArray())
      .firstOrNull { it.extension == "apk" && !it.name.contains("unaligned") }
      ?: (fallbackDir.listFiles() ?: emptyArray())
        .firstOrNull { it.extension == "apk" && !it.name.contains("unaligned") }

    val sha256 = if (apkFile != null && apkFile.exists()) {
      val digest = MessageDigest.getInstance("SHA-256")
      apkFile.inputStream().use { stream ->
        val buffer = ByteArray(8192)
        var read: Int
        while (stream.read(buffer).also { read = it } != -1) {
          digest.update(buffer, 0, read)
        }
      }
      digest.digest().joinToString("") { b -> String.format("%02x", b) }
    } else {
      ""
    }

    val apkSize = apkFile?.length() ?: 0L
    val apkName = "veylora-dev.apk"
    val apkUrl = "https://github.com/playboiammav/Veylora_codex/releases/download/v${devVersionName}/${apkName}"

    val json = """
    {
      "versionCode": $devVersionCode,
      "versionName": "$devVersionName",
      "apkUrl": "$apkUrl",
      "apkName": "$apkName",
      "apkSize": $apkSize,
      "sha256": "$sha256",
      "releaseNotes": "Veylora DEV build $devVersionName (commit $gitCommitShaShort)",
      "commitSha": "$gitCommitSha",
      "publishedAt": "$buildTimestamp"
    }
    """.trimIndent()

    val outputFile = File(rootDir, "latest.json")
    outputFile.writeText(json)
    println("Generated DEV update metadata at: " + outputFile.absolutePath)
    println(json)
  }
}

gradle.taskGraph.whenReady {
  val isDevReleaseRequested = allTasks.any {
    it.name.contains("DevRelease", ignoreCase = true)
  }
  if (isDevReleaseRequested && isDevSigningRequired && !hasDevSigning) {
    throw GradleException(
      "Stable DEV signing configuration is REQUIRED for DEV release builds in CI or when DEV_SIGNING_REQUIRED=true.\n" +
      "Missing or invalid DEV signing credentials (keystore exists: ${file(devKeystorePath).exists()} at '$devKeystorePath', " +
      "password set: ${!devKeystorePassword.isNullOrBlank()}, alias: '$devKeyAlias').\n" +
      "Ephemeral debug keystore fallback is strictly forbidden for published DEV releases to preserve update compatibility across builds."
    )
  }
}

