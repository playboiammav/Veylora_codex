import { NextRequest, NextResponse } from 'next/server';
import { RawgService, RawgGame } from '@/services/rawg/rawg-service';
import { NormalizedGame } from '@/lib/normalized-types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function normalizeRawgGame(g: RawgGame, rank?: number): NormalizedGame {
  const hardwareBadges: string[] = [];
  const platforms = g.platforms?.map((p) => {
    const slug = p.platform.slug.toLowerCase();

    // PlayStation
    if (slug === 'playstation5' || slug === 'ps5') {
      if (!hardwareBadges.includes('ps5')) hardwareBadges.push('ps5');
    } else if (slug === 'playstation4' || slug === 'ps4') {
      if (!hardwareBadges.includes('ps4')) hardwareBadges.push('ps4');
    } else if (slug === 'ps5-pro' || slug === 'playstation-5-pro') {
      if (!hardwareBadges.includes('ps5_pro')) hardwareBadges.push('ps5_pro');
    } else if (slug === 'ps4-pro' || slug === 'playstation-4-pro') {
      if (!hardwareBadges.includes('ps4_pro')) hardwareBadges.push('ps4_pro');
    } else if (slug.includes('playstation') || slug.includes('ps-vita') || slug.includes('psp')) {
      if (slug.includes('vita')) {
        if (!hardwareBadges.includes('ps_vita')) hardwareBadges.push('ps_vita');
      } else if (!hardwareBadges.includes('ps5') && !hardwareBadges.includes('ps4')) {
        hardwareBadges.push('ps5');
      }
    }

    // Xbox
    if (slug.includes('series-x') || slug.includes('series-s') || slug === 'xbox-series') {
      if (!hardwareBadges.includes('xbox_series')) hardwareBadges.push('xbox_series');
    } else if (slug === 'xbox-one' || slug.includes('xboxone')) {
      if (!hardwareBadges.includes('xbox_one')) hardwareBadges.push('xbox_one');
    } else if (slug === 'xbox360' || slug.includes('xbox-360')) {
      if (!hardwareBadges.includes('xbox_360')) hardwareBadges.push('xbox_360');
    } else if (slug.includes('xbox')) {
      if (!hardwareBadges.includes('xbox_series') && !hardwareBadges.includes('xbox_one')) {
        hardwareBadges.push('xbox_series');
      }
    }

    // Desktops / Mobile
    if (slug === 'pc' || slug === 'windows') {
      if (!hardwareBadges.includes('pc')) hardwareBadges.push('pc');
    }
    if (slug === 'macos' || slug === 'mac') {
      if (!hardwareBadges.includes('mac')) hardwareBadges.push('mac');
    }
    if (slug === 'linux') {
      if (!hardwareBadges.includes('linux')) hardwareBadges.push('linux');
    }
    if (slug === 'android') {
      if (!hardwareBadges.includes('android')) hardwareBadges.push('android');
    }
    if (slug === 'ios') {
      if (!hardwareBadges.includes('ios')) hardwareBadges.push('ios');
    }
    if (slug.includes('switch') || slug === 'nintendo-switch') {
      if (!hardwareBadges.includes('nintendo_switch')) hardwareBadges.push('nintendo_switch');
    }

    return p.platform.name;
  }) || ['PC'];

  if (hardwareBadges.length === 0) hardwareBadges.push('pc');

  const releaseYear = g.released ? g.released.split('-')[0] : 'TBA';

  const stores = g.stores?.map((s) => {
    const domain = s.store.domain?.toLowerCase() || '';
    const storeName = s.store.name?.toLowerCase() || '';
    let storeId = 'other';
    let url = `https://${s.store.domain || 'rawg.io'}`;
    if (domain.includes('steampowered') || storeName.includes('steam')) {
      storeId = 'steam';
      url = 'https://store.steampowered.com/';
    } else if (domain.includes('playstation') || storeName.includes('playstation')) {
      storeId = 'playstation_store';
      url = 'https://store.playstation.com/';
    } else if (domain.includes('xbox') || domain.includes('microsoft') || storeName.includes('xbox')) {
      storeId = 'xbox_store';
      url = 'https://www.xbox.com/games/store/';
    } else if (domain.includes('epicgames') || storeName.includes('epic')) {
      storeId = 'epic_games';
      url = 'https://store.epicgames.com/';
    } else if (domain.includes('gog') || storeName.includes('gog')) {
      storeId = 'gog';
      url = `https://www.gog.com/game/${g.slug}`;
    }
    return {
      storeId,
      name: s.store.name,
      url,
    };
  }) || [];

  return {
    id: String(g.id),
    slug: g.slug,
    title: g.name,
    cover: g.background_image || '',
    backdrop: g.background_image || '',
    rating: g.rating ? Number(g.rating.toFixed(1)) : 0,
    metacritic: g.metacritic,
    ratingsCount: g.ratings_count,
    releaseDate: g.released || 'TBA',
    releaseYear,
    platforms,
    hardwareBadges,
    genres: g.genres?.map((gen) => gen.name) || ['Action'],
    developer: g.developers?.[0]?.name,
    publisher: g.publishers?.[0]?.name,
    description: g.description_raw || g.description || '',
    shortDescription: g.released ? `${g.name} (${releaseYear})` : g.name,
    screenshots: g.short_screenshots?.map((s) => s.image).filter(Boolean) || (g.background_image ? [g.background_image] : []),
    stores,
    rank,
    playtime: g.playtime,
    dominantColor: (g as any).dominant_color,
    saturatedColor: (g as any).saturated_color,
    publishersList: g.publishers?.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      imageBackground: p.image_background,
      imageUrl: p.image_background,
    })),
    developersList: g.developers?.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      imageBackground: d.image_background,
      imageUrl: d.image_background,
    })),
    website: g.website,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'trending';
  const search = searchParams.get('search') || searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('page_size') || '20', 10);
  const genres = searchParams.get('genres') || searchParams.get('genre') || '';
  const publishers = searchParams.get('publishers') || undefined;
  const developers = searchParams.get('developers') || undefined;
  const parentPlatforms = searchParams.get('parent_platforms') || undefined;

  try {
    let ordering = '-rating';
    let dates: string | undefined = undefined;
    let targetGenres = genres || undefined;

    if (category === 'rpg' || category === 'rpg_trending') {
      targetGenres = targetGenres || '5,role-playing-games-rpg';
      ordering = '-added';
      const now = new Date();
      const past = new Date();
      past.setMonth(now.getMonth() - 24);
      const startStr = past.toISOString().split('T')[0];
      const endStr = now.toISOString().split('T')[0];
      dates = `${startStr},${endStr}`;
    } else if (category === 'rpg_popular') {
      targetGenres = targetGenres || '5,role-playing-games-rpg';
      ordering = '-rating';
    } else if (category === 'rpg_top') {
      targetGenres = targetGenres || '5,role-playing-games-rpg';
      ordering = '-metacritic';
    } else if (category === 'rpg_upcoming') {
      targetGenres = targetGenres || '5,role-playing-games-rpg';
      ordering = '-added';
      const now = new Date();
      const future = new Date();
      future.setMonth(now.getMonth() + 12);
      const startStr = now.toISOString().split('T')[0];
      const endStr = future.toISOString().split('T')[0];
      dates = `${startStr},${endStr}`;
    } else if (category === 'trending') {
      ordering = '-added';
      // Recent releases from last 18 months
      const now = new Date();
      const past = new Date();
      past.setMonth(now.getMonth() - 18);
      const startStr = past.toISOString().split('T')[0];
      const endStr = now.toISOString().split('T')[0];
      dates = `${startStr},${endStr}`;
    } else if (category === 'upcoming') {
      ordering = '-added';
      const now = new Date();
      const future = new Date();
      future.setMonth(now.getMonth() + 12);
      const startStr = now.toISOString().split('T')[0];
      const endStr = future.toISOString().split('T')[0];
      dates = `${startStr},${endStr}`;
    } else if (category === 'top50' || category === 'top') {
      ordering = '-metacritic';
    } else if (category === 'recently_released' || category === 'recent') {
      ordering = '-released';
      const now = new Date();
      const past = new Date();
      past.setMonth(now.getMonth() - 12);
      const startStr = past.toISOString().split('T')[0];
      const endStr = now.toISOString().split('T')[0];
      dates = `${startStr},${endStr}`;
    }

    const queryOrdering = searchParams.get('ordering');
    if (queryOrdering) ordering = queryOrdering;

    const queryDates = searchParams.get('dates');
    if (queryDates) dates = queryDates;

    const rawgRes = await RawgService.getGames({
      page,
      page_size: pageSize,
      search: search || undefined,
      ordering,
      genres: targetGenres,
      dates,
      publishers,
      developers,
      parent_platforms: parentPlatforms,
    });

    const normalizedData: NormalizedGame[] = rawgRes.data.map((g, idx) => {
      const rank = category === 'top50' || category === 'top' ? (page - 1) * pageSize + idx + 1 : undefined;
      return normalizeRawgGame(g, rank);
    });

    return NextResponse.json(
      {
        success: true,
        category,
        page,
        pageSize,
        count: normalizedData.length,
        total: rawgRes.count,
        source: rawgRes.source,
        data: normalizedData,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch normalized games.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
