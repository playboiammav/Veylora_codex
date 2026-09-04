/**
 * Hardware Platform & Store Normalization Layer
 * 
 * Rules:
 * 1. Hardware platforms: PS5, PS4, PS Vita, PSP, Xbox Series X|S, Xbox One, Xbox 360,
 *    Nintendo Switch, Nintendo Switch 2, Nintendo 3DS, Wii, Wii U, Steam Deck, PC,
 *    Windows, macOS, Linux, Android, iOS, Meta Quest, NVIDIA Shield, ROG Ally.
 * 2. Hardware platforms NEVER include stores (Steam, Epic, PS Store, Xbox Store, etc.).
 * 3. PC is rendered as text "PC", clickable to open PC System Requirements.
 * 4. Logos are white, transparent background, proper aspect ratio, 20-24dp visual height.
 */

export * from './platform-logo-mapper';
import { resolveHardwarePlatform, HARDWARE_PLATFORMS_MAP, HardwarePlatformConfig } from './platform-logo-mapper';

export interface HardwarePlatformInfo extends HardwarePlatformConfig {}

export const HARDWARE_PLATFORMS = HARDWARE_PLATFORMS_MAP;

/**
 * Normalizes raw platform tags / badges into verified hardware platform identifiers
 */
export function normalizeHardwarePlatforms(rawPlatforms: string[] = []): string[] {
  const result = new Set<string>();

  for (const raw of rawPlatforms) {
    const resolved = resolveHardwarePlatform(raw);
    if (resolved) {
      result.add(resolved.id);
    }
  }

  return Array.from(result);
}

