package com.example.data.remote.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class TmdbMovieDto(
  @Json(name = "id") val id: Long,
  @Json(name = "title") val title: String?,
  @Json(name = "overview") val overview: String?,
  @Json(name = "poster_path") val posterPath: String?,
  @Json(name = "backdrop_path") val backdropPath: String?,
  @Json(name = "release_date") val releaseDate: String?,
  @Json(name = "vote_average") val voteAverage: Double?,
  @Json(name = "vote_count") val voteCount: Int?,
  @Json(name = "popularity") val popularity: Double?,
  @Json(name = "genre_ids") val genreIds: List<Int>?
)

@JsonClass(generateAdapter = true)
data class TmdbMovieResponse(
  @Json(name = "page") val page: Int?,
  @Json(name = "results") val results: List<TmdbMovieDto>?,
  @Json(name = "total_pages") val totalPages: Int?,
  @Json(name = "total_results") val totalResults: Int?
)

@JsonClass(generateAdapter = true)
data class TmdbCreditsResponse(
  @Json(name = "id") val id: Long?,
  @Json(name = "cast") val cast: List<TmdbCastDto>?,
  @Json(name = "crew") val crew: List<TmdbCrewDto>?
)

@JsonClass(generateAdapter = true)
data class TmdbCastDto(
  @Json(name = "id") val id: Long,
  @Json(name = "name") val name: String?,
  @Json(name = "character") val character: String?,
  @Json(name = "profile_path") val profilePath: String?,
  @Json(name = "order") val order: Int?
)

@JsonClass(generateAdapter = true)
data class TmdbCrewDto(
  @Json(name = "id") val id: Long,
  @Json(name = "name") val name: String?,
  @Json(name = "job") val job: String?,
  @Json(name = "department") val department: String?,
  @Json(name = "profile_path") val profilePath: String?
)

@JsonClass(generateAdapter = true)
data class TmdbVideosResponse(
  @Json(name = "id") val id: Long?,
  @Json(name = "results") val results: List<TmdbVideoDto>?
)

@JsonClass(generateAdapter = true)
data class TmdbVideoDto(
  @Json(name = "id") val id: String,
  @Json(name = "key") val key: String?,
  @Json(name = "name") val name: String?,
  @Json(name = "site") val site: String?,
  @Json(name = "type") val type: String?,
  @Json(name = "official") val official: Boolean?
)

@JsonClass(generateAdapter = true)
data class TmdbWatchProvidersResponse(
  @Json(name = "id") val id: Long?,
  @Json(name = "results") val results: Map<String, TmdbCountryProvidersDto>?
)

@JsonClass(generateAdapter = true)
data class TmdbCountryProvidersDto(
  @Json(name = "link") val link: String?,
  @Json(name = "flatrate") val flatrate: List<TmdbProviderDto>?,
  @Json(name = "rent") val rent: List<TmdbProviderDto>?,
  @Json(name = "buy") val buy: List<TmdbProviderDto>?
)

@JsonClass(generateAdapter = true)
data class TmdbProviderDto(
  @Json(name = "provider_id") val providerId: Int?,
  @Json(name = "provider_name") val providerName: String?,
  @Json(name = "logo_path") val logoPath: String?,
  @Json(name = "display_priority") val displayPriority: Int?
)

@JsonClass(generateAdapter = true)
data class TmdbProductionCompanyDto(
  @Json(name = "id") val id: Long,
  @Json(name = "name") val name: String?,
  @Json(name = "logo_path") val logoPath: String?,
  @Json(name = "origin_country") val originCountry: String?
)

@JsonClass(generateAdapter = true)
data class TmdbMovieDetailsDto(
  @Json(name = "id") val id: Long,
  @Json(name = "title") val title: String?,
  @Json(name = "overview") val overview: String?,
  @Json(name = "poster_path") val posterPath: String?,
  @Json(name = "backdrop_path") val backdropPath: String?,
  @Json(name = "release_date") val releaseDate: String?,
  @Json(name = "vote_average") val voteAverage: Double?,
  @Json(name = "vote_count") val voteCount: Int?,
  @Json(name = "runtime") val runtime: Int?,
  @Json(name = "tagline") val tagline: String?,
  @Json(name = "production_companies") val productionCompanies: List<TmdbProductionCompanyDto>?
)

@JsonClass(generateAdapter = true)
data class TmdbPersonDto(
  @Json(name = "id") val id: Long,
  @Json(name = "name") val name: String?,
  @Json(name = "biography") val biography: String?,
  @Json(name = "profile_path") val profilePath: String?,
  @Json(name = "birthday") val birthday: String?,
  @Json(name = "deathday") val deathday: String?,
  @Json(name = "place_of_birth") val placeOfBirth: String?,
  @Json(name = "known_for_department") val knownForDepartment: String?,
  @Json(name = "popularity") val popularity: Double?
)

@JsonClass(generateAdapter = true)
data class TmdbCompanyDetailsDto(
  @Json(name = "id") val id: Long,
  @Json(name = "name") val name: String?,
  @Json(name = "description") val description: String?,
  @Json(name = "headquarters") val headquarters: String?,
  @Json(name = "homepage") val homepage: String?,
  @Json(name = "logo_path") val logoPath: String?,
  @Json(name = "origin_country") val originCountry: String?,
  @Json(name = "parent_company") val parentCompany: TmdbProductionCompanyDto?
)

@JsonClass(generateAdapter = true)
data class TmdbPersonMovieCreditsResponse(
  @Json(name = "id") val id: Long?,
  @Json(name = "cast") val cast: List<TmdbMovieDto>?,
  @Json(name = "crew") val crew: List<TmdbMovieDto>?
)

