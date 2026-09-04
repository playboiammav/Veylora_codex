package com.example.ui.publisher

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.VideogameAsset
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
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
import com.example.domain.model.GameCompany
import com.example.domain.model.GameItem
import com.example.ui.home.components.StandardGameCard
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc300
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc700
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PublisherGamesScreen(
  publisher: GameCompany,
  games: List<GameItem>,
  isLoading: Boolean,
  errorMessage: String?,
  onBackClick: () -> Unit,
  onGameClick: (GameItem) -> Unit,
  onRetry: () -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current

  BackHandler(onBack = onBackClick)

  Column(
    modifier = modifier
      .fillMaxSize()
      .background(MinimalBlack)
      .statusBarsPadding()
      .testTag("publisher_games_screen")
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
          modifier = Modifier.testTag("publisher_back_button")
        ) {
          Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = "Back",
            tint = CinemaWhite
          )
        }
      },
      title = {
        Text(
          text = publisher.name,
          fontWeight = FontWeight.Bold,
          fontSize = 18.sp,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
      }
    )

    if (isLoading && games.isEmpty()) {
      Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
      ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
          CircularProgressIndicator(
            color = CinemaWhite,
            strokeWidth = 3.dp,
            modifier = Modifier.size(36.dp)
          )
          Spacer(modifier = Modifier.height(14.dp))
          Text(
            text = "Loading ${publisher.name} catalogue...",
            color = Zinc400,
            fontSize = 13.sp
          )
        }
      }
    } else if (errorMessage != null && games.isEmpty()) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .padding(24.dp),
        contentAlignment = Alignment.Center
      ) {
        Column(
          horizontalAlignment = Alignment.CenterHorizontally,
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Text(
            text = errorMessage,
            color = Zinc400,
            fontSize = 14.sp,
            textAlign = TextAlign.Center
          )
          OutlinedButton(
            onClick = onRetry,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = CinemaWhite),
            border = BorderStroke(1.dp, Zinc700)
          ) {
            Icon(imageVector = Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Retry")
          }
        }
      }
    } else {
      LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 150.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier
          .fillMaxSize()
          .testTag("publisher_games_grid")
      ) {
        // Publisher Header Banner
        item(span = { GridItemSpan(maxLineSpan) }) {
          PublisherHeaderSection(publisher = publisher, gamesCount = games.size)
        }

        if (games.isEmpty()) {
          item(span = { GridItemSpan(maxLineSpan) }) {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 40.dp),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = "No indexed games found for this publisher.",
                color = Zinc500,
                fontSize = 14.sp
              )
            }
          }
        } else {
          items(games, key = { "pub_game_${it.id}" }) { game ->
            StandardGameCard(
              game = game,
              showReleaseDate = true,
              onGameClick = onGameClick,
              modifier = Modifier.fillMaxWidth()
            )
          }
        }
      }
    }
  }
}

@Composable
private fun PublisherHeaderSection(
  publisher: GameCompany,
  gamesCount: Int
) {
  val context = LocalContext.current

  Surface(
    color = Zinc900,
    shape = RoundedCornerShape(20.dp),
    border = BorderStroke(1.dp, CinematicBorderSubtle),
    modifier = Modifier
      .fillMaxWidth()
      .padding(bottom = 12.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(20.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Box(
        modifier = Modifier
          .size(72.dp)
          .clip(CircleShape)
          .background(Zinc800)
          .border(1.5.dp, CinematicBorderSubtle, CircleShape),
        contentAlignment = Alignment.Center
      ) {
        if (!publisher.imageUrl.isNullOrBlank()) {
          SubcomposeAsyncImage(
            model = ImageRequest.Builder(context)
              .data(publisher.imageUrl)
              .crossfade(true)
              .diskCachePolicy(CachePolicy.ENABLED)
              .memoryCachePolicy(CachePolicy.ENABLED)
              .build(),
            contentDescription = publisher.name,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
          )
        } else {
          Icon(
            imageVector = Icons.Default.VideogameAsset,
            contentDescription = null,
            tint = CinemaWhite,
            modifier = Modifier.size(36.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
      ) {
        Text(
          text = publisher.name,
          color = CinemaWhite,
          fontSize = 20.sp,
          fontWeight = FontWeight.Bold,
          textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.width(6.dp))
        Icon(
          imageVector = Icons.Default.CheckCircle,
          contentDescription = "Verified Publisher",
          tint = Color(0xFF4CAF50),
          modifier = Modifier.size(18.dp)
        )
      }

      Spacer(modifier = Modifier.height(4.dp))

      Text(
        text = if (publisher.isDeveloper) "Game Developer & Studio" else "Game Publisher & Studio",
        color = Zinc400,
        fontSize = 12.sp
      )

      Spacer(modifier = Modifier.height(12.dp))

      Surface(
        color = Zinc800,
        shape = RoundedCornerShape(50.dp)
      ) {
        Text(
          text = "${publisher.gamesCount ?: gamesCount} Games Cataloged",
          color = Zinc300,
          fontSize = 12.sp,
          fontWeight = FontWeight.SemiBold,
          modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
        )
      }

      if (!publisher.description.isNullOrBlank()) {
        Spacer(modifier = Modifier.height(16.dp))
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .background(Zinc800.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
            .padding(14.dp),
          horizontalAlignment = Alignment.Start
        ) {
          Text(
            text = "ABOUT",
            color = Zinc400,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
          )
          Spacer(modifier = Modifier.height(6.dp))
          Text(
            text = publisher.description,
            color = Zinc300,
            fontSize = 13.sp,
            lineHeight = 19.sp
          )
        }
      }
    }
  }
}
