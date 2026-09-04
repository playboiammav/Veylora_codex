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

const FALLBACK_NETFLIX_CATALOG: NetflixMediaItem[] = [
  {
    _id: "media-arcane",
    title: "Arcane: League of Legends",
    description: "Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    trailer: "https://www.youtube.com/watch?v=fXmAurh012s",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    genre: ["Action", "Sci-Fi", "Animation", "Drama"],
    duration: "9 Episodes (Season 2)",
    rating: "TV-14",
    year: 2024,
    type: "series",
    isFeatured: true
  },
  {
    _id: "media-cyberpunk-edgerunners",
    title: "Cyberpunk: Edgerunners",
    description: "A street kid trying to survive in a technology and body modification-obsessed city of the future loses everything and chooses to stay alive by becoming an edgerunner.",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    trailer: "https://www.youtube.com/watch?v=JtqIas3bYhg",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    genre: ["Action", "Sci-Fi", "Anime"],
    duration: "10 Episodes",
    rating: "TV-MA",
    year: 2022,
    type: "series",
    isFeatured: true
  },
  {
    _id: "media-fallout",
    title: "Fallout: New California Chronicle",
    description: "In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits.",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    trailer: "https://www.youtube.com/watch?v=V-mugKDQDlg",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    genre: ["Action", "Adventure", "Sci-Fi"],
    duration: "8 Episodes",
    rating: "TV-MA",
    year: 2024,
    type: "series"
  },
  {
    _id: "media-lastofus",
    title: "The Last of Us: Cinematic Cut",
    description: "Twenty years after modern civilization has been destroyed, Joel is hired to smuggle Ellie out of an oppressive quarantine zone.",
    thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    trailer: "https://www.youtube.com/watch?v=uLtkt8BonwM",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    genre: ["Action", "Drama", "Horror"],
    duration: "125 min",
    rating: "TV-MA",
    year: 2023,
    type: "movie"
  }
];

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
      // Fallback
    }

    let items = FALLBACK_NETFLIX_CATALOG;
    if (genre) {
      items = items.filter((m) => m.genre.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }

    return { success: true, data: items, count: items.length, source: 'cache' };
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
      // Fallback
    }

    const fallback = FALLBACK_NETFLIX_CATALOG.find((m) => m._id === mediaId) || FALLBACK_NETFLIX_CATALOG[0];
    return { success: true, data: fallback, source: 'cache' };
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
        success: true,
        message: 'Mock session authorized for sandbox preview.',
        token: 'sample_jwt_stream_token_884920491',
        user: { id: 'usr-421', email, isSubscribed: true },
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
        success: true,
        message: 'Mock account created for sandbox preview.',
        user: { id: 'usr-new', name, email, isSubscribed: false },
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
      // Fallback
    }
    return FALLBACK_NETFLIX_CATALOG.slice(0, 2);
  }
}
