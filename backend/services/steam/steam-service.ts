import { serverCache } from '../cache/cache-service';

export interface SteamFeaturedResponse {
  large_capsules: any[];
  featured_win: any[];
  featured_mac: any[];
  featured_linux: any[];
  layout: string;
  status: number;
}

export interface SteamFeaturedCategoriesResponse {
  specials?: { id: string; name: string; items: any[] };
  top_sellers?: { id: string; name: string; items: any[] };
  new_releases?: { id: string; name: string; items: any[] };
  coming_soon?: { id: string; name: string; items: any[] };
  genres?: Record<string, any>;
  trailer_slideshow?: any[];
  status: number;
}

export interface SteamGameDetails {
  type: string;
  name: string;
  steam_appid: number;
  required_age: number;
  is_free: boolean;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  header_image: string;
  capsule_image: string;
  website?: string;
  pc_requirements?: { minimum?: string; recommended?: string };
  mac_requirements?: { minimum?: string; recommended?: string };
  linux_requirements?: { minimum?: string; recommended?: string };
  developers?: string[];
  publishers?: string[];
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  packages?: number[];
  package_groups?: any[];
  platforms?: { windows: boolean; mac: boolean; linux: boolean };
  categories?: { id: number; description: string }[];
  genres?: { id: string; description: string }[];
  screenshots?: { id: number; path_thumbnail: string; path_full: string }[];
  movies?: any[];
  release_date?: { coming_soon: boolean; date: string };
  metacritic?: { score: number; url: string };
}

export interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  feed_type: number;
  appid: number;
}

export class SteamService {
  private static getApiKey(): string | undefined {
    return process.env.STEAM_KEY || process.env.STEAM_API_KEY;
  }

  /**
   * GET /featured?cc={region}
   * Returns featured games on the Steam Store.
   */
  static async getFeatured(region: string = 'us'): Promise<{ success: boolean; data: any; source: 'live' | 'cache' }> {
    const cacheKey = `steam:featured:${region.toLowerCase()}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    try {
      const url = `https://store.steampowered.com/api/featured/?cc=${encodeURIComponent(region)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        throw new Error(`Steam API responded with HTTP ${res.status}`);
      }

      const data = await res.json();
      serverCache.set(cacheKey, data, 300); // 5 min cache
      return { success: true, data, source: 'live' };
    } catch (error: any) {
      if (cached) return { success: true, data: cached, source: 'cache' };
      throw error;
    }
  }

  /**
   * GET /featuredcategories?cc={region}&l={language}
   * Returns featured categories from the Steam Store.
   */
  static async getFeaturedCategories(
    region: string = 'us',
    language: string = 'english'
  ): Promise<{ success: boolean; data: SteamFeaturedCategoriesResponse; source: 'live' | 'cache' }> {
    const cacheKey = `steam:featuredcategories:${region.toLowerCase()}:${language.toLowerCase()}`;
    const cached = serverCache.get<SteamFeaturedCategoriesResponse>(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    try {
      const url = `https://store.steampowered.com/api/featuredcategories/?cc=${encodeURIComponent(region)}&l=${encodeURIComponent(language)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        throw new Error(`Steam API responded with HTTP ${res.status}`);
      }

      const data = await res.json();
      serverCache.set(cacheKey, data, 300);
      return { success: true, data, source: 'live' };
    } catch (error: any) {
      if (cached) return { success: true, data: cached, source: 'cache' };
      throw error;
    }
  }

  /**
   * GET /game/{appId}?cc={region}&l={language}
   * Returns Steam game details with ~200 req/5min rate-limit guard.
   */
  static async getGameDetails(
    appId: string | number,
    region: string = 'us',
    language: string = 'english'
  ): Promise<{ success: boolean; data?: SteamGameDetails; error?: string; source: 'live' | 'cache' }> {
    const id = String(appId).trim();
    const cacheKey = `steam:game:${id}:${region.toLowerCase()}:${language.toLowerCase()}`;
    const cached = serverCache.get<SteamGameDetails>(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    // Rate-limit check
    const allowed = serverCache.checkRateLimit('steam_appdetails', 180, 300);
    if (!allowed && !cached) {
      return {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED: Steam rate limit threshold (approx 200 req / 5 min) reached. Please retry in a few moments.',
        source: 'cache',
      };
    }

    try {
      const url = `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(id)}&cc=${encodeURIComponent(region)}&l=${encodeURIComponent(language)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Steam API responded with HTTP ${res.status}`);
      }

      const json = await res.json();
      const appResult = json[id];

      if (!appResult || !appResult.success || !appResult.data) {
        return {
          success: false,
          error: `Steam App ID '${id}' not found or has restricted store visibility.`,
          source: 'live',
        };
      }

      const data: SteamGameDetails = appResult.data;
      serverCache.set(cacheKey, data, 600); // 10 min cache
      return { success: true, data, source: 'live' };
    } catch (error: any) {
      if (cached) return { success: true, data: cached, source: 'cache' };
      return {
        success: false,
        error: error.message || 'Failed to fetch Steam game details',
        source: 'live',
      };
    }
  }

  /**
   * GET /news/{appId}
   * Returns news for a Steam game.
   */
  static async getGameNews(
    appId: string | number,
    count: number = 5,
    maxLength: number = 300
  ): Promise<{ success: boolean; data?: SteamNewsItem[]; error?: string; source: 'live' | 'cache' }> {
    const id = String(appId).trim();
    const cacheKey = `steam:news:${id}:${count}:${maxLength}`;
    const cached = serverCache.get<SteamNewsItem[]>(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    try {
      const apiKey = this.getApiKey();
      const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
      const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${encodeURIComponent(id)}&count=${count}&maxlength=${maxLength}&format=json${keyParam}`;

      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Steam News API responded with HTTP ${res.status}`);
      }

      const json = await res.json();
      const newsitems: SteamNewsItem[] = json?.appnews?.newsitems || [];

      serverCache.set(cacheKey, newsitems, 600);
      return { success: true, data: newsitems, source: 'live' };
    } catch (error: any) {
      if (cached) return { success: true, data: cached, source: 'cache' };
      return {
        success: false,
        error: error.message || 'Failed to fetch Steam news',
        source: 'live',
      };
    }
  }
}
