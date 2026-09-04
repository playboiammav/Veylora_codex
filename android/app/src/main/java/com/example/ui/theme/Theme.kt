package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val MonochromeDarkColorScheme = darkColorScheme(
  primary = CinemaWhite,
  onPrimary = CinematicBlack,
  primaryContainer = CinematicSurfaceHighlight,
  onPrimaryContainer = CinemaWhite,
  secondary = CinemaLightGray,
  onSecondary = CinematicBlack,
  secondaryContainer = CinematicSurfaceElevated,
  onSecondaryContainer = CinemaWhite,
  tertiary = CinemaMutedGray,
  onTertiary = CinematicBlack,
  tertiaryContainer = CinematicSurface,
  onTertiaryContainer = CinemaOffWhite,
  background = CinematicBlack,
  onBackground = CinemaWhite,
  surface = CinematicSurface,
  onSurface = CinemaWhite,
  surfaceVariant = CinematicSurfaceElevated,
  onSurfaceVariant = CinemaLightGray,
  surfaceTint = Color.Transparent,
  outline = CinematicBorder,
  outlineVariant = CinematicBorderSubtle,
  inverseSurface = CinemaWhite,
  inverseOnSurface = CinematicBlack,
  inversePrimary = CinematicDarkBg,
  scrim = CinematicBlack
)

private val MonochromeLightColorScheme = lightColorScheme(
  primary = Color(0xFF121212),
  onPrimary = Color.White,
  primaryContainer = Color(0xFFF0F0F0),
  onPrimaryContainer = Color(0xFF121212),
  secondary = Color(0xFF666666),
  onSecondary = Color.White,
  secondaryContainer = Color(0xFFF8F9FA),
  onSecondaryContainer = Color(0xFF121212),
  tertiary = Color(0xFF666666),
  onTertiary = Color.White,
  tertiaryContainer = Color(0xFFF0F0F0),
  onTertiaryContainer = Color(0xFF121212),
  background = Color(0xFFFFFFFF),
  onBackground = Color(0xFF121212),
  surface = Color(0xFFF8F9FA),
  onSurface = Color(0xFF121212),
  surfaceVariant = Color(0xFFF0F0F0),
  onSurfaceVariant = Color(0xFF666666),
  outline = Color(0xFFE0E0E0),
  outlineVariant = Color(0xFFCCCCCC)
)

@Composable
fun CinemaHubTheme(
  darkTheme: Boolean = true,
  content: @Composable () -> Unit
) {
  MaterialTheme(
    colorScheme = if (darkTheme) MonochromeDarkColorScheme else MonochromeLightColorScheme,
    typography = Typography,
    content = content
  )
}

@Composable
fun VeyloraTheme(
  darkTheme: Boolean = true,
  content: @Composable () -> Unit
) {
  CinemaHubTheme(darkTheme = darkTheme, content = content)
}
