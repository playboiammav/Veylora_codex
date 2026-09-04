package com.example.data.remote

import com.example.data.remote.model.VeyloraCompanyResponse
import com.example.data.remote.model.VeyloraGameDetailResponse
import com.example.data.remote.model.VeyloraGamesResponse
import com.example.data.remote.model.VeyloraMovieDetailResponse
import com.example.data.remote.model.VeyloraMoviesResponse
import com.example.data.remote.model.VeyloraPersonResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface VeyloraBackendApiService {

  @GET("api/games")
  suspend fun getGames(
    @Query("category") category: String? = null,
    @Query("page") page: Int = 1,
    @Query("pageSize") pageSize: Int = 20,
    @Query("search") search: String? = null,
    @Query("genres") genres: String? = null,
    @Query("publishers") publishers: String? = null,
    @Query("developers") developers: String? = null,
    @Query("parent_platforms") parentPlatforms: String? = null,
    @Query("ordering") ordering: String? = null,
    @Query("dates") dates: String? = null
  ): VeyloraGamesResponse

  @GET("api/games/{id}")
  suspend fun getGameDetails(
    @Path("id") id: String
  ): VeyloraGameDetailResponse

  @GET("api/movies")
  suspend fun getMovies(
    @Query("category") category: String? = null,
    @Query("page") page: Int = 1,
    @Query("search") search: String? = null,
    @Query("genre") genre: String? = null,
    @Query("with_companies") withCompanies: String? = null
  ): VeyloraMoviesResponse

  @GET("api/movies/{id}")
  suspend fun getMovieDetails(
    @Path("id") id: String
  ): VeyloraMovieDetailResponse

  @GET("api/people/{id}")
  suspend fun getPersonDetails(
    @Path("id") id: String
  ): VeyloraPersonResponse

  @GET("api/companies/{id}")
  suspend fun getCompanyDetails(
    @Path("id") id: String,
    @Query("type") type: String? = null
  ): VeyloraCompanyResponse
}
