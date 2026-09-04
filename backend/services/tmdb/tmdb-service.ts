import { serverCache } from '../cache/cache-service';

export interface TmdbMovie {
  id: number;
  imdb_id?: string;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  external_ids?: {
    imdb_id?: string;
    wikidata_id?: string;
    facebook_id?: string;
    instagram_id?: string;
    twitter_id?: string;
  };
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null; order?: number }[];
    crew: { id: number; name: string; job: string; department: string; profile_path?: string | null }[];
  };
  videos?: {
    results: { id: string; key: string; name: string; site: string; type: string }[];
  };
  images?: {
    backdrops: { file_path: string; width: number; height: number }[];
    posters: { file_path: string; width: number; height: number }[];
  };
  similar?: {
    results: TmdbMovie[];
  };
}

export interface TmdbListResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p';

export function getTmdbImageUrl(path: string | null | undefined, size: 'w500' | 'original' | 'w780' = 'w500'): string {
  if (!path) {
    return '';
  }
  if (path.startsWith('http')) return path;
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

function getTmdbApiKey(): string {
  return process.env.TMDB_KEY || process.env.TMDB_API_KEY || '';
}

export class TmdbService {
  private static async fetchTmdb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const apiKey = getTmdbApiKey();
    if (!apiKey) {
      throw new Error('TMDB API key is not configured.');
    }
    const query = new URLSearchParams({ api_key: apiKey, ...params });
    const url = `${TMDB_BASE_URL}${endpoint}?${query.toString()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`TMDB HTTP error ${res.status}`);
    }

    return await res.json();
  }

  /**
   * Get Trending Movies
   */
  static async getTrending(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data: TmdbMovie[];
    totalPages: number;
    totalResults: number;
  }> {
    const cacheKey = `tmdb_trending_${timeWindow}_${page}`;
    const cached = serverCache.get<{ data: TmdbMovie[]; totalPages: number; totalResults: number }>(cacheKey);
    if (cached) return { success: true, source: 'cache', ...cached };

    try {
      const json = await this.fetchTmdb(`/trending/movie/${timeWindow}`, { page: String(page) });
      const result = {
        data: json.results || [],
        totalPages: json.total_pages || 1,
        totalResults: json.total_results || 0,
      };
      serverCache.set(cacheKey, result, 300);
      return { success: true, source: 'live', ...result };
    } catch (err) {
      console.warn('TMDB Trending fetch failed:', err);
      return {
        success: false,
        source: 'live',
        data: [],
        totalPages: 0,
        totalResults: 0,
      };
    }
  }

  /**
   * Get Popular Movies
   */
  static async getPopular(page: number = 1): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data: TmdbMovie[];
  }> {
    const cacheKey = `tmdb_popular_${page}`;
    const cached = serverCache.get<TmdbMovie[]>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb('/movie/popular', { page: String(page) });
      const data = json.results || [];
      serverCache.set(cacheKey, data, 300);
      return { success: true, source: 'live', data };
    } catch (err) {
      console.warn('TMDB Popular fetch failed:', err);
      return { success: false, source: 'live', data: [] };
    }
  }

  /**
   * Get Top Rated Movies
   */
  static async getTopRated(page: number = 1): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data: TmdbMovie[];
  }> {
    const cacheKey = `tmdb_top_rated_${page}`;
    const cached = serverCache.get<TmdbMovie[]>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb('/movie/top_rated', { page: String(page) });
      const data = json.results || [];
      serverCache.set(cacheKey, data, 600);
      return { success: true, source: 'live', data };
    } catch (err) {
      console.warn('TMDB Top Rated fetch failed:', err);
      return {
        success: false,
        source: 'live',
        data: [],
      };
    }
  }

  /**
   * Get Now Playing Movies
   */
  static async getNowPlaying(page: number = 1): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data: TmdbMovie[];
  }> {
    const cacheKey = `tmdb_now_playing_${page}`;
    const cached = serverCache.get<TmdbMovie[]>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb('/movie/now_playing', { page: String(page) });
      const data = json.results || [];
      serverCache.set(cacheKey, data, 300);
      return { success: true, source: 'live', data };
    } catch (err) {
      console.warn('TMDB Now Playing fetch failed:', err);
      return { success: false, source: 'live', data: [] };
    }
  }

  /**
   * Get Movie Details with Credits, Videos, Images, Similar
   */
  static async getMovieDetails(movieId: string | number): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data?: TmdbMovie;
    error?: string;
  }> {
    const id = String(movieId);
    const cacheKey = `tmdb_movie_detail_${id}`;
    const cached = serverCache.get<TmdbMovie>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const movie = await this.fetchTmdb(`/movie/${id}`, {
        append_to_response: 'credits,videos,images,similar,recommendations,external_ids',
      });
      serverCache.set(cacheKey, movie, 600);
      return { success: true, source: 'live', data: movie };
    } catch (err) {
      console.warn(`TMDB Movie detail for ${id} failed:`, err);
      return { success: false, source: 'live', error: `Movie ${id} not found or TMDB service unavailable.` };
    }
  }

  /**
   * Search Movies
   */
  static async searchMovies(query: string, page: number = 1): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data: TmdbMovie[];
  }> {
    if (!query.trim()) return { success: true, source: 'live', data: [] };

    const cacheKey = `tmdb_search_${query.toLowerCase()}_${page}`;
    const cached = serverCache.get<TmdbMovie[]>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb('/search/movie', { query, page: String(page) });
      const data = json.results || [];
      serverCache.set(cacheKey, data, 300);
      return { success: true, source: 'live', data };
    } catch (err) {
      console.warn(`TMDB search for ${query} failed:`, err);
      return { success: false, source: 'live', data: [] };
    }
  }

  /**
   * Search Person / People
   */
  static async searchPerson(query: string, page: number = 1): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data: any[];
  }> {
    if (!query.trim()) return { success: true, source: 'live', data: [] };

    const cacheKey = `tmdb_search_person_${query.toLowerCase()}_${page}`;
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb('/search/person', { query, page: String(page) });
      const data = json.results || [];
      serverCache.set(cacheKey, data, 300);
      return { success: true, source: 'live', data };
    } catch (err) {
      console.warn(`TMDB search person for ${query} failed:`, err);
      return {
        success: false,
        source: 'live',
        data: [],
      };
    }
  }

  /**
   * Get Movie Genres
   */
  static async getGenres(): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data: { id: number; name: string }[];
  }> {
    const cacheKey = 'tmdb_genres';
    const cached = serverCache.get<{ id: number; name: string }[]>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb('/genre/movie/list');
      const data = json.genres || [];
      serverCache.set(cacheKey, data, 3600);
      return { success: true, source: 'live', data };
    } catch (err) {
      console.warn('TMDB genres fetch failed:', err);
      return { success: false, source: 'live', data: [] };
    }
  }

  /**
   * Find TMDB item by external IMDb ID (e.g. tt15239678)
   */
  static async findByImdbId(imdbId: string): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data?: TmdbMovie;
  }> {
    if (!imdbId) return { success: false, source: 'live' };
    const cacheKey = `tmdb_find_${imdbId}`;
    const cached = serverCache.get<TmdbMovie>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb(`/find/${imdbId}`, { external_source: 'imdb_id' });
      const movie = json.movie_results?.[0] || json.tv_results?.[0];
      if (movie) {
        // Fetch full details
        const full = await this.getMovieDetails(movie.id);
        if (full.success && full.data) {
          serverCache.set(cacheKey, full.data, 600);
          return { success: true, source: 'live', data: full.data };
        }
        serverCache.set(cacheKey, movie, 600);
        return { success: true, source: 'live', data: movie };
      }
      return { success: false, source: 'live' };
    } catch (err) {
      console.warn(`TMDB findByImdbId ${imdbId} failed:`, err);
      return { success: false, source: 'live' };
    }
  }

  /**
   * Get Person / Actor Details
   */
  static async getPersonDetails(personId: string | number): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data?: {
      id: number;
      imdb_id?: string;
      name: string;
      biography?: string;
      birthday?: string;
      deathday?: string;
      place_of_birth?: string;
      profile_path?: string | null;
      known_for_department?: string;
      combined_credits?: {
        cast: { id: number; title?: string; name?: string; poster_path: string | null; release_date?: string; first_air_date?: string; character?: string; media_type?: string }[];
        crew: { id: number; title?: string; name?: string; job?: string; department?: string; poster_path: string | null }[];
      };
      external_ids?: {
        imdb_id?: string;
        wikidata_id?: string;
        instagram_id?: string;
        twitter_id?: string;
      };
    };
  }> {
    const id = String(personId);
    const cacheKey = `tmdb_person_${id}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb(`/person/${id}`, {
        append_to_response: 'combined_credits,external_ids,images',
      });
      serverCache.set(cacheKey, json, 600);
      return { success: true, source: 'live', data: json };
    } catch (err) {
      console.warn(`TMDB Person detail for ${id} failed:`, err);
      return {
        success: false,
        source: 'live',
      };
    }
  }

  /**
   * Get Production Company Details & Movies
   */
  static async getCompanyDetails(companyId: string | number): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data?: {
      id: number;
      name: string;
      description?: string;
      headquarters?: string;
      homepage?: string;
      logo_path?: string | null;
      origin_country?: string;
    };
    movies?: TmdbMovie[];
  }> {
    const id = String(companyId);
    const cacheKey = `tmdb_company_${id}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return { success: true, source: 'cache', ...cached };

    try {
      const [companyRes, moviesRes] = await Promise.all([
        this.fetchTmdb(`/company/${id}`),
        this.fetchTmdb('/discover/movie', { with_companies: id, sort_by: 'popularity.desc' }),
      ]);

      const payload = {
        data: companyRes,
        movies: moviesRes.results || [],
      };
      serverCache.set(cacheKey, payload, 600);
      return { success: true, source: 'live', ...payload };
    } catch (err) {
      console.warn(`TMDB Company detail for ${id} failed:`, err);
      return {
        success: false,
        source: 'live',
      };
    }
  }
}
