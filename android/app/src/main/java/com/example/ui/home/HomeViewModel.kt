package com.example.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.CinemaHubApp
import com.example.data.repository.GameRepository
import com.example.data.repository.MovieRepository
import com.example.domain.model.GameItem
import com.example.domain.model.Movie
import com.example.domain.model.PersonDetails
import com.example.domain.model.ProductionCompany
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class HomeViewModel(
  private val repository: MovieRepository,
  private val gameRepository: GameRepository
) : ViewModel() {

  private val _state = MutableStateFlow(HomeState())
  val state: StateFlow<HomeState> = _state.asStateFlow()

  private var searchJob: Job? = null
  private var companyJob: Job? = null
  private var publisherJob: Job? = null
  private var personJob: Job? = null
  private var gameDetailsJob: Job? = null
  private var userRatingJob: Job? = null

  init {
    com.example.data.repository.LogoManager.fetchLogos(viewModelScope)
    observeFavorites()
    handleIntent(HomeIntent.LoadInitialData)
  }

  fun handleIntent(intent: HomeIntent) {
    when (intent) {
      is HomeIntent.LoadInitialData -> loadInitialData()
      is HomeIntent.SelectMediaType -> selectMediaType(intent.mediaType)
      is HomeIntent.SelectCategory -> selectCategory(intent.category)
      is HomeIntent.ToggleFavorite -> toggleFavorite(intent.movie)
      is HomeIntent.RateContent -> rateContent(intent.contentKey, intent.rating)
      is HomeIntent.SelectMovie -> onSelectMovie(intent.movie)
      is HomeIntent.SelectGame -> onSelectGame(intent.game)
      is HomeIntent.SelectCompany -> onSelectCompany(intent.company)
      is HomeIntent.SelectCompanyById -> onSelectCompanyById(intent.companyId)
      is HomeIntent.SelectPublisher -> onSelectPublisher(intent.publisher)
      is HomeIntent.SelectPerson -> onSelectPerson(intent.personId)
      is HomeIntent.SearchQueryChanged -> onSearchQueryChanged(intent.query)
      is HomeIntent.ClearSearch -> _state.update {
        it.copy(searchQuery = "", searchResults = emptyList(), gameSearchResults = emptyList(), isSearching = false)
      }
      is HomeIntent.ToggleFavoritesFilter -> _state.update { it.copy(showFavoritesOnly = !it.showFavoritesOnly) }
      is HomeIntent.Refresh -> refreshData()
      is HomeIntent.DismissError -> _state.update {
        it.copy(errorMessage = null, companyErrorMessage = null, publisherErrorMessage = null, personErrorMessage = null)
      }
    }
  }

  private fun rateContent(contentKey: String, rating: Float) {
    _state.update { it.copy(currentUserRating = if (rating > 0f) rating else null) }
    viewModelScope.launch {
      repository.saveUserRating(contentKey, rating)
    }
  }

  private fun selectMediaType(mediaType: MediaType) {
    _state.update { it.copy(activeMediaType = mediaType) }
    if (mediaType == MediaType.GAMES && _state.value.gamesList.isEmpty()) {
      loadGames()
    }
  }

  private fun loadGames() {
    viewModelScope.launch {
      _state.update { it.copy(isLoadingGames = true) }
      val trendingDeferred = async { gameRepository.fetchTrendingGames() }
      val upcomingDeferred = async { gameRepository.fetchUpcomingGames() }
      val top50Deferred = async { gameRepository.fetchTop50Games() }
      val recentDeferred = async { gameRepository.fetchRecentlyReleasedGames() }

      val trendingResult = trendingDeferred.await()
      val upcomingResult = upcomingDeferred.await()
      val top50Result = top50Deferred.await()
      val recentResult = recentDeferred.await()

      val trending = trendingResult.getOrNull().orEmpty()
        .filter { !it.posterUrl.isNullOrBlank() || !it.backdropUrl.isNullOrBlank() }
        .distinctBy { it.title.trim() }
      val upcoming = upcomingResult.getOrNull().orEmpty()
        .filter { !it.posterUrl.isNullOrBlank() || !it.backdropUrl.isNullOrBlank() }
        .distinctBy { it.title.trim() }
      val top50 = top50Result.getOrNull().orEmpty()
        .filter { !it.posterUrl.isNullOrBlank() || !it.backdropUrl.isNullOrBlank() }
        .distinctBy { it.title.trim() }
      val recent = recentResult.getOrNull().orEmpty()
        .filter { !it.posterUrl.isNullOrBlank() || !it.backdropUrl.isNullOrBlank() }
        .distinctBy { it.title.trim() }

      // Ensure GTA VI is featured or top in upcoming/trending if possible
      val featured = trending.firstOrNull { !it.backdropUrl.isNullOrEmpty() }
        ?: upcoming.firstOrNull { !it.backdropUrl.isNullOrEmpty() }
        ?: trending.firstOrNull()

      _state.update {
        it.copy(
          isLoadingGames = false,
          trendingGames = trending,
          upcomingGames = upcoming,
          recentlyReleasedGames = recent,
          top50GamesGlobally = if (top50.isNotEmpty()) top50 else recent,
          gamesList = if (upcoming.isNotEmpty()) upcoming else trending,
          featuredGame = featured
        )
      }
    }
  }

  private fun observeFavorites() {
    viewModelScope.launch {
      repository.getFavoriteMovieIds().collect { ids ->
        _state.update { current ->
          val updatedSelected = current.selectedMovie?.let { it.copy(isFavorite = ids.contains(it.id)) }
          val updatedDetails = current.selectedMovieDetails?.let { details ->
            details.copy(movie = details.movie.copy(isFavorite = ids.contains(details.movie.id)))
          }
          val updatedCompanyMovies = current.companyMovies.map { it.copy(isFavorite = ids.contains(it.id)) }
          val updatedPersonDetails = current.selectedPersonDetails?.let { person ->
            person.copy(movies = person.movies.map { it.copy(isFavorite = ids.contains(it.id)) })
          }

          current.copy(
            favoriteMovieIds = ids,
            trendingMovies = current.trendingMovies.map { it.copy(isFavorite = ids.contains(it.id)) },
            categorizedMovies = current.categorizedMovies.map { it.copy(isFavorite = ids.contains(it.id)) },
            featuredMovie = current.featuredMovie?.let { it.copy(isFavorite = ids.contains(it.id)) },
            searchResults = current.searchResults.map { it.copy(isFavorite = ids.contains(it.id)) },
            companyMovies = updatedCompanyMovies,
            selectedMovie = updatedSelected,
            selectedMovieDetails = updatedDetails,
            selectedPersonDetails = updatedPersonDetails
          )
        }
      }
    }

    viewModelScope.launch {
      repository.getFavoriteMovies().collect { favorites ->
        _state.update { it.copy(favoriteMovies = favorites) }
      }
    }
  }

  private fun onSelectMovie(movie: Movie?) {
    userRatingJob?.cancel()
    if (movie == null) {
      _state.update { it.copy(selectedMovie = null, selectedMovieDetails = null, currentUserRating = null, isLoadingDetails = false) }
      return
    }
    _state.update { it.copy(selectedMovie = movie, selectedGame = null, currentUserRating = null, isLoadingDetails = true) }

    userRatingJob = viewModelScope.launch {
      repository.getUserRating("movie_${movie.id}").collect { rating ->
        _state.update { it.copy(currentUserRating = rating) }
      }
    }

    viewModelScope.launch {
      val detailsResult = repository.getMovieDetails(movie)
      detailsResult.onSuccess { details ->
        _state.update {
          if (it.selectedMovie?.id == movie.id) {
            it.copy(selectedMovieDetails = details, isLoadingDetails = false)
          } else it
        }
      }.onFailure {
        _state.update { it.copy(isLoadingDetails = false) }
      }
    }
  }

  private fun onSelectGame(game: GameItem?) {
    userRatingJob?.cancel()
    gameDetailsJob?.cancel()
    if (game == null) {
      _state.update { it.copy(selectedGame = null, selectedGameDetails = null, currentUserRating = null, isLoadingDetails = false) }
      return
    }
    _state.update { it.copy(selectedGame = game, selectedGameDetails = null, selectedMovie = null, selectedMovieDetails = null, currentUserRating = null, isLoadingDetails = true) }

    userRatingJob = viewModelScope.launch {
      repository.getUserRating("game_${game.id}").collect { rating ->
        _state.update { it.copy(currentUserRating = rating) }
      }
    }

    gameDetailsJob = viewModelScope.launch {
      val detailsResult = gameRepository.fetchGameDetails(game.id, conceptId = game.conceptId, productId = game.productId)
      detailsResult.onSuccess { gameDetails ->
        _state.update {
          if (it.selectedGame?.id == game.id) {
            it.copy(selectedGame = gameDetails.game, selectedGameDetails = gameDetails, isLoadingDetails = false)
          } else it
        }
      }.onFailure {
        _state.update { it.copy(isLoadingDetails = false) }
      }
    }
  }

  private fun onSelectCompanyById(companyId: Long) {
    val tempCompany = ProductionCompany(id = companyId, name = "Loading Studio...", logoUrl = null)
    onSelectCompany(tempCompany)
    viewModelScope.launch {
      val detailsResult = repository.fetchCompanyDetails(companyId)
      detailsResult.onSuccess { fullCompany ->
        _state.update {
          if (it.selectedCompany?.id == companyId) {
            it.copy(selectedCompany = fullCompany)
          } else it
        }
      }
    }
  }

  private fun onSelectCompany(company: ProductionCompany?) {
    companyJob?.cancel()
    if (company == null) {
      _state.update {
        it.copy(
          selectedCompany = null,
          companyMovies = emptyList(),
          isLoadingCompanyMovies = false,
          companyErrorMessage = null
        )
      }
      return
    }
    _state.update {
      it.copy(
        selectedCompany = company,
        companyMovies = emptyList(),
        isLoadingCompanyMovies = true,
        companyErrorMessage = null
      )
    }
    companyJob = viewModelScope.launch {
      // Also fetch rich company details (homepage, headquarters) in background
      launch {
        val detailsResult = repository.fetchCompanyDetails(company.id)
        detailsResult.onSuccess { fullCompany ->
          _state.update {
            if (it.selectedCompany?.id == company.id) {
              it.copy(selectedCompany = fullCompany)
            } else it
          }
        }
      }

      val result = repository.fetchCompanyMovies(company.id)
      result.onSuccess { movies ->
        _state.update {
          if (it.selectedCompany?.id == company.id) {
            it.copy(companyMovies = movies, isLoadingCompanyMovies = false, companyErrorMessage = null)
          } else it
        }
      }.onFailure { error ->
        _state.update {
          if (it.selectedCompany?.id == company.id) {
            it.copy(
              isLoadingCompanyMovies = false,
              companyErrorMessage = error.localizedMessage ?: "Failed to load company movies"
            )
          } else it
        }
      }
    }
  }

  private fun onSelectPublisher(publisher: com.example.domain.model.GameCompany?) {
    publisherJob?.cancel()
    if (publisher == null) {
      _state.update {
        it.copy(
          selectedPublisher = null,
          publisherGames = emptyList(),
          isLoadingPublisherGames = false,
          publisherErrorMessage = null
        )
      }
      return
    }
    _state.update {
      it.copy(
        selectedPublisher = publisher,
        publisherGames = emptyList(),
        isLoadingPublisherGames = true,
        publisherErrorMessage = null
      )
    }
    publisherJob = viewModelScope.launch {
      launch {
        val detailsResult = gameRepository.fetchCompanyDetails(publisher)
        detailsResult.onSuccess { fullCompany ->
          _state.update {
            if (it.selectedPublisher?.id == publisher.id || it.selectedPublisher?.name == publisher.name) {
              it.copy(selectedPublisher = fullCompany)
            } else it
          }
        }
      }

      val result = gameRepository.fetchGamesByCompany(publisher)
      result.onSuccess { games ->
        _state.update {
          if (it.selectedPublisher?.id == publisher.id || it.selectedPublisher?.name == publisher.name) {
            it.copy(
              publisherGames = games,
              isLoadingPublisherGames = false,
              publisherErrorMessage = null
            )
          } else it
        }
      }.onFailure { error ->
        _state.update {
          if (it.selectedPublisher?.id == publisher.id || it.selectedPublisher?.name == publisher.name) {
            it.copy(
              isLoadingPublisherGames = false,
              publisherErrorMessage = error.localizedMessage ?: "Failed to load games for ${publisher.name}"
            )
          } else it
        }
      }
    }
  }

  private fun onSelectPerson(personId: Long?) {
    personJob?.cancel()
    if (personId == null) {
      _state.update {
        it.copy(
          selectedPersonId = null,
          selectedPersonDetails = null,
          isLoadingPersonDetails = false,
          personErrorMessage = null
        )
      }
      return
    }
    _state.update {
      it.copy(
        selectedPersonId = personId,
        selectedPersonDetails = null,
        isLoadingPersonDetails = true,
        personErrorMessage = null
      )
    }
    personJob = viewModelScope.launch {
      val result = repository.getPersonDetails(personId)
      result.onSuccess { details ->
        _state.update {
          if (it.selectedPersonId == personId) {
            it.copy(selectedPersonDetails = details, isLoadingPersonDetails = false, personErrorMessage = null)
          } else it
        }
      }.onFailure { error ->
        _state.update {
          if (it.selectedPersonId == personId) {
            it.copy(
              isLoadingPersonDetails = false,
              personErrorMessage = error.localizedMessage ?: "Failed to load actor profile"
            )
          } else it
        }
      }
    }
  }

  private fun loadInitialData() {
    viewModelScope.launch {
      _state.update { it.copy(isLoading = true, errorMessage = null) }
      val trendingResult = repository.fetchTrendingMovies()

      trendingResult.onSuccess { movies ->
        val featured = movies.firstOrNull { !it.backdropUrl.isNullOrEmpty() } ?: movies.firstOrNull()
        _state.update {
          it.copy(
            isLoading = false,
            trendingMovies = movies,
            categorizedMovies = movies,
            featuredMovie = featured,
            errorMessage = null
          )
        }
      }.onFailure { error ->
        _state.update {
          it.copy(
            isLoading = false,
            errorMessage = error.localizedMessage ?: "Failed to fetch trending movies from TMDB"
          )
        }
      }

      // Preload popular games
      loadGames()
    }
  }

  private fun selectCategory(category: MovieCategory) {
    _state.update { it.copy(selectedCategory = category, isLoading = true) }
    viewModelScope.launch {
      val result = when (category) {
        MovieCategory.TRENDING -> repository.fetchTrendingMovies()
        MovieCategory.POPULAR -> repository.fetchPopularMovies()
        MovieCategory.TOP_RATED -> repository.fetchTopRatedMovies()
        MovieCategory.NOW_PLAYING -> repository.fetchNowPlayingMovies()
      }

      result.onSuccess { movies ->
        _state.update {
          it.copy(
            isLoading = false,
            categorizedMovies = movies,
            errorMessage = null
          )
        }
      }.onFailure { error ->
        _state.update {
          it.copy(
            isLoading = false,
            errorMessage = error.localizedMessage ?: "Failed to load ${category.displayName}"
          )
        }
      }
    }
  }

  private fun toggleFavorite(movie: Movie) {
    viewModelScope.launch {
      repository.toggleFavorite(movie)
    }
  }

  private fun onSearchQueryChanged(query: String) {
    _state.update { it.copy(searchQuery = query) }
    searchJob?.cancel()

    if (query.isBlank()) {
      _state.update {
        it.copy(searchResults = emptyList(), gameSearchResults = emptyList(), isSearching = false)
      }
      return
    }

    searchJob = viewModelScope.launch {
      delay(350) // Debounce
      _state.update { it.copy(isSearching = true) }

      if (_state.value.activeMediaType == MediaType.MOVIES) {
        val result = repository.searchMovies(query.trim())
        result.onSuccess { movies ->
          _state.update { it.copy(searchResults = movies, isSearching = false) }
        }.onFailure {
          _state.update { it.copy(isSearching = false) }
        }
      } else {
        val result = gameRepository.searchGames(query.trim())
        result.onSuccess { games ->
          _state.update { it.copy(gameSearchResults = games, isSearching = false) }
        }.onFailure {
          _state.update { it.copy(isSearching = false) }
        }
      }
    }
  }

  private fun refreshData() {
    viewModelScope.launch {
      _state.update { it.copy(isRefreshing = true) }
      val trendingResult = repository.fetchTrendingMovies(forceRefresh = true)
      trendingResult.onSuccess { movies ->
        val featured = movies.firstOrNull { !it.backdropUrl.isNullOrEmpty() } ?: movies.firstOrNull()
        _state.update {
          it.copy(
            isRefreshing = false,
            trendingMovies = movies,
            featuredMovie = featured,
            errorMessage = null
          )
        }
      }.onFailure { error ->
        _state.update {
          it.copy(
            isRefreshing = false,
            errorMessage = error.localizedMessage ?: "Failed to refresh"
          )
        }
      }
      // Also reload current category and games
      selectCategory(_state.value.selectedCategory)
      loadGames()
    }
  }

  companion object {
    val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
      @Suppress("UNCHECKED_CAST")
      override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
        val application = checkNotNull(extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]) as CinemaHubApp
        return HomeViewModel(
          repository = application.container.movieRepository,
          gameRepository = application.container.gameRepository
        ) as T
      }
    }
  }
}

