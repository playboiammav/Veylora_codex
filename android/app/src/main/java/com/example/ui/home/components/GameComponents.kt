package com.example.ui.home.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.VideogameAsset
import androidx.compose.material.icons.rounded.ToggleOn
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import kotlinx.coroutines.delay
import coil.imageLoader
import com.example.domain.model.GamePlatform
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.compose.SubcomposeAsyncImage
import coil.request.CachePolicy
import coil.request.ImageRequest
import com.example.R
import com.example.domain.model.GameItem
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorder
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc300
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900

// Exact Platform Gradients
val PlayStationGradient = listOf(Color(0xFF003791), Color(0xFF0070CC), Color(0xFF00A8E8))
val XboxGradient = listOf(Color(0xFF107C10), Color(0xFF52B043), Color(0xFF8CC63F))
val NetflixGradient = listOf(Color(0xFFB20710), Color(0xFFE50914), Color(0xFFF40612))
val SteamGradient = listOf(Color(0xFF1B2838), Color(0xFF2A475E), Color(0xFF66C0F4))
val EpicGamesGradient = listOf(Color(0xFF1B1B1B), Color(0xFF2F2F2F), Color(0xFF555555), Color(0xFFFFFFFF))
val AndroidGradient = listOf(Color(0xFF3DDC84), Color(0xFF34A853), Color(0xFF0F9D58))
val IosGradient = listOf(Color(0xFF007AFF), Color(0xFF5856D6), Color(0xFFAF52DE))
val CrunchyrollGradient = listOf(Color(0xFFF47521), Color(0xFFFF9A3D), Color(0xFFFFB86B))
val PrimeVideoGradient = listOf(Color(0xFF00A8E1), Color(0xFF008ED3), Color(0xFF005EB8))
val AppStoreGradient = listOf(Color(0xFF0D6EFD), Color(0xFF5AC8FA), Color(0xFF64D2FF))
val AppleTvPlusGradient = listOf(Color(0xFF000000), Color(0xFF1C1C1E), Color(0xFF3A3A3C))

/**
 * Extracts vibrant/dominant colors from an image URL using Coil & Palette,
 * generating a dynamic animated flowing gradient Brush.
 */
@Composable
fun getDynamicBrushFromImage(imageUrl: String, context: android.content.Context): Brush {
  var vibrantColor by remember { mutableStateOf(Color.DarkGray) }
  var dominantColor by remember { mutableStateOf(Color.Black) }

  LaunchedEffect(imageUrl) {
    if (imageUrl.isBlank()) return@LaunchedEffect
    val request = ImageRequest.Builder(context).data(imageUrl).allowHardware(false).build()
    val result = context.imageLoader.execute(request)
    (result.drawable as? android.graphics.drawable.BitmapDrawable)?.bitmap?.let { bmp ->
      androidx.palette.graphics.Palette.from(bmp).generate { palette ->
        vibrantColor = palette?.vibrantSwatch?.rgb?.let { Color(it) } ?: Color.DarkGray
        dominantColor = palette?.dominantSwatch?.rgb?.let { Color(it) } ?: Color.Black
      }
    }
  }
  // Animated flowing gradient
  val transition = rememberInfiniteTransition(label = "DynamicGradientTransition")
  val offset by transition.animateFloat(
    initialValue = 0f, targetValue = 1000f,
    animationSpec = infiniteRepeatable(tween(3000, easing = LinearEasing), RepeatMode.Restart),
    label = "DynamicGradientOffset"
  )
  return Brush.linearGradient(
    colors = listOf(vibrantColor, dominantColor),
    start = Offset(offset, offset), end = Offset(offset + 500f, offset + 500f)
  )
}

/**
 * Returns exact thematic gradient for games (e.g. GTA VI gradient #FF5A36 -> #FF2D55 -> #C62B8F)
 */
fun getDynamicGradient(gameName: String, fallbackColor: Color = Color.DarkGray): Brush {
    return if (gameName.contains("GTA VI", true)) {
        Brush.linearGradient(colors = listOf(Color(0xFFFF5A36), Color(0xFFFF2D55), Color(0xFFC62B8F)))
    } else {
        // Use dynamically extracted color from API/Coil here, flowing to a darker shade
        Brush.linearGradient(colors = listOf(fallbackColor, fallbackColor.copy(alpha = 0.7f)))
    }
}

/**
 * Thematic Animated Gradient Button for View Game / Hero actions
 */
@Composable
fun ThematicGameButton(
  text: String,
  gameTitle: String,
  imageUrl: String? = null,
  fallbackColorHex: String? = null,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val brush = if (!imageUrl.isNullOrBlank()) {
    getDynamicBrushFromImage(imageUrl, context)
  } else {
    val baseColor = parseHexColor(fallbackColorHex, fallback = Color.DarkGray)
    getDynamicGradient(gameTitle, baseColor)
  }

  Box(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(12.dp))
      .background(brush)
      .clickable { onClick() }
      .padding(vertical = 14.dp),
    contentAlignment = Alignment.Center
  ) {
    Text(text = text, color = Color.White, fontWeight = FontWeight.Bold)
  }
}

/**
 * Returns the exact brand gradient for a platform name or store name
 */
fun getPlatformGradient(name: String): List<Color> {
  val lower = name.lowercase()
  return when {
    lower.contains("playstation") || lower.contains("ps5") || lower.contains("ps4") -> PlayStationGradient
    lower.contains("xbox") || lower.contains("microsoft") -> XboxGradient
    lower.contains("netflix") -> NetflixGradient
    lower.contains("crunchyroll") -> CrunchyrollGradient
    lower.contains("prime") || lower.contains("amazon") -> PrimeVideoGradient
    lower.contains("apple tv") || lower.contains("appletv") -> AppleTvPlusGradient
    lower.contains("app store") -> AppStoreGradient
    lower.contains("epic") -> EpicGamesGradient
    lower.contains("android") || lower.contains("google play") -> AndroidGradient
    lower.contains("ios") || lower.contains("apple") -> IosGradient
    lower.contains("steam") || lower.contains("pc") -> SteamGradient
    else -> SteamGradient
  }
}

/**
 * Maps store name / platform name to SimpleIcons slug
 * URL Format: https://cdn.simpleicons.org/{icon_name}/FFFFFF
 */
fun getSimpleIconName(platformName: String): String {
  val lower = platformName.lowercase().trim()
  return when {
    lower.contains("playstation") || lower.contains("ps5") || lower.contains("ps4") || lower.contains("ps3") || lower.contains("ps store") || lower.contains("sony") -> "playstation"
    lower.contains("xbox") || lower.contains("microsoft") -> "xbox"
    lower.contains("steam") || lower.contains("pc") || lower.contains("valve") -> "steam"
    lower.contains("epic") || lower.contains("epicgames") -> "epicgames"
    lower.contains("nintendo") || lower.contains("switch") || lower.contains("eshop") -> "nintendoswitch"
    lower.contains("gog") -> "gogdotcom"
    lower.contains("netflix") -> "netflix"
    lower.contains("crunchyroll") -> "crunchyroll"
    lower.contains("prime") || lower.contains("amazon") -> "prime"
    lower.contains("apple tv") || lower.contains("appletv") -> "appletv"
    lower.contains("app store") || lower.contains("ios") || lower.contains("apple") -> "apple"
    lower.contains("android") || lower.contains("google play") || lower.contains("google") -> "googleplay"
    lower.contains("itch") -> "itchdotio"
    lower.contains("ubisoft") || lower.contains("uplay") -> "ubisoft"
    lower.contains("ea") || lower.contains("origin") -> "ea"
    else -> "steam"
  }
}

/**
 * Clean platform name for display
 */
fun getCleanPlatformName(name: String): String {
  val lower = name.lowercase()
  return when {
    lower.contains("playstation") || lower.contains("ps5") || lower.contains("ps4") -> "PlayStation"
    lower.contains("xbox") -> "Xbox"
    lower.contains("nintendo") || lower.contains("switch") -> "Nintendo"
    lower.contains("crunchyroll") -> "Crunchyroll"
    lower.contains("prime") || lower.contains("amazon") -> "Prime Video"
    lower.contains("apple tv") || lower.contains("appletv") -> "Apple TV+"
    lower.contains("app store") -> "App Store"
    lower.contains("epic") -> "Epic Games"
    lower.contains("netflix") -> "Netflix"
    lower.contains("android") -> "Android"
    lower.contains("ios") || lower.contains("apple") -> "iOS"
    lower.contains("steam") || lower.contains("pc") -> "Steam"
    else -> name
  }
}

@Composable
fun PlatformIconsRow(
  platforms: List<GamePlatform>,
  supportedHardware: List<String>? = null,
  modifier: Modifier = Modifier,
  logoHeight: androidx.compose.ui.unit.Dp = 16.dp,
  spacing: androidx.compose.ui.unit.Dp = 6.dp
) {
  com.example.util.GameCardPlatformLogosRow(
    platforms = platforms,
    supportedHardware = supportedHardware,
    modifier = modifier,
    logoHeight = logoHeight,
    spacing = spacing
  )
}

/**
 * Animated Gradient Platform Badge with official white PNG logo and brand colors
 */
@Composable
fun PlatformBadge(
  platformName: String,
  onClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  val cleanName = getCleanPlatformName(platformName)
  val logoUrl = com.example.util.PlatformLogoUtils.getLogoUrl(cleanName)
  val brandColors = com.example.util.PlatformLogoUtils.getBrandColors(cleanName)

  val infiniteTransition = rememberInfiniteTransition(label = "PlatformBadgeTransition")
  val offset by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = 2000f,
    animationSpec = infiniteRepeatable(
      animation = tween(4000, easing = LinearEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "PlatformBadgeOffset"
  )
  val brush = Brush.linearGradient(
    colors = if (brandColors.size > 1) brandColors else listOf(brandColors.first(), brandColors.first().copy(alpha = 0.8f)),
    start = Offset(offset, offset),
    end = Offset(offset + 1000f, offset + 1000f)
  )

  Box(
    modifier = modifier
      .clip(RoundedCornerShape(10.dp))
      .background(brush = brush)
      .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
      .padding(horizontal = 12.dp, vertical = 7.dp)
      .testTag("platform_badge_${cleanName.lowercase().replace(" ", "_")}")
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically
    ) {
      if (logoUrl.isNotBlank()) {
        AsyncImage(
          model = logoUrl,
          contentDescription = cleanName,
          modifier = Modifier.size(16.dp),
          contentScale = ContentScale.Fit
        )
        Spacer(modifier = Modifier.width(7.dp))
      }
      Text(
        text = cleanName,
        color = Color.White,
        fontWeight = FontWeight.Bold,
        fontSize = 12.sp
      )
    }
  }
}

/**
 * Animated Gradient Store Button with official white PNG logo and continuous Apple Music style flowing gradient
 */
@Composable
fun AnimatedGradientStoreButton(
  platformName: String,
  simpleIconName: String = getSimpleIconName(platformName),
  gradientColors: List<Color> = com.example.util.PlatformLogoUtils.getBrandColors(platformName),
  onClick: () -> Unit
) {
  val logoUrl = com.example.util.PlatformLogoUtils.getLogoUrl(platformName)
  val infiniteTransition = rememberInfiniteTransition(label = "StoreButtonTransition")
  val animProgress by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = (2.0 * Math.PI).toFloat(),
    animationSpec = infiniteRepeatable(
      animation = tween(3000, easing = LinearEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "WaterFlow"
  )
  val sinOffset = kotlin.math.sin(animProgress.toDouble()).toFloat() * 400f
  val cosOffset = kotlin.math.cos(animProgress.toDouble()).toFloat() * 400f
  val brush = Brush.linearGradient(
    colors = gradientColors + gradientColors.first(),
    start = Offset(400f + sinOffset, 0f + cosOffset),
    end = Offset(1400f + sinOffset, 800f + cosOffset)
  )

  Box(
    modifier = Modifier
      .fillMaxWidth()
      .padding(vertical = 6.dp)
      .clip(RoundedCornerShape(12.dp))
      .background(brush = brush)
      .clickable { onClick() }
      .padding(horizontal = 16.dp, vertical = 14.dp)
      .testTag("animated_gradient_button_${platformName.lowercase().replace(" ", "_")}"),
    contentAlignment = Alignment.Center
  ) {
    Row(verticalAlignment = Alignment.CenterVertically) {
      if (logoUrl.isNotBlank()) {
        AsyncImage(
          model = logoUrl,
          contentDescription = platformName,
          modifier = Modifier.size(24.dp),
          contentScale = ContentScale.Fit
        )
        Spacer(modifier = Modifier.width(12.dp))
      }
      Text(
        text = if (platformName.contains("Store", true)) platformName else "$platformName Store",
        color = Color.White,
        fontWeight = FontWeight.Bold,
        fontSize = 16.sp
      )
    }
  }
}

/**
 * Parses a hex color string (e.g. "0f0f0f" or "#1a2b3c") safely to Compose Color
 */
fun parseHexColor(hexString: String?, fallback: Color = Color(0xFFE50914)): Color {
  if (hexString.isNullOrBlank()) return fallback
  return try {
    val clean = if (hexString.startsWith("#")) hexString else "#$hexString"
    Color(android.graphics.Color.parseColor(clean))
  } catch (_: Exception) {
    fallback
  }
}

/**
 * Dynamic countdown calculation with seconds
 */
fun calculateRemainingSeconds(releaseDateStr: String?): Long {
  if (releaseDateStr.isNullOrBlank()) return -1L
  return try {
    val cleanDateStr = if (releaseDateStr.length >= 10) releaseDateStr.substring(0, 10) else releaseDateStr
    val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
    val targetDate = sdf.parse(cleanDateStr) ?: return -1L
    val now = java.util.Date()
    if (targetDate.after(now)) {
      val diffMs = targetDate.time - now.time
      diffMs / 1000L
    } else -1L
  } catch (_: Exception) {
    -1L
  }
}

/**
 * Dynamic Countdown Timer Composable with Real-Time Ticking Seconds
 * and Thematic Animated Gradient Background
 */
@Composable
fun DynamicCountdownTimer(
  releaseDateStr: String?,
  gameTitle: String = "",
  imageUrl: String? = null,
  fallbackColorHex: String? = null,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  var remainingSecs by remember(releaseDateStr) {
    mutableStateOf(calculateRemainingSeconds(releaseDateStr))
  }

  LaunchedEffect(releaseDateStr) {
    while (true) {
      kotlinx.coroutines.delay(1000L)
      remainingSecs = calculateRemainingSeconds(releaseDateStr)
    }
  }

  if (remainingSecs <= 0L) return

  val days = remainingSecs / 86400
  val hours = (remainingSecs % 86400) / 3600
  val minutes = (remainingSecs % 3600) / 60
  val seconds = remainingSecs % 60
  val countdownFormatted = String.format(java.util.Locale.US, "%02dd %02dh %02dm %02ds", days, hours, minutes, seconds)

  val paletteGradientBrush = Brush.linearGradient(
    colors = listOf(Color(0xFFFF6B35), Color(0xFFFF4FA3), Color(0xFF8E44AD))
  )
  val dynamicBrush = if (!imageUrl.isNullOrBlank()) {
    getDynamicBrushFromImage(imageUrl, context)
  } else {
    paletteGradientBrush
  }

  Box(
    modifier = modifier
      .clip(RoundedCornerShape(8.dp))
      .background(dynamicBrush, RoundedCornerShape(8.dp))
      .border(1.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
      .padding(horizontal = 10.dp, vertical = 6.dp)
      .testTag("dynamic_game_countdown_timer")
  ) {
    Row(verticalAlignment = Alignment.CenterVertically) {
      Box(
        modifier = Modifier
          .size(8.dp)
          .clip(CircleShape)
          .background(Color.White)
      )
      Spacer(modifier = Modifier.width(6.dp))
      Text(
        text = "Releases in $countdownFormatted",
        color = Color.White,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 0.8.sp
      )
    }
  }
}

/**
 * Compatibility alias for GradientPlatformButton
 */
@Composable
fun GradientPlatformButton(
  platformName: String,
  iconRes: Int = 0,
  gradientColors: List<Color> = getPlatformGradient(platformName),
  onClick: () -> Unit
) {
  AnimatedGradientStoreButton(
    platformName = platformName,
    simpleIconName = getSimpleIconName(platformName),
    gradientColors = gradientColors,
    onClick = onClick
  )
}

/**
 * Trending Games Carousel with HorizontalPager, Peeking effect, and Dots indicator
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun TrendingGamesCarousel(
  games: List<GameItem>,
  onGameClick: (GameItem) -> Unit,
  onStoreClick: (String) -> Unit,
  modifier: Modifier = Modifier
) {
  if (games.isEmpty()) return
  val maxGames = games.take(7)
  val pagerState = rememberPagerState(pageCount = { maxGames.size })

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
        .height(270.dp)
        .testTag("trending_games_horizontal_pager")
    ) { page ->
      val game = maxGames[page]
      GameHeroCard(
        game = game,
        onGameClick = onGameClick,
        onStoreClick = onStoreClick
      )
    }

    Spacer(modifier = Modifier.height(12.dp))

    // White Dots Indicator
    Row(
      Modifier
        .wrapContentWidth()
        .padding(bottom = 8.dp)
        .testTag("pager_dots_indicator"),
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

/**
 * Hero Card displaying Game Title, Backdrop, Releasing Date, and Gradient Button
 */
@Composable
fun GameHeroCard(
  game: GameItem,
  onGameClick: (GameItem) -> Unit,
  onStoreClick: (String) -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val primaryStore = game.stores.firstOrNull()
  val storeUrl = primaryStore?.url ?: "https://store.steampowered.com"
  val rawPlatformName = primaryStore?.storeName ?: if (game.platforms.any { it.name.contains("PlayStation", ignoreCase = true) }) "PlayStation" else "Steam"
  val platformDisplayName = getCleanPlatformName(rawPlatformName)
  val platformGradient = getPlatformGradient(platformDisplayName)

  Box(
    modifier = modifier
      .fillMaxWidth()
      .height(270.dp)
      .clip(RoundedCornerShape(20.dp))
      .border(1.dp, CinematicBorder, RoundedCornerShape(20.dp))
      .clickable { onGameClick(game) }
      .testTag("game_hero_card_${game.id}")
  ) {
    SubcomposeAsyncImage(
      model = ImageRequest.Builder(context)
        .data(game.backdropUrl ?: game.posterUrl)
        .crossfade(true)
        .diskCachePolicy(CachePolicy.ENABLED)
        .memoryCachePolicy(CachePolicy.ENABLED)
        .build(),
      contentDescription = game.title,
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
            modifier = Modifier.size(24.dp)
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
          Text("No Cover Art", color = Zinc500, fontSize = 12.sp)
        }
      }
    )

    // Gradient Overlay
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(
          Brush.verticalGradient(
            colors = listOf(
              Color(0x33000000),
              Color.Transparent,
              Color(0xF0000000)
            )
          )
        )
    )

    // "View Game" Overlay Badge Top Left
    Box(
      modifier = Modifier
        .align(Alignment.TopStart)
        .padding(12.dp)
        .clip(RoundedCornerShape(8.dp))
        .background(Color.White.copy(alpha = 0.2f))
        .border(1.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
        .clickable { onGameClick(game) }
        .padding(horizontal = 10.dp, vertical = 5.dp)
    ) {
      Text(
        text = "View Game",
        color = Color.White,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold
      )
    }

    // Content bottom
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(14.dp),
      verticalArrangement = Arrangement.Bottom
    ) {
      Text(
        text = game.title,
        color = CinemaWhite,
        fontSize = 18.sp,
        fontWeight = FontWeight.Bold,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )

      if (game.platforms.isNotEmpty() || game.supportedHardware.isNotEmpty()) {
        Spacer(modifier = Modifier.height(4.dp))
        PlatformIconsRow(platforms = game.platforms, supportedHardware = game.supportedHardware)
      }

      Spacer(modifier = Modifier.height(2.dp))

      // Dynamic Countdown Timer sharing the thematic gradient
      DynamicCountdownTimer(
        releaseDateStr = game.releaseDate,
        gameTitle = game.title,
        imageUrl = game.posterUrl ?: game.backdropUrl,
        fallbackColorHex = game.dominantColor
      )

      Spacer(modifier = Modifier.height(6.dp))

      // Thematic View Game Button with animated flowing gradient
      ThematicGameButton(
        text = "View Game",
        gameTitle = game.title,
        imageUrl = game.posterUrl ?: game.backdropUrl,
        fallbackColorHex = game.dominantColor,
        onClick = { onGameClick(game) }
      )
    }
  }
}

/**
 * Standard Game Card for Upcoming & Recently Released sections
 */
@Composable
fun StandardGameCard(
  game: GameItem,
  showReleaseDate: Boolean = false,
  onGameClick: (GameItem) -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current

  Column(
    modifier = modifier
      .width(135.dp)
      .clickable { onGameClick(game) }
      .testTag("game_card_${game.id}")
  ) {
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .aspectRatio(0.75f)
        .clip(RoundedCornerShape(16.dp))
        .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
        .background(Zinc900)
    ) {
      SubcomposeAsyncImage(
        model = ImageRequest.Builder(context)
          .data(game.posterUrl ?: game.backdropUrl)
          .crossfade(true)
          .diskCachePolicy(CachePolicy.ENABLED)
          .memoryCachePolicy(CachePolicy.ENABLED)
          .build(),
        contentDescription = game.title,
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize()
      )
    }

    Spacer(modifier = Modifier.height(6.dp))

    Text(
      text = game.title,
      color = CinemaWhite,
      fontSize = 13.sp,
      fontWeight = FontWeight.SemiBold,
      maxLines = 1,
      overflow = TextOverflow.Ellipsis
    )

    if (game.platforms.isNotEmpty() || game.supportedHardware.isNotEmpty()) {
      Spacer(modifier = Modifier.height(3.dp))
      PlatformIconsRow(
        platforms = game.platforms,
        supportedHardware = game.supportedHardware,
        logoHeight = 13.dp,
        spacing = 5.dp
      )
    }

    Spacer(modifier = Modifier.height(3.dp))

    if (showReleaseDate && !game.releaseDate.isNullOrBlank()) {
      Text(
        text = "Releasing: ${game.releaseDate}",
        color = Color(0xFF64B5F6),
        fontSize = 11.sp,
        fontWeight = FontWeight.Medium
      )
    } else {
      Text(
        text = "★ ${game.formattedRating} • ${game.releaseYear}",
        color = Zinc400,
        fontSize = 11.sp
      )
    }
  }
}

/**
 * Game Row Item with full details
 */
@Composable
fun GameListItem(
  game: GameItem,
  showReleaseDate: Boolean = false,
  onGameClick: (GameItem) -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current

  Row(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(16.dp))
      .background(Zinc900)
      .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
      .clickable { onGameClick(game) }
      .padding(10.dp)
      .testTag("game_list_item_${game.id}"),
    verticalAlignment = Alignment.CenterVertically
  ) {
    Box(
      modifier = Modifier
        .width(72.dp)
        .aspectRatio(0.75f)
        .clip(RoundedCornerShape(12.dp))
        .background(Zinc800)
    ) {
      SubcomposeAsyncImage(
        model = ImageRequest.Builder(context)
          .data(game.posterUrl ?: game.backdropUrl)
          .crossfade(true)
          .diskCachePolicy(CachePolicy.ENABLED)
          .memoryCachePolicy(CachePolicy.ENABLED)
          .build(),
        contentDescription = game.title,
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize()
      )
    }

    Spacer(modifier = Modifier.width(12.dp))

    Column(
      modifier = Modifier.weight(1f)
    ) {
      Text(
        text = game.title,
        color = CinemaWhite,
        fontSize = 15.sp,
        fontWeight = FontWeight.SemiBold,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )

      if (game.platforms.isNotEmpty() || game.supportedHardware.isNotEmpty()) {
        Spacer(modifier = Modifier.height(3.dp))
        PlatformIconsRow(
          platforms = game.platforms,
          supportedHardware = game.supportedHardware,
          logoHeight = 14.dp,
          spacing = 5.dp
        )
      }

      Spacer(modifier = Modifier.height(3.dp))

      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        Text(
          text = "★ ${game.formattedRating}",
          color = CinemaWhite,
          fontSize = 12.sp,
          fontWeight = FontWeight.SemiBold
        )
        Text("•", color = Zinc500, fontSize = 10.sp)
        Text(
          text = if (showReleaseDate && !game.releaseDate.isNullOrBlank()) "Releasing: ${game.releaseDate}" else game.releaseYear,
          color = if (showReleaseDate) Color(0xFF64B5F6) else Zinc400,
          fontSize = 12.sp
        )
      }
    }
  }
}

/**
 * Top 50 Game List Item with Rank Badge (#1, #2...)
 */
@Composable
fun Top50GameListItem(
  game: GameItem,
  rank: Int,
  onGameClick: (GameItem) -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current

  Row(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(16.dp))
      .background(Zinc900)
      .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
      .clickable { onGameClick(game) }
      .padding(10.dp)
      .testTag("top50_game_item_${game.id}"),
    verticalAlignment = Alignment.CenterVertically
  ) {
    // Rank Number Badge
    Box(
      modifier = Modifier
        .size(32.dp)
        .clip(CircleShape)
        .background(if (rank <= 3) Color(0xFFFFB800).copy(alpha = 0.2f) else Zinc800)
        .border(
          1.dp,
          if (rank <= 3) Color(0xFFFFB800).copy(alpha = 0.6f) else CinematicBorderSubtle,
          CircleShape
        ),
      contentAlignment = Alignment.Center
    ) {
      Text(
        text = "#$rank",
        color = if (rank <= 3) Color(0xFFFFB800) else CinemaWhite,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold
      )
    }

    Spacer(modifier = Modifier.width(10.dp))

    // Poster Image
    Box(
      modifier = Modifier
        .width(64.dp)
        .aspectRatio(0.75f)
        .clip(RoundedCornerShape(10.dp))
        .background(Zinc800)
    ) {
      SubcomposeAsyncImage(
        model = ImageRequest.Builder(context)
          .data(game.posterUrl ?: game.backdropUrl)
          .crossfade(true)
          .diskCachePolicy(CachePolicy.ENABLED)
          .memoryCachePolicy(CachePolicy.ENABLED)
          .build(),
        contentDescription = game.title,
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize()
      )
    }

    Spacer(modifier = Modifier.width(12.dp))

    Column(
      modifier = Modifier.weight(1f)
    ) {
      Text(
        text = game.title,
        color = CinemaWhite,
        fontSize = 14.sp,
        fontWeight = FontWeight.SemiBold,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )

      if (game.platforms.isNotEmpty() || game.supportedHardware.isNotEmpty()) {
        Spacer(modifier = Modifier.height(3.dp))
        PlatformIconsRow(
          platforms = game.platforms,
          supportedHardware = game.supportedHardware,
          logoHeight = 13.dp,
          spacing = 5.dp
        )
      }

      Spacer(modifier = Modifier.height(3.dp))

      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        Text(
          text = "★ ${game.formattedRating}",
          color = Color(0xFFFFB800),
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold
        )
        Text("•", color = Zinc500, fontSize = 10.sp)
        Text(
          text = game.releaseYear,
          color = Zinc400,
          fontSize = 12.sp
        )
      }
    }
  }
}
