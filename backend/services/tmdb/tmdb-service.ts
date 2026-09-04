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
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
  }
  if (path.startsWith('http')) return path;
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

function getTmdbApiKey(): string {
  return process.env.TMDB_KEY || process.env.TMDB_API_KEY || '2dca580c2a14b55200e784d157207b4d';
}

const FALLBACK_MOVIES: TmdbMovie[] = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520b40.jpg',
    release_date: '2024-02-27',
    vote_average: 8.3,
    vote_count: 5120,
    popularity: 420.5,
    genre_ids: [878, 12],
    genres: [{ id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    runtime: 166,
    tagline: 'Long live the fighters.',
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yDHYTfa2wfbyGKM8SJDCZnfZQ0G.jpg',
    release_date: '2024-07-24',
    vote_average: 7.8,
    vote_count: 4890,
    popularity: 580.2,
    genre_ids: [28, 35, 878],
    genres: [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 878, name: 'Science Fiction' }],
    runtime: 128,
    tagline: 'Come together.',
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    overview: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up.',
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/stKGOm8fM5kbtj9JnF5ezmMRYk.jpg',
    release_date: '2024-06-11',
    vote_average: 7.7,
    vote_count: 4320,
    popularity: 390.1,
    genre_ids: [16, 10751, 35, 12],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 35, name: 'Comedy' }],
    runtime: 96,
    tagline: 'Make room for new emotions.',
  },
  {
    id: 945961,
    title: 'Alien: Romulus',
    overview: 'While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.',
    poster_path: '/b33nnKl1GSFbao8l3KiM6q4893.jpg',
    backdrop_path: '/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg',
    release_date: '2024-08-13',
    vote_average: 7.3,
    vote_count: 2450,
    popularity: 340.8,
    genre_ids: [27, 878],
    genres: [{ id: 27, name: 'Horror' }, { id: 878, name: 'Science Fiction' }],
    runtime: 119,
    tagline: 'In space no one can hear you.',
  },
  {
    id: 573435,
    title: 'Bad Boys: Ride or Die',
    overview: 'After their late former Captain is framed, Lowrey and Burnett try to clear his name, only to end up on the run themselves.',
    poster_path: '/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg',
    backdrop_path: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    release_date: '2024-06-05',
    vote_average: 7.5,
    vote_count: 2180,
    popularity: 295.4,
    genre_ids: [28, 35, 80],
    genres: [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }],
    runtime: 115,
    tagline: 'Miami\'s finest are now Miami\'s most wanted.',
  },
  {
    id: 823464,
    title: 'Godzilla x Kong: The New Empire',
    overview: 'Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own.',
    poster_path: '/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg',
    backdrop_path: '/qrGtVFxaD8c7et0j3sjYv10xGvi.jpg',
    release_date: '2024-03-27',
    vote_average: 7.2,
    vote_count: 3650,
    popularity: 280.9,
    genre_ids: [28, 878, 12],
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }],
    runtime: 115,
    tagline: 'Rise together or fall alone.',
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 34500,
    popularity: 260.0,
    genre_ids: [12, 18, 878],
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }],
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception".',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 36000,
    popularity: 210.3,
    genre_ids: [28, 878, 12],
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
  },
];

export class TmdbService {
  private static async fetchTmdb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const apiKey = getTmdbApiKey();
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
      console.warn('TMDB Trending fetch failed, using fallback:', err);
      return {
        success: true,
        source: 'fallback',
        data: FALLBACK_MOVIES,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
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
      console.warn('TMDB Popular fetch fallback:', err);
      return { success: true, source: 'fallback', data: FALLBACK_MOVIES };
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
      console.warn('TMDB Top Rated fetch fallback:', err);
      return {
        success: true,
        source: 'fallback',
        data: [...FALLBACK_MOVIES].sort((a, b) => b.vote_average - a.vote_average),
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
      console.warn('TMDB Now Playing fallback:', err);
      return { success: true, source: 'fallback', data: FALLBACK_MOVIES.slice(0, 6) };
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
      console.warn(`TMDB Movie detail for ${id} fallback:`, err);
      const match = FALLBACK_MOVIES.find((m) => String(m.id) === id) || FALLBACK_MOVIES[0];
      if (match) {
        return {
          success: true,
          source: 'fallback',
          data: {
            ...match,
            credits: {
              cast: [
                { id: 1, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: null },
                { id: 2, name: 'Zendaya', character: 'Chani', profile_path: null },
                { id: 3, name: 'Rebecca Ferguson', character: 'Lady Jessica', profile_path: null },
                { id: 4, name: 'Javier Bardem', character: 'Stilgar', profile_path: null },
              ],
              crew: [{ id: 10, name: 'Denis Villeneuve', job: 'Director', department: 'Directing' }],
            },
            videos: {
              results: [
                {
                  id: 'vid1',
                  key: 'Way9Dexny3w',
                  name: 'Official Trailer',
                  site: 'YouTube',
                  type: 'Trailer',
                },
              ],
            },
          },
        };
      }
      return { success: false, source: 'fallback', error: `Movie ${id} not found.` };
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
    if (!query.trim()) return { success: true, source: 'fallback', data: [] };

    const cacheKey = `tmdb_search_${query.toLowerCase()}_${page}`;
    const cached = serverCache.get<TmdbMovie[]>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb('/search/movie', { query, page: String(page) });
      const data = json.results || [];
      serverCache.set(cacheKey, data, 300);
      return { success: true, source: 'live', data };
    } catch (err) {
      console.warn(`TMDB search for ${query} fallback:`, err);
      const q = query.toLowerCase();
      const filtered = FALLBACK_MOVIES.filter((m) => m.title.toLowerCase().includes(q));
      return { success: true, source: 'fallback', data: filtered };
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
    if (!query.trim()) return { success: true, source: 'fallback', data: [] };

    const cacheKey = `tmdb_search_person_${query.toLowerCase()}_${page}`;
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    try {
      const json = await this.fetchTmdb('/search/person', { query, page: String(page) });
      const data = json.results || [];
      serverCache.set(cacheKey, data, 300);
      return { success: true, source: 'live', data };
    } catch (err) {
      console.warn(`TMDB search person for ${query} fallback:`, err);
      return {
        success: true,
        source: 'fallback',
        data: [
          {
            id: 1190668,
            name: 'Timothée Chalamet',
            known_for_department: 'Acting',
            profile_path: null,
            known_for: [{ id: 693134, title: 'Dune: Part Two', vote_average: 8.2 }],
          },
        ],
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
      const fallback = [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 18, name: 'Drama' },
        { id: 14, name: 'Fantasy' },
        { id: 27, name: 'Horror' },
        { id: 878, name: 'Science Fiction' },
        { id: 53, name: 'Thriller' },
      ];
      return { success: true, source: 'fallback', data: fallback };
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
    if (!imdbId) return { success: false, source: 'fallback' };
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
      return { success: false, source: 'fallback' };
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
        success: true,
        source: 'fallback',
        data: {
          id: typeof personId === 'number' ? personId : 1,
          name: 'Acclaimed Artist',
          biography: 'Renowned award-winning performer with a celebrated filmography across cinema and television.',
          known_for_department: 'Acting',
          combined_credits: {
            cast: FALLBACK_MOVIES.map((m) => ({
              id: m.id,
              title: m.title,
              poster_path: m.poster_path,
              release_date: m.release_date,
              character: 'Lead Role',
              media_type: 'movie',
            })),
            crew: [],
          },
        },
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
        success: true,
        source: 'fallback',
        data: {
          id: typeof companyId === 'number' ? companyId : 1,
          name: typeof companyId === 'string' ? companyId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Production Company',
          description: 'A distinguished motion picture production and entertainment studio.',
          origin_country: 'US',
        },
        movies: FALLBACK_MOVIES,
      };
    }
  }
}
