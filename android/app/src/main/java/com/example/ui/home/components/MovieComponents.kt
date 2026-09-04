package com.example.ui.home.components

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.SubcomposeAsyncImage
import coil.request.CachePolicy
import coil.request.ImageRequest
import com.example.domain.model.Movie
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorder
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.GlassBg
import com.example.ui.theme.GlassBorder
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc300
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun TrendingMoviesCarousel(
  movies: List<Movie>,
  onMovieClick: (Movie) -> Unit,
  onFavoriteClick: (Movie) -> Unit,
  modifier: Modifier = Modifier
) {
  if (movies.isEmpty()) return
  val maxMovies = movies.take(7)
  val pagerState = rememberPagerState(pageCount = { maxMovies.size })

  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = modifier.fillMaxWidth()
  ) {
    HorizontalPager(
      state = pagerState,
      contentPadding = PaddingValues(horizontal = 32.dp),
      pageSpacing = 16.dp,
      modifier = Modifier
        .fillMaxWidth()
        .height(280.dp)
        .testTag("trending_movies_horizontal_pager")
    ) { page ->
      val movie = maxMovies[page]
      HeroFeaturedMovie(
        movie = movie,
        onMovieClick = onMovieClick,
        onFavoriteClick = onFavoriteClick
      )
    }

    Spacer(modifier = Modifier.height(12.dp))

    // White Dots Indicator
    Row(
      Modifier
        .wrapContentWidth()
        .padding(bottom = 8.dp)
        .testTag("movies_pager_dots_indicator"),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      repeat(pagerState.pageCount) { iteration ->
        val color = if (pagerState.currentPage == iteration) Color.White else Color.DarkGray
        Box(
          modifier = Modifier
            .size(8.dp)
            .clip(CircleShape)
            .background(color)
        )
      }
    }
  }
}

@Composable
fun HeroFeaturedMovie(
  movie: Movie,
  onMovieClick: (Movie) -> Unit,
  onFavoriteClick: (Movie) -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current

  Box(
    modifier = modifier
      .fillMaxWidth()
      .height(270.dp)
      .clip(RoundedCornerShape(20.dp))
      .border(1.dp, CinematicBorder, RoundedCornerShape(20.dp))
      .clickable { onMovieClick(movie) }
      .testTag("featured_hero_card")
  ) {
    // Backdrop Image (High resolution)
    SubcomposeAsyncImage(
      model = ImageRequest.Builder(context)
        .data(movie.highResBackdropUrl ?: movie.backdropUrl ?: movie.posterUrl)
        .crossfade(true)
        .diskCachePolicy(CachePolicy.ENABLED)
        .memoryCachePolicy(CachePolicy.ENABLED)
        .build(),
      contentDescription = movie.title,
      contentScale = ContentScale.Crop,
      modifier = Modifier.fillMaxSize(),
      loading = {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(Zinc900),
          contentAlignment = Alignment.Center
        ) {
          CircularProgressIndicator(
            color = CinemaWhite,
            strokeWidth = 2.dp,
            modifier = Modifier.size(28.dp)
          )
        }
      },
      error = {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(Zinc900),
          contentAlignment = Alignment.Center
        ) {
          Text("No Backdrop", color = Zinc500, fontSize = 12.sp)
        }
      }
    )

    // Smooth Minimalist Gradient Overlay
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(
          Brush.verticalGradient(
            colors = listOf(
              Color(0x22000000),
              Color.Transparent,
              Color(0xCC000000),
              MinimalBlack
            ),
            startY = 0f,
            endY = Float.POSITIVE_INFINITY
          )
        )
    )

    // Bottom Content Information & Minimal Action Buttons
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(18.dp),
      verticalArrangement = Arrangement.Bottom
    ) {
      Text(
        text = movie.title,
        color = CinemaWhite,
        fontSize = 24.sp,
        fontWeight = FontWeight.Bold,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )

      Spacer(modifier = Modifier.height(3.dp))

      Text(
        text = "${movie.formattedRating} Rating • ${movie.releaseYear}",
        color = Zinc300,
        fontSize = 13.sp,
        fontWeight = FontWeight.Medium
      )

      if (movie.overview.isNotBlank()) {
        Spacer(modifier = Modifier.height(4.dp))
        Text(
          text = movie.overview,
          color = Zinc400,
          fontSize = 12.sp,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis,
          lineHeight = 16.sp
        )
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Action Row: Clean Minimalism Buttons
      Row(
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        // "Track Now" / "Details" Primary Button
        Button(
          onClick = { onMovieClick(movie) },
          colors = ButtonDefaults.buttonColors(
            containerColor = CinemaWhite,
            contentColor = MinimalBlack
          ),
          shape = RoundedCornerShape(16.dp),
          modifier = Modifier
            .weight(1f)
            .height(48.dp)
            .testTag("featured_details_button")
        ) {
          Text(
            text = "Track Now",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp
          )
        }

        // Bookmark Frosted Glass Button
        Surface(
          color = if (movie.isFavorite) CinemaWhite else GlassBg,
          shape = RoundedCornerShape(16.dp),
          border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (movie.isFavorite) CinemaWhite else GlassBorder
          ),
          modifier = Modifier
            .size(48.dp)
            .clickable { onFavoriteClick(movie) }
            .testTag("featured_favorite_button")
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = if (movie.isFavorite) Icons.Default.Bookmark else Icons.Outlined.BookmarkBorder,
              contentDescription = "Watchlist",
              tint = if (movie.isFavorite) MinimalBlack else CinemaWhite,
              modifier = Modifier.size(20.dp)
            )
          }
        }
      }
    }
  }
}

@Composable
fun TrendingMovieCard(
  movie: Movie,
  onMovieClick: (Movie) -> Unit,
  onFavoriteClick: (Movie) -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current

  Column(
    modifier = modifier
      .width(110.dp)
      .clickable { onMovieClick(movie) }
      .testTag("movie_card_${movie.id}")
  ) {
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .aspectRatio(0.67f)
        .clip(RoundedCornerShape(18.dp))
        .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(18.dp))
        .background(Zinc900)
    ) {
      // Movie Poster (w342 thumbnail for high performance)
      SubcomposeAsyncImage(
        model = ImageRequest.Builder(context)
          .data(movie.listThumbnailUrl ?: movie.posterUrl)
          .crossfade(true)
          .diskCachePolicy(CachePolicy.ENABLED)
          .memoryCachePolicy(CachePolicy.ENABLED)
          .build(),
        contentDescription = movie.title,
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize(),
        loading = {
          Box(
            modifier = Modifier
              .fillMaxSize()
              .background(Zinc800),
            contentAlignment = Alignment.Center
          ) {
            CircularProgressIndicator(
              color = CinemaWhite,
              strokeWidth = 2.dp,
              modifier = Modifier.size(18.dp)
            )
          }
        },
        error = {
          Box(
            modifier = Modifier
              .fillMaxSize()
              .background(Zinc900),
            contentAlignment = Alignment.Center
          ) {
            Text("No Poster", color = Zinc500, fontSize = 10.sp)
          }
        }
      )

      // Bookmark Button (Top Right Glass Pill)
      Box(
        modifier = Modifier
          .align(Alignment.TopEnd)
          .padding(6.dp)
          .size(28.dp)
          .clip(CircleShape)
          .background(Color(0x99000000))
          .clickable { onFavoriteClick(movie) }
          .testTag("favorite_button_${movie.id}"),
        contentAlignment = Alignment.Center
      ) {
        Icon(
          imageVector = if (movie.isFavorite) Icons.Default.Bookmark else Icons.Outlined.BookmarkBorder,
          contentDescription = "Toggle Favorite",
          tint = CinemaWhite,
          modifier = Modifier.size(15.dp)
        )
      }
    }

    Spacer(modifier = Modifier.height(6.dp))

    Text(
      text = movie.title,
      color = CinemaWhite,
      fontSize = 12.sp,
      fontWeight = FontWeight.Medium,
      maxLines = 1,
      overflow = TextOverflow.Ellipsis
    )

    Text(
      text = "★ ${movie.formattedRating}",
      color = Zinc400,
      fontSize = 11.sp
    )
  }
}

@Composable
fun MovieListItem(
  movie: Movie,
  onMovieClick: (Movie) -> Unit,
  onFavoriteClick: (Movie) -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current

  Row(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(18.dp))
      .background(Zinc900)
      .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(18.dp))
      .clickable { onMovieClick(movie) }
      .padding(10.dp)
      .testTag("movie_list_item_${movie.id}"),
    verticalAlignment = Alignment.CenterVertically
  ) {
    // Poster (w342 thumbnail for high performance)
    Box(
      modifier = Modifier
        .width(64.dp)
        .aspectRatio(0.67f)
        .clip(RoundedCornerShape(12.dp))
        .background(Zinc800)
    ) {
      SubcomposeAsyncImage(
        model = ImageRequest.Builder(context)
          .data(movie.listThumbnailUrl ?: movie.posterUrl)
          .crossfade(true)
          .diskCachePolicy(CachePolicy.ENABLED)
          .memoryCachePolicy(CachePolicy.ENABLED)
          .build(),
        contentDescription = movie.title,
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize()
      )
    }

    Spacer(modifier = Modifier.width(12.dp))

    // Details
    Column(
      modifier = Modifier.weight(1f)
    ) {
      Text(
        text = movie.title,
        color = CinemaWhite,
        fontSize = 15.sp,
        fontWeight = FontWeight.SemiBold,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )

      Spacer(modifier = Modifier.height(2.dp))

      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        Text(
          text = "★ ${movie.formattedRating}",
          color = CinemaWhite,
          fontSize = 12.sp,
          fontWeight = FontWeight.SemiBold
        )
        Text("•", color = Zinc500, fontSize = 10.sp)
        Text(movie.releaseYear, color = Zinc400, fontSize = 12.sp)
      }

      if (movie.overview.isNotBlank()) {
        Spacer(modifier = Modifier.height(4.dp))
        Text(
          text = movie.overview,
          color = Zinc400,
          fontSize = 11.sp,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis,
          lineHeight = 14.sp
        )
      }
    }

    Spacer(modifier = Modifier.width(8.dp))

    IconButton(
      onClick = { onFavoriteClick(movie) },
      modifier = Modifier.testTag("list_favorite_button_${movie.id}")
    ) {
      Icon(
        imageVector = if (movie.isFavorite) Icons.Default.Bookmark else Icons.Outlined.BookmarkBorder,
        contentDescription = "Toggle Watchlist",
        tint = if (movie.isFavorite) CinemaWhite else Zinc500
      )
    }
  }
}


