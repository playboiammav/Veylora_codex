package com.example.ui.components

import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Verified
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun VerifiedBadge(
  isVerified: Boolean,
  modifier: Modifier = Modifier,
  size: Dp = 18.dp
) {
  val colors = if (isVerified) {
    listOf(Color(0xFF1877F2), Color(0xFF0866FF))
  } else {
    listOf(Color(0xFF9CA3AF), Color(0xFF4B5563))
  }

  Icon(
    imageVector = Icons.Rounded.Verified,
    contentDescription = if (isVerified) "Verified User" else "Unverified User",
    tint = Color.Unspecified,
    modifier = modifier
      .size(size)
      .fastPingPongGradientMask(colors)
      .testTag("verified_badge")
  )
}
