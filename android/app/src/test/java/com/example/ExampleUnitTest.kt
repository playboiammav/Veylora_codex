package com.example

import com.example.data.repository.LogoManager
import com.example.domain.model.GamePlatform
import com.example.util.PlatformLogoUtils
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {

  @Test
  fun testAll29AssetsExistInManager() {
    val expected29 = setOf(
      "android",
      "apple_arcade",
      "battlenet",
      "chromeos",
      "ea_app",
      "epic_games",
      "geforce_now",
      "gog",
      "google_play_games",
      "ios",
      "linux",
      "mac",
      "meta_quest",
      "nintendo_3ds",
      "nintendo_switch",
      "nvidia",
      "ps4",
      "ps5",
      "ps_vita",
      "rog_ally",
      "steam",
      "steam_deck",
      "ubisoft_connect",
      "wii",
      "wii_u",
      "windows",
      "xbox",
      "xbox_360",
      "xbox_series"
    )
    assertEquals(29, LogoManager.ALL_29_ASSETS.size)
    assertEquals(expected29, LogoManager.ALL_29_ASSETS)
  }

  @Test
  fun testHardwarePlatformAssetMapping() {
    // 20 hardware platforms
    assertEquals("android", LogoManager.normalizePlatformAssetName("Android"))
    assertEquals("ios", LogoManager.normalizePlatformAssetName("iOS"))
    assertEquals("windows", LogoManager.normalizePlatformAssetName("Windows"))
    assertEquals("mac", LogoManager.normalizePlatformAssetName("macOS"))
    assertEquals("linux", LogoManager.normalizePlatformAssetName("Linux"))
    assertEquals("chromeos", LogoManager.normalizePlatformAssetName("ChromeOS"))
    assertEquals("ps4", LogoManager.normalizePlatformAssetName("PlayStation 4"))
    assertEquals("ps5", LogoManager.normalizePlatformAssetName("PlayStation 5"))
    assertEquals("ps_vita", LogoManager.normalizePlatformAssetName("PS Vita"))
    assertEquals("xbox", LogoManager.normalizePlatformAssetName("Xbox One"))
    assertEquals("xbox_360", LogoManager.normalizePlatformAssetName("Xbox 360"))
    assertEquals("xbox_series", LogoManager.normalizePlatformAssetName("Xbox Series X"))
    assertEquals("nintendo_3ds", LogoManager.normalizePlatformAssetName("Nintendo 3DS"))
    assertEquals("nintendo_switch", LogoManager.normalizePlatformAssetName("Nintendo Switch"))
    assertEquals("wii", LogoManager.normalizePlatformAssetName("Wii"))
    assertEquals("wii_u", LogoManager.normalizePlatformAssetName("Wii U"))
    assertEquals("steam_deck", LogoManager.normalizePlatformAssetName("Steam Deck"))
    assertEquals("rog_ally", LogoManager.normalizePlatformAssetName("ROG Ally"))
    assertEquals("meta_quest", LogoManager.normalizePlatformAssetName("Meta Quest"))
    assertEquals("nvidia", LogoManager.normalizePlatformAssetName("NVIDIA"))
  }

  @Test
  fun testStoreAssetMapping() {
    // 9 store assets
    assertEquals("steam", LogoManager.normalizeStoreAssetName("Steam"))
    assertEquals("epic_games", LogoManager.normalizeStoreAssetName("Epic Games Store"))
    assertEquals("gog", LogoManager.normalizeStoreAssetName("GOG"))
    assertEquals("ea_app", LogoManager.normalizeStoreAssetName("EA App"))
    assertEquals("ubisoft_connect", LogoManager.normalizeStoreAssetName("Ubisoft Connect"))
    assertEquals("battlenet", LogoManager.normalizeStoreAssetName("Battle.net"))
    assertEquals("google_play_games", LogoManager.normalizeStoreAssetName("Google Play Games"))
    assertEquals("apple_arcade", LogoManager.normalizeStoreAssetName("Apple Arcade"))
    assertEquals("geforce_now", LogoManager.normalizeStoreAssetName("GeForce NOW"))
  }

  @Test
  fun testResolveGamePlatformsSeparation() {
    val platforms = listOf(
      GamePlatform(id = 1, name = "PlayStation 5", slug = "playstation5"),
      GamePlatform(id = 2, name = "PC", slug = "pc"),
      GamePlatform(id = 3, name = "Xbox Series S/X", slug = "xbox-series-x"),
      GamePlatform(id = 4, name = "Nintendo Switch", slug = "nintendo-switch"),
      GamePlatform(id = 5, name = "Steam", slug = "steam") // Store - should be filtered out
    )

    val resolved = PlatformLogoUtils.resolveGamePlatforms(platforms)

    // Store "Steam" should not be in hardware platforms
    assertTrue(resolved.none { it.name.equals("Steam", ignoreCase = true) })

    // PS5, PC, Xbox Series, and Nintendo Switch should all be present
    assertTrue(resolved.any { it.key == "ps5" })
    assertTrue(resolved.any { it.key == "pc" && it.isPc })
    assertTrue(resolved.any { it.key == "xbox_series" })
    assertTrue(resolved.any { it.key == "nintendo_switch" })
  }
}

