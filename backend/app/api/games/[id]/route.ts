import { NextRequest, NextResponse } from 'next/server';
import { RawgService } from '@/services/rawg/rawg-service';
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

  // 1. Replace HTML breaks and block tags with newlines
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // 2. Separate concatenated keywords that lack line breaks (e.g. "Minimum:OS: Windows...Processor: Intel...")
  const kwList = [
    'Minimum', 'Recommended', 'Requires a 64-bit',
    'OS', 'Operating System', 'Processor', 'CPU', 'Memory', 'RAM',
    'Graphics', 'Video Card', 'GPU', 'VRAM', 'Video Memory',
    'Storage', 'Hard Drive', 'Disk Space', 'Hard Disk Space',
    'DirectX', 'Direct X', 'Vulkan', 'OpenGL', 'Open GL',
    'Sound Card', 'Sound', 'Network', 'Additional Notes', 'Notes'
  ];
  kwList.sort((a, b) => b.length - a.length);
  const regex = new RegExp('([a-zA-Z0-9\\)\\.\\*\\:])(' + kwList.join('|') + '):', 'gi');
  text = text.replace(regex, '$1\n$2:');

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const req: NormalizedSystemRequirement = {};

  for (const line of lines) {
    const lLower = line.toLowerCase();
    if (lLower.startsWith('os:') || lLower.startsWith('operating system:')) {
      req.os = line.replace(/^(os|operating system):?/i, '').trim();
    } else if (lLower.startsWith('processor:') || lLower.startsWith('cpu:')) {
      req.processor = line.replace(/^(processor|cpu):?/i, '').trim();
    } else if (lLower.startsWith('memory:') || lLower.startsWith('ram:')) {
      req.memory = line.replace(/^(memory|ram):?/i, '').trim();
    } else if (lLower.startsWith('graphics:') || lLower.startsWith('video card:') || lLower.startsWith('gpu:')) {
      req.graphics = line.replace(/^(graphics|video card|gpu):?/i, '').trim();
    } else if (lLower.startsWith('vram:') || lLower.startsWith('video memory:')) {
      req.vram = line.replace(/^(vram|video memory):?/i, '').trim();
    } else if (
      lLower.startsWith('storage:') ||
      lLower.startsWith('hard drive:') ||
      lLower.startsWith('disk space:') ||
      lLower.startsWith('hard disk space:') ||
      lLower.startsWith('available space:')
    ) {
      req.storage = line.replace(/^(storage|hard drive|disk space|hard disk space|available space):?/i, '').trim();
    } else if (lLower.startsWith('directx:') || lLower.startsWith('direct x:')) {
      req.directx = line.replace(/^(directx|direct x):?/i, '').trim();
    } else if (lLower.startsWith('vulkan:')) {
      req.vulkan = line.replace(/^vulkan:?/i, '').trim();
    } else if (lLower.startsWith('opengl:') || lLower.startsWith('open gl:')) {
      req.opengl = line.replace(/^(opengl|open gl):?/i, '').trim();
    } else if (lLower.startsWith('additional notes:') || lLower.startsWith('notes:')) {
      req.additionalNotes = line.replace(/^(additional notes|notes):?/i, '').trim();
    }
  }

  // Check for inline mentions of Vulkan, OpenGL, DirectX, VRAM in graphics or notes if not yet populated
  if (!req.vulkan) {
    const vulkanMatch = text.match(/vulkan\s*(?:version\s*|api\s*)?([0-9]+(?:\.[0-9]+)*)?/i);
    if (vulkanMatch) {
      req.vulkan = vulkanMatch[1] ? `Vulkan ${vulkanMatch[1]}` : 'Vulkan supported';
    }
  }

  if (!req.opengl) {
    const openglMatch = text.match(/opengl\s*(?:version\s*|api\s*)?([0-9]+(?:\.[0-9]+)*)?/i);
    if (openglMatch) {
      req.opengl = openglMatch[1] ? `OpenGL ${openglMatch[1]}` : 'OpenGL supported';
    }
  }

  if (!req.vram && req.graphics) {
    const vramMatch = req.graphics.match(/(\d+\s*(?:gb|mb)\s*(?:vram|video memory)?)/i);
    if (vramMatch) {
      req.vram = vramMatch[1];
    }
  }

  if (!req.os && !req.processor && !req.graphics) {
    req.additionalNotes = text.slice(0, 500).trim();
  }

  return req;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [detailRes, screensRes, moviesRes, storesRes] = await Promise.allSettled([
      RawgService.getGameDetails(id),
      RawgService.getGameScreenshots(id),
      RawgService.getGameMovies(id),
      RawgService.getGameStores(id),
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

    // Hardware platform badges (strict segregation: stores never enter hardwareBadges)
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

    // Separate PC, Mac, and Linux requirements (never copy PC into Mac/Linux)
    const pcPlatform = g.platforms?.find(
      (p) => p.platform.slug.toLowerCase() === 'pc' || p.platform.slug.toLowerCase().includes('pc')
    );
    const macPlatform = g.platforms?.find(
      (p) => p.platform.slug.toLowerCase() === 'macos' || p.platform.slug.toLowerCase() === 'mac'
    );
    const linuxPlatform = g.platforms?.find(
      (p) => p.platform.slug.toLowerCase() === 'linux'
    );

    const minimumReq = parseSystemReqHtml(pcPlatform?.requirements?.minimum);
    const recommendedReq = parseSystemReqHtml(pcPlatform?.requirements?.recommended);
    const macMinimumReq = parseSystemReqHtml(macPlatform?.requirements?.minimum);
    const macRecommendedReq = parseSystemReqHtml(macPlatform?.requirements?.recommended);
    const linuxMinimumReq = parseSystemReqHtml(linuxPlatform?.requirements?.minimum);
    const linuxRecommendedReq = parseSystemReqHtml(linuxPlatform?.requirements?.recommended);

    // Official Stores: Map real game-specific store deep links from RAWG stores endpoint
    const rawgStores = storesRes.status === 'fulfilled' && storesRes.value.data
      ? storesRes.value.data
      : [];

    const storeUrlMap = new Map<number, string>();
    for (const s of rawgStores) {
      if (s.url) {
        if (s.store_id) storeUrlMap.set(s.store_id, s.url);
        if (s.id) storeUrlMap.set(s.id, s.url);
      }
    }

    let steamUrl: string | undefined;
    let steamAppId: number | undefined;

    const stores = g.stores?.map((s) => {
      const storeIdNum = s.store?.id || s.id;
      const domain = s.store?.domain?.toLowerCase() || '';
      const storeName = s.store?.name?.toLowerCase() || '';
      const realUrl = storeUrlMap.get(storeIdNum) || storeUrlMap.get(s.id) || s.url || s.url_en;

      let storeId = 'other';
      if (domain.includes('steampowered') || storeName.includes('steam')) {
        storeId = 'steam';
      } else if (domain.includes('playstation') || storeName.includes('playstation')) {
        storeId = 'playstation_store';
      } else if (domain.includes('xbox') || domain.includes('microsoft') || storeName.includes('xbox')) {
        storeId = 'xbox_store';
      } else if (domain.includes('epicgames') || storeName.includes('epic')) {
        storeId = 'epic_games';
      } else if (domain.includes('gog') || storeName.includes('gog')) {
        storeId = 'gog';
      } else if (domain.includes('nintendo') || storeName.includes('nintendo') || storeName.includes('eshop')) {
        storeId = 'nintendo_eshop';
      } else if (domain.includes('apple') || storeName.includes('apple') || storeName.includes('app store')) {
        storeId = 'apple_store';
      } else if (domain.includes('google') || storeName.includes('google play')) {
        storeId = 'google_play';
      } else if (domain.includes('itch.io') || storeName.includes('itch')) {
        storeId = 'itch_io';
      }

      const finalUrl = realUrl || (s.store?.domain ? `https://${s.store.domain}` : 'https://rawg.io');

      if (storeId === 'steam' && finalUrl) {
        steamUrl = finalUrl;
        const appMatch = finalUrl.match(/\/app\/(\d+)/);
        if (appMatch) {
          steamAppId = parseInt(appMatch[1], 10);
        }
      }

      return {
        storeId,
        name: s.store?.name || 'Official Store',
        url: finalUrl,
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
        macMinimum: macMinimumReq,
        macRecommended: macRecommendedReq,
        linuxMinimum: linuxMinimumReq,
        linuxRecommended: linuxRecommendedReq,
      },
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
      steamAppId,
      steamUrl,
      playtime: g.playtime,
      dominantColor: (g as any).dominant_color,
      saturatedColor: (g as any).saturated_color,
      rawRequirements: {
        minimum: pcPlatform?.requirements?.minimum,
        recommended: pcPlatform?.requirements?.recommended,
        macMinimum: macPlatform?.requirements?.minimum,
        macRecommended: macPlatform?.requirements?.recommended,
        linuxMinimum: linuxPlatform?.requirements?.minimum,
        linuxRecommended: linuxPlatform?.requirements?.recommended,
      },
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
