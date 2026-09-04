package com.example.ui.home

import com.example.domain.model.ContentType
import com.example.domain.model.GameCompany
import com.example.domain.model.GameItem
import com.example.domain.model.Movie
import com.example.domain.model.MovieDetails
import com.example.domain.model.PersonDetails
import com.example.domain.model.ProductionCompany

enum class MediaType(val displayName: String) {
  MOVIES("Movies"),
  GAMES("Games")
}

enum class MovieCategory(val displayName: String) {
  TRENDING("Trending"),
  POPULAR("Popular"),
  TOP_RATED("Top Rated"),
  NOW_PLAYING("Now Playing")
}

data class HomeState(
  val activeMediaType: MediaType = MediaType.MOVIES,
  val isLoading: Boolean = true,
  val isRefreshing: Boolean = false,
  val featuredMovie: Movie? = null,
  val featuredGame: GameItem? = null,
  val trendingMovies: List<Movie> = emptyList(),
  val categorizedMovies: List<Movie> = emptyList(),
  val gamesList: List<GameItem> = emptyList(),
  val trendingGames: List<GameItem> = emptyList(),
  val upcomingGames: List<GameItem> = emptyList(),
  val recentlyReleasedGames: List<GameItem> = emptyList(),
  val top50GamesGlobally: List<GameItem> = emptyList(),
  val isLoadingGames: Boolean = false,
  val selectedCategory: MovieCategory = MovieCategory.TRENDING,
  val favoriteMovieIds: Set<Long> = emptySet(),
  val favoriteMovies: List<Movie> = emptyList(),
  val favoriteGames: List<GameItem> = emptyList(),
  val selectedMovie: Movie? = null,
  val selectedMovieDetails: MovieDetails? = null,
  val selectedGame: GameItem? = null,
  val selectedGameDetails: com.example.domain.model.GameDetails? = null,
  val currentUserRating: Float? = null,
  val isLoadingDetails: Boolean = false,
  val selectedCompany: ProductionCompany? = null,
  val companyMovies: List<Movie> = emptyList(),
  val isLoadingCompanyMovies: Boolean = false,
  val companyErrorMessage: String? = null,
  val selectedPublisher: GameCompany? = null,
  val publisherGames: List<GameItem> = emptyList(),
  val isLoadingPublisherGames: Boolean = false,
  val publisherErrorMessage: String? = null,
  val selectedPersonId: Long? = null,
  val selectedPersonDetails: PersonDetails? = null,
  val isLoadingPersonDetails: Boolean = false,
  val personErrorMessage: String? = null,
  val searchQuery: String = "",
  val searchResults: List<Movie> = emptyList(),
  val gameSearchResults: List<GameItem> = emptyList(),
  val isSearching: Boolean = false,
  val showFavoritesOnly: Boolean = false,
  val errorMessage: String? = null
)

sealed interface HomeIntent {
  data object LoadInitialData : HomeIntent
  data class SelectMediaType(val mediaType: MediaType) : HomeIntent
  data class SelectCategory(val category: MovieCategory) : HomeIntent
  data class ToggleFavorite(val movie: Movie) : HomeIntent
  data class RateContent(val contentKey: String, val rating: Float) : HomeIntent
  data class SelectMovie(val movie: Movie?) : HomeIntent
  data class SelectGame(val game: GameItem?) : HomeIntent
  data class SelectCompany(val company: ProductionCompany?) : HomeIntent
  data class SelectCompanyById(val companyId: Long) : HomeIntent
  data class SelectPublisher(val publisher: GameCompany?) : HomeIntent
  data class SelectPerson(val personId: Long?) : HomeIntent
  data class SearchQueryChanged(val query: String) : HomeIntent
  data object ClearSearch : HomeIntent
  data object ToggleFavoritesFilter : HomeIntent
  data object Refresh : HomeIntent
  data object DismissError : HomeIntent
}

