package com.example.data.remote

import com.example.data.remote.model.GameDeal
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface CheapSharkApiService {

  companion object {
    const val BASE_URL = "https://www.cheapshark.com/"
  }

  @GET("api/1.0/deals")
  suspend fun getDeals(
    @Query("storeID") storeID: String = "1",
    @Query("onSale") onSale: Int = 1
  ): Response<List<GameDeal>>

  @GET("api/1.0/games")
  suspend fun searchGames(
    @Query("title") title: String,
    @Query("limit") limit: Int = 10
  ): Response<List<CheapSharkGameSearchItem>>

  @GET("api/1.0/games")
  suspend fun getGameDetails(
    @Query("id") gameId: String
  ): Response<CheapSharkGameDetailResponse>
}

@JsonClass(generateAdapter = true)
data class CheapSharkGameSearchItem(
  @Json(name = "gameID") val gameID: String? = null,
  @Json(name = "steamAppID") val steamAppID: String? = null,
  @Json(name = "cheapest") val cheapest: String? = null,
  @Json(name = "cheapestDealID") val cheapestDealID: String? = null,
  @Json(name = "external") val external: String? = null,
  @Json(name = "internalName") val internalName: String? = null,
  @Json(name = "thumb") val thumb: String? = null
)

@JsonClass(generateAdapter = true)
data class CheapSharkGameDetailResponse(
  @Json(name = "info") val info: CheapSharkGameInfo? = null,
  @Json(name = "cheapestPriceEver") val cheapestPriceEver: CheapSharkCheapestPrice? = null,
  @Json(name = "deals") val deals: List<CheapSharkDealItem>? = null
)

@JsonClass(generateAdapter = true)
data class CheapSharkGameInfo(
  @Json(name = "title") val title: String? = null,
  @Json(name = "steamAppID") val steamAppID: String? = null,
  @Json(name = "thumb") val thumb: String? = null
)

@JsonClass(generateAdapter = true)
data class CheapSharkCheapestPrice(
  @Json(name = "price") val price: String? = null,
  @Json(name = "date") val date: Long? = null
)

@JsonClass(generateAdapter = true)
data class CheapSharkDealItem(
  @Json(name = "storeID") val storeID: String? = null,
  @Json(name = "dealID") val dealID: String? = null,
  @Json(name = "price") val price: String? = null,
  @Json(name = "retailPrice") val retailPrice: String? = null,
  @Json(name = "savings") val savings: String? = null
)

data class CheapSharkStore(
  val id: String,
  val name: String,
  val domain: String
)

object CheapSharkStoreRegistry {
  private val STORES = mapOf(
    "1" to CheapSharkStore("1", "Steam", "steampowered.com"),
    "2" to CheapSharkStore("2", "GamersGate", "gamersgate.com"),
    "3" to CheapSharkStore("3", "GreenManGaming", "greenmangaming.com"),
    "4" to CheapSharkStore("4", "Amazon", "amazon.com"),
    "5" to CheapSharkStore("5", "GameStop", "gamestop.com"),
    "6" to CheapSharkStore("6", "Direct2Drive", "direct2drive.com"),
    "7" to CheapSharkStore("7", "GOG", "gog.com"),
    "8" to CheapSharkStore("8", "Origin / EA", "ea.com"),
    "11" to CheapSharkStore("11", "Humble Store", "humblebundle.com"),
    "15" to CheapSharkStore("15", "Fanatical", "fanatical.com"),
    "21" to CheapSharkStore("21", "WinGameStore", "wingamestore.com"),
    "23" to CheapSharkStore("23", "GameBillet", "gamebillet.com"),
    "24" to CheapSharkStore("24", "Voidu", "voidu.com"),
    "25" to CheapSharkStore("25", "Epic Games Store", "epicgames.com"),
    "27" to CheapSharkStore("27", "Gamesplanet", "gamesplanet.com"),
    "29" to CheapSharkStore("29", "2Game", "2game.com"),
    "30" to CheapSharkStore("30", "IndieGala", "indiegala.com"),
    "31" to CheapSharkStore("31", "Battle.net", "battle.net"),
    "32" to CheapSharkStore("32", "AllYouPlay", "allyouplay.com"),
    "34" to CheapSharkStore("34", "DLGamer", "dlgamer.com")
  )

  fun getStore(storeId: String?): CheapSharkStore {
    if (storeId == null) return CheapSharkStore("0", "Digital Store", "cheapshark.com")
    return STORES[storeId] ?: CheapSharkStore(storeId, "Store #$storeId", "cheapshark.com")
  }
}

