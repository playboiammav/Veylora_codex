package com.example.data.repository

import com.example.data.remote.CheapSharkApiService
import com.example.data.remote.CheapSharkStoreRegistry
import com.example.data.remote.NetworkModule
import com.example.data.remote.PlayStationApiService
import com.example.data.remote.XboxApiService
import com.example.domain.model.GameEdition
import com.example.domain.model.GameItem
import com.example.domain.model.GamePrice
import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext

class ConsoleStoreRepository(
  private val xboxApiService: XboxApiService = NetworkModule.createXboxApiService(),
  private val playStationApiService: PlayStationApiService = NetworkModule.createPlayStationApiService(),
  private val cheapSharkApiService: CheapSharkApiService = NetworkModule.createCheapSharkApiService()
) {

  suspend fun fetchEditions(
    gameTitle: String,
    conceptId: String? = null,
    productId: String? = null
  ): List<GameEdition> = withContext(Dispatchers.IO) {
    val editions = mutableListOf<GameEdition>()

    coroutineScope {
      val psDeferred = async {
        try {
          if (!conceptId.isNullOrBlank()) {
            val response = playStationApiService.getPlayStationEditions(conceptId = conceptId)
            if (response.isSuccessful && response.body() != null) {
              parseEditionsFromJson(response.body()!!, "PlayStation")
            } else emptyList()
          } else {
            // Attempt to search catalog by title or category if conceptId not given
            val response = playStationApiService.getPlayStationCatalog(category = null, size = 20)
            if (response.isSuccessful && response.body() != null) {
              findEditionsInCatalog(response.body()!!, gameTitle, "PlayStation")
            } else emptyList()
          }
        } catch (_: Exception) {
          emptyList()
        }
      }

      val xboxDeferred = async {
        try {
          if (!productId.isNullOrBlank()) {
            val response = xboxApiService.getXboxEditions(productId = productId)
            if (response.isSuccessful && response.body() != null) {
              parseEditionsFromJson(response.body()!!, "Xbox")
            } else emptyList()
          } else {
            val response = xboxApiService.getXboxCatalog(listType = "Deal", count = 20)
            if (response.isSuccessful && response.body() != null) {
              findEditionsInCatalog(response.body()!!, gameTitle, "Xbox")
            } else emptyList()
          }
        } catch (_: Exception) {
          emptyList()
        }
      }

      val pcStoreDeferred = async {
        try {
          if (gameTitle.isNotBlank()) {
            val response = cheapSharkApiService.searchGames(title = gameTitle, limit = 6)
            if (response.isSuccessful && response.body() != null) {
              val items = response.body()!!
              val pcEditions = mutableListOf<GameEdition>()
              for (item in items) {
                val externalTitle = item.external ?: continue
                val cheapPrice = item.cheapest?.toDoubleOrNull() ?: continue
                if (cheapPrice <= 0.0) continue

                val cleanGameTitle = gameTitle.replace(Regex("[^a-zA-Z0-9 ]"), " ").lowercase().trim()
                val cleanExternal = externalTitle.replace(Regex("[^a-zA-Z0-9 ]"), " ").lowercase().trim()
                val firstWordGame = cleanGameTitle.split(Regex("\\s+")).firstOrNull { it.length > 2 } ?: cleanGameTitle

                val isMatch = cleanExternal.contains(cleanGameTitle) ||
                    cleanGameTitle.contains(cleanExternal) ||
                    (firstWordGame.isNotBlank() && cleanExternal.contains(firstWordGame) && cleanGameTitle.contains(firstWordGame))
                if (!isMatch) continue

                val editionType = when {
                  externalTitle.contains("deluxe", ignoreCase = true) -> "DELUXE"
                  externalTitle.contains("ultimate", ignoreCase = true) -> "ULTIMATE"
                  externalTitle.contains("gold", ignoreCase = true) -> "GOLD"
                  externalTitle.contains("complete", ignoreCase = true) -> "COMPLETE"
                  externalTitle.contains("premium", ignoreCase = true) -> "PREMIUM"
                  else -> "STANDARD"
                }

                val storeUrl = if (!item.steamAppID.isNullOrBlank()) {
                  "https://store.steampowered.com/app/${item.steamAppID}"
                } else null

                pcEditions.add(
                  GameEdition(
                    id = item.gameID ?: "",
                    name = externalTitle,
                    editionType = editionType,
                    price = cheapPrice,
                    formattedPrice = "$%.2f".format(cheapPrice),
                    originalPrice = null,
                    formattedOriginalPrice = null,
                    discountPercentage = null,
                    currency = "USD",
                    isFree = false,
                    storeUrl = storeUrl,
                    platform = "PC",
                    steamPrice = cheapPrice
                  )
                )
              }
              pcEditions
            } else emptyList()
          } else emptyList()
        } catch (_: Exception) {
          emptyList()
        }
      }

      editions.addAll(psDeferred.await())
      editions.addAll(xboxDeferred.await())
      editions.addAll(pcStoreDeferred.await())
    }

    editions.distinctBy { "${it.name.trim().lowercase()}_${it.platform}" }
  }

  suspend fun fetchPlayStationGames(
    category: String? = null,
    size: Int = 24,
    offset: Int = 0
  ): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    try {
      val response = playStationApiService.getPlayStationCatalog(
        category = category,
        size = size,
        offset = offset
      )
      if (response.isSuccessful && response.body() != null) {
        val games = parseGamesFromCatalogResponse(response.body()!!, defaultPlatform = "PlayStation")
        Result.success(games)
      } else {
        Result.failure(Exception("PlayStation API error: ${response.code()} ${response.message()}"))
      }
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  suspend fun fetchXboxGames(
    listType: String = "Deal",
    count: Int = 20
  ): Result<List<GameItem>> = withContext(Dispatchers.IO) {
    try {
      val response = xboxApiService.getXboxCatalog(
        listType = listType,
        count = count
      )
      if (response.isSuccessful && response.body() != null) {
        val games = parseGamesFromCatalogResponse(response.body()!!, defaultPlatform = "Xbox")
        Result.success(games)
      } else {
        Result.failure(Exception("Xbox API error: ${response.code()} ${response.message()}"))
      }
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  private fun parseEditionsFromJson(json: JsonObject, platform: String): List<GameEdition> {
    val list = mutableListOf<GameEdition>()
    try {
      val dataElement: JsonElement? = when {
        json.has("data") -> json.get("data")
        json.has("editions") -> json.get("editions")
        json.has("results") -> json.get("results")
        else -> json
      }

      if (dataElement != null && dataElement.isJsonArray) {
        val arr = dataElement.asJsonArray
        for (i in 0 until arr.size()) {
          val elem = arr.get(i)
          if (elem.isJsonObject) {
            parseSingleEdition(elem.asJsonObject, platform)?.let { list.add(it) }
          }
        }
      } else if (dataElement != null && dataElement.isJsonObject) {
        parseSingleEdition(dataElement.asJsonObject, platform)?.let { list.add(it) }
      }
    } catch (_: Exception) {}
    return list
  }

  private fun parseSingleEdition(obj: JsonObject, defaultPlatform: String): GameEdition? {
    try {
      val id = obj.optString("id") ?: obj.optString("productId") ?: obj.optString("conceptId") ?: ""
      val name = obj.optString("name") ?: obj.optString("title") ?: obj.optString("editionName") ?: "Standard Edition"
      val editionType = obj.optString("editionType")?.uppercase() ?: when {
        name.contains("deluxe", ignoreCase = true) -> "DELUXE"
        name.contains("ultimate", ignoreCase = true) -> "ULTIMATE"
        name.contains("premium", ignoreCase = true) -> "PREMIUM"
        name.contains("gold", ignoreCase = true) -> "GOLD"
        name.contains("complete", ignoreCase = true) -> "COMPLETE"
        name.contains("standard", ignoreCase = true) -> "STANDARD"
        else -> "STANDARD"
      }

      var price: Double? = null
      var formattedPrice: String? = null
      var originalPrice: Double? = null
      var formattedOriginalPrice: String? = null
      var discountPercentage: Int? = null
      var isFree = false
      var currency: String? = null

      if (obj.has("price") && obj.get("price").isJsonObject) {
        val priceObj = obj.getAsJsonObject("price")
        formattedPrice = priceObj.optString("formattedDiscountedPrice") ?: priceObj.optString("formattedPrice") ?: priceObj.optString("formattedBasePrice")
        formattedOriginalPrice = priceObj.optString("formattedBasePrice") ?: priceObj.optString("formattedOriginalPrice")
        discountPercentage = priceObj.optInt("discountPercentage")
        isFree = priceObj.optBoolean("isFree")
        price = priceObj.optDouble("discountedPrice") ?: priceObj.optDouble("basePrice")
        originalPrice = priceObj.optDouble("basePrice") ?: priceObj.optDouble("originalPrice")
        currency = priceObj.optString("currency")
      } else {
        price = obj.optDouble("price")
        originalPrice = obj.optDouble("originalPrice") ?: obj.optDouble("basePrice")
        formattedPrice = obj.optString("formattedPrice") ?: price?.let { "$%.2f".format(it) }
        formattedOriginalPrice = obj.optString("formattedOriginalPrice") ?: originalPrice?.let { "$%.2f".format(it) }
        discountPercentage = obj.optInt("discountPercentage")
        isFree = obj.optBoolean("isFree")
        currency = obj.optString("currency")
      }

      val storeUrl = obj.optString("storeUrl") ?: obj.optString("url")
      val platform = obj.optString("platform") ?: defaultPlatform

      return GameEdition(
        id = id,
        name = name,
        editionType = editionType,
        price = price,
        formattedPrice = formattedPrice,
        originalPrice = originalPrice,
        formattedOriginalPrice = formattedOriginalPrice,
        discountPercentage = discountPercentage,
        currency = currency,
        isFree = isFree,
        storeUrl = storeUrl,
        platform = platform,
        psPrice = if (platform.equals("PlayStation", true)) price else null,
        xboxPrice = if (platform.equals("Xbox", true)) price else null
      )
    } catch (_: Exception) {
      return null
    }
  }

  private fun findEditionsInCatalog(json: JsonObject, gameTitle: String, platform: String): List<GameEdition> {
    val editions = mutableListOf<GameEdition>()
    try {
      val dataArr = when {
        json.has("data") && json.get("data").isJsonArray -> json.getAsJsonArray("data")
        json.has("results") && json.get("results").isJsonArray -> json.getAsJsonArray("results")
        else -> null
      } ?: return emptyList()

      for (i in 0 until dataArr.size()) {
        val elem = dataArr.get(i)
        if (elem.isJsonObject) {
          val obj = elem.asJsonObject
          val title = obj.optString("title") ?: obj.optString("name") ?: ""
          if (title.contains(gameTitle, ignoreCase = true) || gameTitle.contains(title, ignoreCase = true)) {
            parseSingleEdition(obj, platform)?.let { editions.add(it) }
          }
        }
      }
    } catch (_: Exception) {}
    return editions
  }

  private fun parseGamesFromCatalogResponse(json: JsonObject, defaultPlatform: String): List<GameItem> {
    val games = mutableListOf<GameItem>()
    try {
      val source = json.optString("source") ?: "live"
      val dataArr = when {
        json.has("data") && json.get("data").isJsonArray -> json.getAsJsonArray("data")
        json.has("results") && json.get("results").isJsonArray -> json.getAsJsonArray("results")
        else -> null
      } ?: return emptyList()

      for (i in 0 until dataArr.size()) {
        val elem = dataArr.get(i)
        if (elem.isJsonObject) {
          val obj = elem.asJsonObject
          val idStr = obj.optString("id") ?: i.toString()
          val id = idStr.hashCode().toLong()
          val title = obj.optString("title") ?: obj.optString("name") ?: "Game"
          val coverImage = obj.optString("coverImage") ?: obj.optString("posterUrl") ?: obj.optString("boxArt")
          val bannerImage = obj.optString("bannerImage") ?: obj.optString("backdropUrl") ?: coverImage
          val releaseDate = obj.optString("releaseDate")
          val releaseYear = releaseDate?.takeIf { it.length >= 4 }?.substring(0, 4) ?: ""
          val rating = obj.optDouble("rating") ?: 0.0
          val developer = obj.optString("developer")
          val publisher = obj.optString("publisher")
          val description = obj.optString("description") ?: ""
          val storeUrl = obj.optString("storeUrl")

          // Parse supportedHardware
          val supportedHardware = mutableListOf<String>()
          if (obj.has("supportedHardware") && obj.get("supportedHardware").isJsonArray) {
            val hwArr = obj.getAsJsonArray("supportedHardware")
            for (j in 0 until hwArr.size()) {
              hwArr.get(j).asString?.let { supportedHardware.add(it.lowercase().trim()) }
            }
          }
          if (supportedHardware.isEmpty()) {
            if (defaultPlatform.equals("PlayStation", true)) {
              supportedHardware.add("ps5")
            } else if (defaultPlatform.equals("Xbox", true)) {
              supportedHardware.add("xbox_series")
            }
          }

          // Parse Price
          var gamePrice: GamePrice? = null
          if (obj.has("price") && obj.get("price").isJsonObject) {
            val pObj = obj.getAsJsonObject("price")
            gamePrice = GamePrice(
              formattedBasePrice = pObj.optString("formattedBasePrice"),
              formattedDiscountedPrice = pObj.optString("formattedDiscountedPrice"),
              discountPercentage = pObj.optInt("discountPercentage"),
              isFree = pObj.optBoolean("isFree"),
              basePrice = pObj.optDouble("basePrice"),
              discountedPrice = pObj.optDouble("discountedPrice"),
              currency = pObj.optString("currency"),
              source = source
            )
          }

          val genres = mutableListOf<String>()
          if (obj.has("genres") && obj.get("genres").isJsonArray) {
            val gArr = obj.getAsJsonArray("genres")
            for (k in 0 until gArr.size()) {
              gArr.get(k).asString?.let { genres.add(it) }
            }
          }

          games.add(
            GameItem(
              id = id,
              title = title,
              overview = description,
              posterUrl = coverImage,
              backdropUrl = bannerImage,
              releaseDate = releaseDate,
              releaseYear = releaseYear,
              rating = rating,
              metacritic = null,
              genres = genres,
              publishers = listOfNotNull(publisher),
              developers = listOfNotNull(developer),
              supportedHardware = supportedHardware,
              price = gamePrice
            )
          )
        }
      }
    } catch (_: Exception) {}
    return games
  }

  private fun JsonObject.optString(key: String): String? {
    return if (has(key) && !get(key).isJsonNull) {
      try {
        get(key).asString
      } catch (_: Exception) {
        null
      }
    } else null
  }

  private fun JsonObject.optDouble(key: String): Double? {
    return if (has(key) && !get(key).isJsonNull) {
      try {
        get(key).asDouble
      } catch (_: Exception) {
        null
      }
    } else null
  }

  private fun JsonObject.optInt(key: String): Int? {
    return if (has(key) && !get(key).isJsonNull) {
      try {
        get(key).asInt
      } catch (_: Exception) {
        null
      }
    } else null
  }

  private fun JsonObject.optBoolean(key: String): Boolean {
    return if (has(key) && !get(key).isJsonNull) {
      try {
        get(key).asBoolean
      } catch (_: Exception) {
        false
      }
    } else false
  }
}
