package com.example.domain.model

import androidx.compose.runtime.Immutable

@Immutable
data class GamePrice(
  val formattedBasePrice: String? = null,
  val formattedDiscountedPrice: String? = null,
  val discountPercentage: Int? = null,
  val isFree: Boolean = false,
  val basePrice: Double? = null,
  val discountedPrice: Double? = null,
  val currency: String? = null,
  val source: String? = null
)

@Immutable
data class GameEdition(
  val id: String = "",
  val name: String,
  val editionType: String = "STANDARD",
  val price: Double? = null,
  val formattedPrice: String? = null,
  val originalPrice: Double? = null,
  val formattedOriginalPrice: String? = null,
  val discountPercentage: Int? = null,
  val currency: String? = null,
  val isFree: Boolean = false,
  val storeUrl: String? = null,
  val platform: String? = null,
  val psPrice: Double? = null,
  val xboxPrice: Double? = null,
  val steamPrice: Double? = null
)

@Immutable
data class PcRequirements(
  val minimum: String? = null,
  val recommended: String? = null,
  val minOs: String? = null,
  val minCpu: String? = null,
  val minRam: String? = null,
  val minGpu: String? = null,
  val minVram: String? = null,
  val minStorage: String? = null,
  val minDirectX: String? = null,
  val minNotes: String? = null,
  val recOs: String? = null,
  val recCpu: String? = null,
  val recRam: String? = null,
  val recGpu: String? = null,
  val recVram: String? = null,
  val recStorage: String? = null,
  val recDirectX: String? = null,
  val recNotes: String? = null
) {
  val hasData: Boolean
    get() = !minimum.isNullOrBlank() || !recommended.isNullOrBlank() ||
        !minOs.isNullOrBlank() || !minCpu.isNullOrBlank() || !minGpu.isNullOrBlank() ||
        !recOs.isNullOrBlank() || !recCpu.isNullOrBlank() || !recGpu.isNullOrBlank()
}

@Immutable
data class GamePlatform(
  val id: Long,
  val name: String,
  val slug: String = "",
  val requirements: PcRequirements? = null
)

@Immutable
data class GameStoreLink(
  val id: Long,
  val storeId: Long?,
  val storeName: String,
  val url: String
)

@Immutable
data class GameCompany(
  val id: Long,
  val name: String,
  val slug: String = "",
  val imageUrl: String? = null,
  val description: String? = null,
  val gamesCount: Int? = null,
  val isDeveloper: Boolean = false
)

@Immutable
data class GameItem(
  val id: Long,
  val title: String,
  val overview: String,
  val posterUrl: String?,
  val backdropUrl: String?,
  val releaseDate: String?,
  val releaseYear: String,
  val rating: Double,
  val metacritic: Int?,
  val platforms: List<GamePlatform> = emptyList(),
  val genres: List<String> = emptyList(),
  val isFavorite: Boolean = false,
  val stores: List<GameStoreLink> = emptyList(),
  val publishers: List<String> = emptyList(),
  val publishersList: List<GameCompany> = emptyList(),
  val developers: List<String> = emptyList(),
  val developersList: List<GameCompany> = emptyList(),
  val developerCompany: GameCompany? = null,
  val websiteUrl: String? = null,
  val screenshots: List<String> = emptyList(),
  val dominantColor: String? = null,
  val saturatedColor: String? = null,
  val editions: List<GameEdition> = emptyList(),
  val pcRequirements: PcRequirements? = null,
  val supportedHardware: List<String> = emptyList(),
  val price: GamePrice? = null,
  val conceptId: String? = null,
  val productId: String? = null
) {
  val formattedRating: String
    get() = if (rating > 0.0) String.format("%.1f", rating) else "N/A"

  val contentType: ContentType
    get() = ContentType.Game(
      platforms = platforms,
      stores = stores,
      publishers = publishers,
      publishersList = publishersList,
      developers = developers,
      developersList = developersList,
      developerCompany = developerCompany,
      metacritic = metacritic,
      websiteUrl = websiteUrl,
      screenshots = screenshots,
      dominantColor = dominantColor,
      saturatedColor = saturatedColor,
      editions = editions,
      pcRequirements = pcRequirements,
      supportedHardware = supportedHardware,
      price = price
    )
}

@Immutable
data class GameDetails(
  val game: GameItem,
  val editions: List<GameEdition> = emptyList(),
  val pcRequirements: PcRequirements? = null,
  val supportedHardware: List<String> = emptyList(),
  val price: GamePrice? = null,
  val screenshots: List<String> = emptyList(),
  val stores: List<GameStoreLink> = emptyList(),
  val developerCompany: GameCompany? = null,
  val publisherCompany: GameCompany? = null
)
