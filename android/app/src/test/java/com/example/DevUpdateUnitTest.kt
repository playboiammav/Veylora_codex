package com.example

import com.example.data.update.DevUpdateManager
import com.example.data.update.DevUpdateState
import com.example.data.update.UpdateMetadata
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test

class DevUpdateUnitTest {

    @Test
    fun testUpdateMetadataParsing_validCompleteJson() {
        val json = """
        {
          "versionCode": 1016,
          "versionName": "1.1.1016-dev",
          "apkUrl": "https://github.com/playboiammav/Veylora_codex/releases/download/v1.1.1016-dev/veylora-dev.apk",
          "apkName": "veylora-dev.apk",
          "apkSize": 31840430,
          "sha256": "44f13272e5ae361cbb16543150532c1b165835d88c2278454005386923ba9001",
          "releaseNotes": "Initial DEV build",
          "commitSha": "b08b9104a5e8b14195d9ac2a6069ae8a7722746b",
          "publishedAt": "2026-09-05T18:00:00Z"
        }
        """.trimIndent()

        val metadata = UpdateMetadata.fromJsonString(json)
        assertEquals(1016L, metadata.versionCode)
        assertEquals("1.1.1016-dev", metadata.versionName)
        assertEquals("https://github.com/playboiammav/Veylora_codex/releases/download/v1.1.1016-dev/veylora-dev.apk", metadata.apkUrl)
        assertEquals("veylora-dev.apk", metadata.apkName)
        assertEquals(31840430L, metadata.apkSize)
        assertEquals("44f13272e5ae361cbb16543150532c1b165835d88c2278454005386923ba9001", metadata.sha256)
        assertEquals("Initial DEV build", metadata.releaseNotes)
        assertEquals("b08b9104a5e8b14195d9ac2a6069ae8a7722746b", metadata.commitSha)
        assertEquals("2026-09-05T18:00:00Z", metadata.publishedAt)
    }

    @Test
    fun testUpdateMetadataParsing_minimalJsonDefaults() {
        val json = """
        {
          "versionCode": 500,
          "versionName": "1.0.500-dev",
          "apkUrl": "https://github.com/playboiammav/Veylora_codex/releases/download/dev-latest/veylora-dev.apk"
        }
        """.trimIndent()

        val metadata = UpdateMetadata.fromJsonString(json)
        assertEquals(500L, metadata.versionCode)
        assertEquals("1.0.500-dev", metadata.versionName)
        assertEquals("https://github.com/playboiammav/Veylora_codex/releases/download/dev-latest/veylora-dev.apk", metadata.apkUrl)
        assertEquals("veylora-dev.apk", metadata.apkName)
        assertEquals(0L, metadata.apkSize)
        assertNull(metadata.sha256)
        assertEquals("", metadata.releaseNotes)
        assertEquals("", metadata.commitSha)
        assertEquals("", metadata.publishedAt)
    }

    @Test
    fun testUpdateMetadataParsing_missingRequiredFields() {
        // Missing versionCode
        try {
            UpdateMetadata.fromJsonString("""{"versionName":"1.0.0","apkUrl":"https://..."}""")
            fail("Expected IllegalArgumentException for missing versionCode")
        } catch (e: IllegalArgumentException) {
            assertTrue(e.message?.contains("versionCode") == true)
        }

        // Missing versionName
        try {
            UpdateMetadata.fromJsonString("""{"versionCode":123,"apkUrl":"https://..."}""")
            fail("Expected IllegalArgumentException for missing versionName")
        } catch (e: IllegalArgumentException) {
            assertTrue(e.message?.contains("versionName") == true)
        }

        // Missing apkUrl
        try {
            UpdateMetadata.fromJsonString("""{"versionCode":123,"versionName":"1.0.0"}""")
            fail("Expected IllegalArgumentException for missing apkUrl")
        } catch (e: IllegalArgumentException) {
            assertTrue(e.message?.contains("apkUrl") == true)
        }
    }

    @Test
    fun testUpdateMetadata_jsonRoundTrip() {
        val original = UpdateMetadata(
            versionCode = 1050L,
            versionName = "1.1.1050-dev",
            apkUrl = "https://github.com/playboiammav/Veylora_codex/releases/download/v1.1.1050-dev/veylora-dev.apk",
            apkName = "veylora-dev.apk",
            apkSize = 25000000L,
            sha256 = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            releaseNotes = "Roundtrip test notes",
            commitSha = "1234567890123456789012345678901234567890",
            publishedAt = "2026-09-05T19:00:00Z"
        )

        val json = original.toJsonString()
        val parsed = UpdateMetadata.fromJsonString(json)
        assertEquals(original, parsed)
    }

    @Test
    fun testTrustModel_trustedDevDownloadUrls() {
        // Trusted repository release direct tag URL
        assertTrue(DevUpdateManager.isTrustedDevDownloadUrl(
            "https://github.com/playboiammav/Veylora_codex/releases/download/v1.1.1016-dev/veylora-dev.apk"
        ))

        // Trusted repository rolling tag URL
        assertTrue(DevUpdateManager.isTrustedDevDownloadUrl(
            "https://github.com/playboiammav/Veylora_codex/releases/download/dev-latest/veylora-dev.apk"
        ))

        // Trusted GitHub Release CDN redirect host
        assertTrue(DevUpdateManager.isTrustedDevDownloadUrl(
            "https://objects.githubusercontent.com/github-production-release-asset-2e65be/12345/veylora-dev.apk"
        ))
    }

    @Test
    fun testTrustModel_rejectUntrustedUrls() {
        // Unencrypted HTTP must be rejected
        assertFalse(DevUpdateManager.isTrustedDevDownloadUrl(
            "http://github.com/playboiammav/Veylora_codex/releases/download/v1.1.1016-dev/veylora-dev.apk"
        ))

        // Untrusted foreign host
        assertFalse(DevUpdateManager.isTrustedDevDownloadUrl(
            "https://evil-mirror.com/veylora-dev.apk"
        ))

        // Wrong GitHub repository
        assertFalse(DevUpdateManager.isTrustedDevDownloadUrl(
            "https://github.com/another-attacker/malicious-repo/releases/download/v1.0/update.apk"
        ))

        // Obsolete run.app / ais-dev host must be rejected
        assertFalse(DevUpdateManager.isTrustedDevDownloadUrl(
            "https://ais-dev-oi34e4dhfwkni5arkpizws-228330439328.europe-west3.run.app/veylora-dev.apk"
        ))

        // Blank or garbage URL
        assertFalse(DevUpdateManager.isTrustedDevDownloadUrl(""))
        assertFalse(DevUpdateManager.isTrustedDevDownloadUrl("not-a-url"))
    }

    @Test
    fun testVersionCodeComparisonLogic() {
        val installedVersionCode = 1016L

        // Remote has newer versionCode
        val remoteNewer = 1017L
        assertTrue(remoteNewer > installedVersionCode)

        // Remote has same versionCode (up to date)
        val remoteCurrent = 1016L
        assertFalse(remoteCurrent > installedVersionCode)

        // Remote has older versionCode (installed is newer)
        val remoteOlder = 1015L
        assertFalse(remoteOlder > installedVersionCode)
    }

    @Test
    fun testDevUpdateState_errorHierarchy() {
        val errorState = DevUpdateState.Error(
            message = "Update server unreachable",
            errorType = DevUpdateState.ErrorType.NETWORK_OFFLINE
        )
        assertEquals("Update server unreachable", errorState.message)
        assertEquals(DevUpdateState.ErrorType.NETWORK_OFFLINE, errorState.errorType)
        assertNull(errorState.throwable)
    }
}
