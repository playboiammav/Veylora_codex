package com.example.domain.model

import androidx.compose.runtime.Immutable

@Immutable
data class CastMember(
  val id: Long,
  val name: String,
  val character: String,
  val profileUrl: String?
)

@Immutable
data class MovieVideo(
  val id: String,
  val key: String,
  val title: String,
  val site: String,
  val type: String,
  val isOfficial: Boolean
) {
  val youtubeThumbnailUrl: String
    get() = "https://img.youtube.com/vi/$key/hqdefault.jpg"
  val youtubeWatchUrl: String
    get() = "https://www.youtube.com/watch?v=$key"
}

@Immutable
data class WatchProvider(
  val id: Int,
  val name: String,
  val logoUrl: String?
)

@Immutable
data class ProductionCompany(
  val id: Long,
  val name: String,
  val logoUrl: String?,
  val originCountry: String? = null,
  val description: String? = null,
  val headquarters: String? = null,
  val homepage: String? = null
)

fun isVerifiedCompany(name: String?): Boolean {
  if (name.isNullOrBlank()) return false
  val verifiedKeywords = listOf(
    "Marvel", "Marvel Studios", "Warner Bros", "Universal Pictures",
    "Walt Disney", "Disney", "Paramount", "Columbia Pictures",
    "20th Century Studios", "20th Century Fox", "Sony Pictures",
    "A24", "Lucasfilm", "Pixar", "Lionsgate", "MGM", "Metro-Goldwyn-Mayer",
    "Blumhouse", "Legendary Entertainment", "New Line Cinema", "DreamWorks",
    "Studio Ghibli", "Toho", "Bad Robot", "Village Roadshow", "Focus Features",
    "Searchlight Pictures", "Miramax", "Illumination", "DC Entertainment", "DC Films"
  )
  return verifiedKeywords.any { name.contains(it, ignoreCase = true) }
}

@Immutable
sealed class ContentType {
  @Immutable
  data class Movie(
    val watchProviders: List<WatchProvider>,
    val productionCompanies: List<ProductionCompany>
  ) : ContentType()

  @Immutable
  data class Game(
    val platforms: List<GamePlatform>,
    val stores: List<GameStoreLink>,
    val publishers: List<String> = emptyList(),
    val publishersList: List<GameCompany> = emptyList(),
    val developers: List<String> = emptyList(),
    val developersList: List<GameCompany> = emptyList(),
    val developerCompany: GameCompany? = null,
    val metacritic: Int? = null,
    val websiteUrl: String? = null,
    val screenshots: List<String> = emptyList(),
    val dominantColor: String? = null,
    val saturatedColor: String? = null,
    val editions: List<GameEdition> = emptyList(),
    val pcRequirements: PcRequirements? = null,
    val supportedHardware: List<String> = emptyList(),
    val price: GamePrice? = null
  ) : ContentType()
}

@Immutable
data class PersonDetails(
  val id: Long,
  val name: String,
  val biography: String = "",
  val profileUrl: String? = null,
  val birthday: String? = null,
  val deathday: String? = null,
  val placeOfBirth: String? = null,
  val knownForDepartment: String? = null,
  val popularity: Double? = null,
  val movies: List<Movie> = emptyList()
)

@Immutable
data class MovieDetails(
  val movie: Movie,
  val cast: List<CastMember> = emptyList(),
  val crew: List<CastMember> = emptyList(),
  val videos: List<MovieVideo> = emptyList(),
  val watchProviders: List<WatchProvider> = emptyList(),
  val productionCompany: ProductionCompany? = null,
  val productionCompanies: List<ProductionCompany> = emptyList(),
  val runtime: Int? = null,
  val tagline: String? = null
) {
  val contentType: ContentType
    get() = ContentType.Movie(
      watchProviders = watchProviders,
      productionCompanies = productionCompanies
    )
}

@Immutable
data class Movie(
  val id: Long,
  val title: String,
  val overview: String,
  val posterUrl: String?,
  val backdropUrl: String?,
  val releaseDate: String?,
  val releaseYear: String,
  val voteAverage: Double,
  val voteCount: Int,
  val isFavorite: Boolean = false,
  val posterPath: String? = null,
  val backdropPath: String? = null
) {
  val formattedRating: String
    get() = if (voteAverage > 0.0) String.format("%.1f", voteAverage) else "N/A"

  // w342 for list thumbnails (fast loading & smooth scrolling)
  val listThumbnailUrl: String?
    get() = posterPath?.let { "https://image.tmdb.org/t/p/w342$it" } ?: posterUrl

  // original for hero/backdrop image in Details Screen (crystal clear)
  val highResBackdropUrl: String?
    get() = backdropPath?.let { "https://image.tmdb.org/t/p/original$it" }
      ?: backdropUrl?.replace("/w780/", "/original/")?.replace("/w500/", "/original/")?.replace("/w1280/", "/original/")

  // w780 for detail poster image
  val highResPosterUrl: String?
    get() = posterPath?.let { "https://image.tmdb.org/t/p/w780$it" }
      ?: posterUrl?.replace("/w342/", "/w780/")?.replace("/w500/", "/w780/")
}

