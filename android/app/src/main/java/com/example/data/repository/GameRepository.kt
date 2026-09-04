package com.example.data.repository

import android.util.Log
import com.example.data.remote.NetworkModule
import com.example.data.remote.VeyloraBackendApiService
import com.example.data.remote.model.VeyloraGameDto
import com.example.domain.model.GameCompany
import com.example.domain.model.GameDetails
import com.example.domain.model.GameEdition
import com.example.domain.model.GameItem
import com.example.domain.model.GamePlatform
import com.example.domain.model.GamePrice
import com.example.domain.model.GameStoreLink
import com.example.domain.model.PcRequirements
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

class GameRepository(
  private val backendApiService: VeyloraBackendApiService = NetworkModule.createVeyloraBackendApiService(),
  private val consoleStoreRepository: ConsoleStoreRepository = ConsoleStoreRepository()
) {

  private val gameDetailsCache = ConcurrentHashMap<Long, GameDetails>()
  private val gameItemCache = ConcurrentHashMap<Long, GameItem>()

  suspend fun fetchTrendingGames(forceRefresh: Boolean = false): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    try {
      val response = backendApiService.getGames(category = "trending", page = 1, pageSize = 20)
      val dtoList = response.data.orEmpty()
      val items = dtoList.map { mapDtoToGameItem(it) }
      items.forEach { gameItemCache[it.id] = it }
      Log.d("GameRepository", "Fetched ${items.size} trending games")
      Result.success(items)
    } catch (e: Exception) {
      Log.e("GameRepository", "Error fetching trending games", e)
      Result.failure(e)
    }
  }

  suspend fun fetchUpcomingGames(forceRefresh: Boolean = false): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    try {
      val response = backendApiService.getGames(category = "upcoming", page = 1, pageSize = 20)
      val dtoList = response.data.orEmpty()
      val items = dtoList.map { mapDtoToGameItem(it) }
      items.forEach { gameItemCache[it.id] = it }
      Log.d("GameRepository", "Fetched ${items.size} upcoming games")
      Result.success(items)
    } catch (e: Exception) {
      Log.e("GameRepository", "Error fetching upcoming games", e)
      Result.failure(e)
    }
  }

  suspend fun fetchTop50Games(forceRefresh: Boolean = false): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    try {
      val response = backendApiService.getGames(category = "top50", page = 1, pageSize = 50)
      val dtoList = response.data.orEmpty()
      val items = dtoList.map { mapDtoToGameItem(it) }
      items.forEach { gameItemCache[it.id] = it }
      Result.success(items)
    } catch (e: Exception) {
      Log.e("GameRepository", "Error fetching top rated games", e)
      Result.failure(e)
    }
  }

  suspend fun fetchRecentlyReleasedGames(forceRefresh: Boolean = false): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    try {
      val response = backendApiService.getGames(category = "recent", page = 1, pageSize = 20)
      val dtoList = response.data.orEmpty()
      val items = dtoList.map { mapDtoToGameItem(it) }
      items.forEach { gameItemCache[it.id] = it }
      Result.success(items)
    } catch (e: Exception) {
      Log.e("GameRepository", "Error fetching recently released games", e)
      Result.failure(e)
    }
  }

  suspend fun fetchGamesByPublisher(publisherSlugOrId: String): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    try {
      val response = backendApiService.getGames(publishers = publisherSlugOrId, page = 1, pageSize = 40)
      val dtoList = response.data.orEmpty()
      val items = dtoList.map { mapDtoToGameItem(it) }
      items.forEach { gameItemCache[it.id] = it }
      Log.d("GameRepository", "Fetched ${items.size} games for publisher=$publisherSlugOrId")
      Result.success(items)
    } catch (e: Exception) {
      Log.e("GameRepository", "Error fetching games for publisher=$publisherSlugOrId", e)
      Result.failure(e)
    }
  }

  suspend fun fetchGamesByDeveloper(developerSlugOrId: String): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    try {
      val response = backendApiService.getGames(developers = developerSlugOrId, page = 1, pageSize = 40)
      val dtoList = response.data.orEmpty()
      val items = dtoList.map { mapDtoToGameItem(it) }
      items.forEach { gameItemCache[it.id] = it }
      Log.d("GameRepository", "Fetched ${items.size} games for developer=$developerSlugOrId")
      Result.success(items)
    } catch (e: Exception) {
      Log.e("GameRepository", "Error fetching games for developer=$developerSlugOrId", e)
      Result.failure(e)
    }
  }

  suspend fun fetchGamesByCompany(company: GameCompany): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    val queryParam = if (company.slug.isNotBlank()) company.slug else company.id.toString()
    if (company.isDeveloper) {
      val devResult = fetchGamesByDeveloper(queryParam)
      if (devResult.isSuccess && devResult.getOrNull()?.isNotEmpty() == true) {
        devResult
      } else {
        fetchGamesByPublisher(queryParam)
      }
    } else {
      val pubResult = fetchGamesByPublisher(queryParam)
      if (pubResult.isSuccess && pubResult.getOrNull()?.isNotEmpty() == true) {
        pubResult
      } else {
        fetchGamesByDeveloper(queryParam)
      }
    }
  }

  suspend fun fetchCompanyDetails(company: GameCompany): Result<GameCompany> = withContext(Dispatchers.IO) {
    try {
      val idOrSlug = if (company.id > 0) company.id.toString() else company.slug
      val type = if (company.isDeveloper) "developer" else "publisher"
      val res = backendApiService.getCompanyDetails(idOrSlug, type = type)
      val detail = res.data ?: throw Exception("Company not found")
      Result.success(
        company.copy(
          id = detail.id?.toLongOrNull() ?: company.id,
          name = detail.name ?: company.name,
          slug = detail.slug ?: company.slug,
          imageUrl = detail.imageUrl ?: company.imageUrl,
          description = cleanHtml(detail.description).ifBlank { null } ?: company.description,
          gamesCount = detail.gamesCount ?: company.gamesCount
        )
      )
    } catch (e: Exception) {
      Log.e("GameRepository", "Error fetching company details for ${company.name}", e)
      Result.failure(e)
    }
  }

  suspend fun searchGames(query: String): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    try {
      val response = backendApiService.getGames(search = query, page = 1, pageSize = 20)
      val dtoList = response.data.orEmpty()
      val items = dtoList.map { mapDtoToGameItem(it) }
      items.forEach { gameItemCache[it.id] = it }
      Result.success(items)
    } catch (e: Exception) {
      Log.e("GameRepository", "Error searching games query=$query", e)
      Result.failure(e)
    }
  }

  suspend fun fetchGameDetails(
    gameId: Long,
    conceptId: String? = null,
    productId: String? = null
  ): Result<GameDetails> = withContext(Dispatchers.IO) {
    if (gameDetailsCache.containsKey(gameId)) {
      return@withContext Result.success(gameDetailsCache[gameId]!!)
    }

    try {
      coroutineScope {
        val gameIdStr = gameId.toString()
        val detailDeferred = async { backendApiService.getGameDetails(gameIdStr) }

        val detailRes = detailDeferred.await()
        val dto = detailRes.data ?: throw Exception("Game $gameId not found")
        val title = dto.title ?: "Game"
        val screenshots = dto.screenshots.orEmpty()
        val stores = dto.stores.orEmpty().mapNotNull { item ->
          item.url?.let { u ->
            GameStoreLink(
              id = 0L,
              storeId = null,
              storeName = item.name ?: getStoreNameFromUrlOrId(null, u),
              url = u
            )
          }
        }.distinctBy { it.storeName.lowercase().trim() }

        val resolvedConceptId = conceptId ?: extractPlayStationConceptId(stores)
        val resolvedProductId = productId ?: extractXboxProductId(stores)

        val editionsDeferred = async {
          try {
            consoleStoreRepository.fetchEditions(gameTitle = title, conceptId = resolvedConceptId, productId = resolvedProductId)
          } catch (e: Exception) {
            Log.e("GameRepository", "Error fetching editions for $title", e)
            emptyList()
          }
        }

        val editions = editionsDeferred.await()

        val supportedHardware = mutableListOf<String>()
        dto.hardwareBadges.orEmpty().forEach {
          val clean = it.lowercase().trim()
          if (!clean.contains("store") && !clean.contains("steam") && !clean.contains("epic") && !clean.contains("gog")) {
            supportedHardware.add(clean)
          }
        }
        if (supportedHardware.isEmpty()) {
          dto.platforms.orEmpty().forEach { p ->
            val slug = p.lowercase().trim()
            if (slug.contains("playstation") || slug.contains("ps5") || slug.contains("ps4")) supportedHardware.add("ps5")
            if (slug.contains("xbox")) supportedHardware.add("xbox_series")
            if (slug.contains("pc") || slug.contains("windows")) supportedHardware.add("pc")
            if (slug.contains("nintendo") || slug.contains("switch")) supportedHardware.add("nintendo_switch")
          }
        }
        if (supportedHardware.isEmpty()) {
          supportedHardware.add("pc")
        }

        val pcReq = dto.systemRequirements?.let { com.example.util.PcRequirementsParser.parse(it) }
          ?: dto.rawRequirements?.let { com.example.util.PcRequirementsParser.parse(it) }

        val price = resolvePriceFromEditions(editions)

        // Sanitized diagnostic logging for debugging data pipeline
        for (s in stores) {
          val domain = try { java.net.URI(s.url).host ?: "" } catch (_: Exception) { "" }
          Log.d("GameRepository_Diag", "store=${s.storeName}, url_domain=$domain, url=${s.url}")
        }
        Log.d("GameRepository_Diag", "Resolved conceptId=$resolvedConceptId, productId=$resolvedProductId")
        Log.d("GameRepository_Diag", "Editions count=${editions.size}: ${editions.map { "${it.name} (${it.platform}): ${it.formattedPrice}" }}")
        Log.d("GameRepository_Diag", "Price: $price")
        Log.d("GameRepository_Diag", "PC Requirements: minimum='${pcReq?.minimum}', recommended='${pcReq?.recommended}'")

        val baseGameItem = mapDetailResponseToGameItem(
          dto,
          editions,
          pcReq,
          supportedHardware,
          price,
          stores,
          resolvedConceptId,
          resolvedProductId
        )

        val gameDetails = GameDetails(
          game = baseGameItem,
          editions = editions,
          pcRequirements = pcReq,
          supportedHardware = supportedHardware.distinct(),
          price = price,
          screenshots = screenshots,
          stores = stores,
          developerCompany = baseGameItem.developerCompany,
          publisherCompany = baseGameItem.publishersList.firstOrNull()
        )

        gameDetailsCache[gameId] = gameDetails
        gameItemCache[gameId] = baseGameItem

        Log.d(
          "GameRepository",
          "Loaded details for gameId=$gameId title=$title editionsCount=${editions.size} pcReqPresent=${pcReq?.hasData}"
        )

        Result.success(gameDetails)
      }
    } catch (e: Exception) {
      Log.e("GameRepository", "Failed to fetch game details for gameId=$gameId", e)
      Result.failure(e)
    }
  }

  fun getCachedGameItem(gameId: Long): GameItem? {
    return gameItemCache[gameId]
  }

  private fun mapDtoToGameItem(dto: VeyloraGameDto): GameItem {
    val supportedHardware = mutableListOf<String>()
    dto.hardwareBadges.orEmpty().forEach {
      val clean = it.lowercase().trim()
      if (!clean.contains("store") && !clean.contains("steam") && !clean.contains("epic") && !clean.contains("gog")) {
        supportedHardware.add(clean)
      }
    }
    if (supportedHardware.isEmpty()) {
      dto.platforms.orEmpty().forEach { p ->
        val slug = p.lowercase().trim()
        if (slug.contains("playstation") || slug.contains("ps5") || slug.contains("ps4")) supportedHardware.add("ps5")
        if (slug.contains("xbox")) supportedHardware.add("xbox_series")
        if (slug.contains("pc") || slug.contains("windows")) supportedHardware.add("pc")
        if (slug.contains("nintendo") || slug.contains("switch")) supportedHardware.add("nintendo_switch")
      }
    }
    if (supportedHardware.isEmpty()) {
      supportedHardware.add("pc")
    }

    val pcReq = dto.systemRequirements?.let { com.example.util.PcRequirementsParser.parse(it) }
      ?: dto.rawRequirements?.let { com.example.util.PcRequirementsParser.parse(it) }

    val platforms = dto.platforms.orEmpty().map { pName ->
      GamePlatform(
        id = 0L,
        name = pName,
        slug = pName.lowercase().replace(" ", "-"),
        requirements = if (pName.contains("pc", ignoreCase = true) || pName.contains("windows", ignoreCase = true)) pcReq else null
      )
    }

    val publishersList = dto.publishersList.orEmpty().map {
      GameCompany(
        id = it.id?.toLongOrNull() ?: 0L,
        name = it.name ?: "",
        slug = it.slug ?: "",
        imageUrl = it.imageUrl ?: it.imageBackground,
        imageBackground = it.imageBackground ?: it.imageUrl,
        isDeveloper = false
      )
    }

    val developersList = dto.developersList.orEmpty().map {
      GameCompany(
        id = it.id?.toLongOrNull() ?: 0L,
        name = it.name ?: "",
        slug = it.slug ?: "",
        imageUrl = it.imageUrl ?: it.imageBackground,
        imageBackground = it.imageBackground ?: it.imageUrl,
        isDeveloper = true
      )
    }

    val developerCompany = developersList.firstOrNull() ?: publishersList.firstOrNull()

    val releaseDate = dto.releaseDate
    val releaseYear = dto.releaseYear?.ifBlank { null }
      ?: releaseDate?.takeIf { it.length >= 4 }?.substring(0, 4)
      ?: ""

    return GameItem(
      id = dto.id.toLongOrNull() ?: 0L,
      title = dto.title ?: "Game",
      overview = dto.description ?: dto.shortDescription ?: "",
      posterUrl = dto.cover ?: dto.backdrop,
      backdropUrl = dto.backdrop ?: dto.cover,
      releaseDate = releaseDate,
      releaseYear = releaseYear,
      rating = dto.rating ?: 0.0,
      metacritic = dto.metacritic,
      platforms = platforms,
      genres = dto.genres.orEmpty(),
      publishers = if (!dto.publisher.isNullOrBlank()) listOf(dto.publisher) else emptyList(),
      publishersList = publishersList,
      developers = if (!dto.developer.isNullOrBlank()) listOf(dto.developer) else emptyList(),
      developersList = developersList,
      developerCompany = developerCompany,
      dominantColor = dto.dominantColor,
      saturatedColor = dto.saturatedColor,
      pcRequirements = pcReq,
      supportedHardware = supportedHardware.distinct()
    )
  }

  private fun mapDetailResponseToGameItem(
    res: VeyloraGameDto,
    editions: List<GameEdition>,
    pcReq: PcRequirements?,
    supportedHardware: List<String>,
    price: GamePrice?,
    stores: List<GameStoreLink>,
    conceptId: String? = null,
    productId: String? = null
  ): GameItem {
    val releaseDate = res.releaseDate
    val releaseYear = res.releaseYear?.ifBlank { null }
      ?: releaseDate?.takeIf { it.length >= 4 }?.substring(0, 4)
      ?: ""

    val platforms = res.platforms.orEmpty().map { pName ->
      GamePlatform(
        id = 0L,
        name = pName,
        slug = pName.lowercase().replace(" ", "-"),
        requirements = if (pName.contains("pc", ignoreCase = true) || pName.contains("windows", ignoreCase = true)) pcReq else null
      )
    }

    val publishersList = res.publishersList.orEmpty().map {
      GameCompany(
        id = it.id?.toLongOrNull() ?: 0L,
        name = it.name ?: "",
        slug = it.slug ?: "",
        imageUrl = it.imageUrl ?: it.imageBackground,
        imageBackground = it.imageBackground ?: it.imageUrl,
        isDeveloper = false
      )
    }

    val developersList = res.developersList.orEmpty().map {
      GameCompany(
        id = it.id?.toLongOrNull() ?: 0L,
        name = it.name ?: "",
        slug = it.slug ?: "",
        imageUrl = it.imageUrl ?: it.imageBackground,
        imageBackground = it.imageBackground ?: it.imageUrl,
        isDeveloper = true
      )
    }

    val developerCompany = developersList.firstOrNull() ?: publishersList.firstOrNull()

    return GameItem(
      id = res.id.toLongOrNull() ?: 0L,
      title = res.title ?: "Game",
      overview = res.description ?: res.shortDescription ?: "",
      posterUrl = res.cover ?: res.backdrop,
      backdropUrl = res.backdrop ?: res.cover,
      releaseDate = releaseDate,
      releaseYear = releaseYear,
      rating = res.rating ?: 0.0,
      metacritic = res.metacritic,
      platforms = platforms,
      genres = res.genres.orEmpty(),
      stores = stores,
      publishers = if (!res.publisher.isNullOrBlank()) listOf(res.publisher) else emptyList(),
      publishersList = publishersList,
      developers = if (!res.developer.isNullOrBlank()) listOf(res.developer) else emptyList(),
      developersList = developersList,
      developerCompany = developerCompany,
      websiteUrl = res.website,
      dominantColor = res.dominantColor,
      saturatedColor = res.saturatedColor,
      editions = editions,
      pcRequirements = pcReq,
      supportedHardware = supportedHardware.distinct(),
      price = price,
      conceptId = conceptId,
      productId = productId
    )
  }

  private fun resolvePriceFromEditions(editions: List<GameEdition>): GamePrice? {
    if (editions.isEmpty()) return null

    val freeEdition = editions.firstOrNull { it.isFree }
    if (freeEdition != null) {
      return GamePrice(
        formattedBasePrice = "FREE",
        formattedDiscountedPrice = "FREE",
        discountPercentage = 0,
        isFree = true,
        basePrice = 0.0,
        discountedPrice = 0.0,
        currency = "USD",
        source = freeEdition.platform
      )
    }

    val validEditions = editions.filter { it.price != null && it.price > 0.0 }
    if (validEditions.isEmpty()) return null

    val lowest = validEditions.minByOrNull { it.price!! } ?: return null

    return GamePrice(
      formattedBasePrice = lowest.formattedOriginalPrice ?: lowest.formattedPrice,
      formattedDiscountedPrice = lowest.formattedPrice,
      discountPercentage = lowest.discountPercentage,
      isFree = false,
      basePrice = lowest.originalPrice ?: lowest.price,
      discountedPrice = lowest.price,
      currency = lowest.currency ?: "USD",
      source = lowest.platform
    )
  }

  private fun cleanHtml(html: String?): String {
    if (html.isNullOrBlank()) return ""
    return html
      .replace("\r\n", "\n")
      .replace("\r", "\n")
      .replace(Regex("(?i)<br\\s*/?>"), "\n")
      .replace(Regex("(?i)</p>"), "\n\n")
      .replace(Regex("(?i)</li>"), "\n")
      .replace(Regex("(?i)<[^>]+>"), "")
      .replace("&nbsp;", " ")
      .replace("&amp;", "&")
      .replace("&quot;", "\"")
      .replace("&#39;", "'")
      .trim()
  }

  private fun extractPlayStationConceptId(stores: List<GameStoreLink>): String? {
    for (store in stores) {
      if (store.url.contains("playstation.com", ignoreCase = true)) {
        val match = Regex("(?i)concept[/=](\\d+)").find(store.url)
          ?: Regex("(?i)product[/=]([a-zA-Z0-9_-]+)").find(store.url)
        if (match != null) {
          return match.groupValues[1]
        }
      }
    }
    return null
  }

  private fun extractXboxProductId(stores: List<GameStoreLink>): String? {
    for (store in stores) {
      if (store.url.contains("xbox.com", ignoreCase = true) || store.url.contains("microsoft.com", ignoreCase = true)) {
        val match = Regex("(?i)/store/[^/]+/([a-zA-Z0-9]{12})").find(store.url)
          ?: Regex("(?i)productId=([a-zA-Z0-9]{12})").find(store.url)
        if (match != null) {
          return match.groupValues[1]
        }
      }
    }
    return null
  }

  fun extractSteamAppId(stores: List<GameStoreLink>): Long? {
    for (store in stores) {
      if (store.url.contains("steampowered.com", ignoreCase = true)) {
        val match = Regex("(?i)app[/=](\\d+)").find(store.url)
        if (match != null) {
          return match.groupValues[1].toLongOrNull()
        }
      }
    }
    return null
  }

  private fun getStoreNameFromUrlOrId(storeId: Long?, url: String): String {
    val lowerUrl = url.lowercase()
    return when {
      lowerUrl.contains("steampowered.com") || lowerUrl.contains("steam.com") -> "Steam"
      lowerUrl.contains("playstation.com") -> "PlayStation Store"
      lowerUrl.contains("xbox.com") || lowerUrl.contains("microsoft.com") -> "Xbox Store"
      lowerUrl.contains("epicgames.com") -> "Epic Games"
      lowerUrl.contains("gog.com") -> "GOG"
      lowerUrl.contains("nintendo.com") -> "Nintendo eShop"
      lowerUrl.contains("apple.com") -> "App Store"
      lowerUrl.contains("google.com") -> "Google Play"
      lowerUrl.contains("ea.com") || lowerUrl.contains("origin.com") -> "EA App"
      lowerUrl.contains("ubisoft.com") || lowerUrl.contains("uplay") -> "Ubisoft Connect"
      lowerUrl.contains("battle.net") || lowerUrl.contains("blizzard.com") -> "Battle.net"
      else -> when (storeId) {
        1L -> "Steam"
        2L -> "Xbox Store"
        3L -> "PlayStation Store"
        4L -> "App Store"
        5L -> "GOG"
        6L -> "Nintendo eShop"
        7L -> "Xbox Store"
        8L -> "Google Play"
        9L -> "itch.io"
        11L -> "Epic Games"
        else -> "Official Store"
      }
    }
  }
}
