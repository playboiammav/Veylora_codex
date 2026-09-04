package com.example.data.remote

import com.example.data.remote.model.TmdbCreditsResponse
import com.example.data.remote.model.TmdbMovieDetailsDto
import com.example.data.remote.model.TmdbMovieResponse
import com.example.data.remote.model.TmdbPersonDto
import com.example.data.remote.model.TmdbPersonMovieCreditsResponse
import com.example.data.remote.model.TmdbVideosResponse
import com.example.data.remote.model.TmdbWatchProvidersResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface TmdbApiService {

  @GET("trending/movie/{time_window}")
  suspend fun getTrendingMovies(
    @Path("time_window") timeWindow: String = "day",
    @Query("page") page: Int = 1
  ): TmdbMovieResponse

  @GET("movie/popular")
  suspend fun getPopularMovies(
    @Query("page") page: Int = 1
  ): TmdbMovieResponse

  @GET("movie/top_rated")
  suspend fun getTopRatedMovies(
    @Query("page") page: Int = 1
  ): TmdbMovieResponse

  @GET("movie/now_playing")
  suspend fun getNowPlayingMovies(
    @Query("page") page: Int = 1
  ): TmdbMovieResponse

  @GET("search/movie")
  suspend fun searchMovies(
    @Query("query") query: String,
    @Query("page") page: Int = 1
  ): TmdbMovieResponse

  @GET("movie/{movie_id}")
  suspend fun getMovieDetails(
    @Path("movie_id") movieId: Long
  ): TmdbMovieDetailsDto

  @GET("movie/{movie_id}/credits")
  suspend fun getMovieCredits(
    @Path("movie_id") movieId: Long
  ): TmdbCreditsResponse

  @GET("movie/{movie_id}/videos")
  suspend fun getMovieVideos(
    @Path("movie_id") movieId: Long
  ): TmdbVideosResponse

  @GET("movie/{movie_id}/watch/providers")
  suspend fun getMovieWatchProviders(
    @Path("movie_id") movieId: Long,
    @Query("watch_region") watchRegion: String = "US"
  ): TmdbWatchProvidersResponse

  @GET("discover/movie")
  suspend fun discoverMoviesByCompany(
    @Query("with_companies") companyId: Long,
    @Query("sort_by") sortBy: String = "popularity.desc",
    @Query("page") page: Int = 1
  ): TmdbMovieResponse

  @GET("company/{company_id}")
  suspend fun getCompanyDetails(
    @Path("company_id") companyId: Long
  ): com.example.data.remote.model.TmdbCompanyDetailsDto

  @GET("person/{person_id}")
  suspend fun getPersonDetails(
    @Path("person_id") personId: Long
  ): TmdbPersonDto

  @GET("person/{person_id}/movie_credits")
  suspend fun getPersonMovieCredits(
    @Path("person_id") personId: Long
  ): TmdbPersonMovieCreditsResponse
}

