/**
 * Centralized Platform and Store Logo Mapping Layer
 * 
 * Uses verified SVG assets from /public/assets/logos/ (commit cd86905)
 * Strict separation between Hardware Platforms and Digital Stores.
 * PC is rendered as a special text chip with a 4-side chasing RGB border.
 */

export interface HardwarePlatformConfig {
  id: string;
  name: string;
  shortName: string;
  isPc: boolean;
  logoPath?: string;
  altText: string;
}

export interface OfficialStoreConfig {
  id: string;
  name: string;
  brandColor: string;
  bgClass: string;
  textClass: string;
  logoPath: string;
  altText: string;
}

export const HARDWARE_PLATFORMS_MAP: Record<string, HardwarePlatformConfig> = {
  pc: {
    id: 'pc',
    name: 'PC',
    shortName: 'PC',
    isPc: true,
    altText: 'PC (System Requirements)',
  },
  ps5: {
    id: 'ps5',
    name: 'PlayStation 5',
    shortName: 'PS5',
    isPc: false,
    logoPath: '/assets/logos/ps5.svg',
    altText: 'PlayStation 5',
  },
  ps4: {
    id: 'ps4',
    name: 'PlayStation 4',
    shortName: 'PS4',
    isPc: false,
    logoPath: '/assets/logos/ps4.svg',
    altText: 'PlayStation 4',
  },
  ps3: {
    id: 'ps3',
    name: 'PlayStation 3',
    shortName: 'PS3',
    isPc: false,
    logoPath: '/assets/logos/ps3.svg',
    altText: 'PlayStation 3',
  },
  ps2: {
    id: 'ps2',
    name: 'PlayStation 2',
    shortName: 'PS2',
    isPc: false,
    logoPath: '/assets/logos/ps2.svg',
    altText: 'PlayStation 2',
  },
  ps_vita: {
    id: 'ps_vita',
    name: 'PlayStation Vita',
    shortName: 'PS Vita',
    isPc: false,
    logoPath: '/assets/logos/ps_vita.svg',
    altText: 'PlayStation Vita',
  },
  xbox_series: {
    id: 'xbox_series',
    name: 'Xbox Series X|S',
    shortName: 'Xbox Series',
    isPc: false,
    logoPath: '/assets/logos/xbox_series.svg',
    altText: 'Xbox Series X|S',
  },
  xbox: {
    id: 'xbox',
    name: 'Xbox',
    shortName: 'Xbox',
    isPc: false,
    logoPath: '/assets/logos/xbox.svg',
    altText: 'Xbox',
  },
  xbox_one: {
    id: 'xbox_one',
    name: 'Xbox One',
    shortName: 'Xbox One',
    isPc: false,
    logoPath: '/assets/logos/xbox.svg',
    altText: 'Xbox One',
  },
  xbox_360: {
    id: 'xbox_360',
    name: 'Xbox 360',
    shortName: 'Xbox 360',
    isPc: false,
    logoPath: '/assets/logos/xbox_360.svg',
    altText: 'Xbox 360',
  },
  nintendo_switch: {
    id: 'nintendo_switch',
    name: 'Nintendo Switch',
    shortName: 'Switch',
    isPc: false,
    logoPath: '/assets/logos/nintendo_switch.svg',
    altText: 'Nintendo Switch',
  },
  nintendo_switch_2: {
    id: 'nintendo_switch_2',
    name: 'Nintendo Switch 2',
    shortName: 'Switch 2',
    isPc: false,
    logoPath: '/assets/logos/nintendo_switch.svg',
    altText: 'Nintendo Switch 2',
  },
  nintendo_3ds: {
    id: 'nintendo_3ds',
    name: 'Nintendo 3DS',
    shortName: '3DS',
    isPc: false,
    logoPath: '/assets/logos/nintendo_3ds.svg',
    altText: 'Nintendo 3DS',
  },
  wii: {
    id: 'wii',
    name: 'Wii',
    shortName: 'Wii',
    isPc: false,
    logoPath: '/assets/logos/wii.svg',
    altText: 'Wii',
  },
  wii_u: {
    id: 'wii_u',
    name: 'Wii U',
    shortName: 'Wii U',
    isPc: false,
    logoPath: '/assets/logos/wii_u.svg',
    altText: 'Wii U',
  },
  steam_deck: {
    id: 'steam_deck',
    name: 'Steam Deck',
    shortName: 'Steam Deck',
    isPc: false,
    logoPath: '/assets/logos/steam_deck.svg',
    altText: 'Steam Deck',
  },
  rog_ally: {
    id: 'rog_ally',
    name: 'ROG Ally',
    shortName: 'ROG Ally',
    isPc: false,
    logoPath: '/assets/logos/rog_ally.svg',
    altText: 'ROG Ally',
  },
  windows: {
    id: 'windows',
    name: 'Windows',
    shortName: 'Windows',
    isPc: false,
    logoPath: '/assets/logos/windows.svg',
    altText: 'Windows',
  },
  mac: {
    id: 'mac',
    name: 'macOS',
    shortName: 'macOS',
    isPc: false,
    logoPath: '/assets/logos/mac.svg',
    altText: 'macOS',
  },
  linux: {
    id: 'linux',
    name: 'Linux',
    shortName: 'Linux',
    isPc: false,
    logoPath: '/assets/logos/linux.svg',
    altText: 'Linux',
  },
  android: {
    id: 'android',
    name: 'Android',
    shortName: 'Android',
    isPc: false,
    logoPath: '/assets/logos/android.svg',
    altText: 'Android',
  },
  ios: {
    id: 'ios',
    name: 'iOS',
    shortName: 'iOS',
    isPc: false,
    logoPath: '/assets/logos/ios.svg',
    altText: 'iOS',
  },
  meta_quest: {
    id: 'meta_quest',
    name: 'Meta Quest',
    shortName: 'Quest',
    isPc: false,
    logoPath: '/assets/logos/meta_quest.svg',
    altText: 'Meta Quest',
  },
  chromeos: {
    id: 'chromeos',
    name: 'ChromeOS',
    shortName: 'ChromeOS',
    isPc: false,
    logoPath: '/assets/logos/chromeos.svg',
    altText: 'ChromeOS',
  },
};

export const OFFICIAL_STORES_MAP: Record<string, OfficialStoreConfig> = {
  steam: {
    id: 'steam',
    name: 'Steam',
    brandColor: '#171A21',
    bgClass: 'bg-[#1b2838] hover:bg-[#2a475e]',
    textClass: 'text-white',
    logoPath: '/assets/logos/steam.svg',
    altText: 'Steam Store',
  },
  playstation_store: {
    id: 'playstation_store',
    name: 'PlayStation Store',
    brandColor: '#003791',
    bgClass: 'bg-[#003791] hover:bg-[#0047ba]',
    textClass: 'text-white',
    logoPath: '/assets/logos/playstation-store-logo-brandlogos.net_trj4r2512.svg',
    altText: 'PlayStation Store',
  },
  xbox_store: {
    id: 'xbox_store',
    name: 'Xbox Store',
    brandColor: '#107C10',
    bgClass: 'bg-[#107C10] hover:bg-[#159415]',
    textClass: 'text-white',
    logoPath: '/assets/logos/xbox.svg',
    altText: 'Xbox Store',
  },
  epic_games: {
    id: 'epic_games',
    name: 'Epic Games',
    brandColor: '#222226',
    bgClass: 'bg-[#222226] hover:bg-[#2c2c30] border border-zinc-700/80',
    textClass: 'text-white',
    logoPath: '/assets/logos/epic_games.svg',
    altText: 'Epic Games Store',
  },
  gog: {
    id: 'gog',
    name: 'GOG.com',
    brandColor: '#5C1E7A',
    bgClass: 'bg-[#401357] hover:bg-[#581c78]',
    textClass: 'text-white',
    logoPath: '/assets/logos/gog.svg',
    altText: 'GOG Store',
  },
  ea_app: {
    id: 'ea_app',
    name: 'EA App',
    brandColor: '#FF4747',
    bgClass: 'bg-[#d63031] hover:bg-[#e17055]',
    textClass: 'text-white',
    logoPath: '/assets/logos/ea_app.svg',
    altText: 'EA App',
  },
  ubisoft_connect: {
    id: 'ubisoft_connect',
    name: 'Ubisoft Store',
    brandColor: '#0070FF',
    bgClass: 'bg-[#0984e3] hover:bg-[#74b9ff]',
    textClass: 'text-white',
    logoPath: '/assets/logos/ubisoft_connect.svg',
    altText: 'Ubisoft Store',
  },
  battlenet: {
    id: 'battlenet',
    name: 'Battle.net',
    brandColor: '#00AEFF',
    bgClass: 'bg-[#0078D7] hover:bg-[#0099FF]',
    textClass: 'text-white',
    logoPath: '/assets/logos/battlenet.svg',
    altText: 'Battle.net',
  },
  google_play_games: {
    id: 'google_play_games',
    name: 'Google Play',
    brandColor: '#01875F',
    bgClass: 'bg-[#01875F] hover:bg-[#00a672]',
    textClass: 'text-white',
    logoPath: '/assets/logos/google_play_games.svg',
    altText: 'Google Play Games',
  },
  apple_arcade: {
    id: 'apple_arcade',
    name: 'Apple Arcade',
    brandColor: '#FF2D55',
    bgClass: 'bg-[#e02447] hover:bg-[#ff3b60]',
    textClass: 'text-white',
    logoPath: '/assets/logos/apple_arcade.svg',
    altText: 'Apple Arcade',
  },
  geforce_now: {
    id: 'geforce_now',
    name: 'GeForce NOW',
    brandColor: '#76B900',
    bgClass: 'bg-[#76B900] hover:bg-[#8edb02] text-black',
    textClass: 'text-black',
    logoPath: '/assets/logos/geforce_now.svg',
    altText: 'GeForce NOW',
  },
};

/**
 * Resolves a raw platform string/badge into a normalized HardwarePlatformConfig
 */
export function resolveHardwarePlatform(raw: string): HardwarePlatformConfig | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();

  // PC
  if (lower === 'pc' || lower.includes('windows') || lower.includes('personal computer')) {
    return HARDWARE_PLATFORMS_MAP.pc;
  }

  // PlayStation Generations (must check PS5 first, then PS4, PS3, PS2, PS Vita)
  if (lower === 'ps5' || lower.includes('playstation 5') || lower.includes('ps5')) {
    return HARDWARE_PLATFORMS_MAP.ps5;
  }
  if (lower === 'ps4' || lower.includes('playstation 4') || lower.includes('ps4')) {
    return HARDWARE_PLATFORMS_MAP.ps4;
  }
  if (lower === 'ps3' || lower.includes('playstation 3') || lower.includes('ps3')) {
    return HARDWARE_PLATFORMS_MAP.ps3;
  }
  if (lower === 'ps2' || lower.includes('playstation 2') || lower.includes('ps2')) {
    return HARDWARE_PLATFORMS_MAP.ps2;
  }
  if (lower.includes('vita') || lower.includes('psvita')) {
    return HARDWARE_PLATFORMS_MAP.ps_vita;
  }
  if (lower.includes('playstation') || lower.includes('sony')) {
    return HARDWARE_PLATFORMS_MAP.ps5;
  }

  // Xbox Generations
  if (lower.includes('series') || lower.includes('series x') || lower.includes('series s')) {
    return HARDWARE_PLATFORMS_MAP.xbox_series;
  }
  if (lower.includes('360')) {
    return HARDWARE_PLATFORMS_MAP.xbox_360;
  }
  if (lower.includes('xbox one') || lower.includes('xboxone')) {
    return HARDWARE_PLATFORMS_MAP.xbox_one;
  }
  if (lower.includes('xbox')) {
    return HARDWARE_PLATFORMS_MAP.xbox_series;
  }

  // Nintendo Generations
  if (lower.includes('switch 2')) {
    return HARDWARE_PLATFORMS_MAP.nintendo_switch_2;
  }
  if (lower.includes('switch') || lower.includes('nintendo switch')) {
    return HARDWARE_PLATFORMS_MAP.nintendo_switch;
  }
  if (lower.includes('3ds') || lower.includes('nintendo 3ds')) {
    return HARDWARE_PLATFORMS_MAP.nintendo_3ds;
  }
  if (lower.includes('wii u') || lower.includes('wiiu')) {
    return HARDWARE_PLATFORMS_MAP.wii_u;
  }
  if (lower === 'wii' || lower.includes('wii')) {
    return HARDWARE_PLATFORMS_MAP.wii;
  }
  if (lower.includes('nintendo')) {
    return HARDWARE_PLATFORMS_MAP.nintendo_switch;
  }

  // Handhelds & Desktops
  if (lower.includes('steam deck') || lower.includes('steamdeck')) {
    return HARDWARE_PLATFORMS_MAP.steam_deck;
  }
  if (lower.includes('rog ally') || lower.includes('rogally')) {
    return HARDWARE_PLATFORMS_MAP.rog_ally;
  }
  if (lower.includes('mac') || lower.includes('macos') || lower.includes('osx') || lower.includes('apple')) {
    return HARDWARE_PLATFORMS_MAP.mac;
  }
  if (lower.includes('linux')) {
    return HARDWARE_PLATFORMS_MAP.linux;
  }
  if (lower.includes('android')) {
    return HARDWARE_PLATFORMS_MAP.android;
  }
  if (lower === 'ios' || lower.includes('iphone') || lower.includes('ipad')) {
    return HARDWARE_PLATFORMS_MAP.ios;
  }
  if (lower.includes('quest') || lower.includes('meta quest') || lower.includes('oculus')) {
    return HARDWARE_PLATFORMS_MAP.meta_quest;
  }
  if (lower.includes('chromeos') || lower.includes('chromebook')) {
    return HARDWARE_PLATFORMS_MAP.chromeos;
  }

  // Direct ID match fallback
  if (HARDWARE_PLATFORMS_MAP[lower]) {
    return HARDWARE_PLATFORMS_MAP[lower];
  }

  return null;
}

/**
 * Resolves a store ID or name to OfficialStoreConfig
 */
export function resolveStoreConfig(storeIdOrName: string): OfficialStoreConfig {
  if (!storeIdOrName) {
    return {
      id: 'store',
      name: 'Official Store',
      brandColor: '#27272A',
      bgClass: 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700',
      textClass: 'text-white',
      logoPath: '/assets/logos/steam.svg',
      altText: 'Store',
    };
  }

  const lower = storeIdOrName.toLowerCase().trim();

  if (lower.includes('steam') || lower.includes('steampowered')) {
    return OFFICIAL_STORES_MAP.steam;
  }
  if (lower.includes('playstation') || lower.includes('psn') || lower.includes('ps store')) {
    return OFFICIAL_STORES_MAP.playstation_store;
  }
  if (lower.includes('xbox') || lower.includes('microsoft')) {
    return OFFICIAL_STORES_MAP.xbox_store;
  }
  if (lower.includes('epic') || lower.includes('epicgames')) {
    return OFFICIAL_STORES_MAP.epic_games;
  }
  if (lower.includes('gog')) {
    return OFFICIAL_STORES_MAP.gog;
  }
  if (lower.includes('ea') || lower.includes('origin')) {
    return OFFICIAL_STORES_MAP.ea_app;
  }
  if (lower.includes('ubisoft') || lower.includes('uplay')) {
    return OFFICIAL_STORES_MAP.ubisoft_connect;
  }
  if (lower.includes('battle.net') || lower.includes('battlenet') || lower.includes('blizzard')) {
    return OFFICIAL_STORES_MAP.battlenet;
  }
  if (lower.includes('google play') || lower.includes('play games')) {
    return OFFICIAL_STORES_MAP.google_play_games;
  }
  if (lower.includes('arcade') || lower.includes('apple')) {
    return OFFICIAL_STORES_MAP.apple_arcade;
  }
  if (lower.includes('geforce') || lower.includes('nvidia')) {
    return OFFICIAL_STORES_MAP.geforce_now;
  }

  if (OFFICIAL_STORES_MAP[lower]) {
    return OFFICIAL_STORES_MAP[lower];
  }

  return {
    id: lower,
    name: storeIdOrName,
    brandColor: '#27272A',
    bgClass: 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700',
    textClass: 'text-white',
    logoPath: '/assets/logos/steam.svg',
    altText: storeIdOrName,
  };
}
