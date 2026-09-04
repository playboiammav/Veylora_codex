import { serverCache } from '../cache/cache-service';
import {
  NormalizedMovie,
  NormalizedCastMember,
  MovieRatingSource,
  MovieReviewItem,
  MovieAwardItem,
  NormalizedPerson,
  NormalizedCompany,
} from '@/lib/normalized-types';

const TV_API_BASE_URL = 'https://tv-api.com/en/API';

function getTvApiKey(): string | null {
  const key =
    process.env.TV_API_KEY ||
    process.env.TVAPI_KEY ||
    process.env.IMDB_API_KEY ||
    process.env.IMDB_KEY ||
    '';
  return key.trim() || null;
}

export interface TvApiTitleData {
  id: string;
  title: string;
  originalTitle?: string;
  fullTitle?: string;
  type?: string;
  year?: string;
  image?: string;
  releaseDate?: string;
  runtimeMins?: string;
  runtimeStr?: string;
  plot?: string;
  plotLocal?: string;
  awards?: string;
  directors?: string;
  directorList?: { id: string; name: string }[];
  writers?: string;
  writerList?: { id: string; name: string }[];
  stars?: string;
  starList?: { id: string; name: string }[];
  actorList?: { id: string; image: string; name: string; asCharacter: string }[];
  genres?: string;
  genreList?: { key: string; value: string }[];
  companies?: string;
  companyList?: { id: string; name: string }[];
  countries?: string;
  languages?: string;
  contentRating?: string;
  imDbRating?: string;
  imDbRatingVotes?: string;
  metacriticRating?: string;
  ratings?: {
    imDb?: string;
    metacritic?: string;
    theMovieDb?: string;
    rottenTomatoes?: string;
    tV_com?: string;
    filmAffinity?: string;
  };
  wikipedia?: {
    imDbId?: string;
    title?: string;
    fullTitle?: string;
    type?: string;
    year?: string;
    language?: string;
    titleInLanguage?: string;
    url?: string;
    plotShort?: { plainText?: string; html?: string };
    plotFull?: { plainText?: string; html?: string };
    errorMessage?: string;
  };
  posters?: {
    posters?: { id: string; link: string; aspectRatio: number; language: string; width: number; height: number }[];
    backdrops?: { id: string; link: string; aspectRatio: number; language: string; width: number; height: number }[];
  };
  images?: {
    items?: { title: string; image: string }[];
  };
  trailer?: {
    imDbId?: string;
    title?: string;
    fullTitle?: string;
    type?: string;
    year?: string;
    videoId?: string;
    videoUrl?: string;
    errorMessage?: string;
    thumbnailUrl?: string;
    link?: string;
    linkEmbed?: string;
  };
  boxOffice?: {
    budget?: string;
    openingWeekendUSA?: string;
    grossUSA?: string;
    cumulativeWorldwideGross?: string;
  };
  tagline?: string;
  keywords?: string;
  tvSeriesInfo?: {
    yearEnd?: string;
    creators?: string;
    seasons?: string[];
  };
  tvEpisodeInfo?: {
    seriesId?: string;
    seriesTitle?: string;
    seasonNumber?: string;
    episodeNumber?: string;
    previousEpisodeId?: string;
    nextEpisodeId?: string;
  };
  errorMessage?: string;
}

export interface TvApiReviewsData {
  imDbId: string;
  title: string;
  fullTitle: string;
  type: string;
  year: string;
  items?: {
    username: string;
    userUrl: string;
    reviewTitle: string;
    reviewText: string;
    rate: string;
    date: string;
    helpful: string;
  }[];
  errorMessage?: string;
}

export interface TvApiAwardsData {
  imDbId: string;
  title: string;
  fullTitle: string;
  type: string;
  year: string;
  description?: string;
  items?: {
    eventTitle: string;
    outcomeItems?: {
      outcomeTitle: string;
      outcomeCategory: string;
      outcomeYear?: string;
      isWinner?: boolean;
      outcomeDetails?: {
        plainText: string;
        html: string;
      }[];
    }[];
  }[];
  errorMessage?: string;
}

export interface TvApiExternalSitesData {
  imDbId: string;
  title: string;
  fullTitle: string;
  type: string;
  year: string;
  officialWebsite?: string;
  imDb?: { id: string; url: string };
  theMovieDb?: { id: string; url: string };
  rottenTomatoes?: { id: string; url: string };
  metacritic?: { id: string; url: string };
  netflix?: { id: string; url: string };
  googlePlay?: { id: string; url: string };
  amazonPrime?: { id: string; url: string };
  websites?: { id: string; name: string; url: string }[];
  errorMessage?: string;
}

export interface TvApiNameData {
  id: string;
  name: string;
  role?: string;
  image?: string;
  summary?: string;
  birthDate?: string;
  deathDate?: string;
  awards?: string;
  height?: string;
  knownFor?: {
    id: string;
    title: string;
    fullTitle?: string;
    year?: string;
    role?: string;
    image?: string;
  }[];
  castMovies?: {
    id: string;
    role: string;
    title: string;
    year: string;
    description?: string;
  }[];
  errorMessage?: string;
}

export interface TvApiCompanyData {
  id: string;
  name: string;
  items?: {
    id: string;
    title: string;
    fullTitle?: string;
    year?: string;
    image?: string;
    imDbRating?: string;
  }[];
  errorMessage?: string;
}

export class TvApiService {
  /**
   * Helper to perform safe fetch to TV-API
   */
  private static async fetchApi<T>(endpoint: string, params: string = ''): Promise<T | null> {
    const apiKey = getTvApiKey();
    if (!apiKey) {
      return null;
    }

    // Build URL according to TV-API standard /en/API/{endpoint}/{apiKey}/{params}
    const cleanParams = params.startsWith('/') ? params : params ? `/${params}` : '';
    const url = `${TV_API_BASE_URL}/${endpoint}/${apiKey}${cleanParams}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`TV-API HTTP error ${res.status} for ${endpoint}`);
        return null;
      }

      const json = await res.json();
      if (json.errorMessage && json.errorMessage.trim().length > 0) {
        console.warn(`TV-API returned error: ${json.errorMessage}`);
        return null;
      }

      return json as T;
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`TV-API fetch failed for ${endpoint}:`, err);
      return null;
    }
  }

  /**
   * Universal Search (Movies, Series, Names, Companies)
   */
  static async search(
    query: string,
    type: 'all' | 'movie' | 'series' | 'name' | 'company' | 'title' = 'all'
  ): Promise<{
    success: boolean;
    source: 'live' | 'cache' | 'fallback';
    data: any[];
  }> {
    if (!query.trim()) return { success: true, source: 'fallback', data: [] };

    const cacheKey = `tvapi_search_${type}_${encodeURIComponent(query.toLowerCase())}`;
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return { success: true, source: 'cache', data: cached };

    let endpoint = 'Search';
    if (type === 'movie') endpoint = 'SearchMovie';
    else if (type === 'series') endpoint = 'SearchSeries';
    else if (type === 'name') endpoint = 'SearchName';
    else if (type === 'company') endpoint = 'SearchCompany';
    else if (type === 'title') endpoint = 'SearchTitle';

    const result = await this.fetchApi<{ results?: any[]; expression?: string }>(
      endpoint,
      encodeURIComponent(query.trim())
    );

    if (result && result.results) {
      serverCache.set(cacheKey, result.results, 600);
      return { success: true, source: 'live', data: result.results };
    }

    return { success: false, source: 'fallback', data: [] };
  }

  /**
   * Get Title details (Movie, Series, Episode) with full payload options
   */
  static async getTitle(
    id: string,
    options: string = 'FullActor,FullCast,Posters,Images,Trailer,Ratings,Wikipedia'
  ): Promise<TvApiTitleData | null> {
    if (!id) return null;
    const cacheKey = `tvapi_title_${id}_${options}`;
    const cached = serverCache.get<TvApiTitleData>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<TvApiTitleData>('Title', `${id}/${options}`);
    if (data && data.id) {
      serverCache.set(cacheKey, data, 1800);
      return data;
    }
    return null;
  }

  /**
   * Get Ratings from multiple authorities
   */
  static async getRatings(id: string): Promise<{
    imDb?: string;
    metacritic?: string;
    theMovieDb?: string;
    rottenTomatoes?: string;
    tV_com?: string;
    filmAffinity?: string;
    errorMessage?: string;
  } | null> {
    if (!id) return null;
    const cacheKey = `tvapi_ratings_${id}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<any>('Ratings', id);
    if (data) {
      serverCache.set(cacheKey, data, 1800);
      return data;
    }
    return null;
  }

  /**
   * Get Full Cast & Crew
   */
  static async getFullCast(id: string): Promise<any | null> {
    if (!id) return null;
    const cacheKey = `tvapi_fullcast_${id}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<any>('FullCast', id);
    if (data) {
      serverCache.set(cacheKey, data, 1800);
      return data;
    }
    return null;
  }

  /**
   * Get Posters & Backdrops
   */
  static async getPosters(id: string): Promise<any | null> {
    if (!id) return null;
    const cacheKey = `tvapi_posters_${id}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<any>('Posters', id);
    if (data) {
      serverCache.set(cacheKey, data, 1800);
      return data;
    }
    return null;
  }

  /**
   * Get Images
   */
  static async getImages(id: string, options: string = 'Short'): Promise<any | null> {
    if (!id) return null;
    const cacheKey = `tvapi_images_${id}_${options}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<any>('Images', `${id}/${options}`);
    if (data) {
      serverCache.set(cacheKey, data, 1800);
      return data;
    }
    return null;
  }

  /**
   * Get Trailer information
   */
  static async getTrailer(id: string): Promise<any | null> {
    if (!id) return null;
    const cacheKey = `tvapi_trailer_${id}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<any>('Trailer', id);
    if (data) {
      serverCache.set(cacheKey, data, 1800);
      return data;
    }
    return null;
  }

  /**
   * Get Reviews (IMDb & User Reviews)
   */
  static async getReviews(id: string): Promise<TvApiReviewsData | null> {
    if (!id) return null;
    const cacheKey = `tvapi_reviews_${id}`;
    const cached = serverCache.get<TvApiReviewsData>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<TvApiReviewsData>('Reviews', id);
    if (data) {
      serverCache.set(cacheKey, data, 1800);
      return data;
    }
    return null;
  }

  /**
   * Get Metacritic Reviews
   */
  static async getMetacriticReviews(id: string): Promise<any | null> {
    if (!id) return null;
    const cacheKey = `tvapi_metacritic_reviews_${id}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<any>('MetacriticReviews', id);
    if (data) {
      serverCache.set(cacheKey, data, 1800);
      return data;
    }
    return null;
  }

  /**
   * Get Awards
   */
  static async getAwards(id: string): Promise<TvApiAwardsData | null> {
    if (!id) return null;
    const cacheKey = `tvapi_awards_${id}`;
    const cached = serverCache.get<TvApiAwardsData>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<TvApiAwardsData>('Awards', id);
    if (data) {
      serverCache.set(cacheKey, data, 3600);
      return data;
    }
    return null;
  }

  /**
   * Get Wikipedia Data
   */
  static async getWikipedia(id: string): Promise<any | null> {
    if (!id) return null;
    const cacheKey = `tvapi_wikipedia_${id}`;
    const cached = serverCache.get<any>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<any>('Wikipedia', id);
    if (data) {
      serverCache.set(cacheKey, data, 3600);
      return data;
    }
    return null;
  }

  /**
   * Get External Sites
   */
  static async getExternalSites(id: string): Promise<TvApiExternalSitesData | null> {
    if (!id) return null;
    const cacheKey = `tvapi_external_sites_${id}`;
    const cached = serverCache.get<TvApiExternalSitesData>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<TvApiExternalSitesData>('ExternalSites', id);
    if (data) {
      serverCache.set(cacheKey, data, 3600);
      return data;
    }
    return null;
  }

  /**
   * Get Person Details (Name)
   */
  static async getName(id: string): Promise<NormalizedPerson | null> {
    if (!id) return null;
    const cacheKey = `tvapi_name_${id}`;
    const cached = serverCache.get<NormalizedPerson>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<TvApiNameData>('Name', id);
    if (data && data.name) {
      const knownFor = (data.knownFor || []).map((k) => ({
        id: k.id,
        title: k.title,
        year: k.year,
        role: k.role,
        poster: k.image,
      }));

      const filmography = (data.castMovies || []).map((c) => ({
        id: c.id,
        title: c.title,
        year: c.year,
        role: c.role,
        character: c.role,
      }));

      const normalizedPerson: NormalizedPerson = {
        id: data.id,
        imdbId: data.id,
        name: data.name,
        role: data.role || 'Performer',
        photo: data.image || null,
        biography: data.summary || 'Acclaimed artist with a celebrated career.',
        birthDate: data.birthDate,
        deathDate: data.deathDate,
        height: data.height,
        awardsSummary: data.awards,
        knownFor,
        filmography,
      };

      serverCache.set(cacheKey, normalizedPerson, 3600);
      return normalizedPerson;
    }
    return null;
  }

  /**
   * Get Company Details
   */
  static async getCompany(id: string): Promise<NormalizedCompany | null> {
    if (!id) return null;
    const cacheKey = `tvapi_company_${id}`;
    const cached = serverCache.get<NormalizedCompany>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<TvApiCompanyData>('Company', id);
    if (data && data.name) {
      const movies = (data.items || []).map((m) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        poster: m.image,
        rating: m.imDbRating ? parseFloat(m.imDbRating) : undefined,
      }));

      const company: NormalizedCompany = {
        id: data.id,
        name: data.name,
        description: `Premier film & television production company behind prominent titles.`,
        type: 'production',
        movies,
      };

      serverCache.set(cacheKey, company, 3600);
      return company;
    }
    return null;
  }

  /**
   * Top 250 Movies
   */
  static async getTop250Movies(): Promise<any[] | null> {
    const cacheKey = 'tvapi_top250_movies';
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<{ items?: any[] }>('Top250Movies');
    if (data && data.items) {
      serverCache.set(cacheKey, data.items, 3600);
      return data.items;
    }
    return null;
  }

  /**
   * Top 250 TVs
   */
  static async getTop250TVs(): Promise<any[] | null> {
    const cacheKey = 'tvapi_top250_tvs';
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<{ items?: any[] }>('Top250TVs');
    if (data && data.items) {
      serverCache.set(cacheKey, data.items, 3600);
      return data.items;
    }
    return null;
  }

  /**
   * Most Popular Movies
   */
  static async getMostPopularMovies(): Promise<any[] | null> {
    const cacheKey = 'tvapi_popular_movies';
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<{ items?: any[] }>('MostPopularMovies');
    if (data && data.items) {
      serverCache.set(cacheKey, data.items, 1800);
      return data.items;
    }
    return null;
  }

  /**
   * Most Popular TVs
   */
  static async getMostPopularTVs(): Promise<any[] | null> {
    const cacheKey = 'tvapi_popular_tvs';
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<{ items?: any[] }>('MostPopularTVs');
    if (data && data.items) {
      serverCache.set(cacheKey, data.items, 1800);
      return data.items;
    }
    return null;
  }

  /**
   * In Theaters
   */
  static async getInTheaters(): Promise<any[] | null> {
    const cacheKey = 'tvapi_in_theaters';
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<{ items?: any[] }>('InTheaters');
    if (data && data.items) {
      serverCache.set(cacheKey, data.items, 1800);
      return data.items;
    }
    return null;
  }

  /**
   * Coming Soon
   */
  static async getComingSoon(): Promise<any[] | null> {
    const cacheKey = 'tvapi_coming_soon';
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<{ items?: any[] }>('ComingSoon');
    if (data && data.items) {
      serverCache.set(cacheKey, data.items, 1800);
      return data.items;
    }
    return null;
  }

  /**
   * Box Office
   */
  static async getBoxOffice(): Promise<any[] | null> {
    const cacheKey = 'tvapi_box_office';
    const cached = serverCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.fetchApi<{ items?: any[] }>('BoxOffice');
    if (data && data.items) {
      serverCache.set(cacheKey, data.items, 1800);
      return data.items;
    }
    return null;
  }

  /**
   * Enriches a NormalizedMovie with TV-API data (Ratings, Cast, Reviews, Awards, Wikipedia, Box Office)
   */
  static async enrichMovie(movie: NormalizedMovie): Promise<NormalizedMovie> {
    // If we don't have an IMDb ID, we can't query TV-API directly without search
    let imdbId = movie.imdbId;

    if (!imdbId && movie.id.startsWith('tt')) {
      imdbId = movie.id;
    }

    // Build multi-source ratings collection starting with TMDB
    const ratingsList: MovieRatingSource[] = [
      {
        source: 'TMDB',
        score: `${movie.rating}/10`,
        scoreValue: movie.rating,
        maxScore: '10',
        votes: movie.voteCount,
        percentage: Math.round(movie.rating * 10),
      },
    ];

    if (!imdbId) {
      return {
        ...movie,
        ratingsList,
      };
    }

    try {
      // Fetch comprehensive TV-API Title data in parallel with Reviews and Awards
      const [titleData, reviewsData, awardsData] = await Promise.all([
        this.getTitle(imdbId),
        this.getReviews(imdbId),
        this.getAwards(imdbId),
      ]);

      if (!titleData) {
        return {
          ...movie,
          imdbId,
          ratingsList,
        };
      }

      // 1. Process Ratings
      let imdbRating = movie.imdbRating;
      let metacriticRating = movie.metacriticRating;
      let rottenTomatoesRating = movie.rottenTomatoesRating;

      if (titleData.imDbRating && titleData.imDbRating !== '0') {
        const parsed = parseFloat(titleData.imDbRating);
        if (!isNaN(parsed) && parsed > 0) {
          imdbRating = parsed;
          ratingsList.push({
            source: 'IMDb',
            score: `${parsed.toFixed(1)}/10`,
            scoreValue: parsed,
            maxScore: '10',
            votes: titleData.imDbRatingVotes ? parseInt(titleData.imDbRatingVotes.replace(/,/g, ''), 10) : undefined,
            percentage: Math.round(parsed * 10),
          });
        }
      }

      if (titleData.ratings?.metacritic || titleData.metacriticRating) {
        const mcStr = titleData.ratings?.metacritic || titleData.metacriticRating || '';
        const mc = parseInt(mcStr, 10);
        if (!isNaN(mc) && mc > 0) {
          metacriticRating = mc;
          ratingsList.push({
            source: 'Metacritic',
            score: `${mc}/100`,
            scoreValue: mc,
            maxScore: '100',
            percentage: mc,
          });
        }
      }

      if (titleData.ratings?.rottenTomatoes) {
        const rt = parseInt(titleData.ratings.rottenTomatoes.replace('%', ''), 10);
        if (!isNaN(rt) && rt > 0) {
          rottenTomatoesRating = rt;
          ratingsList.push({
            source: 'Rotten Tomatoes',
            score: `${rt}%`,
            scoreValue: rt,
            maxScore: '100%',
            percentage: rt,
          });
        }
      }

      if (titleData.ratings?.tV_com && titleData.ratings.tV_com !== '0') {
        const tvVal = parseFloat(titleData.ratings.tV_com);
        if (!isNaN(tvVal) && tvVal > 0) {
          ratingsList.push({
            source: 'TV.com',
            score: `${tvVal.toFixed(1)}/10`,
            scoreValue: tvVal,
            maxScore: '10',
            percentage: Math.round(tvVal * 10),
          });
        }
      }

      // 2. Merge Cast carefully and deduplicate
      const mergedCast: NormalizedCastMember[] = [...movie.cast];
      const seenNames = new Set<string>(movie.cast.map((c) => c.name.toLowerCase()));

      if (titleData.actorList && titleData.actorList.length > 0) {
        for (const actor of titleData.actorList) {
          if (!seenNames.has(actor.name.toLowerCase())) {
            seenNames.add(actor.name.toLowerCase());
            mergedCast.push({
              id: actor.id || `tvapi-${actor.name.toLowerCase().replace(/\s+/g, '-')}`,
              imdbId: actor.id,
              name: actor.name,
              character: actor.asCharacter || 'Cast',
              profileImage: actor.image || null,
            });
          }
        }
      }

      // 3. Process Directors & Writers
      const directors = titleData.directorList?.map((d) => d.name) || (movie.director ? [movie.director] : []);
      const writers = titleData.writerList?.map((w) => w.name) || [];
      const stars = titleData.starList?.map((s) => s.name) || [];

      // 4. Process Production Companies
      const companies = (titleData.companyList && titleData.companyList.length > 0)
        ? titleData.companyList.map((c) => ({
            id: c.id,
            name: c.name,
          }))
        : movie.companies || [];

      // 5. Process Reviews
      const reviews: MovieReviewItem[] = [];
      if (reviewsData && reviewsData.items && reviewsData.items.length > 0) {
        for (const item of reviewsData.items.slice(0, 8)) {
          const rateNum = item.rate ? parseInt(item.rate, 10) : undefined;
          reviews.push({
            id: `review-${item.username}-${item.date}`,
            author: item.username,
            title: item.reviewTitle,
            content: item.reviewText,
            date: item.date,
            rating: !isNaN(Number(rateNum)) ? rateNum : undefined,
            source: 'IMDb',
            url: item.userUrl,
          });
        }
      }

      // 6. Process Awards
      const awards: MovieAwardItem[] = [];
      if (awardsData && awardsData.items && awardsData.items.length > 0) {
        for (const event of awardsData.items) {
          if (event.outcomeItems) {
            for (const outcome of event.outcomeItems) {
              const detailsText = outcome.outcomeDetails?.map((d) => d.plainText).join('; ') || '';
              awards.push({
                awardTitle: outcome.outcomeTitle || event.eventTitle,
                eventName: event.eventTitle,
                category: outcome.outcomeCategory,
                forYear: outcome.outcomeYear,
                isWinner: outcome.isWinner !== undefined ? outcome.isWinner : outcome.outcomeTitle.toLowerCase().includes('winner'),
                description: detailsText,
              });
            }
          }
        }
      }

      // 7. Process Wikipedia
      const wikipedia = titleData.wikipedia
        ? {
            title: titleData.wikipedia.title || movie.title,
            url: titleData.wikipedia.url,
            plotShort: titleData.wikipedia.plotShort?.plainText,
            plotFull: titleData.wikipedia.plotFull?.plainText,
          }
        : undefined;

      // 8. Process Box Office
      const boxOffice = titleData.boxOffice
        ? {
            budget: titleData.boxOffice.budget,
            openingWeekend: titleData.boxOffice.openingWeekendUSA,
            grossWorldwide: titleData.boxOffice.cumulativeWorldwideGross || titleData.boxOffice.grossUSA,
            cumulativeWorldwideGross: titleData.boxOffice.cumulativeWorldwideGross,
          }
        : undefined;

      // 9. Process External Sites
      const externalSites: { name: string; url: string; category?: string }[] = [
        { name: 'IMDb', url: `https://www.imdb.com/title/${imdbId}/` },
      ];
      if (movie.tmdbId) {
        externalSites.push({ name: 'TMDB', url: `https://www.themoviedb.org/movie/${movie.tmdbId}` });
      }
      if (titleData.wikipedia?.url) {
        externalSites.push({ name: 'Wikipedia', url: titleData.wikipedia.url });
      }

      // 10. Process Posters & Backdrops from TV-API
      const additionalPosters: string[] = [];
      if (titleData.posters?.posters) {
        for (const p of titleData.posters.posters.slice(0, 6)) {
          if (p.link && !additionalPosters.includes(p.link)) {
            additionalPosters.push(p.link);
          }
        }
      }

      return {
        ...movie,
        imdbId,
        imdbRating,
        metacriticRating,
        rottenTomatoesRating,
        ratingsList,
        cast: mergedCast,
        directors: directors.length > 0 ? directors : (movie.director ? [movie.director] : []),
        writers,
        stars,
        companies: companies.length > 0 ? companies : undefined,
        reviews: reviews.length > 0 ? reviews : movie.reviews,
        awardsSummary: titleData.awards || awardsData?.description || movie.awardsSummary,
        awards: awards.length > 0 ? awards : movie.awards,
        wikipedia: wikipedia || movie.wikipedia,
        boxOffice: boxOffice || movie.boxOffice,
        contentRating: titleData.contentRating || movie.contentRating,
        externalSites: externalSites.length > 0 ? externalSites : movie.externalSites,
        posters: additionalPosters.length > 0 ? additionalPosters : movie.posters,
      };
    } catch (err) {
      console.warn('TV-API enrichment failed gracefully:', err);
      return {
        ...movie,
        imdbId,
        ratingsList,
      };
    }
  }
}
