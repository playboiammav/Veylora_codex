package com.example.data.repository

import com.example.data.local.MovieDao
import com.example.data.local.MovieEntity
import com.example.data.local.UserRatingDao
import com.example.data.local.UserRatingEntity
import com.example.data.remote.RawgApiService
import com.example.data.remote.TmdbApiService
import com.example.data.remote.model.RawgGameDto
import com.example.data.remote.model.TmdbMovieDto
import com.example.data.remote.model.RawgScreenshotsResponse
import com.example.data.remote.model.RawgGameStoresResponse
import com.example.domain.model.CastMember
import com.example.domain.model.GameCompany
import com.example.domain.model.GameItem
import com.example.domain.model.GamePlatform
import com.example.domain.model.GameStoreLink
import com.example.domain.model.Movie
import com.example.domain.model.MovieDetails
import com.example.domain.model.MovieVideo
import com.example.domain.model.PersonDetails
import com.example.domain.model.ProductionCompany
import com.example.domain.model.WatchProvider
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import java.util.concurrent.ConcurrentHashMap

class MovieRepository(
  private val apiService: TmdbApiService,
  private val rawgApiService: RawgApiService,
  private val movieDao: MovieDao,
  private val userRatingDao: UserRatingDao,
  private val consoleStoreRepository: ConsoleStoreRepository = ConsoleStoreRepository()
) {

  private val detailsCache = ConcurrentHashMap<Long, MovieDetails>()
  private val personCache = ConcurrentHashMap<Long, PersonDetails>()
  private val gameDetailsCache = ConcurrentHashMap<Long, GameItem>()

  fun getUserRating(contentKey: String): Flow<Float?> {
    return userRatingDao.getUserRating(contentKey)
  }

  suspend fun saveUserRating(contentKey: String, rating: Float) {
    if (rating <= 0f) {
      userRatingDao.deleteUserRating(contentKey)
    } else {
      userRatingDao.upsertUserRating(UserRatingEntity(contentKey = contentKey, rating = rating))
    }
  }

  fun getFavoriteMovieIds(): Flow<Set<Long>> {
    return movieDao.getFavoriteMovieIds().map { it.toSet() }
  }

  fun getFavoriteMovies(): Flow<List<Movie>> {
    return movieDao.getFavoriteMovies().map { list -> list.map { it.toDomain() } }
  }

  suspend fun fetchTrendingMovies(forceRefresh: Boolean = false): Result<List<Movie>> {
    return fetchAndCacheCategory("TRENDING") {
      apiService.getTrendingMovies(timeWindow = "day", page = 1).results.orEmpty()
    }
  }

  suspend fun fetchPopularMovies(forceRefresh: Boolean = false): Result<List<Movie>> {
    return fetchAndCacheCategory("POPULAR") {
      apiService.getPopularMovies(page = 1).results.orEmpty()
    }
  }

  suspend fun fetchTopRatedMovies(forceRefresh: Boolean = false): Result<List<Movie>> {
    return fetchAndCacheCategory("TOP_RATED") {
      apiService.getTopRatedMovies(page = 1).results.orEmpty()
    }
  }

  suspend fun fetchNowPlayingMovies(forceRefresh: Boolean = false): Result<List<Movie>> {
    return fetchAndCacheCategory("NOW_PLAYING") {
      apiService.getNowPlayingMovies(page = 1).results.orEmpty()
    }
  }

  fun observeMoviesByCategory(category: String): Flow<List<Movie>> {
    return movieDao.getMoviesByCategory(category).map { list ->
      list.map { it.toDomain() }
    }
  }

  suspend fun searchMovies(query: String): Result<List<Movie>> {
    return try {
      val response = apiService.searchMovies(query = query, page = 1)
      val dtoList = response.results.orEmpty()
      val favoriteIds = movieDao.getFavoriteMovieIds().firstOrNull().orEmpty().toSet()
      val domainMovies = dtoList.map { dto ->
        mapDtoToDomain(dto, isFavorite = favoriteIds.contains(dto.id))
      }
      Result.success(domainMovies)
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  suspend fun fetchCompanyDetails(companyId: Long): Result<ProductionCompany> {
    return try {
      val dto = apiService.getCompanyDetails(companyId)
      val company = ProductionCompany(
        id = dto.id,
        name = dto.name ?: "Unknown Studio",
        logoUrl = dto.logoPath?.let { "https://image.tmdb.org/t/p/w300$it" },
        originCountry = dto.originCountry,
        description = dto.description,
        headquarters = dto.headquarters,
        homepage = dto.homepage
      )
      Result.success(company)
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  /**
   * Fetches comprehensive filmography for a company (e.g. Marvel Studios, Warner Bros, Universal)
   * Fetches multiple pages in parallel to return a complete filmography catalog rather than just 20 items.
   */
  suspend fun fetchCompanyMovies(companyId: Long): Result<List<Movie>> {
    return try {
      coroutineScope {
        val page1Deferred = async { apiService.discoverMoviesByCompany(companyId = companyId, page = 1) }
        val page2Deferred = async { runCatching { apiService.discoverMoviesByCompany(companyId = companyId, page = 2) }.getOrNull() }
        val page3Deferred = async { runCatching { apiService.discoverMoviesByCompany(companyId = companyId, page = 3) }.getOrNull() }

        val p1 = page1Deferred.await()
        val p2 = page2Deferred.await()
        val p3 = page3Deferred.await()

        val allResults = (p1.results.orEmpty() + p2?.results.orEmpty() + p3?.results.orEmpty())
          .filter { !it.title.isNullOrBlank() }
          .distinctBy { it.id }
          .sortedByDescending { it.popularity ?: 0.0 }

        val favoriteIds = movieDao.getFavoriteMovieIds().firstOrNull().orEmpty().toSet()
        val domainMovies = allResults.map { dto ->
          mapDtoToDomain(dto, isFavorite = favoriteIds.contains(dto.id))
        }
        Result.success(domainMovies)
      }
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  suspend fun getPersonDetails(personId: Long): Result<PersonDetails> {
    personCache[personId]?.let { return Result.success(it) }
    return try {
      coroutineScope {
        val personDeferred = async { apiService.getPersonDetails(personId) }
        val creditsDeferred = async {
          runCatching { apiService.getPersonMovieCredits(personId) }.getOrNull()
        }

        val personDto = personDeferred.await()
        val creditsResponse = creditsDeferred.await()

        val favoriteIds = movieDao.getFavoriteMovieIds().firstOrNull().orEmpty().toSet()
        val castMovies = creditsResponse?.cast.orEmpty()
        val crewMovies = creditsResponse?.crew.orEmpty()

        // Deduplicate movies by ID and prioritize higher popularity
        val allDtos = (castMovies + crewMovies)
          .filter { !it.title.isNullOrBlank() }
          .distinctBy { it.id }
          .sortedByDescending { it.popularity ?: 0.0 }

        val domainMovies = allDtos.map { dto ->
          mapDtoToDomain(dto, isFavorite = favoriteIds.contains(dto.id))
        }

        val details = PersonDetails(
          id = personDto.id,
          name = personDto.name ?: "Unknown",
          biography = personDto.biography.orEmpty(),
          profileUrl = personDto.profilePath?.let { "https://image.tmdb.org/t/p/w342$it" },
          birthday = personDto.birthday,
          deathday = personDto.deathday,
          placeOfBirth = personDto.placeOfBirth,
          knownForDepartment = personDto.knownForDepartment,
          popularity = personDto.popularity,
          movies = domainMovies
        )

        personCache[personId] = details
        Result.success(details)
      }
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  suspend fun getMovieDetails(movie: Movie): Result<MovieDetails> {
    detailsCache[movie.id]?.let {
      return Result.success(it.copy(movie = movie))
    }

    return try {
      coroutineScope {
        val detailsDeferred = async {
          runCatching { apiService.getMovieDetails(movie.id) }.getOrNull()
        }
        val creditsDeferred = async {
          runCatching { apiService.getMovieCredits(movie.id) }.getOrNull()
        }
        val videosDeferred = async {
          runCatching { apiService.getMovieVideos(movie.id) }.getOrNull()
        }
        val providersDeferred = async {
          runCatching { apiService.getMovieWatchProviders(movie.id) }.getOrNull()
        }

        val detailsResponse = detailsDeferred.await()
        val creditsResponse = creditsDeferred.await()
        val videosResponse = videosDeferred.await()
        val providersResponse = providersDeferred.await()

        val prodCompanies = detailsResponse?.productionCompanies.orEmpty().map { dto ->
          ProductionCompany(
            id = dto.id,
            name = dto.name ?: "Unknown",
            logoUrl = dto.logoPath?.let { "https://image.tmdb.org/t/p/w300$it" },
            originCountry = dto.originCountry
          )
        }
        val primaryCompany = prodCompanies.firstOrNull { !it.logoUrl.isNullOrBlank() }
          ?: prodCompanies.firstOrNull()

        val cast = creditsResponse?.cast.orEmpty()
          .sortedBy { it.order ?: 999 }
          .take(15)
          .map { castDto ->
            CastMember(
              id = castDto.id,
              name = castDto.name ?: "Unknown",
              character = castDto.character.orEmpty(),
              profileUrl = castDto.profilePath?.let { "https://image.tmdb.org/t/p/w185$it" }
            )
          }

        val crew = creditsResponse?.crew.orEmpty()
          .take(10)
          .map { crewDto ->
            CastMember(
              id = crewDto.id,
              name = crewDto.name ?: "Unknown",
              character = crewDto.job ?: crewDto.department.orEmpty(),
              profileUrl = crewDto.profilePath?.let { "https://image.tmdb.org/t/p/w185$it" }
            )
          }

        val videos = videosResponse?.results.orEmpty()
          .filter { it.site.equals("YouTube", ignoreCase = true) && !it.key.isNullOrBlank() }
          .map { videoDto ->
            MovieVideo(
              id = videoDto.id,
              key = videoDto.key.orEmpty(),
              title = videoDto.name ?: "Trailer",
              site = videoDto.site ?: "YouTube",
              type = videoDto.type ?: "Trailer",
              isOfficial = videoDto.official ?: false
            )
          }
          .sortedWith(compareByDescending<MovieVideo> { it.isOfficial }.thenByDescending { it.type == "Trailer" })
          .take(6)

        // Only parse real US providers from TMDB
        val countryProviders = providersResponse?.results?.get("US")
          ?: providersResponse?.results?.values?.firstOrNull()

        val providerList = mutableListOf<WatchProvider>()
        val seenIds = mutableSetOf<Int>()

        // Flatrate (streaming subscription)
        countryProviders?.flatrate?.forEach { p ->
          val pid = p.providerId ?: return@forEach
          if (seenIds.add(pid)) {
            providerList.add(
              WatchProvider(
                id = pid,
                name = p.providerName ?: "Streaming",
                logoUrl = p.logoPath?.let { "https://image.tmdb.org/t/p/w154$it" }
              )
            )
          }
        }

        // Buy / Rent providers
        countryProviders?.rent?.forEach { p ->
          val pid = p.providerId ?: return@forEach
          if (seenIds.add(pid) && providerList.size < 8) {
            providerList.add(
              WatchProvider(
                id = pid,
                name = p.providerName ?: "Digital",
                logoUrl = p.logoPath?.let { "https://image.tmdb.org/t/p/w154$it" }
              )
            )
          }
        }

        countryProviders?.buy?.forEach { p ->
          val pid = p.providerId ?: return@forEach
          if (seenIds.add(pid) && providerList.size < 8) {
            providerList.add(
              WatchProvider(
                id = pid,
                name = p.providerName ?: "Digital",
                logoUrl = p.logoPath?.let { "https://image.tmdb.org/t/p/w154$it" }
              )
            )
          }
        }

        val finalDetails = MovieDetails(
          movie = movie,
          cast = cast,
          crew = crew,
          videos = videos,
          watchProviders = providerList,
          productionCompany = primaryCompany,
          productionCompanies = prodCompanies,
          runtime = detailsResponse?.runtime,
          tagline = detailsResponse?.tagline
        )

        detailsCache[movie.id] = finalDetails
        Result.success(finalDetails)
      }
    } catch (e: Exception) {
      val fallback = MovieDetails(movie = movie)
      Result.success(fallback)
    }
  }

  suspend fun toggleFavorite(movie: Movie) {
    val currentFav = movieDao.isFavorite(movie.id) ?: movie.isFavorite
    val newFav = !currentFav
    val existing = movieDao.getMoviesByCategory("TRENDING").firstOrNull()?.find { it.id == movie.id }
      ?: movieDao.getMoviesByCategory("POPULAR").firstOrNull()?.find { it.id == movie.id }

    val entity = existing?.copy(isFavorite = newFav) ?: MovieEntity(
      id = movie.id,
      title = movie.title,
      overview = movie.overview,
      posterPath = movie.posterPath ?: movie.posterUrl?.substringAfterLast("/"),
      backdropPath = movie.backdropPath ?: movie.backdropUrl?.substringAfterLast("/"),
      releaseDate = movie.releaseDate,
      voteAverage = movie.voteAverage,
      voteCount = movie.voteCount,
      category = "SAVED",
      isFavorite = newFav,
      savedAt = System.currentTimeMillis()
    )
    movieDao.upsertMovies(listOf(entity))
  }

  private suspend fun fetchAndCacheCategory(
    category: String,
    fetchBlock: suspend () -> List<TmdbMovieDto>
  ): Result<List<Movie>> {
    return try {
      val dtoList = fetchBlock()
      val favoriteIds = movieDao.getFavoriteMovieIds().firstOrNull().orEmpty().toSet()

      val entities = dtoList.mapIndexed { index, dto ->
        MovieEntity(
          id = dto.id,
          title = dto.title ?: "Untitled",
          overview = dto.overview.orEmpty(),
          posterPath = dto.posterPath,
          backdropPath = dto.backdropPath,
          releaseDate = dto.releaseDate,
          voteAverage = dto.voteAverage ?: 0.0,
          voteCount = dto.voteCount ?: 0,
          category = category,
          isFavorite = favoriteIds.contains(dto.id),
          savedAt = System.currentTimeMillis() + index
        )
      }

      movieDao.upsertMovies(entities)
      Result.success(entities.map { it.toDomain() })
    } catch (e: Exception) {
      // Return cached data if available
      val cached = movieDao.getMoviesByCategory(category).firstOrNull().orEmpty()
      if (cached.isNotEmpty()) {
        Result.success(cached.map { it.toDomain() })
      } else {
        Result.failure(e)
      }
    }
  }

  private fun mapDtoToDomain(dto: TmdbMovieDto, isFavorite: Boolean): Movie {
    val year = dto.releaseDate?.takeIf { it.length >= 4 }?.substring(0, 4) ?: "Unknown"
    val poster = dto.posterPath?.let { "https://image.tmdb.org/t/p/w342$it" }
    val backdrop = dto.backdropPath?.let { "https://image.tmdb.org/t/p/original$it" }

    return Movie(
      id = dto.id,
      title = dto.title ?: "Untitled",
      overview = dto.overview.orEmpty(),
      posterUrl = poster,
      backdropUrl = backdrop,
      releaseDate = dto.releaseDate,
      releaseYear = year,
      voteAverage = dto.voteAverage ?: 0.0,
      voteCount = dto.voteCount ?: 0,
      isFavorite = isFavorite,
      posterPath = dto.posterPath,
      backdropPath = dto.backdropPath
    )
  }
}


