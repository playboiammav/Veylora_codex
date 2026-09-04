package com.example.data.remote.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class VeyloraGamesResponse(
  @Json(name = "success") val success: Boolean? = true,
  @Json(name = "category") val category: String? = null,
  @Json(name = "page") val page: Int? = 1,
  @Json(name = "pageSize") val pageSize: Int? = null,
  @Json(name = "count") val count: Int? = null,
  @Json(name = "total") val total: Int? = null,
  @Json(name = "source") val source: String? = null,
  @Json(name = "data") val data: List<VeyloraGameDto>? = emptyList()
)

@JsonClass(generateAdapter = true)
data class VeyloraGameDetailResponse(
  @Json(name = "success") val success: Boolean? = true,
  @Json(name = "data") val data: VeyloraGameDto? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraGameDto(
  @Json(name = "id") val id: String,
  @Json(name = "slug") val slug: String? = null,
  @Json(name = "title") val title: String? = null,
  @Json(name = "cover") val cover: String? = null,
  @Json(name = "backdrop") val backdrop: String? = null,
  @Json(name = "rating") val rating: Double? = null,
  @Json(name = "ratingTop") val ratingTop: Int? = null,
  @Json(name = "metacritic") val metacritic: Int? = null,
  @Json(name = "ratingsCount") val ratingsCount: Int? = null,
  @Json(name = "releaseDate") val releaseDate: String? = null,
  @Json(name = "releaseYear") val releaseYear: String? = null,
  @Json(name = "platforms") val platforms: List<String>? = emptyList(),
  @Json(name = "hardwareBadges") val hardwareBadges: List<String>? = emptyList(),
  @Json(name = "genres") val genres: List<String>? = emptyList(),
  @Json(name = "developer") val developer: String? = null,
  @Json(name = "publisher") val publisher: String? = null,
  @Json(name = "description") val description: String? = null,
  @Json(name = "shortDescription") val shortDescription: String? = null,
  @Json(name = "screenshots") val screenshots: List<String>? = emptyList(),
  @Json(name = "trailers") val trailers: List<VeyloraGameTrailerDto>? = emptyList(),
  @Json(name = "stores") val stores: List<VeyloraStoreLinkDto>? = emptyList(),
  @Json(name = "publishersList") val publishersList: List<VeyloraCompanyDto>? = emptyList(),
  @Json(name = "developersList") val developersList: List<VeyloraCompanyDto>? = emptyList(),
  @Json(name = "website") val website: String? = null,
  @Json(name = "playtime") val playtime: Int? = null,
  @Json(name = "dominantColor") val dominantColor: String? = null,
  @Json(name = "saturatedColor") val saturatedColor: String? = null,
  @Json(name = "rawRequirements") val rawRequirements: VeyloraRawRequirementsDto? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraStoreLinkDto(
  @Json(name = "storeId") val storeId: String? = null,
  @Json(name = "name") val name: String? = null,
  @Json(name = "url") val url: String? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraGameTrailerDto(
  @Json(name = "id") val id: String,
  @Json(name = "name") val name: String? = null,
  @Json(name = "videoUrl") val videoUrl: String? = null,
  @Json(name = "previewImage") val previewImage: String? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraRawRequirementsDto(
  @Json(name = "minimum") val minimum: String? = null,
  @Json(name = "recommended") val recommended: String? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraMoviesResponse(
  @Json(name = "success") val success: Boolean? = true,
  @Json(name = "category") val category: String? = null,
  @Json(name = "page") val page: Int? = 1,
  @Json(name = "count") val count: Int? = null,
  @Json(name = "data") val data: List<VeyloraMovieDto>? = emptyList()
)

@JsonClass(generateAdapter = true)
data class VeyloraMovieDetailResponse(
  @Json(name = "success") val success: Boolean? = true,
  @Json(name = "data") val data: VeyloraMovieDto? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraMovieDto(
  @Json(name = "id") val id: String,
  @Json(name = "tmdbId") val tmdbId: Long? = null,
  @Json(name = "imdbId") val imdbId: String? = null,
  @Json(name = "title") val title: String? = null,
  @Json(name = "originalTitle") val originalTitle: String? = null,
  @Json(name = "poster") val poster: String? = null,
  @Json(name = "backdrop") val backdrop: String? = null,
  @Json(name = "posterPath") val posterPath: String? = null,
  @Json(name = "backdropPath") val backdropPath: String? = null,
  @Json(name = "rating") val rating: Double? = null,
  @Json(name = "voteCount") val voteCount: Int? = null,
  @Json(name = "popularity") val popularity: Double? = null,
  @Json(name = "releaseDate") val releaseDate: String? = null,
  @Json(name = "releaseYear") val releaseYear: String? = null,
  @Json(name = "genres") val genres: List<String>? = emptyList(),
  @Json(name = "overview") val overview: String? = null,
  @Json(name = "tagline") val tagline: String? = null,
  @Json(name = "runtime") val runtime: Int? = null,
  @Json(name = "formattedRuntime") val formattedRuntime: String? = null,
  @Json(name = "cast") val cast: List<VeyloraCastMemberDto>? = emptyList(),
  @Json(name = "crew") val crew: List<VeyloraCastMemberDto>? = emptyList(),
  @Json(name = "director") val director: String? = null,
  @Json(name = "companies") val companies: List<VeyloraCompanyDto>? = emptyList(),
  @Json(name = "trailers") val trailers: List<VeyloraMovieTrailerDto>? = emptyList(),
  @Json(name = "watchProviders") val watchProviders: List<VeyloraWatchProviderDto>? = emptyList()
)

@JsonClass(generateAdapter = true)
data class VeyloraCastMemberDto(
  @Json(name = "id") val id: Long? = null,
  @Json(name = "name") val name: String? = null,
  @Json(name = "character") val character: String? = null,
  @Json(name = "profileImage") val profileImage: String? = null,
  @Json(name = "role") val role: String? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraMovieTrailerDto(
  @Json(name = "id") val id: String? = null,
  @Json(name = "name") val name: String? = null,
  @Json(name = "key") val key: String? = null,
  @Json(name = "site") val site: String? = null,
  @Json(name = "type") val type: String? = null,
  @Json(name = "url") val url: String? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraWatchProviderDto(
  @Json(name = "id") val id: Int? = null,
  @Json(name = "name") val name: String? = null,
  @Json(name = "logoUrl") val logoUrl: String? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraCompanyResponse(
  @Json(name = "success") val success: Boolean? = true,
  @Json(name = "data") val data: VeyloraCompanyDto? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraCompanyDto(
  @Json(name = "id") val id: String? = null,
  @Json(name = "name") val name: String? = null,
  @Json(name = "slug") val slug: String? = null,
  @Json(name = "description") val description: String? = null,
  @Json(name = "logo") val logo: String? = null,
  @Json(name = "imageUrl") val imageUrl: String? = null,
  @Json(name = "country") val country: String? = null,
  @Json(name = "headquarters") val headquarters: String? = null,
  @Json(name = "website") val website: String? = null,
  @Json(name = "gamesCount") val gamesCount: Int? = null,
  @Json(name = "type") val type: String? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraPersonResponse(
  @Json(name = "success") val success: Boolean? = true,
  @Json(name = "data") val data: VeyloraPersonDto? = null
)

@JsonClass(generateAdapter = true)
data class VeyloraPersonDto(
  @Json(name = "id") val id: String,
  @Json(name = "tmdbId") val tmdbId: Long? = null,
  @Json(name = "imdbId") val imdbId: String? = null,
  @Json(name = "name") val name: String? = null,
  @Json(name = "role") val role: String? = null,
  @Json(name = "photo") val photo: String? = null,
  @Json(name = "biography") val biography: String? = null,
  @Json(name = "birthDate") val birthDate: String? = null,
  @Json(name = "deathDate") val deathDate: String? = null,
  @Json(name = "birthPlace") val birthPlace: String? = null,
  @Json(name = "popularity") val popularity: Double? = null,
  @Json(name = "height") val height: String? = null,
  @Json(name = "awardsSummary") val awardsSummary: String? = null,
  @Json(name = "knownFor") val knownFor: List<VeyloraPersonCreditDto>? = emptyList(),
  @Json(name = "filmography") val filmography: List<VeyloraPersonCreditDto>? = emptyList()
)

@JsonClass(generateAdapter = true)
data class VeyloraPersonCreditDto(
  @Json(name = "id") val id: String,
  @Json(name = "title") val title: String? = null,
  @Json(name = "year") val year: String? = null,
  @Json(name = "role") val role: String? = null,
  @Json(name = "character") val character: String? = null,
  @Json(name = "rating") val rating: Double? = null,
  @Json(name = "type") val type: String? = null,
  @Json(name = "poster") val poster: String? = null,
  @Json(name = "popularity") val popularity: Double? = null
)
