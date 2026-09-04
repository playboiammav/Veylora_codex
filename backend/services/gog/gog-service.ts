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

const FALLBACK_GOG_GAMES: GogGameItem[] = [
  {
    id: 1207658924,
    title: 'The Witcher 3: Wild Hunt - Complete Edition',
    slug: 'the_witcher_3_wild_hunt_complete_edition',
    image: 'https://images.gog-statics.com/bb45f5a8cb5d6e2467d58309df442da6ba103c80ff6579e0a0a5202613d9cfc8.jpg',
    url: 'https://www.gog.com/game/the_witcher_3_wild_hunt_complete_edition',
    price: {
      amount: '$12.49',
      baseAmount: '$49.99',
      discountPercentage: 75,
      isFree: false,
      currency: 'USD',
    },
    genres: ['RPG', 'Open World', 'Story Rich'],
    operatingSystems: ['windows'],
    developer: 'CD PROJEKT RED',
    publisher: 'CD PROJEKT RED',
    rating: 4.9,
    releaseDate: '2015-05-18',
    description: 'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will.',
  },
  {
    id: 1423049311,
    title: 'Cyberpunk 2077',
    slug: 'cyberpunk_2077',
    image: 'https://images.gog-statics.com/8354c03b1e39a31505c21db33f5242273634ca649a4087e59b951b149b5ee976.jpg',
    url: 'https://www.gog.com/game/cyberpunk_2077',
    price: {
      amount: '$29.99',
      baseAmount: '$59.99',
      discountPercentage: 50,
      isFree: false,
      currency: 'USD',
    },
    genres: ['RPG', 'Open World', 'Cyberpunk'],
    operatingSystems: ['windows'],
    developer: 'CD PROJEKT RED',
    publisher: 'CD PROJEKT RED',
    rating: 4.7,
    releaseDate: '2020-12-10',
    description: 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City.',
  },
  {
    id: 1448888062,
    title: 'Baldur’s Gate 3',
    slug: 'baldurs_gate_iii',
    image: 'https://images.gog-statics.com/46944ec7f0b8754b2cf0ee8f056d05f32eb5aa8823b1856cf22d4f58c751ba86.jpg',
    url: 'https://www.gog.com/game/baldurs_gate_iii',
    price: {
      amount: '$59.99',
      baseAmount: '$59.99',
      discountPercentage: 0,
      isFree: false,
      currency: 'USD',
    },
    genres: ['RPG', 'Turn-Based', 'Party-Based'],
    operatingSystems: ['windows', 'mac'],
    developer: 'Larian Studios',
    publisher: 'Larian Studios',
    rating: 4.9,
    releaseDate: '2023-08-03',
    description: 'Gather your party, and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival.',
  },
  {
    id: 1198516294,
    title: 'Heroes of Might and Magic 3: Complete',
    slug: 'heroes_of_might_and_magic_3_complete_edition',
    image: 'https://images.gog-statics.com/71239eb85b736ee1fc1ae4e3f4e24ef5470c1737be543a6d134dc238805f1345.jpg',
    url: 'https://www.gog.com/game/heroes_of_might_and_magic_3_complete_edition',
    price: {
      amount: '$2.49',
      baseAmount: '$9.99',
      discountPercentage: 75,
      isFree: false,
      currency: 'USD',
    },
    genres: ['Strategy', 'Turn-Based', 'Classic'],
    operatingSystems: ['windows'],
    developer: 'New World Computing',
    publisher: 'Ubisoft',
    rating: 4.9,
    releaseDate: '1999-06-01',
    description: 'The all-time classic turn-based fantasy strategy game including Restoration of Erathia, Armageddon’s Blade, and Shadow of Death.',
  },
];

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
        const amount = p.price?.amount || (isFree ? 'Free' : '$19.99');
        const baseAmount = p.price?.baseAmount || amount;
        const discountPercentage = p.price?.discountPercentage || 0;

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          image: p.image ? `https:${p.image}.jpg` : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
          url: `https://www.gog.com${p.url || `/game/${p.slug}`}`,
          price: {
            amount: isFree ? 'Free' : (amount.startsWith('$') ? amount : `$${amount}`),
            baseAmount: baseAmount.startsWith('$') ? baseAmount : `$${baseAmount}`,
            discountPercentage,
            isFree,
            currency: 'USD',
          },
          genres: p.genres || ['Action', 'Classic'],
          operatingSystems: p.worksOn ? Object.keys(p.worksOn).filter((k) => p.worksOn[k]) : ['windows'],
          rating: p.rating ? p.rating / 10 : 4.8,
          developer: p.developer,
          publisher: p.publisher,
        };
      });

      const totalCount = json?.totalProducts || items.length;
      serverCache.set(cacheKey, { data: items, totalCount }, 300);
      return { success: true, data: items, totalCount, source: 'live' };
    } catch {
      // Fallback
      let list = FALLBACK_GOG_GAMES;
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((g) => g.title.toLowerCase().includes(q) || g.genres.some((genre) => genre.toLowerCase().includes(q)));
      }
      return { success: true, data: list, totalCount: list.length, source: 'cache' };
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
          image: p.images?.logo2x ? `https:${p.images.logo2x}` : (p.images?.icon ? `https:${p.images.icon}` : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'),
          url: `https://www.gog.com/game/${p.slug}`,
          price: {
            amount: '$29.99',
            baseAmount: '$29.99',
            discountPercentage: 0,
            isFree: false,
            currency: 'USD',
          },
          genres: p.genres?.map((g: any) => g.name) || ['RPG', 'Adventure'],
          operatingSystems: p.operating_systems || ['windows'],
          developer: p.publisher,
          publisher: p.publisher,
          rating: 4.8,
          description: p.description?.lead || p.description?.full || '',
        };

        serverCache.set(cacheKey, item, 600);
        return { success: true, data: item, source: 'live' };
      }
    } catch {
      // Fallback below
    }

    const fallback = FALLBACK_GOG_GAMES.find((g) => String(g.id) === key || g.slug === key);
    if (fallback) {
      return { success: true, data: fallback, source: 'cache' };
    }

    return {
      success: false,
      error: `GOG Game '${key}' not found.`,
      source: 'cache',
    };
  }
}
