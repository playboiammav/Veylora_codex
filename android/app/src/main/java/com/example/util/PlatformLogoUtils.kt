package com.example.util

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.SubcomposeAsyncImage
import coil.request.CachePolicy
import coil.request.ImageRequest
import com.example.R
import com.example.data.repository.LogoManager
import com.example.domain.model.GamePlatform
import com.example.ui.theme.Zinc400

@Immutable
data class GamePlatformDisplay(
  val name: String,
  val key: String,
  val logoUrl: String = "",
  val isPc: Boolean = false,
  val isAndroid: Boolean = false,
  val isLinux: Boolean = false,
  val isIos: Boolean = false,
  val isTextOnly: Boolean = false,
  val priority: Int = 99
)

object PlatformLogoUtils {
  const val BASE_URL = "https://raw.githubusercontent.com/playboiammav/Logos-/main/"

  /**
   * Resolves store SVG logo URL for official store buttons in Purchase & Official Stores.
   */
  fun getStoreLogoUrl(storeName: String): String {
    return LogoManager.getStoreLogoUrl(storeName)
  }

  /**
   * Resolves SVG logo URL for hardware and stores.
   */
  fun getLogoUrl(nameOrSlug: String): String {
    return LogoManager.getPlatformLogoUrl(nameOrSlug)
  }

  /**
   * Resolves supported hardware platforms exclusively.
   *
   * RULES:
   * 1. supportedHardware is the source of truth if available.
   * 2. Stores and services (Steam, Epic, eShop, Game Pass, PS Plus, etc.) are strictly excluded from hardware row.
   * 3. Specific generations take priority over generic parent logos (e.g. if PS5 or PS4 is present, do not show duplicate generic PlayStation).
   * 4. PC is represented as clickable text "PC".
   * 5. macOS uses mac logo; iOS uses ios logo (never collapse macOS and iOS).
   * 6. Linux is never hidden when Windows/PC is present.
   * 7. Steam belongs ONLY in stores, Steam Deck only when steam_deck is in hardware.
   */
  fun resolveGamePlatforms(
    platforms: List<GamePlatform> = emptyList(),
    supportedHardware: List<String>? = null
  ): List<GamePlatformDisplay> {
    val items = mutableListOf<GamePlatformDisplay>()
    val addedKeys = mutableSetOf<String>()

    // If supportedHardware is explicitly provided from API, parse directly as source of truth
    if (!supportedHardware.isNullOrEmpty()) {
      for (rawHw in supportedHardware) {
        val hw = rawHw.lowercase().replace("-", "_").trim()
        when {
          hw == "ps5" || hw.contains("playstation_5") || hw.contains("playstation5") || hw == "ps_5" -> {
            if (addedKeys.add("ps5")) {
              items.add(GamePlatformDisplay("PlayStation 5", "ps5", LogoManager.getPlatformLogoUrl("ps5"), priority = 1))
            }
          }
          hw == "ps4" || hw.contains("playstation_4") || hw.contains("playstation4") || hw == "ps_4" -> {
            if (addedKeys.add("ps4")) {
              items.add(GamePlatformDisplay("PlayStation 4", "ps4", LogoManager.getPlatformLogoUrl("ps4"), priority = 2))
            }
          }
          hw == "ps_vita" || hw == "psvita" || hw == "vita" || hw.contains("playstation_vita") || hw == "psp" -> {
            if (addedKeys.add("ps_vita")) {
              items.add(GamePlatformDisplay("PS Vita", "ps_vita", LogoManager.getPlatformLogoUrl("ps_vita"), priority = 3))
            }
          }
          hw == "playstation" -> {
            if (!addedKeys.contains("ps5") && !addedKeys.contains("ps4") && addedKeys.add("playstation")) {
              items.add(GamePlatformDisplay("PlayStation", "playstation", LogoManager.getPlatformLogoUrl("ps5"), priority = 4))
            }
          }
          hw == "xbox_series" || hw.contains("series_x") || hw.contains("series_s") || hw.contains("xbox_series") -> {
            if (addedKeys.add("xbox_series")) {
              items.add(GamePlatformDisplay("Xbox Series X|S", "xbox_series", LogoManager.getPlatformLogoUrl("xbox_series"), priority = 10))
            }
          }
          hw == "xbox_one" || hw == "xboxone" -> {
            if (addedKeys.add("xbox_one")) {
              items.add(GamePlatformDisplay("Xbox One", "xbox_one", LogoManager.getPlatformLogoUrl("xbox_one"), priority = 11))
            }
          }
          hw == "xbox_360" || hw == "xbox360" -> {
            if (addedKeys.add("xbox_360")) {
              items.add(GamePlatformDisplay("Xbox 360", "xbox_360", LogoManager.getPlatformLogoUrl("xbox_360"), priority = 12))
            }
          }
          hw == "xbox" || hw == "original_xbox" -> {
            if (!addedKeys.contains("xbox_series") && !addedKeys.contains("xbox_one") && addedKeys.add("xbox")) {
              items.add(GamePlatformDisplay("Xbox", "xbox", LogoManager.getPlatformLogoUrl("xbox"), priority = 13))
            }
          }
          hw == "nintendo_switch" || hw == "switch" || hw.contains("switch") -> {
            if (addedKeys.add("nintendo_switch")) {
              items.add(GamePlatformDisplay("Nintendo Switch", "nintendo_switch", LogoManager.getPlatformLogoUrl("nintendo_switch"), priority = 20))
            }
          }
          hw == "nintendo_3ds" || hw == "3ds" || hw.contains("3ds") || hw.contains("2ds") -> {
            if (addedKeys.add("nintendo_3ds")) {
              items.add(GamePlatformDisplay("Nintendo 3DS", "nintendo_3ds", LogoManager.getPlatformLogoUrl("nintendo_3ds"), priority = 22))
            }
          }
          hw == "wii_u" || hw == "wiiu" || hw.contains("wii_u") -> {
            if (addedKeys.add("wii_u")) {
              items.add(GamePlatformDisplay("Wii U", "wii_u", LogoManager.getPlatformLogoUrl("wii_u"), priority = 23))
            }
          }
          hw == "wii" || hw.contains("wii") -> {
            if (addedKeys.add("wii")) {
              items.add(GamePlatformDisplay("Wii", "wii", LogoManager.getPlatformLogoUrl("wii"), priority = 24))
            }
          }
          hw == "pc" -> {
            if (addedKeys.add("pc")) {
              items.add(GamePlatformDisplay("PC", "pc", logoUrl = "", isPc = true, isTextOnly = true, priority = 25))
            }
          }
          hw == "windows" || hw == "win" -> {
            if (!addedKeys.contains("pc") && addedKeys.add("windows")) {
              items.add(GamePlatformDisplay("Windows", "windows", LogoManager.getPlatformLogoUrl("windows"), priority = 26))
            }
          }
          hw == "mac" || hw == "macos" || hw == "os_x" || hw == "osx" -> {
            if (addedKeys.add("mac")) {
              items.add(GamePlatformDisplay("macOS", "mac", LogoManager.getPlatformLogoUrl("mac"), priority = 30))
            }
          }
          hw == "linux" -> {
            if (addedKeys.add("linux")) {
              items.add(GamePlatformDisplay("Linux", "linux", logoUrl = LogoManager.getPlatformLogoUrl("linux"), isLinux = true, isTextOnly = true, priority = 31))
            }
          }
          hw == "chromeos" || hw.contains("chrome_os") || hw.contains("chromeos") -> {
            if (addedKeys.add("chromeos")) {
              items.add(GamePlatformDisplay("ChromeOS", "chromeos", LogoManager.getPlatformLogoUrl("chromeos"), priority = 32))
            }
          }
          hw == "ios" || hw.contains("iphone") || hw.contains("ipad") -> {
            if (addedKeys.add("ios")) {
              items.add(GamePlatformDisplay("iOS", "ios", logoUrl = LogoManager.getPlatformLogoUrl("ios"), isIos = true, isTextOnly = true, priority = 40))
            }
          }
          hw == "android" -> {
            if (addedKeys.add("android")) {
              items.add(GamePlatformDisplay("Android", "android", logoUrl = "", isAndroid = true, isTextOnly = true, priority = 41))
            }
          }
          hw == "steam_deck" || hw.contains("steam_deck") -> {
            if (addedKeys.add("steam_deck")) {
              items.add(GamePlatformDisplay("Steam Deck", "steam_deck", LogoManager.getPlatformLogoUrl("steam_deck"), priority = 50))
            }
          }
          hw == "rog_ally" || hw.contains("rog_ally") -> {
            if (addedKeys.add("rog_ally")) {
              items.add(GamePlatformDisplay("ROG Ally", "rog_ally", LogoManager.getPlatformLogoUrl("rog_ally"), priority = 51))
            }
          }
          hw == "nvidia" || hw.contains("shield") -> {
            if (addedKeys.add("nvidia")) {
              items.add(GamePlatformDisplay("NVIDIA", "nvidia", LogoManager.getPlatformLogoUrl("nvidia"), priority = 52))
            }
          }
          hw == "meta_quest" || hw.contains("quest") || hw.contains("oculus") -> {
            if (addedKeys.add("meta_quest")) {
              items.add(GamePlatformDisplay("Meta Quest", "meta_quest", LogoManager.getPlatformLogoUrl("meta_quest"), priority = 53))
            }
          }
        }
      }
      return items.sortedBy { it.priority }
    }

    if (platforms.isEmpty()) return emptyList()

    var pcSupported = false
    var hasSpecificPlayStation = false
    var hasGenericPlayStation = false
    var hasSpecificXbox = false
    var hasGenericXbox = false

    for (p in platforms) {
      val name = p.name
      val slug = p.slug.ifBlank { name.lowercase() }
      val lower = "$name $slug".lowercase().replace("-", " ").replace("_", " ").trim()

      // 1. NEVER mix stores and subscriptions with hardware platforms
      if (lower.contains("store") || lower.contains("pass") || lower.contains("plus") ||
          lower.contains("eshop") || lower.contains("epic") || lower.contains("gog") ||
          lower.contains("ubisoft") || lower.contains("battlenet") || lower.contains("battle.net") ||
          lower.contains("arcade") || lower.contains("play games") || lower.contains("luna") ||
          (lower.contains("steam") && !lower.contains("deck"))
      ) {
        continue
      }

      // Check PlayStation generations
      when {
        lower.contains("ps5") || lower.contains("playstation 5") || slug == "playstation5" -> {
          hasSpecificPlayStation = true
          if (addedKeys.add("ps5")) {
            items.add(GamePlatformDisplay("PlayStation 5", "ps5", LogoManager.getPlatformLogoUrl("ps5"), priority = 1))
          }
        }
        lower.contains("ps4") || lower.contains("playstation 4") || slug == "playstation4" -> {
          hasSpecificPlayStation = true
          if (addedKeys.add("ps4")) {
            items.add(GamePlatformDisplay("PlayStation 4", "ps4", LogoManager.getPlatformLogoUrl("ps4"), priority = 2))
          }
        }
        lower.contains("ps vita") || lower.contains("psvita") || lower.contains("vita") || slug == "ps-vita" || lower.contains("psp") || slug == "psp" -> {
          hasSpecificPlayStation = true
          if (addedKeys.add("ps_vita")) {
            items.add(GamePlatformDisplay("PS Vita", "ps_vita", LogoManager.getPlatformLogoUrl("ps_vita"), priority = 3))
          }
        }
        lower.contains("playstation") || slug == "playstation" -> {
          hasGenericPlayStation = true
        }
      }

      // Check for PC support
      if (lower == "pc" || slug == "pc" || lower.contains("pc ") || lower.contains("windows") || slug == "windows" || slug == "win") {
        pcSupported = true
      }

      // Check Xbox generations
      when {
        lower.contains("series x") || lower.contains("series s") || lower.contains("xbox series") || slug == "xbox-series-x" || slug == "xbox-series-s" || slug == "xbox-series" -> {
          hasSpecificXbox = true
          if (addedKeys.add("xbox_series")) {
            items.add(GamePlatformDisplay("Xbox Series X|S", "xbox_series", LogoManager.getPlatformLogoUrl("xbox_series"), priority = 10))
          }
        }
        lower.contains("xbox one") || slug == "xbox-one" -> {
          hasSpecificXbox = true
          if (addedKeys.add("xbox_one")) {
            items.add(GamePlatformDisplay("Xbox One", "xbox_one", LogoManager.getPlatformLogoUrl("xbox_one"), priority = 11))
          }
        }
        lower.contains("xbox 360") || lower.contains("xbox360") || slug == "xbox360" -> {
          hasSpecificXbox = true
          if (addedKeys.add("xbox_360")) {
            items.add(GamePlatformDisplay("Xbox 360", "xbox_360", LogoManager.getPlatformLogoUrl("xbox_360"), priority = 12))
          }
        }
        lower == "xbox" || slug == "xbox-old" || slug == "original-xbox" -> {
          hasGenericXbox = true
        }
      }

      // Check Nintendo platforms
      when {
        lower.contains("switch") || slug == "nintendo-switch" -> {
          if (addedKeys.add("nintendo_switch")) {
            items.add(GamePlatformDisplay("Nintendo Switch", "nintendo_switch", LogoManager.getPlatformLogoUrl("nintendo_switch"), priority = 20))
          }
        }
        lower.contains("3ds") || slug == "nintendo-3ds" -> {
          if (addedKeys.add("nintendo_3ds")) {
            items.add(GamePlatformDisplay("Nintendo 3DS", "nintendo_3ds", LogoManager.getPlatformLogoUrl("nintendo_3ds"), priority = 22))
          }
        }
        lower.contains("wii u") || slug == "wii-u" -> {
          if (addedKeys.add("wii_u")) {
            items.add(GamePlatformDisplay("Wii U", "wii_u", LogoManager.getPlatformLogoUrl("wii_u"), priority = 23))
          }
        }
        (lower.contains("wii") && !lower.contains("wii u")) || slug == "wii" -> {
          if (addedKeys.add("wii")) {
            items.add(GamePlatformDisplay("Wii", "wii", LogoManager.getPlatformLogoUrl("wii"), priority = 24))
          }
        }
      }

      // Check Desktop OSes (macOS, Linux, ChromeOS)
      when {
        lower.contains("macos") || lower.contains("mac os") || slug == "macos" || (lower.contains("mac") && !lower.contains("machine")) || slug == "mac" -> {
          if (addedKeys.add("mac")) {
            items.add(GamePlatformDisplay("macOS", "mac", LogoManager.getPlatformLogoUrl("mac"), priority = 30))
          }
        }
        lower.contains("linux") || slug == "linux" -> {
          if (addedKeys.add("linux")) {
            items.add(GamePlatformDisplay("Linux", "linux", logoUrl = LogoManager.getPlatformLogoUrl("linux"), isLinux = true, isTextOnly = true, priority = 31))
          }
        }
        lower.contains("chromeos") || lower.contains("chrome os") || slug == "chromeos" || slug == "chrome-os" -> {
          if (addedKeys.add("chromeos")) {
            items.add(GamePlatformDisplay("ChromeOS", "chromeos", LogoManager.getPlatformLogoUrl("chromeos"), priority = 32))
          }
        }
      }

      // Check Handhelds & VR
      when {
        lower.contains("steam deck") || slug == "steam-deck" -> {
          if (addedKeys.add("steam_deck")) {
            items.add(GamePlatformDisplay("Steam Deck", "steam_deck", LogoManager.getPlatformLogoUrl("steam_deck"), priority = 35))
          }
        }
        lower.contains("rog ally") || slug == "rog-ally" -> {
          if (addedKeys.add("rog_ally")) {
            items.add(GamePlatformDisplay("ROG Ally", "rog_ally", LogoManager.getPlatformLogoUrl("rog_ally"), priority = 36))
          }
        }
        lower.contains("shield") || slug == "nvidia-shield" || (lower.contains("nvidia") && !lower.contains("geforce")) -> {
          if (addedKeys.add("nvidia")) {
            items.add(GamePlatformDisplay("NVIDIA", "nvidia", LogoManager.getPlatformLogoUrl("nvidia"), priority = 37))
          }
        }
        lower.contains("quest") || lower.contains("oculus") || slug == "meta-quest" -> {
          if (addedKeys.add("meta_quest")) {
            items.add(GamePlatformDisplay("Meta Quest", "meta_quest", LogoManager.getPlatformLogoUrl("meta_quest"), priority = 50))
          }
        }
      }

      // Check Mobile OSes
      when {
        (lower.contains("ios") || lower.contains("iphone") || lower.contains("ipad") || slug == "ios") && !lower.contains("bios") -> {
          if (addedKeys.add("ios")) {
            items.add(GamePlatformDisplay("iOS", "ios", logoUrl = LogoManager.getPlatformLogoUrl("ios"), isIos = true, isTextOnly = true, priority = 40))
          }
        }
        lower.contains("android") || slug == "android" -> {
          if (addedKeys.add("android")) {
            items.add(GamePlatformDisplay("Android", "android", logoUrl = "", isAndroid = true, isTextOnly = true, priority = 41))
          }
        }
      }
    }

    // Fallback: If only generic PlayStation was reported
    if (!hasSpecificPlayStation && hasGenericPlayStation && addedKeys.add("playstation_generic")) {
      items.add(GamePlatformDisplay("PlayStation", "playstation", LogoManager.getPlatformLogoUrl("ps5"), priority = 4))
    }

    // Fallback: If only generic Xbox was reported and no specific generation
    if (!hasSpecificXbox && hasGenericXbox && addedKeys.add("xbox_generic")) {
      items.add(GamePlatformDisplay("Xbox", "xbox", LogoManager.getPlatformLogoUrl("xbox"), priority = 15))
    }

    // Append PC clickable text if supported
    if (pcSupported && addedKeys.add("pc_text")) {
      items.add(
        GamePlatformDisplay(
          name = "PC",
          key = "pc",
          logoUrl = "",
          isPc = true,
          isTextOnly = true,
          priority = 25
        )
      )
    }

    return items.sortedBy { it.priority }
  }

  fun getBrandColors(name: String): List<Color> {
    val lower = name.lowercase().replace("-", " ").replace("_", " ").trim()
    return when {
      lower.contains("google play") || lower.contains("chromeos") -> listOf(
        Color(0xFF4285F4),
        Color(0xFF34A853),
        Color(0xFFFBBC05),
        Color(0xFFEA4335)
      )
      lower.contains("meta quest") || lower.contains("oculus") -> listOf(
        Color(0xFF0064E0),
        Color(0xFF8A3FFC)
      )
      lower.contains("playstation") || lower.contains("ps5") || lower.contains("ps4") || lower.contains("ps vita") || lower.contains("psp") || lower.contains("ps") -> listOf(Color(0xFF00439C))
      lower.contains("xbox 360") -> listOf(Color(0xFF8BC53F))
      lower.contains("xbox") || lower.contains("game pass") -> listOf(Color(0xFF107C10))
      lower.contains("steam deck") -> listOf(Color(0xFF1B2838))
      lower.contains("steam") -> listOf(Color(0xFF1B9FFF))
      lower.contains("epic") -> listOf(Color(0xFF2F2F2F))
      lower.contains("gog") -> listOf(Color(0xFF86328A))
      lower.contains("ea app") || lower.contains("ea play") || lower.contains("ea") -> listOf(Color(0xFFEA0000))
      lower.contains("ubisoft") -> listOf(Color(0xFF000000))
      lower.contains("geforce") || lower.contains("nvidia") || lower.contains("shield") -> listOf(Color(0xFF76B900))
      lower.contains("nintendo") || lower.contains("switch") || lower.contains("3ds") || lower.contains("wii") || lower.contains("eshop") -> listOf(Color(0xFFE60012))
      lower.contains("battlenet") || lower.contains("battle.net") || lower.contains("blizzard") -> listOf(Color(0xFF00AEFF))
      lower.contains("microsoft store") || lower.contains("windows") -> listOf(Color(0xFF0078D4))
      lower.contains("pc") -> listOf(Color(0xFF1B2838))
      lower.contains("rog ally") -> listOf(Color(0xFFED1C24))
      lower.contains("apple arcade") -> listOf(Color(0xFFFA243C))
      lower.contains("android") -> listOf(Color(0xFF01875F))
      lower.contains("ios") || lower.contains("mac") || lower.contains("macos") -> listOf(Color(0xFF1C1C1E))
      lower.contains("linux") -> listOf(Color(0xFFE95420))
      else -> listOf(Color(0xFF333333))
    }
  }

  fun getBrandColor(name: String): Color = getBrandColors(name).first()
}

/**
 * Reusable Pure White Platform Logo Composable.
 * - Sharp SVG rendered in pure WHITE on dark UI with ColorFilter.tint(Color.White).
 * - Preserves aspect ratio with ContentScale.Fit.
 * - NO RGB border, no glowing animations, no square background boxes.
 * - Graceful error handling: uses vector fallback on error, never displays broken dot or box.
 */
@Composable
fun PlatformLogo(
  logoUrl: String,
  contentDescription: String,
  modifier: Modifier = Modifier,
  height: Dp = 22.dp,
  onClick: (() -> Unit)? = null
) {
  if (logoUrl.isBlank()) return
  val context = LocalContext.current

  val fallbackRes = remember(contentDescription) {
    val lower = contentDescription.lowercase()
    when {
      lower.contains("playstation") || lower.contains("ps5") || lower.contains("ps4") -> R.drawable.ic_playstation
      lower.contains("xbox") -> R.drawable.ic_xbox
      lower.contains("nintendo") || lower.contains("switch") -> R.drawable.ic_nintendo
      lower.contains("steam") -> R.drawable.ic_steam
      lower.contains("apple") || lower.contains("mac") || lower.contains("ios") -> R.drawable.ic_apple
      lower.contains("android") -> R.drawable.ic_android
      lower.contains("epic") -> R.drawable.ic_epic_games
      else -> null
    }
  }

  Box(
    modifier = modifier
      .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
      .testTag("platform_logo_${contentDescription.lowercase().replace(" ", "_").replace("|", "_")}"),
    contentAlignment = Alignment.Center
  ) {
    SubcomposeAsyncImage(
      model = ImageRequest.Builder(context)
        .data(logoUrl)
        .crossfade(true)
        .diskCachePolicy(CachePolicy.ENABLED)
        .memoryCachePolicy(CachePolicy.ENABLED)
        .build(),
      contentDescription = contentDescription,
      colorFilter = ColorFilter.tint(Color.White),
      contentScale = ContentScale.Fit,
      modifier = Modifier
        .height(height)
        .widthIn(min = 14.dp, max = height * 3.5f),
      loading = { Box(modifier = Modifier.height(height).widthIn(min = 14.dp)) },
      error = {
        if (fallbackRes != null) {
          Image(
            painter = painterResource(id = fallbackRes),
            contentDescription = contentDescription,
            colorFilter = ColorFilter.tint(Color.White),
            contentScale = ContentScale.Fit,
            modifier = Modifier.height(height)
          )
        }
      }
    )
  }
}

/**
 * Interactive PC Text Chip with Continuous Rotating Animated RGB Border
 * Requirements:
 * - PC is text, not an image ("PC")
 * - White text on #14151B dark background
 * - Clickable to launch PC System Requirements bottom sheet
 * - Continuous, smooth rotating RGB border (RED -> PURPLE -> BLUE -> CYAN -> GREEN -> YELLOW -> RED)
 * - Outline border moves continuously while PC text and chip background remain completely static
 * - Sized 10–15% smaller for optimal visual balance
 */
@Composable
fun PcChipWithRgbBorder(
  onClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier,
  height: Dp = 30.dp,
  fontSize: TextUnit = 13.sp,
  textPaddingHorizontal: Dp = 8.dp,
  textPaddingVertical: Dp = 2.dp
) {
  val infiniteTransition = rememberInfiniteTransition(label = "pc_rgb_border_anim")
  val phase by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(
      animation = tween(durationMillis = 3000, easing = LinearEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "pc_rgb_phase"
  )

  val sampledColors = remember(phase) {
    sampleRgbSpectrum(phase, count = 24)
  }

  val shape = RoundedCornerShape(6.dp)

  Box(
    modifier = modifier
      .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
      .height(height)
      .clip(shape)
      .background(Color(0xFF14151B))
      .testTag("platform_text_pc"),
    contentAlignment = Alignment.Center
  ) {
    Canvas(modifier = Modifier.matchParentSize()) {
      val strokePx = 1.5.dp.toPx()
      val inset = strokePx / 2f
      val brush = Brush.sweepGradient(
        colors = sampledColors,
        center = Offset(size.width / 2f, size.height / 2f)
      )
      drawRoundRect(
        brush = brush,
        topLeft = Offset(inset, inset),
        size = androidx.compose.ui.geometry.Size(
          width = (size.width - strokePx).coerceAtLeast(0f),
          height = (size.height - strokePx).coerceAtLeast(0f)
        ),
        cornerRadius = CornerRadius(6.dp.toPx()),
        style = Stroke(width = strokePx)
      )
    }

    Text(
      text = "PC",
      color = Color.White,
      fontSize = fontSize,
      fontWeight = FontWeight.Bold,
      letterSpacing = 0.8.sp,
      modifier = Modifier.padding(horizontal = textPaddingHorizontal, vertical = textPaddingVertical)
    )
  }
}

/**
 * Interactive Android Chip with Continuous Rotating Themed Green Border
 * Requirements:
 * - Distinct Android visual identity (#34A853, #01875F, #3DDC84, #00E676)
 * - Static #14151B dark background
 * - Static pure white "Android" text
 * - Outline moves smoothly around all 4 rounded sides
 * - Sized ~30-32dp height matching PC chip
 * - Clickable to launch Android Compatibility Bottom Sheet
 */
@Composable
fun AndroidChipWithThemedBorder(
  onClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier,
  height: Dp = 30.dp,
  fontSize: TextUnit = 13.sp,
  textPaddingHorizontal: Dp = 8.dp,
  textPaddingVertical: Dp = 2.dp
) {
  val infiniteTransition = rememberInfiniteTransition(label = "android_border_anim")
  val phase by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(
      animation = tween(durationMillis = 3000, easing = LinearEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "android_border_phase"
  )

  val sampledColors = remember(phase) {
    sampleAndroidSpectrum(phase, count = 20)
  }

  val shape = RoundedCornerShape(6.dp)

  Box(
    modifier = modifier
      .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
      .height(height)
      .clip(shape)
      .background(Color(0xFF14151B))
      .testTag("platform_text_android"),
    contentAlignment = Alignment.Center
  ) {
    Canvas(modifier = Modifier.matchParentSize()) {
      val strokePx = 1.5.dp.toPx()
      val inset = strokePx / 2f
      val brush = Brush.sweepGradient(
        colors = sampledColors,
        center = Offset(size.width / 2f, size.height / 2f)
      )
      drawRoundRect(
        brush = brush,
        topLeft = Offset(inset, inset),
        size = androidx.compose.ui.geometry.Size(
          width = (size.width - strokePx).coerceAtLeast(0f),
          height = (size.height - strokePx).coerceAtLeast(0f)
        ),
        cornerRadius = CornerRadius(6.dp.toPx()),
        style = Stroke(width = strokePx)
      )
    }

    Text(
      text = "Android",
      color = Color.White,
      fontSize = fontSize,
      fontWeight = FontWeight.Bold,
      letterSpacing = 0.8.sp,
      modifier = Modifier.padding(horizontal = textPaddingHorizontal, vertical = textPaddingVertical)
    )
  }
}

/**
 * Interactive Linux Chip with Continuous Rotating Themed Orange/Gold Border
 */
@Composable
fun LinuxChipWithThemedBorder(
  onClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier,
  height: Dp = 30.dp,
  fontSize: TextUnit = 13.sp,
  textPaddingHorizontal: Dp = 8.dp,
  textPaddingVertical: Dp = 2.dp
) {
  val infiniteTransition = rememberInfiniteTransition(label = "linux_border_anim")
  val phase by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(
      animation = tween(durationMillis = 3000, easing = LinearEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "linux_border_phase"
  )

  val sampledColors = remember(phase) {
    sampleLinuxSpectrum(phase, count = 20)
  }

  val shape = RoundedCornerShape(6.dp)

  Box(
    modifier = modifier
      .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
      .height(height)
      .clip(shape)
      .background(Color(0xFF14151B))
      .testTag("platform_text_linux"),
    contentAlignment = Alignment.Center
  ) {
    Canvas(modifier = Modifier.matchParentSize()) {
      val strokePx = 1.5.dp.toPx()
      val inset = strokePx / 2f
      val brush = Brush.sweepGradient(
        colors = sampledColors,
        center = Offset(size.width / 2f, size.height / 2f)
      )
      drawRoundRect(
        brush = brush,
        topLeft = Offset(inset, inset),
        size = androidx.compose.ui.geometry.Size(
          width = (size.width - strokePx).coerceAtLeast(0f),
          height = (size.height - strokePx).coerceAtLeast(0f)
        ),
        cornerRadius = CornerRadius(6.dp.toPx()),
        style = Stroke(width = strokePx)
      )
    }

    Text(
      text = "Linux",
      color = Color.White,
      fontSize = fontSize,
      fontWeight = FontWeight.Bold,
      letterSpacing = 0.8.sp,
      modifier = Modifier.padding(horizontal = textPaddingHorizontal, vertical = textPaddingVertical)
    )
  }
}

/**
 * Interactive iOS Chip with Continuous Rotating Themed Silver/Cyan Border
 */
@Composable
fun IosChipWithThemedBorder(
  onClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier,
  height: Dp = 30.dp,
  fontSize: TextUnit = 13.sp,
  textPaddingHorizontal: Dp = 8.dp,
  textPaddingVertical: Dp = 2.dp
) {
  val infiniteTransition = rememberInfiniteTransition(label = "ios_border_anim")
  val phase by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(
      animation = tween(durationMillis = 3000, easing = LinearEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "ios_border_phase"
  )

  val sampledColors = remember(phase) {
    sampleIosSpectrum(phase, count = 20)
  }

  val shape = RoundedCornerShape(6.dp)

  Box(
    modifier = modifier
      .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
      .height(height)
      .clip(shape)
      .background(Color(0xFF14151B))
      .testTag("platform_text_ios"),
    contentAlignment = Alignment.Center
  ) {
    Canvas(modifier = Modifier.matchParentSize()) {
      val strokePx = 1.5.dp.toPx()
      val inset = strokePx / 2f
      val brush = Brush.sweepGradient(
        colors = sampledColors,
        center = Offset(size.width / 2f, size.height / 2f)
      )
      drawRoundRect(
        brush = brush,
        topLeft = Offset(inset, inset),
        size = androidx.compose.ui.geometry.Size(
          width = (size.width - strokePx).coerceAtLeast(0f),
          height = (size.height - strokePx).coerceAtLeast(0f)
        ),
        cornerRadius = CornerRadius(6.dp.toPx()),
        style = Stroke(width = strokePx)
      )
    }

    Text(
      text = "iOS",
      color = Color.White,
      fontSize = fontSize,
      fontWeight = FontWeight.Bold,
      letterSpacing = 0.8.sp,
      modifier = Modifier.padding(horizontal = textPaddingHorizontal, vertical = textPaddingVertical)
    )
  }
}

private fun sampleLinuxSpectrum(phase: Float, count: Int = 20): List<Color> {
  val keyColors = listOf(
    Color(0xFFFF9800), // Linux Orange
    Color(0xFFFFC107), // Amber Gold
    Color(0xFFFF8F00), // Deep Orange
    Color(0xFFFFE082), // Light Amber
    Color(0xFFFF9800)  // Linux Orange
  )
  val numSegments = keyColors.size - 1
  return List(count + 1) { i ->
    val fraction = (i.toFloat() / count - phase).let { (it % 1f + 1f) % 1f }
    val scaled = fraction * numSegments
    val index = scaled.toInt().coerceIn(0, numSegments - 1)
    val localFraction = scaled - index
    lerpColor(keyColors[index], keyColors[index + 1], localFraction)
  }
}

private fun sampleIosSpectrum(phase: Float, count: Int = 20): List<Color> {
  val keyColors = listOf(
    Color(0xFFE0E0E0), // Silver
    Color(0xFF81D4FA), // Cyan Accent
    Color(0xFFB0BEC5), // Slate
    Color(0xFF29B6F6), // Bright Cyan
    Color(0xFFE0E0E0)  // Silver
  )
  val numSegments = keyColors.size - 1
  return List(count + 1) { i ->
    val fraction = (i.toFloat() / count - phase).let { (it % 1f + 1f) % 1f }
    val scaled = fraction * numSegments
    val index = scaled.toInt().coerceIn(0, numSegments - 1)
    val localFraction = scaled - index
    lerpColor(keyColors[index], keyColors[index + 1], localFraction)
  }
}

private fun sampleAndroidSpectrum(phase: Float, count: Int = 20): List<Color> {
  val keyColors = listOf(
    Color(0xFF34A853), // Android Dark Green
    Color(0xFF01875F), // Google Teal
    Color(0xFF3DDC84), // Android Light Green
    Color(0xFF00E676), // Bright Green
    Color(0xFF00C853), // Green Accent
    Color(0xFF34A853)  // Android Dark Green
  )
  val numSegments = keyColors.size - 1
  return List(count + 1) { i ->
    val fraction = (i.toFloat() / count - phase).let { (it % 1f + 1f) % 1f }
    val scaled = fraction * numSegments
    val index = scaled.toInt().coerceIn(0, numSegments - 1)
    val localFraction = scaled - index
    lerpColor(keyColors[index], keyColors[index + 1], localFraction)
  }
}

private fun sampleRgbSpectrum(phase: Float, count: Int = 24): List<Color> {
  val keyColors = listOf(
    Color(0xFFFF0055), // RED
    Color(0xFF7A00FF), // PURPLE
    Color(0xFF0070FF), // BLUE
    Color(0xFF00E5FF), // CYAN
    Color(0xFF00FF66), // GREEN
    Color(0xFFFFEE00), // YELLOW
    Color(0xFFFF0055)  // RED
  )
  val numSegments = keyColors.size - 1
  return List(count + 1) { i ->
    val fraction = (i.toFloat() / count - phase).let { (it % 1f + 1f) % 1f }
    val scaled = fraction * numSegments
    val index = scaled.toInt().coerceIn(0, numSegments - 1)
    val localFraction = scaled - index
    lerpColor(keyColors[index], keyColors[index + 1], localFraction)
  }
}

private fun lerpColor(start: Color, stop: Color, fraction: Float): Color {
  return Color(
    red = start.red + fraction * (stop.red - start.red),
    green = start.green + fraction * (stop.green - start.green),
    blue = start.blue + fraction * (stop.blue - start.blue),
    alpha = start.alpha + fraction * (stop.alpha - start.alpha)
  )
}

/**
 * Reusable Horizontal Row of pure white SVG platform logos and clickable "PC" / "Android" text chips for game cards.
 */
@Composable
fun GameCardPlatformLogosRow(
  platforms: List<GamePlatform> = emptyList(),
  supportedHardware: List<String>? = null,
  modifier: Modifier = Modifier,
  logoHeight: Dp = 15.dp,
  spacing: Dp = 6.dp,
  maxLogos: Int = 6,
  onPlatformClick: ((GamePlatformDisplay) -> Unit)? = null
) {
  val resolved = PlatformLogoUtils.resolveGamePlatforms(platforms, supportedHardware)
  if (resolved.isEmpty()) return

  val displayList = if (maxLogos > 0) resolved.take(maxLogos) else resolved

  Row(
    modifier = modifier.testTag("game_card_platform_logos_row"),
    horizontalArrangement = Arrangement.spacedBy(spacing),
    verticalAlignment = Alignment.CenterVertically
  ) {
    displayList.forEach { platform ->
      when {
        platform.isAndroid -> {
          AndroidChipWithThemedBorder(
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null,
            height = (logoHeight + 9.dp).coerceIn(24.dp, 28.dp),
            fontSize = (logoHeight.value * 0.70f).coerceIn(9f, 11f).sp,
            textPaddingHorizontal = 5.dp,
            textPaddingVertical = 1.dp
          )
        }
        platform.isPc -> {
          PcChipWithRgbBorder(
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null,
            height = (logoHeight + 9.dp).coerceIn(24.dp, 28.dp),
            fontSize = (logoHeight.value * 0.72f).coerceIn(9f, 11f).sp,
            textPaddingHorizontal = 5.dp,
            textPaddingVertical = 1.dp
          )
        }
        platform.isLinux -> {
          LinuxChipWithThemedBorder(
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null,
            height = (logoHeight + 9.dp).coerceIn(24.dp, 28.dp),
            fontSize = (logoHeight.value * 0.70f).coerceIn(9f, 11f).sp,
            textPaddingHorizontal = 5.dp,
            textPaddingVertical = 1.dp
          )
        }
        platform.isIos -> {
          IosChipWithThemedBorder(
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null,
            height = (logoHeight + 9.dp).coerceIn(24.dp, 28.dp),
            fontSize = (logoHeight.value * 0.70f).coerceIn(9f, 11f).sp,
            textPaddingHorizontal = 5.dp,
            textPaddingVertical = 1.dp
          )
        }
        platform.logoUrl.isNotBlank() -> {
          PlatformLogo(
            logoUrl = platform.logoUrl,
            contentDescription = platform.name,
            height = logoHeight,
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null
          )
        }
      }
    }
  }
}

/**
 * Interactive Horizontal Platform Row for DetailsScreen
 * - Placed directly beside / beneath Game Title in header area
 * - Displays supported pure white SVG platform logos (22–24dp) + clickable "PC" / "Android" chips
 * - Tapping "PC" opens the PC System Requirements modal
 * - Tapping "Android" opens the Android Compatibility modal
 */
@Composable
fun DetailsPlatformLogosSection(
  platforms: List<GamePlatform> = emptyList(),
  supportedHardware: List<String>? = null,
  modifier: Modifier = Modifier,
  logoHeight: Dp = 24.dp,
  spacing: Dp = 8.dp,
  onPlatformClick: ((GamePlatformDisplay) -> Unit)? = null
) {
  val resolved = PlatformLogoUtils.resolveGamePlatforms(platforms, supportedHardware)
  if (resolved.isEmpty()) return

  val scrollState = rememberScrollState()

  Row(
    modifier = modifier
      .horizontalScroll(scrollState)
      .testTag("details_platform_logos_section"),
    horizontalArrangement = Arrangement.spacedBy(spacing),
    verticalAlignment = Alignment.CenterVertically
  ) {
    resolved.forEach { platform ->
      when {
        platform.isAndroid -> {
          AndroidChipWithThemedBorder(
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null,
            height = 30.dp,
            fontSize = 13.sp,
            textPaddingHorizontal = 8.dp,
            textPaddingVertical = 2.dp,
            modifier = Modifier.testTag("details_platform_text_android")
          )
        }
        platform.isPc -> {
          PcChipWithRgbBorder(
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null,
            height = 30.dp,
            fontSize = 13.sp,
            textPaddingHorizontal = 8.dp,
            textPaddingVertical = 2.dp,
            modifier = Modifier.testTag("details_platform_text_pc")
          )
        }
        platform.isLinux -> {
          LinuxChipWithThemedBorder(
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null,
            height = 30.dp,
            fontSize = 13.sp,
            textPaddingHorizontal = 8.dp,
            textPaddingVertical = 2.dp,
            modifier = Modifier.testTag("details_platform_text_linux")
          )
        }
        platform.isIos -> {
          IosChipWithThemedBorder(
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null,
            height = 30.dp,
            fontSize = 13.sp,
            textPaddingHorizontal = 8.dp,
            textPaddingVertical = 2.dp,
            modifier = Modifier.testTag("details_platform_text_ios")
          )
        }
        platform.logoUrl.isNotBlank() -> {
          PlatformLogo(
            logoUrl = platform.logoUrl,
            contentDescription = platform.name,
            height = logoHeight,
            onClick = if (onPlatformClick != null) { { onPlatformClick(platform) } } else null
          )
        }
      }
    }
  }
}

// Backward compatibility alias for any existing references
@Composable
fun GamePlatformBadge(
  platformName: String,
  modifier: Modifier = Modifier,
  onClick: (() -> Unit)? = null
) {
  val logoUrl = PlatformLogoUtils.getLogoUrl(platformName)
  PlatformLogo(
    logoUrl = logoUrl,
    contentDescription = platformName,
    height = 18.dp,
    modifier = modifier,
    onClick = onClick
  )
}
