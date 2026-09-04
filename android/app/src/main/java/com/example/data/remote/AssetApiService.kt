package com.example.data.remote

import com.google.gson.JsonObject
import retrofit2.Response
import retrofit2.http.GET

interface AssetApiService {
  @GET("api/assets/logos")
  suspend fun getLogos(): Response<JsonObject>
}
