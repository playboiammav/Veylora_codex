import { serverCache } from '../cache/cache-service';

export interface NetflixMediaItem {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  trailer: string;
  video: string;
  genre: string[];
  duration: string;
  rating: string;
  year: number;
  type: 'movie' | 'series';
  isFeatured?: boolean;
}

export class NetflixService {
  private static getBaseUrl(): string {
    return process.env.NETFLIX_API_URL || 'https://netflix-api-g992.onrender.com';
  }

  /**
   * Retrieves media list from Netflix-like streaming service
   */
  static async getMedia(genre?: string, search?: string): Promise<{ success: boolean; data: NetflixMediaItem[]; count: number; source: 'live' | 'cache' }> {
    const cacheKey = `netflix:media:${genre || 'all'}:${search || 'all'}`;
    const cached = serverCache.get<NetflixMediaItem[]>(cacheKey);
    if (cached) return { success: true, data: cached, count: cached.length, source: 'cache' };

    try {
      const baseUrl = this.getBaseUrl();
      const endpoint = search ? `${baseUrl}/media/search/${encodeURIComponent(search)}` : `${baseUrl}/media`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const mediaList: NetflixMediaItem[] = Array.isArray(json) ? json : (json?.data || []);
        if (mediaList.length > 0) {
          serverCache.set(cacheKey, mediaList, 300);
          return { success: true, data: mediaList, count: mediaList.length, source: 'live' };
        }
      }
    } catch {
      // Return empty below
    }

    return { success: false, data: [], count: 0, source: 'live' };
  }

  /**
   * Retrieves single media detail by ID
   */
  static async getMediaDetail(mediaId: string): Promise<{ success: boolean; data?: NetflixMediaItem; source: 'live' | 'cache' }> {
    try {
      const baseUrl = this.getBaseUrl();
      const res = await fetch(`${baseUrl}/media/${encodeURIComponent(mediaId)}`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'live' };
      }
    } catch {
      // Return not found below
    }

    return { success: false, source: 'live' };
  }

  /**
   * User authentication proxy (Login)
   */
  static async login(email: string, password: string): Promise<any> {
    try {
      const baseUrl = this.getBaseUrl();
      const res = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch {
      return {
        success: false,
        error: 'AUTH_FAILED',
        message: 'Netflix upstream authentication service unavailable.',
      };
    }
  }

  /**
   * User registration proxy (Register)
   */
  static async register(name: string, email: string, password: string): Promise<any> {
    try {
      const baseUrl = this.getBaseUrl();
      const res = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      return await res.json();
    } catch {
      return {
        success: false,
        error: 'REGISTRATION_FAILED',
        message: 'Netflix upstream registration service unavailable.',
      };
    }
  }

  /**
   * Watchlist retrieval
   */
  static async getWatchlist(userId: string): Promise<NetflixMediaItem[]> {
    try {
      const baseUrl = this.getBaseUrl();
      const res = await fetch(`${baseUrl}/media/watchlist/${encodeURIComponent(userId)}`);
      if (res.ok) return await res.json();
    } catch {
      // Return empty below
    }
    return [];
  }
}
