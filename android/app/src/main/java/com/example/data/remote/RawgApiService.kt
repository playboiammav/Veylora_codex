package com.example.data.remote

import com.example.data.remote.model.*
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface RawgApiService {

  companion object {
    val RAWG_API_KEY: String
      get() = NetworkModule.RAWG_API_KEY
    const val BASE_URL = "https://api.rawg.io/api/"
  }

  @GET("games")
  suspend fun getGames(
    @Query("key") apiKey: String = RAWG_API_KEY,
    @Query("page") page: Int = 1,
    @Query("page_size") pageSize: Int = 20,
    @Query("ordering") ordering: String = "-rating",
    @Query("search") search: String? = null
  ): RawgGamesResponse

  @GET("games")
  suspend fun getTrendingGames(
    @Query("key") apiKey: String = RAWG_API_KEY,
    @Query("page") page: Int = 1,
    @Query("page_size") pageSize: Int = 20,
    @Query("dates") dates: String? = null,
    @Query("ordering") ordering: String = "-added"
  ): RawgGamesResponse

  @GET("games")
  suspend fun getUpcomingGames(
    @Query("key") apiKey: String = RAWG_API_KEY,
    @Query("page") page: Int = 1,
    @Query("page_size") pageSize: Int = 20,
    @Query("dates") dates: String = "2026-09-01,2027-12-31",
    @Query("ordering") ordering: String = "-added"
  ): RawgGamesResponse

  @GET("games")
  suspend fun getRecentlyReleasedGames(
    @Query("key") apiKey: String = RAWG_API_KEY,
    @Query("page") page: Int = 1,
    @Query("page_size") pageSize: Int = 20,
    @Query("dates") dates: String = "2026-01-01,2026-08-28",
    @Query("ordering") ordering: String = "-released"
  ): RawgGamesResponse

  @GET("games")
  suspend fun getTop50Games(
    @Query("key") apiKey: String = RAWG_API_KEY,
    @Query("page") page: Int = 1,
    @Query("page_size") pageSize: Int = 50,
    @Query("ordering") ordering: String = "-metacritic",
    @Query("dates") dates: String = "2017-01-01,2026-12-31",
    @Query("parent_platforms") parentPlatforms: String = "1,2,3,8"
  ): RawgGamesResponse

  @GET("games")
  suspend fun getGamesByPublisher(
    @Query("publishers") publishers: String,
    @Query("key") apiKey: String = RAWG_API_KEY,
    @Query("page") page: Int = 1,
    @Query("page_size") pageSize: Int = 40
  ): RawgGamesResponse

  @GET("games")
  suspend fun getGamesByDeveloper(
    @Query("developers") developers: String,
    @Query("key") apiKey: String = RAWG_API_KEY,
    @Query("page") page: Int = 1,
    @Query("page_size") pageSize: Int = 40
  ): RawgGamesResponse

  @GET("games/{id}")
  suspend fun getGameDetails(
    @Path("id") gameId: String,
    @Query("key") apiKey: String = RAWG_API_KEY
  ): RawgGameDetailResponse

  @GET("games/{id}/screenshots")
  suspend fun getGameScreenshots(
    @Path("id") gameId: String,
    @Query("key") apiKey: String = RAWG_API_KEY
  ): RawgScreenshotsResponse

  @GET("games/{id}/stores")
  suspend fun getGameStores(
    @Path("id") gameId: String,
    @Query("key") apiKey: String = RAWG_API_KEY
  ): RawgGameStoresResponse

  @GET("developers/{id}")
  suspend fun getDeveloperDetails(
    @Path("id") id: String,
    @Query("key") apiKey: String = RAWG_API_KEY
  ): RawgCompanyDetailResponse

  @GET("publishers/{id}")
  suspend fun getPublisherDetails(
    @Path("id") id: String,
    @Query("key") apiKey: String = RAWG_API_KEY
  ): RawgCompanyDetailResponse
}
