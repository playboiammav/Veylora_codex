import { serverCache } from '../cache/cache-service';

export interface GogGameItem {
  id: number | string;
  title: string;
  slug: string;
  image: string;
  url: string;
  price: {
    amount: string;
    baseAmount: string;
    discountPercentage: number;
    isFree: boolean;
    currency: string;
  };
  genres: string[];
  operatingSystems: string[];
  developer?: string;
  publisher?: string;
  rating?: number;
  releaseDate?: string;
  description?: string;
}

export class GogService {
  /**
   * Retrieves filtered GOG game catalog
   */
  static async getCatalog(page: number = 1, search?: string, sort: string = 'popularity'): Promise<{ success: boolean; data: GogGameItem[]; totalCount: number; source: 'live' | 'cache' }> {
    const cacheKey = `gog:catalog:${page}:${search || ''}:${sort}`;
    const cached = serverCache.get<{ data: GogGameItem[]; totalCount: number }>(cacheKey);
    if (cached) return { success: true, ...cached, source: 'cache' };

    try {
      let url = `https://embed.gog.com/games/ajax/filtered?mediaType=game&page=${page}&sort=${encodeURIComponent(sort)}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`GOG API returned HTTP ${res.status}`);
      }

      const json = await res.json();
      const products = json?.products || [];

      const items: GogGameItem[] = products.map((p: any) => {
        const isFree = p.price?.isFree || false;
        const amount = p.price?.amount || (isFree ? 'Free' : '');
        const baseAmount = p.price?.baseAmount || amount;
        const discountPercentage = p.price?.discountPercentage || 0;

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          image: p.image ? `https:${p.image}.jpg` : '',
          url: `https://www.gog.com${p.url || `/game/${p.slug}`}`,
          price: {
            amount: isFree ? 'Free' : (amount ? (amount.startsWith('$') ? amount : `$${amount}`) : ''),
            baseAmount: baseAmount ? (baseAmount.startsWith('$') ? baseAmount : `$${baseAmount}`) : '',
            discountPercentage,
            isFree,
            currency: 'USD',
          },
          genres: p.genres || ['Action', 'Classic'],
          operatingSystems: p.worksOn ? Object.keys(p.worksOn).filter((k) => p.worksOn[k]) : ['windows'],
          rating: p.rating ? p.rating / 10 : 0,
          developer: p.developer,
          publisher: p.publisher,
        };
      });

      const totalCount = json?.totalProducts || items.length;
      serverCache.set(cacheKey, { data: items, totalCount }, 300);
      return { success: true, data: items, totalCount, source: 'live' };
    } catch {
      return { success: false, data: [], totalCount: 0, source: 'live' };
    }
  }

  /**
   * Retrieves individual GOG game details by product ID or slug
   */
  static async getGameDetails(idOrSlug: string | number): Promise<{ success: boolean; data?: GogGameItem; error?: string; source: 'live' | 'cache' }> {
    const key = String(idOrSlug).trim();
    const cacheKey = `gog:details:${key}`;
    const cached = serverCache.get<GogGameItem>(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    try {
      const url = `https://api.gog.com/products/${encodeURIComponent(key)}?expand=description,images,screenshots`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const p = await res.json();
        const item: GogGameItem = {
          id: p.id,
          title: p.title,
          slug: p.slug,
          image: p.images?.logo2x ? `https:${p.images.logo2x}` : (p.images?.icon ? `https:${p.images.icon}` : ''),
          url: `https://www.gog.com/game/${p.slug}`,
          price: {
            amount: '',
            baseAmount: '',
            discountPercentage: 0,
            isFree: false,
            currency: 'USD',
          },
          genres: p.genres?.map((g: any) => g.name) || ['RPG', 'Adventure'],
          operatingSystems: p.operating_systems || ['windows'],
          developer: p.publisher,
          publisher: p.publisher,
          rating: 0,
          description: p.description?.lead || p.description?.full || '',
        };

        serverCache.set(cacheKey, item, 600);
        return { success: true, data: item, source: 'live' };
      }
    } catch {
      // Fallback below
    }

    return {
      success: false,
      error: `GOG Game '${key}' not found.`,
      source: 'live',
    };
  }
}
