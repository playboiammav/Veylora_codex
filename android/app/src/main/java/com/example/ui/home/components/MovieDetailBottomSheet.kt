package com.example.ui.home.components

import androidx.compose.runtime.Composable
import com.example.domain.model.ContentType
import com.example.domain.model.Movie
import com.example.domain.model.MovieDetails
import com.example.domain.model.ProductionCompany
import com.example.ui.details.DetailsScreen

@Composable
fun MovieDetailBottomSheet(
  movie: Movie,
  details: MovieDetails? = null,
  isLoadingDetails: Boolean = false,
  onDismiss: () -> Unit,
  onFavoriteClick: (Movie) -> Unit,
  onCompanyClick: (ProductionCompany) -> Unit = {},
  onPersonClick: (Long) -> Unit = {}
) {
  val contentType = ContentType.Movie(
    watchProviders = details?.watchProviders.orEmpty(),
    productionCompanies = details?.productionCompany?.let { listOf(it) }.orEmpty()
  )

  DetailsScreen(
    title = movie.title,
    backdropPath = movie.highResBackdropUrl ?: movie.backdropUrl ?: movie.posterUrl,
    posterUrl = movie.highResPosterUrl ?: movie.posterUrl,
    rating = movie.voteAverage,
    formattedRating = movie.formattedRating,
    voteCount = movie.voteCount,
    releaseDate = movie.releaseDate ?: movie.releaseYear,
    overview = movie.overview,
    contentType = contentType,
    isFavorite = movie.isFavorite,
    cast = details?.cast.orEmpty(),
    videos = details?.videos.orEmpty(),
    isLoadingDetails = isLoadingDetails,
    onDismiss = onDismiss,
    onFavoriteClick = { onFavoriteClick(movie) },
    onCompanyClick = onCompanyClick,
    onPersonClick = onPersonClick
  )
}



