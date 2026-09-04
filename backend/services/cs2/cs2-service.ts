import { serverCache } from '../cache/cache-service';

export type Cs2Endpoint =
  | 'all'
  | 'skins'
  | 'stickers'
  | 'collections'
  | 'crates'
  | 'keys'
  | 'collectibles'
  | 'agents'
  | 'patches'
  | 'graffiti'
  | 'music_kits';

export interface Cs2Item {
  id: string;
  name: string;
  description?: string;
  rarity?: { id: string; name: string; color: string };
  type?: string;
  image: string;
  category?: { id: string; name: string };
  pattern?: { id: string; name: string };
  min_float?: number;
  max_float?: number;
  wear_categories?: { id: string; name: string }[];
  collections?: { id: string; name: string; image: string }[];
  crates?: { id: string; name: string; image: string }[];
  team?: { id: string; name: string };
}

const SUPPORTED_LANGUAGES = new Set([
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es-ES', 'es-MX', 'fi', 'fr', 'hu', 'it',
  'ja', 'ko', 'nl', 'no', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sv', 'th',
  'tr', 'uk', 'zh-CN', 'zh-TW'
]);

export class Cs2Service {
  private static sanitizeLanguage(lang: string = 'en'): string {
    if (SUPPORTED_LANGUAGES.has(lang)) return lang;
    if (lang === 'es') return 'es-ES';
    if (lang === 'pt') return 'pt-BR';
    if (lang === 'zh') return 'zh-CN';
    return 'en';
  }

  /**
   * Fetches specific CS2 inventory/item category from CSGO-API
   */
  static async getItems(
    endpoint: Cs2Endpoint = 'skins',
    language: string = 'en',
    search?: string,
    limit: number = 50
  ): Promise<{ success: boolean; data: Cs2Item[]; count: number; endpoint: string; language: string; source: 'live' | 'cache' }> {
    const lang = this.sanitizeLanguage(language);
    const fileName = endpoint === 'music_kits' ? 'music_kits.json' : `${endpoint}.json`;
    const cacheKey = `cs2:${lang}:${endpoint}`;

    let items = serverCache.get<Cs2Item[]>(cacheKey);

    if (!items) {
      try {
        const url = `https://bymykel.github.io/CSGO-API/api/${lang}/${fileName}`;
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
          next: { revalidate: 3600 },
        });

        if (!res.ok) {
          throw new Error(`CS2 API returned HTTP ${res.status}`);
        }

        items = await res.json();
        if (Array.isArray(items)) {
          serverCache.set(cacheKey, items, 3600); // 1 hour cache
        } else {
          items = [];
        }
      } catch (err: any) {
        // Return cached or empty
        items = [];
      }
    }

    let filtered = items || [];
    if (search && filtered.length > 0) {
      const q = search.toLowerCase();
      filtered = filtered.filter((i) =>
        i.name?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.rarity?.name?.toLowerCase().includes(q) ||
        i.category?.name?.toLowerCase().includes(q)
      );
    }

    const sliced = filtered.slice(0, limit);

    return {
      success: true,
      data: sliced,
      count: sliced.length,
      endpoint,
      language: lang,
      source: serverCache.get(cacheKey) ? 'cache' : 'live',
    };
  }

  /**
   * Search across all CS2 items
   */
  static async searchItems(query: string, language: string = 'en', limit: number = 20): Promise<Cs2Item[]> {
    const result = await this.getItems('all', language, query, limit);
    return result.data;
  }
}
