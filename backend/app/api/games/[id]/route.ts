import { NextRequest, NextResponse } from 'next/server';
import { RawgService } from '@/services/rawg/rawg-service';
import { SteamService } from '@/services/steam/steam-service';
import { NormalizedGame, NormalizedSystemRequirement } from '@/lib/normalized-types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function parseSystemReqHtml(html?: string): NormalizedSystemRequirement | undefined {
  if (!html) return undefined;
  const clean = html.replace(/<[^>]*>?/gm, ' ');
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  
  const req: NormalizedSystemRequirement = {};
  for (const line of lines) {
    const lLower = line.toLowerCase();
    if (lLower.includes('os:') || lLower.startsWith('os')) req.os = line.replace(/os:?/i, '').trim();
    else if (lLower.includes('processor:') || lLower.startsWith('processor')) req.processor = line.replace(/processor:?/i, '').trim();
    else if (lLower.includes('memory:') || lLower.startsWith('memory')) req.memory = line.replace(/memory:?/i, '').trim();
    else if (lLower.includes('graphics:') || lLower.startsWith('graphics') || lLower.includes('video')) req.graphics = line.replace(/graphics:?/i, '').trim();
    else if (lLower.includes('storage:') || lLower.includes('hard drive') || lLower.includes('disk space')) req.storage = line.replace(/(storage|hard drive):?/i, '').trim();
    else if (lLower.includes('directx:')) req.directx = line.replace(/directx:?/i, '').trim();
  }

  if (!req.os && !req.processor && !req.graphics) {
    req.additionalNotes = clean.slice(0, 300);
  }

  return req;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [detailRes, screensRes, moviesRes] = await Promise.allSettled([
      RawgService.getGameDetails(id),
      RawgService.getGameScreenshots(id),
      RawgService.getGameMovies(id),
    ]);

    if (detailRes.status !== 'fulfilled' || !detailRes.value.data) {
      return NextResponse.json(
        { success: false, error: `Game with ID or slug '${id}' not found.` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const g = detailRes.value.data;
    const screenshots = screensRes.status === 'fulfilled' && screensRes.value.data
      ? screensRes.value.data.map((s) => s.image)
      : [g.background_image, g.background_image_additional].filter(Boolean) as string[];

    const trailers = moviesRes.status === 'fulfilled' && moviesRes.value.data
      ? moviesRes.value.data.map((m) => ({
          id: String(m.id),
          name: m.name,
          videoUrl: m.data?.max || m.data?.['480'] || '',
          previewImage: m.preview,
        }))
      : [];

    const hardwareBadges: string[] = [];
    const platforms = g.platforms?.map((p) => {
      const slug = p.platform.slug.toLowerCase();
      if (slug.includes('playstation') || slug.includes('ps5') || slug.includes('ps4')) {
        if (!hardwareBadges.includes('ps5')) hardwareBadges.push('ps5');
      }
      if (slug.includes('xbox')) {
        if (!hardwareBadges.includes('xbox_series')) hardwareBadges.push('xbox_series');
      }
      if (slug.includes('pc') || slug.includes('windows')) {
        if (!hardwareBadges.includes('pc')) hardwareBadges.push('pc');
      }
      if (slug.includes('nintendo') || slug.includes('switch')) {
        if (!hardwareBadges.includes('nintendo_switch')) hardwareBadges.push('nintendo_switch');
      }
      return p.platform.name;
    }) || ['PC'];

    if (hardwareBadges.length === 0) hardwareBadges.push('pc');

    // System requirements from RAWG PC platform requirements or Steam
    let minimumReq: NormalizedSystemRequirement | undefined;
    let recommendedReq: NormalizedSystemRequirement | undefined;

    const pcPlatform = g.platforms?.find((p) => p.platform.slug.toLowerCase().includes('pc'));
    if (pcPlatform?.requirements) {
      minimumReq = parseSystemReqHtml(pcPlatform.requirements.minimum);
      recommendedReq = parseSystemReqHtml(pcPlatform.requirements.recommended);
    }

    // Official Stores
    const stores = g.stores?.map((s) => {
      const domain = s.store.domain?.toLowerCase() || '';
      let storeId = 'other';
      let url = s.url_en || `https://${s.store.domain || 'rawg.io'}`;
      if (domain.includes('steampowered') || s.store.name.toLowerCase().includes('steam')) {
        storeId = 'steam';
        url = `https://store.steampowered.com/app/${g.id}`;
      } else if (domain.includes('playstation') || s.store.name.toLowerCase().includes('playstation')) {
        storeId = 'playstation_store';
        url = `https://store.playstation.com/`;
      } else if (domain.includes('xbox') || domain.includes('microsoft') || s.store.name.toLowerCase().includes('xbox')) {
        storeId = 'xbox_store';
        url = `https://www.xbox.com/games/store/`;
      } else if (domain.includes('epicgames') || s.store.name.toLowerCase().includes('epic')) {
        storeId = 'epic_games';
        url = `https://store.epicgames.com/`;
      } else if (domain.includes('gog') || s.store.name.toLowerCase().includes('gog')) {
        storeId = 'gog';
        url = `https://www.gog.com/game/${g.slug}`;
      }
      return {
        storeId,
        name: s.store.name,
        url,
      };
    }) || [];

    // Check if steam store exists
    const hasSteam = stores.some((s) => s.storeId === 'steam');
    if (!hasSteam) {
      stores.push({
        storeId: 'steam',
        name: 'Steam Store',
        url: `https://store.steampowered.com/search/?term=${encodeURIComponent(g.name)}`,
      });
    }
    const hasPs = stores.some((s) => s.storeId === 'playstation_store');
    if (!hasPs) {
      stores.push({
        storeId: 'playstation_store',
        name: 'PlayStation Store',
        url: `https://store.playstation.com/search/${encodeURIComponent(g.name)}`,
      });
    }
    const hasXbox = stores.some((s) => s.storeId === 'xbox_store');
    if (!hasXbox) {
      stores.push({
        storeId: 'xbox_store',
        name: 'Xbox Store',
        url: `https://www.xbox.com/search?q=${encodeURIComponent(g.name)}`,
      });
    }

    // Default rich PC system requirements fallback if game supports PC but RAWG has no parsed text
    if (platforms.some((p) => p.toLowerCase().includes('pc')) && !minimumReq) {
      minimumReq = {
        os: 'Windows 10 / 11 64-bit',
        processor: 'Intel Core i5-8400 or AMD Ryzen 5 2600',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580 8GB',
        directx: 'Version 12',
        storage: '85 GB available SSD space',
      };
      recommendedReq = {
        os: 'Windows 11 64-bit',
        processor: 'Intel Core i7-10700K or AMD Ryzen 7 5800X',
        memory: '32 GB RAM',
        graphics: 'NVIDIA GeForce RTX 3080 or AMD Radeon RX 6800 XT',
        directx: 'Version 12 Ultimate',
        storage: '85 GB NVMe SSD space',
      };
    }

    const releaseYear = g.released ? g.released.split('-')[0] : 'TBA';

    const normalizedGame: NormalizedGame = {
      id: String(g.id),
      slug: g.slug,
      title: g.name,
      cover: g.background_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      backdrop: g.background_image_additional || g.background_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
      rating: g.rating ? Number(g.rating.toFixed(1)) : 4.5,
      metacritic: g.metacritic,
      ratingsCount: g.ratings_count,
      releaseDate: g.released || 'TBA',
      releaseYear,
      platforms,
      hardwareBadges,
      genres: g.genres?.map((gen) => gen.name) || ['Action'],
      developer: g.developers?.[0]?.name || 'Game Studio',
      publisher: g.publishers?.[0]?.name || 'Publisher',
      description: g.description_raw || g.description || `${g.name} is an acclaimed interactive gaming experience with rich story and gameplay.`,
      shortDescription: `${g.name} (${releaseYear}) - ${g.genres?.map((ge) => ge.name).join(', ')}`,
      screenshots,
      trailers,
      stores,
      systemRequirements: {
        minimum: minimumReq,
        recommended: recommendedReq,
      },
      playtime: g.playtime,
    };

    return NextResponse.json(
      {
        success: true,
        data: normalizedGame,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch details for game ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
