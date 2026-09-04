package com.example.data.remote.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class RawgRequirementsDto(
  @Json(name = "minimum") val minimum: String? = null,
  @Json(name = "recommended") val recommended: String? = null
)
