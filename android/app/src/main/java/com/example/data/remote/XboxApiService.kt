package com.example.data.remote

import com.google.gson.JsonObject
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface XboxApiService {
  @GET("api/xbox")
  suspend fun getXboxCatalog(
    @Query("listType") listType: String = "Deal",
    @Query("market") market: String = "US",
    @Query("language") language: String = "en-us",
    @Query("count") count: Int = 20,
    @Query("enrich") enrich: Boolean = true
  ): Response<JsonObject>

  @GET("api/xbox/editions")
  suspend fun getXboxEditions(
    @Query("productId") productId: String,
    @Query("market") market: String = "US"
  ): Response<JsonObject>

  @GET("api/xbox")
  suspend fun getXboxGamesList(
    @Query("list") listType: String = "Deal"
  ): Response<JsonObject>
}
