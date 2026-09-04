package com.example.ui.company

import android.content.Intent
import android.net.Uri
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
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Refresh
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
import com.example.domain.model.ProductionCompany
import com.example.domain.model.isVerifiedCompany
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
fun CompanyMoviesScreen(
  company: ProductionCompany,
  movies: List<Movie>,
  isLoading: Boolean,
  errorMessage: String?,
  onBackClick: () -> Unit,
  onMovieClick: (Movie) -> Unit,
  onFavoriteClick: (Movie) -> Unit,
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
      .testTag("company_movies_screen")
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
          modifier = Modifier.testTag("company_back_button")
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
            text = "PRODUCTION STUDIO",
            color = Zinc500,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.5.sp
          )
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
              text = company.name,
              color = CinemaWhite,
              fontSize = 16.sp,
              fontWeight = FontWeight.Bold,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
            if (isVerifiedCompany(company.name)) {
              Spacer(modifier = Modifier.width(4.dp))
              Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = "Verified Studio",
                tint = CinemaWhite,
                modifier = Modifier.size(14.dp)
              )
            }
          }
        }
      }
    )

    // Studio Banner / Card
    Surface(
      color = Zinc900,
      border = BorderStroke(1.dp, CinematicBorder),
      shape = RoundedCornerShape(16.dp),
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
      Column(modifier = Modifier.padding(16.dp)) {
        Row(
          verticalAlignment = Alignment.CenterVertically
        ) {
          if (!company.logoUrl.isNullOrBlank()) {
            Box(
              modifier = Modifier
                .size(54.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(CinemaWhite)
                .padding(4.dp),
              contentAlignment = Alignment.Center
            ) {
              SubcomposeAsyncImage(
                model = ImageRequest.Builder(context)
                  .data(company.logoUrl)
                  .crossfade(true)
                  .diskCachePolicy(CachePolicy.ENABLED)
                  .memoryCachePolicy(CachePolicy.ENABLED)
                  .build(),
                contentDescription = company.name,
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize()
              )
            }
            Spacer(modifier = Modifier.width(14.dp))
          }

          Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = company.name,
                color = CinemaWhite,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
              )
              if (isVerifiedCompany(company.name)) {
                Spacer(modifier = Modifier.width(6.dp))
                Icon(
                  imageVector = Icons.Default.CheckCircle,
                  contentDescription = "Verified Studio",
                  tint = CinemaWhite,
                  modifier = Modifier.size(16.dp)
                )
              }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              company.originCountry?.takeIf { it.isNotBlank() }?.let { country ->
                Surface(
                  color = Zinc800,
                  shape = RoundedCornerShape(4.dp),
                  border = BorderStroke(1.dp, CinematicBorderSubtle)
                ) {
                  Text(
                    text = country,
                    color = Zinc400,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                  )
                }
              }
              Text(
                text = if (isLoading) "Loading full catalog..." else "${movies.size} titles discovered",
                color = Zinc400,
                fontSize = 12.sp
              )
            }
          }
        }

        // Official Website / Headquarters if present
        if (!company.homepage.isNullOrBlank() || !company.headquarters.isNullOrBlank()) {
          Spacer(modifier = Modifier.height(12.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            company.headquarters?.takeIf { it.isNotBlank() }?.let { hq ->
              Text(
                text = "HQ: $hq",
                color = Zinc500,
                fontSize = 11.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f, fill = false)
              )
            }

            company.homepage?.takeIf { it.isNotBlank() }?.let { url ->
              OutlinedButton(
                onClick = {
                  try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                  } catch (_: Exception) {}
                },
                shape = RoundedCornerShape(8.dp),
                border = BorderStroke(1.dp, CinematicBorderSubtle),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = CinemaWhite),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                modifier = Modifier.height(32.dp)
              ) {
                Text("Official Website", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                  imageVector = Icons.AutoMirrored.Filled.OpenInNew,
                  contentDescription = null,
                  modifier = Modifier.size(12.dp)
                )
              }
            }
          }
        }
      }
    }

    // Content Area
    when {
      isLoading -> {
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
              text = "Discovering studio filmography...",
              color = Zinc400,
              fontSize = 13.sp
            )
          }
        }
      }

      errorMessage != null -> {
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

      movies.isEmpty() -> {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "No movies currently cataloged for this studio.",
            color = Zinc500,
            fontSize = 13.sp,
            textAlign = TextAlign.Center
          )
        }
      }

      else -> {
        LazyVerticalGrid(
          columns = GridCells.Fixed(2),
          contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
          horizontalArrangement = Arrangement.spacedBy(12.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp),
          modifier = Modifier
            .fillMaxSize()
            .testTag("company_movies_grid")
        ) {
          items(movies, key = { "comp_${company.id}_${it.id}" }) { movie ->
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

