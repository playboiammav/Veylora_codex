package com.example.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.graphicsLayer

@Composable
fun rememberFastPingPongBrush(colors: List<Color>): Brush {
  val transition = rememberInfiniteTransition(label = "PingPongGradientTransition")
  val offset by transition.animateFloat(
    initialValue = 0f,
    targetValue = 1000f,
    animationSpec = infiniteRepeatable(
      animation = tween(durationMillis = 400, easing = LinearEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "PingPongGradientOffset"
  )
  return Brush.linearGradient(
    colors = colors,
    start = Offset(offset, offset),
    end = Offset(offset + 500f, offset + 500f)
  )
}

fun Modifier.fastPingPongGradientMask(colors: List<Color>): Modifier = composed {
  val brush = rememberFastPingPongBrush(colors)
  this
    .graphicsLayer(alpha = 0.99f)
    .drawWithCache {
      onDrawWithContent {
        drawContent()
        drawRect(brush, blendMode = BlendMode.SrcIn)
      }
    }
}

fun Modifier.fastPingPongGradientBackground(
  colors: List<Color>,
  shape: Shape = androidx.compose.ui.graphics.RectangleShape
): Modifier = composed {
  val brush = rememberFastPingPongBrush(colors)
  this.background(brush, shape)
}
