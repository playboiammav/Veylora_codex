package com.example.data.remote.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class RawgGamesResponse(
  @Json(name = "count") val count: Int?,
  @Json(name = "next") val next: String?,
  @Json(name = "previous") val previous: String?,
  @Json(name = "results") val results: List<RawgGameDto>?
)

@JsonClass(generateAdapter = true)
data class RawgGameDto(
  @Json(name = "id") val id: Long,
  @Json(name = "slug") val slug: String?,
  @Json(name = "name") val name: String?,
  @Json(name = "released") val released: String?,
  @Json(name = "background_image") val backgroundImage: String?,
  @Json(name = "rating") val rating: Double?,
  @Json(name = "rating_top") val ratingTop: Int?,
  @Json(name = "metacritic") val metacritic: Int?,
  @Json(name = "playtime") val playtime: Int?,
  @Json(name = "dominant_color") val dominantColor: String?,
  @Json(name = "saturated_color") val saturatedColor: String?,
  @Json(name = "parent_platforms") val parentPlatforms: List<RawgParentPlatformDto>?,
  @Json(name = "platforms") val platforms: List<RawgPlatformDetailDto>?,
  @Json(name = "genres") val genres: List<RawgGenreDto>?,
  @Json(name = "short_screenshots") val shortScreenshots: List<RawgScreenshotDto>?
)

@JsonClass(generateAdapter = true)
data class RawgParentPlatformDto(
  @Json(name = "platform") val platform: RawgPlatformDto?
)

@JsonClass(generateAdapter = true)
data class RawgPlatformDetailDto(
  @Json(name = "platform") val platform: RawgPlatformDto?,
  @Json(name = "released_at") val releasedAt: String? = null,
  @Json(name = "requirements_en") val requirementsEn: Any? = null,
  @Json(name = "requirements") val requirements: Any? = null
)

@JsonClass(generateAdapter = true)
data class RawgRequirementsDto(
  @Json(name = "minimum") val minimum: String? = null,
  @Json(name = "recommended") val recommended: String? = null
)

@JsonClass(generateAdapter = true)
data class RawgPlatformDto(
  @Json(name = "id") val id: Long,
  @Json(name = "name") val name: String?,
  @Json(name = "slug") val slug: String?
)

@JsonClass(generateAdapter = true)
data class RawgGenreDto(
  @Json(name = "id") val id: Long,
  @Json(name = "name") val name: String?,
  @Json(name = "slug") val slug: String?
)

@JsonClass(generateAdapter = true)
data class RawgScreenshotDto(
  @Json(name = "id") val id: Long,
  @Json(name = "image") val image: String?
)

@JsonClass(generateAdapter = true)
data class RawgScreenshotsResponse(
  @Json(name = "count") val count: Int?,
  @Json(name = "results") val results: List<RawgScreenshotDto>?
)

@JsonClass(generateAdapter = true)
data class RawgGameDetailResponse(
  @Json(name = "id") val id: Long,
  @Json(name = "slug") val slug: String?,
  @Json(name = "name") val name: String?,
  @Json(name = "description_raw") val descriptionRaw: String?,
  @Json(name = "description") val description: String?,
  @Json(name = "metacritic") val metacritic: Int?,
  @Json(name = "released") val released: String?,
  @Json(name = "background_image") val backgroundImage: String?,
  @Json(name = "background_image_additional") val backgroundImageAdditional: String?,
  @Json(name = "website") val website: String?,
  @Json(name = "dominant_color") val dominantColor: String?,
  @Json(name = "saturated_color") val saturatedColor: String?,
  @Json(name = "rating") val rating: Double?,
  @Json(name = "parent_platforms") val parentPlatforms: List<RawgParentPlatformDto>?,
  @Json(name = "platforms") val platforms: List<RawgPlatformDetailDto>?,
  @Json(name = "publishers") val publishers: List<RawgCompanyDto>?,
  @Json(name = "developers") val developers: List<RawgCompanyDto>?,
  @Json(name = "genres") val genres: List<RawgGenreDto>?
)

@JsonClass(generateAdapter = true)
data class RawgCompanyDto(
  @Json(name = "id") val id: Long,
  @Json(name = "name") val name: String?,
  @Json(name = "slug") val slug: String?,
  @Json(name = "image_background") val imageBackground: String?
)

@JsonClass(generateAdapter = true)
data class RawgCompanyDetailResponse(
  @Json(name = "id") val id: Long,
  @Json(name = "name") val name: String?,
  @Json(name = "slug") val slug: String?,
  @Json(name = "games_count") val gamesCount: Int?,
  @Json(name = "image_background") val imageBackground: String?,
  @Json(name = "description") val description: String?
)

@JsonClass(generateAdapter = true)
data class RawgGameStoresResponse(
  @Json(name = "count") val count: Int?,
  @Json(name = "results") val results: List<RawgStoreItemDto>?
)

@JsonClass(generateAdapter = true)
data class RawgStoreItemDto(
  @Json(name = "id") val id: Long? = null,
  @Json(name = "game_id") val gameId: Any? = null,
  @Json(name = "store_id") val storeId: Long? = null,
  @Json(name = "url") val url: String? = null
)
