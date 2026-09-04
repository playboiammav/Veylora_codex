import { serverCache } from '../cache/cache-service';

export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  background_image_additional?: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  metacritic?: number;
  playtime: number;
  suggestions_count: number;
  updated: string;
  genres?: { id: number; name: string; slug: string }[];
  platforms?: {
    platform: { id: number; name: string; slug: string };
    released_at?: string;
    requirements?: { minimum?: string; recommended?: string };
  }[];
  stores?: { id: number; url?: string; url_en?: string; store: { id: number; name: string; slug: string; domain: string } }[];
  short_screenshots?: { id: number; image: string }[];
  description_raw?: string;
  description?: string;
  website?: string;
  reddit_url?: string;
  developers?: { id: number; name: string; slug: string; image_background?: string }[];
  publishers?: { id: number; name: string; slug: string; image_background?: string }[];
  esrb_rating?: { id: number; name: string; slug: string };
}

export interface RawgListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RawgQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  search_exact?: boolean;
  parent_platforms?: string;
  platforms?: string;
  stores?: string;
  developers?: string;
  publishers?: string;
  genres?: string;
  tags?: string;
  dates?: string;
  updated?: string;
  ordering?: string;
  metacritic?: string;
}

const RAWG_BASE_URL = 'https://api.rawg.io/api';

function getRawgApiKey(): string {
  return process.env.RAWG_API_KEY || '';
}

export class RawgService {
  /**
   * Get filtered list of games from RAWG API
   */
  static async getGames(params: RawgQueryParams = {}): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    count: number;
    next: string | null;
    previous: string | null;
    data: RawgGame[];
  }> {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const search = params.search || '';
    const ordering = params.ordering || '-rating';
    const genres = params.genres || '';
    const platforms = params.platforms || '';
    const dates = params.dates || '';
    const metacritic = params.metacritic || '';

    const cacheKey = `rawg_games_${page}_${pageSize}_${search}_${ordering}_${genres}_${platforms}_${dates}_${metacritic}`;
    const cached = serverCache.get<{ count: number; next: string | null; previous: string | null; data: RawgGame[] }>(cacheKey);
    if (cached) {
      return {
        success: true,
        source: 'cache',
        ...cached,
      };
    }

    const apiKey = getRawgApiKey();
    if (!apiKey) {
      return {
        success: false,
        source: 'live',
        count: 0,
        next: null,
        previous: null,
        data: [],
      };
    }
    const query = new URLSearchParams({
      key: apiKey,
      page: String(page),
      page_size: String(pageSize),
      ordering,
    });

    if (search) query.append('search', search);
    if (genres) query.append('genres', genres);
    if (platforms) query.append('platforms', platforms);
    if (dates) query.append('dates', dates);
    if (metacritic) query.append('metacritic', metacritic);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${RAWG_BASE_URL}/games?${query.toString()}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Veylora-GameHub/1.0',
          Accept: 'application/json',
        },
      });

      clearTimeout(timeout);

      if (response.ok) {
        const json: RawgListResponse<RawgGame> = await response.json();
        const result = {
          count: json.count || json.results.length,
          next: json.next,
          previous: json.previous,
          data: json.results || [],
        };
        serverCache.set(cacheKey, result, 300); // 5 min TTL
        return {
          success: true,
          source: 'live',
          ...result,
        };
      }
    } catch (err) {
      console.warn('RAWG API live fetch failed:', err);
    }

    return {
      success: false,
      source: 'live',
      count: 0,
      next: null,
      previous: null,
      data: [],
    };
  }

  /**
   * Get detailed game information by ID or slug
   */
  static async getGameDetails(idOrSlug: string | number): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data?: RawgGame;
    error?: string;
  }> {
    const cacheKey = `rawg_detail_${idOrSlug}`;
    const cached = serverCache.get<RawgGame>(cacheKey);
    if (cached) {
      return { success: true, source: 'cache', data: cached };
    }

    const apiKey = getRawgApiKey();
    if (!apiKey) {
      return { success: false, source: 'live', error: 'RAWG API key is not configured.' };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${RAWG_BASE_URL}/games/${idOrSlug}?key=${apiKey}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Veylora-GameHub/1.0',
          Accept: 'application/json',
        },
      });

      clearTimeout(timeout);

      if (response.ok) {
        const game: RawgGame = await response.json();
        serverCache.set(cacheKey, game, 600); // 10 min TTL
        return { success: true, source: 'live', data: game };
      }
    } catch (err) {
      console.warn(`RAWG Game details fetch failed for ${idOrSlug}:`, err);
    }

    return { success: false, source: 'live', error: `Game ${idOrSlug} not found or RAWG API unavailable.` };
  }

  /**
   * Get game screenshots
   */
  static async getGameScreenshots(idOrSlug: string | number): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    count: number;
    data: { id: number; image: string; width: number; height: number; is_deleted: boolean }[];
  }> {
    const cacheKey = `rawg_screenshots_${idOrSlug}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) {
      return { success: true, source: 'cache', count: cached.length, data: cached };
    }

    const apiKey = getRawgApiKey();
    if (!apiKey) {
      return { success: false, source: 'live', count: 0, data: [] };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${RAWG_BASE_URL}/games/${idOrSlug}/screenshots?key=${apiKey}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        const results = json.results || [];
        serverCache.set(cacheKey, results, 600);
        return { success: true, source: 'live', count: results.length, data: results };
      }
    } catch (err) {
      console.warn(`RAWG screenshots error for ${idOrSlug}:`, err);
    }

    return {
      success: false,
      source: 'live',
      count: 0,
      data: [],
    };
  }

  /**
   * Get game trailers / movies
   */
  static async getGameMovies(idOrSlug: string | number): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    count: number;
    data: any[];
  }> {
    const cacheKey = `rawg_movies_${idOrSlug}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) {
      return { success: true, source: 'cache', count: cached.length, data: cached };
    }

    const apiKey = getRawgApiKey();
    if (!apiKey) {
      return { success: false, source: 'live', count: 0, data: [] };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${RAWG_BASE_URL}/games/${idOrSlug}/movies?key=${apiKey}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        const results = json.results || [];
        serverCache.set(cacheKey, results, 600);
        return { success: true, source: 'live', count: results.length, data: results };
      }
    } catch (err) {
      console.warn(`RAWG movies error for ${idOrSlug}:`, err);
    }

    return { success: false, source: 'live', count: 0, data: [] };
  }

  /**
   * Get real game-specific store deep links
   */
  static async getGameStores(idOrSlug: string | number): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    count: number;
    data: Array<{ id: number; game_id: number; store_id: number; url: string }>;
  }> {
    const cacheKey = `rawg_stores_${idOrSlug}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) {
      return { success: true, source: 'cache', count: cached.length, data: cached };
    }

    const apiKey = getRawgApiKey();
    if (!apiKey) {
      return { success: false, source: 'live', count: 0, data: [] };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${RAWG_BASE_URL}/games/${idOrSlug}/stores?key=${apiKey}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        const results = json.results || [];
        serverCache.set(cacheKey, results, 600);
        return { success: true, source: 'live', count: results.length, data: results };
      }
    } catch (err) {
      console.warn(`RAWG stores error for ${idOrSlug}:`, err);
    }

    return { success: false, source: 'live', count: 0, data: [] };
  }

  /**
   * Get genres list
   */
  static async getGenres(): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    count: number;
    data: any[];
  }> {
    const cacheKey = 'rawg_genres';
    const cached = serverCache.get<any>(cacheKey);
    if (cached) {
      return { success: true, source: 'cache', count: cached.length, data: cached };
    }

    const apiKey = getRawgApiKey();
    if (!apiKey) {
      return { success: false, source: 'live', count: 0, data: [] };
    }
    try {
      const res = await fetch(`${RAWG_BASE_URL}/genres?key=${apiKey}&page_size=30`);
      if (res.ok) {
        const json = await res.json();
        const results = json.results || [];
        serverCache.set(cacheKey, results, 3600); // 1 hr TTL
        return { success: true, source: 'live', count: results.length, data: results };
      }
    } catch (err) {
      console.warn('RAWG genres fetch error:', err);
    }

    return { success: false, source: 'live', count: 0, data: [] };
  }

  /**
   * Get platforms list
   */
  static async getPlatforms(): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    count: number;
    data: any[];
  }> {
    const cacheKey = 'rawg_platforms';
    const cached = serverCache.get<any>(cacheKey);
    if (cached) {
      return { success: true, source: 'cache', count: cached.length, data: cached };
    }

    const apiKey = getRawgApiKey();
    if (!apiKey) {
      return { success: false, source: 'live', count: 0, data: [] };
    }
    try {
      const res = await fetch(`${RAWG_BASE_URL}/platforms?key=${apiKey}&page_size=50`);
      if (res.ok) {
        const json = await res.json();
        const results = json.results || [];
        serverCache.set(cacheKey, results, 3600);
        return { success: true, source: 'live', count: results.length, data: results };
      }
    } catch (err) {
      console.warn('RAWG platforms fetch error:', err);
    }

    return { success: false, source: 'live', count: 0, data: [] };
  }

  /**
   * Get Developer or Publisher profile details and their games
   */
  static async getCompany(idOrSlug: string | number, type: 'developer' | 'publisher' = 'developer'): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data?: {
      id: number;
      name: string;
      slug: string;
      games_count: number;
      image_background: string;
      description?: string;
      roles?: string[];
      website?: string;
    };
    games?: RawgGame[];
    error?: string;
  }> {
    const endpoint = type === 'publisher' ? 'publishers' : 'developers';
    const cacheKey = `rawg_${endpoint}_${idOrSlug}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) {
      return { success: true, source: 'cache', ...cached };
    }

    const apiKey = getRawgApiKey();
    if (!apiKey) {
      return { success: false, source: 'live', error: 'RAWG API key is not configured.' };
    }
    try {
      const [profileRes, gamesRes] = await Promise.all([
        fetch(`${RAWG_BASE_URL}/${endpoint}/${idOrSlug}?key=${apiKey}`),
        fetch(`${RAWG_BASE_URL}/games?${endpoint}=${idOrSlug}&page_size=20&ordering=-added&key=${apiKey}`),
      ]);

      if (profileRes.ok) {
        const profile = await profileRes.json();
        let gamesList: RawgGame[] = [];
        if (gamesRes.ok) {
          const gamesJson = await gamesRes.json();
          gamesList = gamesJson.results || [];
        }

        const payload = {
          data: {
            id: profile.id,
            name: profile.name,
            slug: profile.slug,
            games_count: profile.games_count,
            image_background: profile.image_background,
            description: profile.description,
          },
          games: gamesList,
        };

        serverCache.set(cacheKey, payload, 600);
        return { success: true, source: 'live', ...payload };
      }
    } catch (err) {
      console.warn(`RAWG company fetch failed for ${endpoint}/${idOrSlug}:`, err);
    }

    return {
      success: false,
      source: 'live',
      error: `Company ${idOrSlug} not found or RAWG API unavailable.`,
    };
  }
}

