package com.example.data.repository

import com.example.data.local.MovieDao
import com.example.data.local.MovieEntity
import com.example.data.local.UserRatingDao
import com.example.data.local.UserRatingEntity
import com.example.data.remote.NetworkModule
import com.example.data.remote.VeyloraBackendApiService
import com.example.data.remote.model.VeyloraMovieDto
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
  private val backendApiService: VeyloraBackendApiService = NetworkModule.createVeyloraBackendApiService(),
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
      backendApiService.getMovies(category = "trending", page = 1).data.orEmpty()
    }
  }

  suspend fun fetchPopularMovies(forceRefresh: Boolean = false): Result<List<Movie>> {
    return fetchAndCacheCategory("POPULAR") {
      backendApiService.getMovies(category = "popular", page = 1).data.orEmpty()
    }
  }

  suspend fun fetchTopRatedMovies(forceRefresh: Boolean = false): Result<List<Movie>> {
    return fetchAndCacheCategory("TOP_RATED") {
      backendApiService.getMovies(category = "top_rated", page = 1).data.orEmpty()
    }
  }

  suspend fun fetchNowPlayingMovies(forceRefresh: Boolean = false): Result<List<Movie>> {
    return fetchAndCacheCategory("NOW_PLAYING") {
      backendApiService.getMovies(category = "now_playing", page = 1).data.orEmpty()
    }
  }

  fun observeMoviesByCategory(category: String): Flow<List<Movie>> {
    return movieDao.getMoviesByCategory(category).map { list ->
      list.map { it.toDomain() }
    }
  }

  suspend fun searchMovies(query: String): Result<List<Movie>> {
    return try {
      val response = backendApiService.getMovies(search = query, page = 1)
      val dtoList = response.data.orEmpty()
      val favoriteIds = movieDao.getFavoriteMovieIds().firstOrNull().orEmpty().toSet()
      val domainMovies = dtoList.map { dto ->
        mapDtoToDomain(dto, isFavorite = favoriteIds.contains(dto.id.toLongOrNull() ?: dto.tmdbId ?: 0L))
      }
      Result.success(domainMovies)
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  suspend fun fetchCompanyDetails(companyId: Long): Result<ProductionCompany> {
    return try {
      val res = backendApiService.getCompanyDetails(companyId.toString(), type = "production")
      val dto = res.data ?: throw Exception("Company not found")
      val company = ProductionCompany(
        id = dto.id?.toLongOrNull() ?: companyId,
        name = dto.name ?: "Unknown Studio",
        logoUrl = dto.logo,
        originCountry = dto.country,
        description = dto.description,
        headquarters = dto.headquarters,
        homepage = dto.website
      )
      Result.success(company)
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  /**
   * Fetches comprehensive filmography for a company (e.g. Marvel Studios, Warner Bros, Universal)
   */
  suspend fun fetchCompanyMovies(companyId: Long): Result<List<Movie>> {
    return try {
      val res = backendApiService.getMovies(withCompanies = companyId.toString(), page = 1)
      val dtoList = res.data.orEmpty()
      val favoriteIds = movieDao.getFavoriteMovieIds().firstOrNull().orEmpty().toSet()
      val domainMovies = dtoList.map { dto ->
        mapDtoToDomain(dto, isFavorite = favoriteIds.contains(dto.id.toLongOrNull() ?: dto.tmdbId ?: 0L))
      }
      Result.success(domainMovies)
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  suspend fun getPersonDetails(personId: Long): Result<PersonDetails> {
    personCache[personId]?.let { return Result.success(it) }
    return try {
      val res = backendApiService.getPersonDetails(personId.toString())
      val personDto = res.data ?: throw Exception("Person not found")

      val favoriteIds = movieDao.getFavoriteMovieIds().firstOrNull().orEmpty().toSet()
      val domainMovies = personDto.filmography.orEmpty().map { credit ->
        val mId = credit.id.toLongOrNull() ?: 0L
        Movie(
          id = mId,
          title = credit.title ?: "Untitled",
          overview = "",
          posterUrl = credit.poster,
          backdropUrl = credit.poster,
          releaseDate = credit.year?.let { "$it-01-01" },
          releaseYear = credit.year ?: "Unknown",
          voteAverage = credit.rating ?: 0.0,
          voteCount = 0,
          isFavorite = favoriteIds.contains(mId)
        )
      }

      val details = PersonDetails(
        id = personDto.id.toLongOrNull() ?: personDto.tmdbId ?: personId,
        name = personDto.name ?: "Unknown",
        biography = personDto.biography.orEmpty(),
        profileUrl = personDto.photo,
        birthday = personDto.birthDate,
        deathday = personDto.deathDate,
        placeOfBirth = personDto.birthPlace,
        knownForDepartment = personDto.role,
        popularity = personDto.popularity,
        movies = domainMovies
      )

      personCache[personId] = details
      Result.success(details)
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  suspend fun getMovieDetails(movie: Movie): Result<MovieDetails> {
    detailsCache[movie.id]?.let {
      return Result.success(it.copy(movie = movie))
    }

    return try {
      val res = backendApiService.getMovieDetails(movie.id.toString())
      val detailsDto = res.data ?: throw Exception("Movie details not found")

      val prodCompanies = detailsDto.companies.orEmpty().map { dto ->
        ProductionCompany(
          id = dto.id?.toLongOrNull() ?: 0L,
          name = dto.name ?: "Unknown",
          logoUrl = dto.logo,
          originCountry = dto.country
        )
      }
      val primaryCompany = prodCompanies.firstOrNull { !it.logoUrl.isNullOrBlank() }
        ?: prodCompanies.firstOrNull()

      val cast = detailsDto.cast.orEmpty().take(15).map { c ->
        CastMember(
          id = c.id ?: 0L,
          name = c.name ?: "Unknown",
          character = c.character.orEmpty(),
          profileUrl = c.profileImage
        )
      }

      val crew = detailsDto.crew.orEmpty().take(10).map { c ->
        CastMember(
          id = c.id ?: 0L,
          name = c.name ?: "Unknown",
          character = c.character ?: c.role.orEmpty(),
          profileUrl = c.profileImage
        )
      }

      val videos = detailsDto.trailers.orEmpty()
        .filter { it.site.equals("YouTube", ignoreCase = true) && !it.key.isNullOrBlank() }
        .map { v ->
          MovieVideo(
            id = v.id ?: "",
            key = v.key.orEmpty(),
            title = v.name ?: "Trailer",
            site = v.site ?: "YouTube",
            type = v.type ?: "Trailer",
            isOfficial = true
          )
        }

      val providerList = detailsDto.watchProviders.orEmpty().map { p ->
        WatchProvider(
          id = p.id ?: 0,
          name = p.name ?: "Digital",
          logoUrl = p.logoUrl
        )
      }

      val finalDetails = MovieDetails(
        movie = movie,
        cast = cast,
        crew = crew,
        videos = videos,
        watchProviders = providerList,
        productionCompany = primaryCompany,
        productionCompanies = prodCompanies,
        runtime = detailsDto.runtime,
        tagline = detailsDto.tagline
      )

      detailsCache[movie.id] = finalDetails
      Result.success(finalDetails)
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
    fetchBlock: suspend () -> List<VeyloraMovieDto>
  ): Result<List<Movie>> {
    return try {
      val dtoList = fetchBlock()
      val favoriteIds = movieDao.getFavoriteMovieIds().firstOrNull().orEmpty().toSet()

      val entities = dtoList.mapIndexed { index, dto ->
        val mId = dto.id.toLongOrNull() ?: dto.tmdbId ?: 0L
        MovieEntity(
          id = mId,
          title = dto.title ?: "Untitled",
          overview = dto.overview.orEmpty(),
          posterPath = dto.posterPath,
          backdropPath = dto.backdropPath,
          releaseDate = dto.releaseDate,
          voteAverage = dto.rating ?: 0.0,
          voteCount = dto.voteCount ?: 0,
          category = category,
          isFavorite = favoriteIds.contains(mId),
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

  private fun mapDtoToDomain(dto: VeyloraMovieDto, isFavorite: Boolean): Movie {
    val year = dto.releaseYear?.ifBlank { null }
      ?: dto.releaseDate?.takeIf { it.length >= 4 }?.substring(0, 4)
      ?: "Unknown"
    val poster = dto.poster ?: dto.posterPath?.let { "https://image.tmdb.org/t/p/w342$it" }
    val backdrop = dto.backdrop ?: dto.backdropPath?.let { "https://image.tmdb.org/t/p/original$it" }

    return Movie(
      id = dto.id.toLongOrNull() ?: dto.tmdbId ?: 0L,
      title = dto.title ?: "Untitled",
      overview = dto.overview.orEmpty(),
      posterUrl = poster,
      backdropUrl = backdrop,
      releaseDate = dto.releaseDate,
      releaseYear = year,
      voteAverage = dto.rating ?: 0.0,
      voteCount = dto.voteCount ?: 0,
      isFavorite = isFavorite,
      posterPath = dto.posterPath,
      backdropPath = dto.backdropPath
    )
  }
}


