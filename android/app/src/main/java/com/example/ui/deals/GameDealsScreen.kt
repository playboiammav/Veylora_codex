package com.example.ui.deals

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.LocalOffer
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.currency.CurrencyManager
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900

@Composable
fun GameDealsScreen(
  viewModel: DealsViewModel,
  modifier: Modifier = Modifier
) {
  val uiState by viewModel.uiState.collectAsState()
  val currentCurrency by CurrencyManager.currentCurrency.collectAsState()

  Column(
    modifier = modifier
      .fillMaxSize()
      .background(MinimalBlack)
      .testTag("game_deals_screen")
  ) {
    // Top Bar Info
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Rounded.LocalOffer,
            contentDescription = null,
            tint = Color(0xFF00F2FE),
            modifier = Modifier.size(20.dp)
          )
          Spacer(modifier = Modifier.size(8.dp))
          Text(
            text = "GAME DEALS & DISCOUNTS",
            color = CinemaWhite,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
          )
        }
        Text(
          text = "Prices in ${currentCurrency.code} (${currentCurrency.flag}) • Powered by CheapShark",
          color = Zinc500,
          fontSize = 11.sp
        )
      }

      IconButton(
        onClick = { viewModel.retry() },
        modifier = Modifier.testTag("deals_refresh_button")
      ) {
        Icon(
          imageVector = Icons.Rounded.Refresh,
          contentDescription = "Refresh",
          tint = CinemaWhite
        )
      }
    }

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
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      modifier = Modifier.padding(bottom = 12.dp)
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
            .testTag("full_deal_filter_$storeId")
        ) {
          Text(
            text = label,
            color = if (isSelected) Color.White else Zinc400,
            fontSize = 12.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
          )
        }
      }
    }

    // Content List
    when (val state = uiState) {
      is DealsUiState.Loading -> {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .padding(40.dp),
          contentAlignment = Alignment.Center
        ) {
          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(
              color = Color(0xFF00F2FE),
              strokeWidth = 3.dp,
              modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
              text = "Scanning digital store discounts...",
              color = Zinc400,
              fontSize = 13.sp
            )
          }
        }
      }
      is DealsUiState.Success -> {
        LazyColumn(
          contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 4.dp, bottom = 90.dp),
          verticalArrangement = Arrangement.spacedBy(16.dp),
          modifier = Modifier.fillMaxSize()
        ) {
          items(state.deals, key = { "full_deal_${it.dealID ?: it.gameID}" }) { deal ->
            GameDealCard(deal = deal)
          }
        }
      }
      is DealsUiState.Error -> {
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
              text = state.message,
              color = Zinc400,
              fontSize = 14.sp,
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
              onClick = { viewModel.retry() },
              colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6001D2)),
              shape = RoundedCornerShape(12.dp)
            ) {
              Text("Retry Loading Deals")
            }
          }
        }
      }
      is DealsUiState.Empty -> {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "No deals currently available for this category.",
            color = Zinc500,
            fontSize = 14.sp
          )
        }
      }
    }
  }
}
