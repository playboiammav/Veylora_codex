package com.example.ui.deals

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
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
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.LocalOffer
import androidx.compose.material.icons.rounded.OpenInNew
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.compose.SubcomposeAsyncImage
import coil.request.CachePolicy
import coil.request.ImageRequest
import com.example.data.currency.CurrencyManager
import com.example.data.remote.CheapSharkStoreRegistry
import com.example.data.remote.model.GameDealDto
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc300
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc700
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900
import com.example.ui.theme.Zinc950

@Composable
fun GameDealCard(
  deal: GameDealDto,
  modifier: Modifier = Modifier,
  onDealClick: ((GameDealDto) -> Unit)? = null
) {
  val context = LocalContext.current
  val currentCurrency by CurrencyManager.currentCurrency.collectAsState()
  val store = CheapSharkStoreRegistry.getStore(deal.storeID)

  val savingsPercent = deal.savings?.toDoubleOrNull()?.toInt() ?: 0
  val formattedSalePrice = CurrencyManager.formatPrice(deal.salePrice)
  val formattedNormalPrice = CurrencyManager.formatPrice(deal.normalPrice)
  val metacritic = deal.metacriticScore?.toIntOrNull()

  val handleOpenDeal = {
    if (onDealClick != null) {
      onDealClick(deal)
    } else if (!deal.dealID.isNullOrBlank()) {
      try {
        val redirectUrl = "https://www.cheapshark.com/redirect?dealID=${deal.dealID}"
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(redirectUrl)).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
      } catch (e: Exception) {
        android.widget.Toast.makeText(context, "Could not open browser", android.widget.Toast.LENGTH_SHORT).show()
      }
    }
  }

  Card(
    onClick = handleOpenDeal,
    colors = CardDefaults.cardColors(containerColor = Zinc900),
    border = BorderStroke(1.dp, Zinc800),
    shape = RoundedCornerShape(16.dp),
    modifier = modifier
      .fillMaxWidth()
      .testTag("deal_card_${deal.dealID ?: deal.gameID}")
  ) {
    Column(modifier = Modifier.fillMaxWidth()) {
      // Top: Image Banner with Discount Badge & Metacritic Score
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(130.dp)
          .background(MinimalBlack)
      ) {
        SubcomposeAsyncImage(
          model = ImageRequest.Builder(context)
            .data(deal.thumb)
            .crossfade(true)
            .diskCachePolicy(CachePolicy.ENABLED)
            .memoryCachePolicy(CachePolicy.ENABLED)
            .build(),
          contentDescription = deal.title,
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize(),
          loading = {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
              CircularProgressIndicator(color = CinemaWhite, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
            }
          },
          error = {
            Box(
              modifier = Modifier
                .fillMaxSize()
                .background(Zinc800),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Rounded.LocalOffer,
                contentDescription = null,
                tint = Zinc500,
                modifier = Modifier.size(32.dp)
              )
            }
          }
        )

        // Gradient shadow over image
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(
              Brush.verticalGradient(
                colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.8f)),
                startY = 40f
              )
            )
        )

        // Savings percentage badge (Top Left)
        if (savingsPercent > 0) {
          Surface(
            color = Color(0xFFE50914),
            shape = RoundedCornerShape(bottomEnd = 10.dp, topStart = 16.dp),
            modifier = Modifier.align(Alignment.TopStart)
          ) {
            Text(
              text = "-$savingsPercent%",
              color = Color.White,
              fontSize = 12.sp,
              fontWeight = FontWeight.Black,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }
        }

        // Metacritic Badge (Top Right)
        if (metacritic != null && metacritic > 0) {
          val metaColor = when {
            metacritic >= 75 -> Color(0xFF4CAF50)
            metacritic >= 50 -> Color(0xFFFFB800)
            else -> Color(0xFFE50914)
          }
          Surface(
            color = metaColor,
            shape = RoundedCornerShape(6.dp),
            modifier = Modifier
              .align(Alignment.TopEnd)
              .padding(8.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
              Text(
                text = "Metacritic $metacritic",
                color = Color.White,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
              )
            }
          }
        }

        // Store logo badge (Bottom Left inside image)
        Surface(
          color = Zinc950.copy(alpha = 0.9f),
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.dp, CinematicBorderSubtle),
          modifier = Modifier
            .align(Alignment.BottomStart)
            .padding(8.dp)
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
          ) {
            AsyncImage(
              model = ImageRequest.Builder(context)
                .data("https://logo.clearbit.com/${store.domain}")
                .crossfade(true)
                .build(),
              contentDescription = store.name,
              modifier = Modifier
                .size(16.dp)
                .clip(CircleShape)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = store.name,
              color = CinemaWhite,
              fontSize = 11.sp,
              fontWeight = FontWeight.SemiBold
            )
          }
        }
      }

      // Bottom Info & Price Row
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(14.dp)
      ) {
        Text(
          text = deal.title ?: "Game Deal",
          color = CinemaWhite,
          fontSize = 15.sp,
          fontWeight = FontWeight.Bold,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Prices
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
              text = formattedSalePrice,
              color = Color(0xFF4CAF50),
              fontSize = 17.sp,
              fontWeight = FontWeight.ExtraBold
            )

            if (!deal.normalPrice.isNullOrBlank() && deal.normalPrice != deal.salePrice) {
              Spacer(modifier = Modifier.width(8.dp))
              Text(
                text = formattedNormalPrice,
                color = Zinc500,
                fontSize = 13.sp,
                textDecoration = TextDecoration.LineThrough
              )
            }
          }

          // View Deal Action Button
          Button(
            onClick = handleOpenDeal,
            colors = ButtonDefaults.buttonColors(
              containerColor = Color(0xFF6001D2),
              contentColor = Color.White
            ),
            shape = RoundedCornerShape(8.dp),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
            modifier = Modifier
              .height(34.dp)
              .testTag("btn_view_deal_${deal.dealID}")
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = "View Deal",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
              )
              Spacer(modifier = Modifier.width(4.dp))
              Icon(
                imageVector = Icons.Rounded.OpenInNew,
                contentDescription = null,
                modifier = Modifier.size(14.dp)
              )
            }
          }
        }
      }
    }
  }
}

@Composable
fun CompactDealItem(
  deal: GameDealDto,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val store = CheapSharkStoreRegistry.getStore(deal.storeID)
  val savingsPercent = deal.savings?.toDoubleOrNull()?.toInt() ?: 0

  val handleOpenDeal = {
    if (!deal.dealID.isNullOrBlank()) {
      try {
        val redirectUrl = "https://www.cheapshark.com/redirect?dealID=${deal.dealID}"
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(redirectUrl)).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
      } catch (_: Exception) {}
    }
  }

  Card(
    onClick = handleOpenDeal,
    colors = CardDefaults.cardColors(containerColor = Zinc900),
    border = BorderStroke(1.dp, Zinc800),
    shape = RoundedCornerShape(12.dp),
    modifier = modifier
      .width(180.dp)
      .testTag("compact_deal_${deal.dealID}")
  ) {
    Column(modifier = Modifier.fillMaxWidth()) {
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(95.dp)
          .background(MinimalBlack)
      ) {
        SubcomposeAsyncImage(
          model = ImageRequest.Builder(context)
            .data(deal.thumb)
            .crossfade(true)
            .build(),
          contentDescription = deal.title,
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize()
        )

        if (savingsPercent > 0) {
          Surface(
            color = Color(0xFFE50914),
            shape = RoundedCornerShape(bottomEnd = 8.dp, topStart = 12.dp),
            modifier = Modifier.align(Alignment.TopStart)
          ) {
            Text(
              text = "-$savingsPercent%",
              color = Color.White,
              fontSize = 10.sp,
              fontWeight = FontWeight.Black,
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
            )
          }
        }
      }

      Column(modifier = Modifier.padding(10.dp)) {
        Text(
          text = deal.title ?: "Deal",
          color = CinemaWhite,
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
        Spacer(modifier = Modifier.height(4.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = CurrencyManager.formatPrice(deal.salePrice),
            color = Color(0xFF4CAF50),
            fontSize = 13.sp,
            fontWeight = FontWeight.ExtraBold
          )
          AsyncImage(
            model = "https://logo.clearbit.com/${store.domain}",
            contentDescription = store.name,
            modifier = Modifier
              .size(14.dp)
              .clip(CircleShape)
          )
        }
      }
    }
  }
}

@Composable
fun GameDealsSection(
  viewModel: DealsViewModel,
  modifier: Modifier = Modifier
) {
  val uiState by viewModel.uiState.collectAsState()

  Column(
    modifier = modifier
      .fillMaxWidth()
      .padding(vertical = 12.dp)
  ) {
    // Header
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
          imageVector = Icons.Rounded.LocalOffer,
          contentDescription = null,
          tint = Color(0xFF00F2FE),
          modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = "Current Top Deals",
          color = CinemaWhite,
          fontSize = 13.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.sp
        )
      }

      IconButtonRefresh(onClick = { viewModel.retry() })
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Filter Chips
    val filters = listOf(
      "1" to "🎮 Steam",
      "25" to "⚡ Epic Games",
      "7" to "🕹️ GOG",
      "11" to "🎁 Humble"
    )

    val currentFilter = (uiState as? DealsUiState.Success)?.currentFilter ?: "1"

    LazyRow(
      contentPadding = PaddingValues(horizontal = 20.dp),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      items(filters) { (storeId, label) ->
        val isSelected = currentFilter == storeId
        Surface(
          color = if (isSelected) Color(0xFF6001D2) else Zinc900,
          shape = RoundedCornerShape(50.dp),
          border = BorderStroke(1.dp, if (isSelected) Color(0xFF00F2FE) else Zinc800),
          modifier = Modifier
            .clickable {
              viewModel.fetchDeals(storeId = storeId)
            }
            .testTag("deal_filter_$storeId")
        ) {
          Text(
            text = label,
            color = if (isSelected) Color.White else Zinc400,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Body
    when (val state = uiState) {
      is DealsUiState.Loading -> {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .height(180.dp),
          contentAlignment = Alignment.Center
        ) {
          CircularProgressIndicator(
            color = Color(0xFF00F2FE),
            strokeWidth = 2.5.dp,
            modifier = Modifier.size(32.dp)
          )
        }
      }
      is DealsUiState.Success -> {
        LazyRow(
          contentPadding = PaddingValues(horizontal = 20.dp),
          horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          items(state.deals.take(15), key = { "carousel_deal_${it.dealID ?: it.gameID}" }) { deal ->
            CompactDealItem(deal = deal)
          }
        }
      }
      is DealsUiState.Error -> {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .padding(20.dp)
            .background(Zinc900, RoundedCornerShape(12.dp))
            .border(1.dp, Zinc800, RoundedCornerShape(12.dp))
            .padding(16.dp),
          contentAlignment = Alignment.Center
        ) {
          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
              text = state.message,
              color = Zinc400,
              fontSize = 12.sp,
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Button(
              onClick = { viewModel.retry() },
              colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6001D2)),
              shape = RoundedCornerShape(8.dp)
            ) {
              Text("Retry", fontSize = 12.sp)
            }
          }
        }
      }
      is DealsUiState.Empty -> {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .height(100.dp),
          contentAlignment = Alignment.Center
        ) {
          Text("No active deals found.", color = Zinc500, fontSize = 13.sp)
        }
      }
    }
  }
}

@Composable
private fun IconButtonRefresh(onClick: () -> Unit) {
  Box(
    modifier = Modifier
      .size(32.dp)
      .clip(CircleShape)
      .background(Zinc900)
      .border(1.dp, CinematicBorderSubtle, CircleShape)
      .clickable { onClick() },
    contentAlignment = Alignment.Center
  ) {
    Icon(
      imageVector = Icons.Rounded.Refresh,
      contentDescription = "Refresh Deals",
      tint = Zinc400,
      modifier = Modifier.size(16.dp)
    )
  }
}
