import { SteamService } from '../steam/steam-service';
import { GogService } from '../gog/gog-service';
import { Cs2Service } from '../cs2/cs2-service';
import { GooglePlayService } from '../google-play/google-play-service';
import { AppStoreConnectService } from '../app-store-connect/app-store-connect-service';
import { NetflixService } from '../netflix/netflix-service';
import { RawgService } from '../rawg/rawg-service';

export type UnifiedPlatformType =
  | 'steam'
  | 'epic'
  | 'gog'
  | 'cs2'
  | 'google-play'
  | 'app-store'
  | 'netflix'
  | 'rawg'
  | 'playstation'
  | 'xbox';

export type UnifiedItemType = 'game' | 'app' | 'media' | 'item' | 'service';

export interface UnifiedItem {
  platform: UnifiedPlatformType;
  id: string;
  name: string;
  description?: string;
  image?: string;
  url?: string;
  category?: string;
  type: UnifiedItemType;
  price?: {
    isFree?: boolean;
    formatted?: string;
    raw?: number;
    currency?: string;
    discountPercent?: number;
  };
  metadata: Record<string, any>;
}

export interface UnifiedSearchParams {
  query?: string;
  platform?: UnifiedPlatformType | 'all';
  category?: string;
  type?: UnifiedItemType | 'all';
  language?: string;
  country?: string;
  limit?: number;
}

export class UnifiedSearchService {
  static async search(params: UnifiedSearchParams = {}): Promise<{
    success: boolean;
    total: number;
    query: string;
    platform: string;
    results: UnifiedItem[];
  }> {
    const {
      query = '',
      platform = 'all',
      type = 'all',
      language = 'en',
      country = 'us',
      limit = 40,
    } = params;

    const normalizedResults: UnifiedItem[] = [];
    const searchLower = query.toLowerCase();

    // 1. STEAM SEARCH
    if (platform === 'all' || platform === 'steam') {
      try {
        const featuredResult = await SteamService.getFeatured(country);
        const capsules = [
          ...(featuredResult.data?.large_capsules || []),
          ...(featuredResult.data?.featured_win || []),
        ];

        for (const item of capsules) {
          if (!query || item.name?.toLowerCase().includes(searchLower)) {
            normalizedResults.push({
              platform: 'steam',
              id: String(item.id),
              name: item.name || 'Steam Game',
              description: item.headline || 'Available on Steam',
              image: item.large_capsule_image || item.header_image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
              url: `https://store.steampowered.com/app/${item.id}`,
              category: 'PC Gaming',
              type: 'game',
              price: {
                isFree: item.final_price === 0,
                formatted: item.final_price === 0 ? 'Free' : `$${(item.final_price / 100).toFixed(2)}`,
                discountPercent: item.discount_percent || 0,
                currency: 'USD',
              },
              metadata: {
                steamAppId: item.id,
                windows: item.windows_available,
                mac: item.mac_available,
                linux: item.linux_available,
              },
            });
          }
        }
      } catch {
        // Continue
      }
    }

    // 2. GOG SEARCH
    if (platform === 'all' || platform === 'gog') {
      try {
        const gogRes = await GogService.getCatalog(1, query);
        for (const g of gogRes.data) {
          normalizedResults.push({
            platform: 'gog',
            id: String(g.id),
            name: g.title,
            description: g.description || `DRM-Free classic available on GOG.`,
            image: g.image,
            url: g.url,
            category: g.genres?.[0] || 'RPG',
            type: 'game',
            price: {
              isFree: g.price.isFree,
              formatted: g.price.amount,
              discountPercent: g.price.discountPercentage,
              currency: g.price.currency,
            },
            metadata: {
              slug: g.slug,
              developer: g.developer,
              publisher: g.publisher,
              rating: g.rating,
              drmFree: true,
            },
          });
        }
      } catch {
        // Continue
      }
    }

    // 3. CS2 SEARCH
    if (platform === 'all' || platform === 'cs2') {
      try {
        const cs2Items = await Cs2Service.searchItems(query, language, 12);
        for (const item of cs2Items) {
          normalizedResults.push({
            platform: 'cs2',
            id: item.id,
            name: item.name,
            description: item.description || `CS2 In-game cosmetic asset (${item.rarity?.name || 'Standard'})`,
            image: item.image,
            url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(item.name)}`,
            category: item.category?.name || 'Weapon Skin',
            type: 'item',
            price: {
              isFree: false,
              formatted: 'Market Price',
              currency: 'USD',
            },
            metadata: {
              rarity: item.rarity,
              type: item.type,
              minFloat: item.min_float,
              maxFloat: item.max_float,
            },
          });
        }
      } catch {
        // Continue
      }
    }

    // 4. GOOGLE PLAY SEARCH
    if (platform === 'all' || platform === 'google-play') {
      try {
        if (query) {
          const gplayApps = await GooglePlayService.search(query, 10, country, language);
          for (const app of gplayApps) {
            normalizedResults.push({
              platform: 'google-play',
              id: app.appId,
              name: app.title,
              description: app.summary || app.developer,
              image: app.icon,
              url: app.url,
              category: app.genre || 'Android App',
              type: 'app',
              price: {
                isFree: app.free,
                formatted: app.priceText || (app.free ? 'Free' : `$${app.price}`),
                currency: app.currency || 'USD',
              },
              metadata: {
                developer: app.developer,
                score: app.score,
                installs: app.installs,
              },
            });
          }
        } else {
          const gplayTop = await GooglePlayService.getApps({ country, lang: language, num: 10 });
          for (const app of gplayTop.data) {
            normalizedResults.push({
              platform: 'google-play',
              id: app.appId,
              name: app.title,
              description: app.summary || app.developer,
              image: app.icon,
              url: app.url,
              category: app.genre || 'Android App',
              type: 'app',
              price: {
                isFree: app.free,
                formatted: app.priceText || 'Free',
                currency: 'USD',
              },
              metadata: {
                developer: app.developer,
                score: app.score,
              },
            });
          }
        }
      } catch {
        // Continue
      }
    }

    // 5. APP STORE CONNECT SEARCH
    if (platform === 'all' || platform === 'app-store') {
      try {
        const ascApps = await AppStoreConnectService.listApps();
        for (const app of ascApps.data) {
          if (!query || app.name.toLowerCase().includes(searchLower) || app.bundleId.toLowerCase().includes(searchLower)) {
            normalizedResults.push({
              platform: 'app-store',
              id: app.id,
              name: app.name,
              description: `Bundle: ${app.bundleId} (${app.primaryLocale})`,
              image: app.iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
              url: `https://apps.apple.com/app/id${app.id}`,
              category: 'iOS / macOS',
              type: 'app',
              metadata: {
                bundleId: app.bundleId,
                sku: app.sku,
                platform: app.platform,
                versions: app.appStoreVersions,
              },
            });
          }
        }
      } catch {
        // Continue
      }
    }

    // 6. NETFLIX STREAMING SEARCH
    if (platform === 'all' || platform === 'netflix') {
      try {
        const netflixRes = await NetflixService.getMedia(undefined, query || undefined);
        for (const media of netflixRes.data) {
          normalizedResults.push({
            platform: 'netflix',
            id: media._id,
            name: media.title,
            description: media.description,
            image: media.thumbnail,
            url: media.video,
            category: media.genre?.[0] || 'Streaming',
            type: 'media',
            metadata: {
              trailer: media.trailer,
              duration: media.duration,
              rating: media.rating,
              year: media.year,
              mediaType: media.type,
            },
          });
        }
      } catch {
        // Continue
      }
    }

    // 7. RAWG VIDEO GAMES DATABASE SEARCH
    if (platform === 'all' || platform === 'rawg') {
      try {
        const rawgRes = await RawgService.getGames({
          search: query || undefined,
          page_size: 15,
          ordering: '-rating',
        });
        for (const game of rawgRes.data) {
          normalizedResults.push({
            platform: 'rawg',
            id: String(game.id),
            name: game.name,
            description: `Released: ${game.released || 'TBA'} • Metacritic: ${game.metacritic || 'N/A'} • Rating: ${game.rating}/5`,
            image: game.background_image,
            url: `https://rawg.io/games/${game.slug}`,
            category: game.genres?.[0]?.name || 'Video Game',
            type: 'game',
            price: {
              isFree: false,
              formatted: 'Various Stores',
              currency: 'USD',
            },
            metadata: {
              rawgId: game.id,
              slug: game.slug,
              rating: game.rating,
              ratingsCount: game.ratings_count,
              metacritic: game.metacritic,
              released: game.released,
              genres: game.genres?.map((g) => g.name),
              platforms: game.platforms?.map((p) => p.platform.name),
            },
          });
        }
      } catch {
        // Continue
      }
    }

    // Filter by type if requested
    let filtered = normalizedResults;
    if (type !== 'all') {
      filtered = filtered.filter((i) => i.type === type);
    }

    return {
      success: true,
      total: filtered.length,
      query,
      platform,
      results: filtered.slice(0, limit),
    };
  }
}
