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
  stores?: { id: number; url_en?: string; store: { id: number; name: string; slug: string; domain: string } }[];
  short_screenshots?: { id: number; image: string }[];
  description_raw?: string;
  description?: string;
  website?: string;
  reddit_url?: string;
  developers?: { id: number; name: string; slug: string }[];
  publishers?: { id: number; name: string; slug: string }[];
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
  return process.env.RAWG_API_KEY || '7fec0c952263468d982273c01e2e977c';
}

const SAMPLE_RAWG_GAMES: RawgGame[] = [
  {
    id: 3498,
    slug: 'grand-theft-auto-v',
    name: 'Grand Theft Auto V',
    released: '2013-09-17',
    tba: false,
    background_image: 'https://media.rawg.io/media/games/20a/20aa03a10e53b66921e6e9f69e6b1678.jpg',
    rating: 4.47,
    rating_top: 5,
    ratings_count: 6780,
    reviews_text_count: 59,
    added: 21200,
    metacritic: 92,
    playtime: 74,
    suggestions_count: 428,
    updated: '2024-05-12T14:15:20',
    genres: [
      { id: 4, name: 'Action', slug: 'action' },
      { id: 3, name: 'Adventure', slug: 'adventure' },
    ],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
      { platform: { id: 186, name: 'Xbox Series S/X', slug: 'xbox-series-x' } },
      { platform: { id: 18, name: 'PlayStation 4', slug: 'playstation4' } },
      { platform: { id: 1, name: 'Xbox One', slug: 'xbox-one' } },
    ],
    publishers: [{ id: 2155, name: 'Rockstar Games', slug: 'rockstar-games' }],
    developers: [{ id: 3524, name: 'Rockstar North', slug: 'rockstar-north' }],
  },
  {
    id: 3328,
    slug: 'the-witcher-3-wild-hunt',
    name: 'The Witcher 3: Wild Hunt',
    released: '2015-05-18',
    tba: false,
    background_image: 'https://media.rawg.io/media/games/618/618c2031a0709d77b614e6f2a59fca4a.jpg',
    rating: 4.66,
    rating_top: 5,
    ratings_count: 6500,
    reviews_text_count: 50,
    added: 20400,
    metacritic: 92,
    playtime: 46,
    suggestions_count: 670,
    updated: '2024-05-10T12:00:00',
    genres: [
      { id: 4, name: 'Action', slug: 'action' },
      { id: 5, name: 'RPG', slug: 'role-playing-games-rpg' },
    ],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
      { platform: { id: 186, name: 'Xbox Series S/X', slug: 'xbox-series-x' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } },
    ],
    publishers: [{ id: 918, name: 'CD PROJEKT RED', slug: 'cd-projekt-red' }],
  },
  {
    id: 4200,
    slug: 'portal-2',
    name: 'Portal 2',
    released: '2011-04-18',
    tba: false,
    background_image: 'https://media.rawg.io/media/games/2ba/2bac4e87f4d63d979d46a63dfbfba2ce.jpg',
    rating: 4.61,
    rating_top: 5,
    ratings_count: 5700,
    reviews_text_count: 34,
    added: 19300,
    metacritic: 95,
    playtime: 11,
    suggestions_count: 549,
    updated: '2024-05-01T10:00:00',
    genres: [
      { id: 2, name: 'Shooter', slug: 'shooter' },
      { id: 7, name: 'Puzzle', slug: 'puzzle' },
    ],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } },
      { platform: { id: 14, name: 'Xbox 360', slug: 'xbox360' } },
      { platform: { id: 16, name: 'PlayStation 3', slug: 'playstation3' } },
    ],
    publishers: [{ id: 3408, name: 'Valve', slug: 'valve' }],
  },
  {
    id: 5286,
    slug: 'tomb-raider',
    name: 'Tomb Raider (2013)',
    released: '2013-03-05',
    tba: false,
    background_image: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925edd63240b4.jpg',
    rating: 4.05,
    rating_top: 4,
    ratings_count: 3900,
    reviews_text_count: 22,
    added: 16700,
    metacritic: 86,
    playtime: 10,
    suggestions_count: 440,
    updated: '2024-04-20T10:00:00',
    genres: [
      { id: 4, name: 'Action', slug: 'action' },
      { id: 3, name: 'Adventure', slug: 'adventure' },
    ],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 18, name: 'PlayStation 4', slug: 'playstation4' } },
      { platform: { id: 1, name: 'Xbox One', slug: 'xbox-one' } },
    ],
    publishers: [{ id: 308, name: 'Square Enix', slug: 'square-enix' }],
  },
  {
    id: 12020,
    slug: 'left-4-dead-2',
    name: 'Left 4 Dead 2',
    released: '2009-11-17',
    tba: false,
    background_image: 'https://media.rawg.io/media/games/d58/d588947d4286e7b5e0e12e1bea7d9844.jpg',
    rating: 4.09,
    rating_top: 4,
    ratings_count: 3400,
    reviews_text_count: 10,
    added: 16200,
    metacritic: 89,
    playtime: 9,
    suggestions_count: 588,
    updated: '2024-04-18T10:00:00',
    genres: [
      { id: 4, name: 'Action', slug: 'action' },
      { id: 2, name: 'Shooter', slug: 'shooter' },
    ],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 14, name: 'Xbox 360', slug: 'xbox360' } },
    ],
    publishers: [{ id: 3408, name: 'Valve', slug: 'valve' }],
  },
];

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
      console.warn('RAWG API live fetch failed, using fallback catalog:', err);
    }

    // Filter fallback
    let filtered = [...SAMPLE_RAWG_GAMES];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (g) => g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      source: 'fallback',
      count: filtered.length,
      next: null,
      previous: null,
      data: filtered,
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

    // Search fallback
    const match = SAMPLE_RAWG_GAMES.find(
      (g) => String(g.id) === String(idOrSlug) || g.slug === String(idOrSlug).toLowerCase()
    );

    if (match) {
      return { success: true, source: 'fallback', data: match };
    }

    return { success: false, source: 'fallback', error: `Game ${idOrSlug} not found.` };
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
      success: true,
      source: 'fallback',
      count: 1,
      data: [
        {
          id: 1,
          image: 'https://media.rawg.io/media/games/20a/20aa03a10e53b66921e6e9f69e6b1678.jpg',
          width: 1920,
          height: 1080,
          is_deleted: false,
        },
      ],
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

    return { success: true, source: 'fallback', count: 0, data: [] };
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

    const fallbackGenres = [
      { id: 4, name: 'Action', slug: 'action', games_count: 180000 },
      { id: 51, name: 'Indie', slug: 'indie', games_count: 65000 },
      { id: 3, name: 'Adventure', slug: 'adventure', games_count: 140000 },
      { id: 5, name: 'RPG', slug: 'role-playing-games-rpg', games_count: 55000 },
      { id: 10, name: 'Strategy', slug: 'strategy', games_count: 56000 },
      { id: 2, name: 'Shooter', slug: 'shooter', games_count: 60000 },
      { id: 7, name: 'Puzzle', slug: 'puzzle', games_count: 100000 },
      { id: 1, name: 'Racing', slug: 'racing', games_count: 24000 },
      { id: 15, name: 'Sports', slug: 'sports', games_count: 21000 },
    ];

    return { success: true, source: 'fallback', count: fallbackGenres.length, data: fallbackGenres };
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

    const fallbackPlatforms = [
      { id: 4, name: 'PC', slug: 'pc' },
      { id: 187, name: 'PlayStation 5', slug: 'playstation5' },
      { id: 18, name: 'PlayStation 4', slug: 'playstation4' },
      { id: 186, name: 'Xbox Series S/X', slug: 'xbox-series-x' },
      { id: 1, name: 'Xbox One', slug: 'xbox-one' },
      { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' },
      { id: 3, name: 'iOS', slug: 'ios' },
      { id: 21, name: 'Android', slug: 'android' },
    ];

    return { success: true, source: 'fallback', count: fallbackPlatforms.length, data: fallbackPlatforms };
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

    // Fallback company information
    const sampleGames = SAMPLE_RAWG_GAMES;
    return {
      success: true,
      source: 'fallback',
      data: {
        id: typeof idOrSlug === 'number' ? idOrSlug : 1,
        name: typeof idOrSlug === 'string' ? idOrSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Game Studio',
        slug: String(idOrSlug).toLowerCase(),
        games_count: sampleGames.length,
        image_background: sampleGames[0]?.background_image || 'https://media.rawg.io/media/games/20a/20aa03a10e53b66921e6e9f69e6b1678.jpg',
        description: 'An acclaimed premier video game development studio and interactive entertainment publisher.',
      },
      games: sampleGames,
    };
  }
}

