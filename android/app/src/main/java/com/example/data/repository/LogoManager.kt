package com.example.data.repository

import com.example.data.remote.AssetApiService
import com.example.data.remote.NetworkModule
import com.google.gson.JsonObject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentHashMap

/**
 * Centralized Logo Manager for all 29 local SVG assets from the Logos- repository.
 * Provides instant local asset loading (`file:///android_asset/logos/$name.svg`)
 * with remote fallback and dynamic API resolution.
 */
object LogoManager {
  private val assetApiService: AssetApiService by lazy { NetworkModule.createAssetApiService() }

  private val _platforms = ConcurrentHashMap<String, String>()
  private val _stores = ConcurrentHashMap<String, String>()
  private val _subscriptions = ConcurrentHashMap<String, String>()

  private val _playstationLogo = MutableStateFlow<String?>(null)
  val playstationLogo: StateFlow<String?> = _playstationLogo.asStateFlow()

  private val _xboxLogo = MutableStateFlow<String?>(null)
  val xboxLogo: StateFlow<String?> = _xboxLogo.asStateFlow()

  private val _steamLogo = MutableStateFlow<String?>(null)
  val steamLogo: StateFlow<String?> = _steamLogo.asStateFlow()

  private val _ps5Badge = MutableStateFlow<String?>(null)
  val ps5Badge: StateFlow<String?> = _ps5Badge.asStateFlow()

  private val _xboxBadge = MutableStateFlow<String?>(null)
  val xboxBadge: StateFlow<String?> = _xboxBadge.asStateFlow()

  private var isFetched = false

  const val LOCAL_ASSET_BASE_URI = "file:///android_asset/logos/"
  const val FALLBACK_BASE_URL = "https://raw.githubusercontent.com/playboiammav/Logos-/main/"

  /**
   * Set of verified local SVG assets in the project.
   */
  val ALL_29_ASSETS = setOf(
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
    "nintendo_switch_2",
    "nvidia",
    "playstation_store",
    "ps2",
    "ps3",
    "ps4",
    "ps5",
    "ps_vita",
    "psp",
    "rog_ally",
    "steam",
    "steam_deck",
    "ubisoft_connect",
    "wii",
    "wii_u",
    "windows",
    "xbox",
    "xbox_360",
    "xbox_one",
    "xbox_series"
  )

  /**
   * Returns local asset URI for an asset name (e.g. "ps5" -> "file:///android_asset/logos/ps5.svg")
   */
  fun getLocalAssetUri(assetName: String): String {
    return "${LOCAL_ASSET_BASE_URI}${assetName}.svg"
  }

  fun fetchLogos(scope: CoroutineScope = CoroutineScope(Dispatchers.IO)) {
    if (isFetched) return
    scope.launch {
      try {
        val response = assetApiService.getLogos()
        if (response.isSuccessful) {
          val body = response.body()
          if (body != null) {
            parseAndCacheLogos(body)
            isFetched = true
          }
        }
      } catch (_: Exception) {
        // Fallback gracefully
      }
    }
  }

  private fun parseAndCacheLogos(json: JsonObject) {
    try {
      if (json.has("platforms") && json.get("platforms").isJsonObject) {
        val platformsObj = json.getAsJsonObject("platforms")
        for (key in platformsObj.keySet()) {
          if (!platformsObj.get(key).isJsonNull) {
            val url = platformsObj.get(key).asString
            _platforms[key.lowercase().trim()] = url
          }
        }
        _ps5Badge.value = _platforms["ps5"] ?: getPlatformLogoUrl("ps5")
        _xboxBadge.value = _platforms["xbox_series"] ?: _platforms["xbox"] ?: getPlatformLogoUrl("xbox_series")
      }

      if (json.has("stores") && json.get("stores").isJsonObject) {
        val storesObj = json.getAsJsonObject("stores")
        for (key in storesObj.keySet()) {
          if (!storesObj.get(key).isJsonNull) {
            val url = storesObj.get(key).asString
            _stores[key.lowercase().trim()] = url
          }
        }
        _playstationLogo.value = _stores["playstation_store"] ?: getStoreLogoUrl("playstation_store")
        _xboxLogo.value = _stores["xbox_store"] ?: getStoreLogoUrl("xbox_store")
        _steamLogo.value = _stores["steam"] ?: getStoreLogoUrl("steam")
      }

      if (json.has("subscriptions") && json.get("subscriptions").isJsonObject) {
        val subsObj = json.getAsJsonObject("subscriptions")
        for (key in subsObj.keySet()) {
          if (!subsObj.get(key).isJsonNull) {
            val url = subsObj.get(key).asString
            _subscriptions[key.lowercase().trim()] = url
          }
        }
      }
    } catch (_: Exception) {}
  }

  /**
   * Maps platform/hardware name or slug to its local SVG asset URI.
   * Handles all case variations and RAWG platform identifiers.
   */
  fun getPlatformLogoUrl(key: String): String {
    val cleanKey = key.lowercase().replace("-", "_").replace(" ", "_").trim()
    _platforms[cleanKey]?.let { return it }

    val assetName = normalizePlatformAssetName(cleanKey)
    if (assetName != null && ALL_29_ASSETS.contains(assetName)) {
      return getLocalAssetUri(assetName)
    }

    return "${FALLBACK_BASE_URL}${cleanKey}.svg"
  }

  /**
   * Normalizes any platform name or slug to one of the verified hardware asset names.
   */
  fun normalizePlatformAssetName(rawKey: String): String? {
    val key = rawKey.lowercase().replace("-", "_").replace(" ", "_").trim()
    return when {
      key == "ps5" || key.contains("playstation_5") || key.contains("playstation5") || key == "ps_5" -> "ps5"
      key == "ps4" || key.contains("playstation_4") || key.contains("playstation4") || key == "ps_4" -> "ps4"
      key == "ps3" || key.contains("playstation_3") || key.contains("playstation3") || key == "ps_3" -> "ps3"
      key == "ps2" || key.contains("playstation_2") || key.contains("playstation2") || key == "ps_2" -> "ps2"
      key == "psp" || key.contains("playstation_portable") || key.contains("playstationportable") -> "psp"
      key == "ps_vita" || key == "psvita" || key == "vita" || key.contains("playstation_vita") -> "ps_vita"
      key == "playstation" || key.contains("playstation") -> "ps5"

      key == "xbox_series" || key.contains("series_x") || key.contains("series_s") || key.contains("xbox_series") || key.contains("series_x_s") -> "xbox_series"
      key == "xbox_one" || key == "xboxone" || key.contains("xbox_one") -> "xbox_one"
      key == "xbox_360" || key == "xbox360" || key.contains("xbox_360") -> "xbox_360"
      key == "xbox" || key == "original_xbox" || key.contains("xbox") -> "xbox"

      key == "nintendo_switch_2" || key == "switch_2" || key.contains("switch_2") -> "nintendo_switch_2"
      key == "nintendo_switch" || key == "switch" || key.contains("switch") -> "nintendo_switch"
      key == "nintendo_3ds" || key == "3ds" || key.contains("3ds") || key.contains("2ds") -> "nintendo_3ds"
      key == "wii_u" || key == "wiiu" || key.contains("wii_u") || key.contains("wiiu") -> "wii_u"
      key == "wii" || key.contains("wii") -> "wii"

      key == "steam_deck" || key.contains("steam_deck") || key.contains("steamdeck") -> "steam_deck"
      key == "rog_ally" || key.contains("rog_ally") || key.contains("ally") -> "rog_ally"
      key == "meta_quest" || key.contains("quest") || key.contains("oculus") -> "meta_quest"
      key == "nvidia" || key.contains("shield") || (key.contains("nvidia") && !key.contains("geforce_now")) -> "nvidia"

      key == "chromeos" || key.contains("chrome_os") || key.contains("chromeos") || key.contains("chromebook") -> "chromeos"
      key == "windows" || key == "win" || key.contains("windows") || key == "pc_windows" -> "windows"
      key == "mac" || key == "macos" || key == "os_x" || key == "osx" || key.contains("macintosh") || key.contains("apple_mac") -> "mac"
      key == "linux" || key.contains("linux") || key.contains("ubuntu") || key.contains("debian") || key.contains("arch") -> "linux"
      key == "ios" || key.contains("iphone") || key.contains("ipad") || key == "apple_ios" -> "ios"
      key == "android" || key.contains("android") -> "android"

      ALL_29_ASSETS.contains(key) -> key
      else -> null
    }
  }

  /**
   * Maps store/launcher/service name to its local SVG asset URI.
   * Handles all case variations and store identifiers.
   */
  fun getStoreLogoUrl(key: String): String {
    val cleanKey = key.lowercase().replace("-", "_").replace(" ", "_").trim()
    _stores[cleanKey]?.let { return it }

    val assetName = normalizeStoreAssetName(cleanKey)
    if (assetName != null && ALL_29_ASSETS.contains(assetName)) {
      return getLocalAssetUri(assetName)
    }

    return "${FALLBACK_BASE_URL}${cleanKey}.svg"
  }

  /**
   * Normalizes any store/launcher name to one of the 9 store asset names (or PlayStation/Xbox/Nintendo SVG).
   */
  fun normalizeStoreAssetName(rawKey: String): String? {
    val key = rawKey.lowercase().replace("-", "_").replace(" ", "_").replace(".", "_").trim()
    return when {
      key.contains("steam") && !key.contains("deck") -> "steam"
      key.contains("epic") -> "epic_games"
      key.contains("gog") -> "gog"
      key.contains("ea") || key.contains("origin") -> "ea_app"
      key.contains("ubisoft") || key.contains("uplay") -> "ubisoft_connect"
      key.contains("battlenet") || key.contains("battle_net") || key.contains("blizzard") -> "battlenet"
      key.contains("google") || key.contains("play_games") -> "google_play_games"
      key.contains("apple") || key.contains("arcade") -> "apple_arcade"
      key.contains("geforce") || key.contains("geforce_now") -> "geforce_now"
      key.contains("playstation") || key.contains("ps_store") || key.contains("psn") -> "playstation_store"
      key.contains("xbox") || key.contains("microsoft") -> "xbox"
      key.contains("eshop") || key.contains("nintendo") -> "nintendo_switch"
      ALL_29_ASSETS.contains(key) -> key
      else -> null
    }
  }
}

