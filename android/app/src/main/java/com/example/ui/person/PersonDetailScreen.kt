package com.example.ui.person

import androidx.activity.compose.BackHandler
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.SubcomposeAsyncImage
import coil.request.CachePolicy
import coil.request.ImageRequest
import com.example.domain.model.Movie
import com.example.domain.model.PersonDetails
import com.example.ui.home.components.TrendingMovieCard
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorder
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc300
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc700
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900
import com.example.ui.theme.Zinc950

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PersonDetailScreen(
  personDetails: PersonDetails?,
  isLoading: Boolean,
  errorMessage: String?,
  onBackClick: () -> Unit,
  onMovieClick: (Movie) -> Unit,
  onFavoriteClick: (Movie) -> Unit,
  onRetry: () -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  var isBioExpanded by remember { mutableStateOf(false) }

  BackHandler(onBack = onBackClick)

  Column(
    modifier = modifier
      .fillMaxSize()
      .background(MinimalBlack)
      .statusBarsPadding()
      .testTag("person_detail_screen")
  ) {
    // Top Bar
    TopAppBar(
      colors = TopAppBarDefaults.topAppBarColors(
        containerColor = MinimalBlack,
        titleContentColor = CinemaWhite
      ),
      navigationIcon = {
        IconButton(
          onClick = onBackClick,
          modifier = Modifier.testTag("person_back_button")
        ) {
          Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = "Back",
            tint = CinemaWhite
          )
        }
      },
      title = {
        Column {
          Text(
            text = "TALENT PROFILE",
            color = Zinc500,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.5.sp
          )
          Text(
            text = personDetails?.name ?: "Artist Details",
            color = CinemaWhite,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }
      }
    )

    when {
      isLoading && personDetails == null -> {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
          contentAlignment = Alignment.Center
        ) {
          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(
              color = CinemaWhite,
              strokeWidth = 2.dp,
              modifier = Modifier.size(36.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
              text = "Loading artist biography & filmography...",
              color = Zinc400,
              fontSize = 13.sp
            )
          }
        }
      }

      errorMessage != null && personDetails == null -> {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
          contentAlignment = Alignment.Center
        ) {
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
          ) {
            Text(
              text = errorMessage,
              color = Zinc400,
              fontSize = 13.sp,
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
              onClick = onRetry,
              colors = ButtonDefaults.buttonColors(
                containerColor = CinemaWhite,
                contentColor = MinimalBlack
              ),
              shape = RoundedCornerShape(12.dp)
            ) {
              Icon(
                imageVector = Icons.Default.Refresh,
                contentDescription = null,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text("Retry", fontWeight = FontWeight.Bold)
            }
          }
        }
      }

      personDetails != null -> {
        LazyVerticalGrid(
          columns = GridCells.Fixed(2),
          contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
          horizontalArrangement = Arrangement.spacedBy(12.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp),
          modifier = Modifier.fillMaxSize()
        ) {
          // 1. Profile Header Card (Span full width)
          item(span = { GridItemSpan(2) }) {
            Surface(
              color = Zinc900,
              border = BorderStroke(1.dp, CinematicBorder),
              shape = RoundedCornerShape(18.dp),
              modifier = Modifier.fillMaxWidth()
            ) {
              Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                // Portrait Image
                Box(
                  modifier = Modifier
                    .size(92.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Zinc800)
                    .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
                ) {
                  SubcomposeAsyncImage(
                    model = ImageRequest.Builder(context)
                      .data(personDetails.profileUrl)
                      .crossfade(true)
                      .diskCachePolicy(CachePolicy.ENABLED)
                      .memoryCachePolicy(CachePolicy.ENABLED)
                      .build(),
                    contentDescription = personDetails.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                    error = {
                      Box(
                        modifier = Modifier
                          .fillMaxSize()
                          .background(Zinc800),
                        contentAlignment = Alignment.Center
                      ) {
                        Text(
                          text = personDetails.name.take(1).uppercase(),
                          color = CinemaWhite,
                          fontSize = 28.sp,
                          fontWeight = FontWeight.Bold
                        )
                      }
                    }
                  )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = personDetails.name,
                    color = CinemaWhite,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 24.sp
                  )

                  Spacer(modifier = Modifier.height(6.dp))

                  personDetails.knownForDepartment?.takeIf { it.isNotBlank() }?.let { dept ->
                    Surface(
                      color = CinemaWhite,
                      shape = RoundedCornerShape(4.dp)
                    ) {
                      Text(
                        text = dept.uppercase(),
                        color = MinimalBlack,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                      )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                  }

                  personDetails.birthday?.takeIf { it.isNotBlank() }?.let { bday ->
                    Text(
                      text = "Born: $bday",
                      color = Zinc400,
                      fontSize = 11.sp
                    )
                  }

                  personDetails.placeOfBirth?.takeIf { it.isNotBlank() }?.let { place ->
                    Text(
                      text = place,
                      color = Zinc500,
                      fontSize = 11.sp,
                      maxLines = 1,
                      overflow = TextOverflow.Ellipsis
                    )
                  }
                }
              }
            }
          }

          // 2. Biography Section (Span full width)
          if (personDetails.biography.isNotBlank()) {
            item(span = { GridItemSpan(2) }) {
              Surface(
                color = Zinc950,
                border = BorderStroke(1.dp, CinematicBorderSubtle),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(top = 4.dp)
              ) {
                Column(
                  modifier = Modifier
                    .padding(16.dp)
                    .animateContentSize()
                ) {
                  Text(
                    text = "BIOGRAPHY",
                    color = Zinc400,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp
                  )

                  Spacer(modifier = Modifier.height(8.dp))

                  Text(
                    text = personDetails.biography,
                    color = Zinc300,
                    fontSize = 13.sp,
                    lineHeight = 20.sp,
                    maxLines = if (isBioExpanded) Int.MAX_VALUE else 4,
                    overflow = TextOverflow.Ellipsis
                  )

                  if (personDetails.biography.length > 200) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                      text = if (isBioExpanded) "Show Less" else "Read More",
                      color = CinemaWhite,
                      fontSize = 12.sp,
                      fontWeight = FontWeight.Bold,
                      modifier = Modifier
                        .clickable { isBioExpanded = !isBioExpanded }
                        .padding(vertical = 4.dp)
                    )
                  }
                }
              }
            }
          }

          // 3. Filmography Title (Span full width)
          item(span = { GridItemSpan(2) }) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp, bottom = 4.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = "FILMOGRAPHY",
                color = CinemaWhite,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.2.sp
              )
              Text(
                text = "${personDetails.movies.size} titles",
                color = Zinc500,
                fontSize = 12.sp
              )
            }
          }

          // 4. Filmography Movie Grid
          if (personDetails.movies.isEmpty()) {
            item(span = { GridItemSpan(2) }) {
              Box(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(24.dp),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = "No filmography credits available.",
                  color = Zinc500,
                  fontSize = 13.sp
                )
              }
            }
          } else {
            items(personDetails.movies, key = { "actor_mov_${personDetails.id}_${it.id}" }) { movie ->
              TrendingMovieCard(
                movie = movie,
                onMovieClick = { onMovieClick(movie) },
                onFavoriteClick = { onFavoriteClick(movie) },
                modifier = Modifier.fillMaxWidth()
              )
            }
          }
        }
      }
    }
  }
}
