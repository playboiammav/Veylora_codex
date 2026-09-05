package com.example.data.update

import org.json.JSONObject

/**
 * Metadata contract representing an available DEV update.
 * Matches latest.json hosted statically via GitHub Releases or repository distribution.
 */
data class UpdateMetadata(
    val versionCode: Long,
    val versionName: String,
    val apkUrl: String,
    val apkName: String = "veylora-dev.apk",
    val apkSize: Long = 0L,
    val sha256: String? = null,
    val releaseNotes: String = "",
    val commitSha: String = "",
    val publishedAt: String = ""
) {
    fun toJsonString(indentSpaces: Int = 2): String {
        val obj = JSONObject().apply {
            put("versionCode", versionCode)
            put("versionName", versionName)
            put("apkUrl", apkUrl)
            put("apkName", apkName)
            put("apkSize", apkSize)
            if (sha256 != null) put("sha256", sha256)
            put("releaseNotes", releaseNotes)
            put("commitSha", commitSha)
            put("publishedAt", publishedAt)
        }
        return if (indentSpaces > 0) obj.toString(indentSpaces) else obj.toString()
    }

    companion object {
        /**
         * Safely parse an UpdateMetadata object from a JSON string.
         * Validates required contract fields (versionCode, versionName, apkUrl).
         * Throws IllegalArgumentException if required fields are missing or invalid.
         */
        fun fromJsonString(jsonString: String): UpdateMetadata {
            val obj = JSONObject(jsonString)
            if (!obj.has("versionCode")) {
                throw IllegalArgumentException("Update metadata missing required field: versionCode")
            }
            if (!obj.has("versionName") || obj.getString("versionName").isBlank()) {
                throw IllegalArgumentException("Update metadata missing required field: versionName")
            }
            if (!obj.has("apkUrl") || obj.getString("apkUrl").isBlank()) {
                throw IllegalArgumentException("Update metadata missing required field: apkUrl")
            }

            val versionCode = obj.getLong("versionCode")
            val versionName = obj.getString("versionName")
            val apkUrl = obj.getString("apkUrl")
            val apkName = obj.optString("apkName", "veylora-dev.apk")
            val apkSize = obj.optLong("apkSize", 0L)
            val sha256 = if (obj.has("sha256") && !obj.isNull("sha256")) {
                obj.getString("sha256").trim().takeIf { it.isNotBlank() }
            } else null
            val releaseNotes = obj.optString("releaseNotes", "")
            val commitSha = obj.optString("commitSha", "")
            val publishedAt = obj.optString("publishedAt", "")

            return UpdateMetadata(
                versionCode = versionCode,
                versionName = versionName,
                apkUrl = apkUrl,
                apkName = apkName,
                apkSize = apkSize,
                sha256 = sha256,
                releaseNotes = releaseNotes,
                commitSha = commitSha,
                publishedAt = publishedAt
            )
        }
    }
}
