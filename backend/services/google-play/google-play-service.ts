import { serverCache } from '../cache/cache-service';

// Dynamically import google-play-scraper safely
let gplay: any = null;
async function getGplay() {
  if (!gplay) {
    const mod = await import('google-play-scraper');
    gplay = (mod as any).default || mod;
  }
  return gplay;
}

export interface GooglePlayAppItem {
  appId: string;
  title: string;
  url: string;
  icon: string;
  developer: string;
  developerId?: string;
  priceText?: string;
  free: boolean;
  score?: number;
  scoreText?: string;
  summary?: string;
  genre?: string;
  genreId?: string;
  currency?: string;
  price?: number;
  screenshots?: string[];
  video?: string;
  description?: string;
  descriptionHTML?: string;
  installs?: string;
  minInstalls?: number;
  ratings?: number;
  reviews?: number;
  updated?: number;
  version?: string;
  recentChanges?: string;
  contentRating?: string;
  released?: string;
}

export class GooglePlayService {
  /**
   * Retrieves apps by collection, category, country, language, with optional fullDetail
   */
  static async getApps(options: {
    collection?: string;
    category?: string;
    country?: string;
    lang?: string;
    num?: number;
    fullDetail?: boolean;
  } = {}): Promise<{ success: boolean; data: GooglePlayAppItem[]; count: number; source: 'live' | 'cache' }> {
    const {
      collection = 'TOP_FREE',
      category,
      country = 'us',
      lang = 'en',
      num = 24,
      fullDetail = false,
    } = options;

    const cacheKey = `gplay:apps:${collection}:${category || 'ALL'}:${country}:${lang}:${num}:${fullDetail}`;
    const cached = serverCache.get<GooglePlayAppItem[]>(cacheKey);
    if (cached) return { success: true, data: cached, count: cached.length, source: 'cache' };

    try {
      const scraper = await getGplay();
      const collectionEnum = (scraper.collection && scraper.collection[collection.toUpperCase()]) || scraper.collection?.TOP_FREE || collection;
      const categoryEnum = category && scraper.category ? (scraper.category[category.toUpperCase()] || category) : undefined;

      const results = await scraper.list({
        collection: collectionEnum,
        category: categoryEnum,
        country,
        lang,
        num,
        fullDetail,
      });

      const formatted: GooglePlayAppItem[] = (results || []).map((app: any) => ({
        appId: app.appId,
        title: app.title,
        url: app.url || `https://play.google.com/store/apps/details?id=${app.appId}`,
        icon: app.icon || '',
        developer: app.developer,
        developerId: app.developerId,
        priceText: app.priceText || (app.free ? 'Free' : (app.price ? `$${app.price}` : '')),
        free: app.free ?? true,
        score: app.score,
        scoreText: app.scoreText,
        summary: app.summary,
        genre: app.genre,
        genreId: app.genreId,
        currency: app.currency,
        price: app.price,
        description: app.description,
        screenshots: app.screenshots,
        installs: app.installs,
      }));

      serverCache.set(cacheKey, formatted, 600);
      return { success: true, data: formatted, count: formatted.length, source: 'live' };
    } catch (err: any) {
      // Return cached or fallback
      return {
        success: false,
        data: [],
        count: 0,
        source: 'live',
      };
    }
  }

  /**
   * Retrieves single application details by appId
   */
  static async getAppDetails(
    appId: string,
    country: string = 'us',
    lang: string = 'en'
  ): Promise<{ success: boolean; data?: GooglePlayAppItem; error?: string; source: 'live' | 'cache' }> {
    const cacheKey = `gplay:detail:${appId}:${country}:${lang}`;
    const cached = serverCache.get<GooglePlayAppItem>(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    try {
      const scraper = await getGplay();
      const app = await scraper.app({ appId, country, lang });

      const item: GooglePlayAppItem = {
        appId: app.appId,
        title: app.title,
        url: app.url,
        icon: app.icon || '',
        developer: app.developer,
        developerId: app.developerId,
        priceText: app.priceText || (app.free ? 'Free' : (app.price !== undefined ? `$${app.price}` : '')),
        free: app.free,
        score: app.score,
        scoreText: app.scoreText,
        summary: app.summary,
        genre: app.genre,
        genreId: app.genreId,
        currency: app.currency,
        price: app.price,
        screenshots: app.screenshots,
        video: app.video,
        description: app.description,
        descriptionHTML: app.descriptionHTML,
        installs: app.installs,
        minInstalls: app.minInstalls,
        ratings: app.ratings,
        reviews: app.reviews,
        updated: app.updated,
        version: app.version,
        recentChanges: app.recentChanges,
        contentRating: app.contentRating,
        released: app.released,
      };

      serverCache.set(cacheKey, item, 600);
      return { success: true, data: item, source: 'live' };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || `App '${appId}' not found on Google Play.`,
        source: 'live',
      };
    }
  }

  /**
   * Permissions
   */
  static async getPermissions(appId: string, lang: string = 'en', short: boolean = false) {
    const scraper = await getGplay();
    return await scraper.permissions({ appId, lang, short });
  }

  /**
   * Data Safety
   */
  static async getDataSafety(appId: string, lang: string = 'en') {
    const scraper = await getGplay();
    return await scraper.datasafety({ appId, lang });
  }

  /**
   * Similar Apps
   */
  static async getSimilar(appId: string, country: string = 'us', lang: string = 'en') {
    const scraper = await getGplay();
    return await scraper.similar({ appId, country, lang });
  }

  /**
   * Reviews
   */
  static async getReviews(appId: string, options: { country?: string; lang?: string; num?: number } = {}) {
    const scraper = await getGplay();
    return await scraper.reviews({ appId, ...options });
  }

  /**
   * Search
   */
  static async search(term: string, num: number = 20, country: string = 'us', lang: string = 'en') {
    const scraper = await getGplay();
    return await scraper.search({ term, num, country, lang });
  }

  /**
   * Search suggestions
   */
  static async suggest(term: string) {
    const scraper = await getGplay();
    return await scraper.suggest({ term });
  }

  /**
   * Developer apps
   */
  static async getDeveloperApps(devId: string, country: string = 'us', lang: string = 'en', num: number = 20) {
    const scraper = await getGplay();
    return await scraper.developer({ devId, country, lang, num });
  }

  /**
   * Categories
   */
  static async getCategories() {
    const scraper = await getGplay();
    return await scraper.categories();
  }
}
