package com.example.data.remote

import com.google.gson.JsonObject
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface PlayStationApiService {
  @GET("api/playstation")
  suspend fun getPlayStationCatalog(
    @Query("category") category: String? = null,
    @Query("size") size: Int? = 24,
    @Query("offset") offset: Int? = 0,
    @Query("locale") locale: String? = "en-us",
    @Query("countryCode") countryCode: String? = "US"
  ): Response<JsonObject>

  @GET("api/playstation/editions")
  suspend fun getPlayStationEditions(
    @Query("conceptId") conceptId: String,
    @Query("locale") locale: String? = "en-us"
  ): Response<JsonObject>

  @GET("api/playstation")
  suspend fun getPlayStationProduct(
    @Query("id") gameId: String
  ): Response<JsonObject>
}
