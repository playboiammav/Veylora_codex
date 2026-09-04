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

    const releaseYear = g.released ? g.released.split('-')[0] : 'TBA';

    const normalizedGame: NormalizedGame = {
      id: String(g.id),
      slug: g.slug,
      title: g.name,
      cover: g.background_image || '',
      backdrop: g.background_image_additional || g.background_image || '',
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
      screenshots,
      trailers,
      stores,
      systemRequirements: {
        minimum: minimumReq,
        recommended: recommendedReq,
      },
      publishersList: g.publishers?.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
      developersList: g.developers?.map((d) => ({ id: d.id, name: d.name, slug: d.slug })),
      website: g.website,
      playtime: g.playtime,
      dominantColor: (g as any).dominant_color,
      saturatedColor: (g as any).saturated_color,
      rawRequirements: pcPlatform?.requirements,
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
