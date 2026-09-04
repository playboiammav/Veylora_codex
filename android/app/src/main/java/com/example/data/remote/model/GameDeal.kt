package com.example.data.remote.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class GameDeal(
  @Json(name = "title") val title: String? = null,
  @Json(name = "dealID") val dealID: String? = null,
  @Json(name = "storeID") val storeID: String? = null,
  @Json(name = "gameID") val gameID: String? = null,
  @Json(name = "salePrice") val salePrice: String? = null,
  @Json(name = "normalPrice") val normalPrice: String? = null,
  @Json(name = "isOnSale") val isOnSale: String? = null,
  @Json(name = "savings") val savings: String? = null,
  @Json(name = "metacriticScore") val metacriticScore: String? = null,
  @Json(name = "steamRatingText") val steamRatingText: String? = null,
  @Json(name = "steamRatingPercent") val steamRatingPercent: String? = null,
  @Json(name = "steamRatingCount") val steamRatingCount: String? = null,
  @Json(name = "steamAppID") val steamAppID: String? = null,
  @Json(name = "releaseDate") val releaseDate: Long? = null,
  @Json(name = "dealRating") val dealRating: String? = null,
  @Json(name = "thumb") val thumb: String? = null
)

typealias GameDealDto = GameDeal
