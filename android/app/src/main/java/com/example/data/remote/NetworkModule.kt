package com.example.data.remote

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {

  val BACKEND_BASE_URL: String
    get() = com.example.BuildConfig.BACKEND_BASE_URL

  val PRICE_API_BASE_URL: String
    get() = BACKEND_BASE_URL

  val VEYLORA_PROXY_BASE_URL: String
    get() = BACKEND_BASE_URL

  const val IMAGE_BASE_URL_W500 = "https://image.tmdb.org/t/p/w500"
  const val IMAGE_BASE_URL_ORIGINAL = "https://image.tmdb.org/t/p/original"

  fun createMoshi(): Moshi {
    return Moshi.Builder()
      .addLast(KotlinJsonAdapterFactory())
      .build()
  }

  fun createVeyloraBackendApiService(
    moshi: Moshi = createMoshi()
  ): VeyloraBackendApiService {
    val logging = HttpLoggingInterceptor().apply {
      level = HttpLoggingInterceptor.Level.BASIC
    }
    val okHttpClient = OkHttpClient.Builder()
      .addInterceptor(logging)
      .connectTimeout(15, TimeUnit.SECONDS)
      .readTimeout(15, TimeUnit.SECONDS)
      .writeTimeout(15, TimeUnit.SECONDS)
      .build()

    return Retrofit.Builder()
      .baseUrl(VEYLORA_PROXY_BASE_URL)
      .client(okHttpClient)
      .addConverterFactory(MoshiConverterFactory.create(moshi))
      .build()
      .create(VeyloraBackendApiService::class.java)
  }

  fun createCheapSharkApiService(
    moshi: Moshi = createMoshi()
  ): CheapSharkApiService {
    val logging = HttpLoggingInterceptor().apply {
      level = HttpLoggingInterceptor.Level.BASIC
    }
    val okHttpClient = OkHttpClient.Builder()
      .addInterceptor(logging)
      .connectTimeout(15, TimeUnit.SECONDS)
      .readTimeout(15, TimeUnit.SECONDS)
      .writeTimeout(15, TimeUnit.SECONDS)
      .build()

    return Retrofit.Builder()
      .baseUrl(CheapSharkApiService.BASE_URL)
      .client(okHttpClient)
      .addConverterFactory(MoshiConverterFactory.create(moshi))
      .build()
      .create(CheapSharkApiService::class.java)
  }

  fun createXboxApiService(): XboxApiService {
    val logging = HttpLoggingInterceptor().apply {
      level = HttpLoggingInterceptor.Level.BASIC
    }
    val okHttpClient = OkHttpClient.Builder()
      .addInterceptor(logging)
      .connectTimeout(15, TimeUnit.SECONDS)
      .readTimeout(15, TimeUnit.SECONDS)
      .writeTimeout(15, TimeUnit.SECONDS)
      .build()

    return Retrofit.Builder()
      .baseUrl(VEYLORA_PROXY_BASE_URL)
      .client(okHttpClient)
      .addConverterFactory(GsonConverterFactory.create())
      .build()
      .create(XboxApiService::class.java)
  }

  fun createPlayStationApiService(): PlayStationApiService {
    val logging = HttpLoggingInterceptor().apply {
      level = HttpLoggingInterceptor.Level.BASIC
    }
    val okHttpClient = OkHttpClient.Builder()
      .addInterceptor(logging)
      .connectTimeout(15, TimeUnit.SECONDS)
      .readTimeout(15, TimeUnit.SECONDS)
      .writeTimeout(15, TimeUnit.SECONDS)
      .build()

    return Retrofit.Builder()
      .baseUrl(VEYLORA_PROXY_BASE_URL)
      .client(okHttpClient)
      .addConverterFactory(GsonConverterFactory.create())
      .build()
      .create(PlayStationApiService::class.java)
  }

  fun createAssetApiService(): AssetApiService {
    val logging = HttpLoggingInterceptor().apply {
      level = HttpLoggingInterceptor.Level.BASIC
    }
    val okHttpClient = OkHttpClient.Builder()
      .addInterceptor(logging)
      .connectTimeout(15, TimeUnit.SECONDS)
      .readTimeout(15, TimeUnit.SECONDS)
      .writeTimeout(15, TimeUnit.SECONDS)
      .build()

    return Retrofit.Builder()
      .baseUrl(VEYLORA_PROXY_BASE_URL)
      .client(okHttpClient)
      .addConverterFactory(GsonConverterFactory.create())
      .build()
      .create(AssetApiService::class.java)
  }
}
