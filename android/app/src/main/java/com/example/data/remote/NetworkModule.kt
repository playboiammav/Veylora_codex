package com.example.data.remote

import com.example.BuildConfig
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {

  const val PRICE_API_BASE_URL = "https://ais-dev-oi34e4dhfwkni5arkpizws-228330439328.europe-west3.run.app/"
  const val VEYLORA_PROXY_BASE_URL = PRICE_API_BASE_URL

  val TMDB_API_KEY: String
    get() = try {
      BuildConfig.TMDB_API_KEY.ifBlank { "4ab19d12cb3b454ebdf649044e6f698b" }
    } catch (_: Exception) {
      "4ab19d12cb3b454ebdf649044e6f698b"
    }

  val RAWG_API_KEY: String
    get() = try {
      BuildConfig.RAWG_API_KEY.ifBlank { "7fec0c952263468d982273c01e2e977c" }
    } catch (_: Exception) {
      "7fec0c952263468d982273c01e2e977c"
    }

  const val BASE_URL = "https://api.themoviedb.org/3/"
  const val IMAGE_BASE_URL_W500 = "https://image.tmdb.org/t/p/w500"
  const val IMAGE_BASE_URL_ORIGINAL = "https://image.tmdb.org/t/p/original"

  private fun createApiKeyInterceptor(): Interceptor {
    return Interceptor { chain ->
      val originalRequest = chain.request()
      val originalUrl = originalRequest.url

      val urlWithApiKey = originalUrl.newBuilder()
        .addQueryParameter("api_key", TMDB_API_KEY)
        .build()

      val newRequest = originalRequest.newBuilder()
        .url(urlWithApiKey)
        .header("Accept", "application/json")
        .build()

      chain.proceed(newRequest)
    }
  }

  fun createMoshi(): Moshi {
    return Moshi.Builder()
      .addLast(KotlinJsonAdapterFactory())
      .build()
  }

  fun createOkHttpClient(): OkHttpClient {
    val logging = HttpLoggingInterceptor().apply {
      level = HttpLoggingInterceptor.Level.BASIC
    }

    return OkHttpClient.Builder()
      .addInterceptor(createApiKeyInterceptor())
      .addInterceptor(logging)
      .connectTimeout(15, TimeUnit.SECONDS)
      .readTimeout(15, TimeUnit.SECONDS)
      .writeTimeout(15, TimeUnit.SECONDS)
      .build()
  }

  fun createTmdbApiService(
    okHttpClient: OkHttpClient = createOkHttpClient(),
    moshi: Moshi = createMoshi()
  ): TmdbApiService {
    return Retrofit.Builder()
      .baseUrl(BASE_URL)
      .client(okHttpClient)
      .addConverterFactory(MoshiConverterFactory.create(moshi))
      .build()
      .create(TmdbApiService::class.java)
  }

  fun createRawgApiService(
    moshi: Moshi = createMoshi()
  ): RawgApiService {
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
      .baseUrl(RawgApiService.BASE_URL)
      .client(okHttpClient)
      .addConverterFactory(MoshiConverterFactory.create(moshi))
      .build()
      .create(RawgApiService::class.java)
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
