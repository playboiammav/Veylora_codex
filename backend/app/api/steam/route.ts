import { NextRequest, NextResponse } from 'next/server';
import { GameItem, PcRequirements } from '@/lib/game-types';
import { normalizeHardwarePlatforms } from '@/lib/platform-utils';
import { cleanHtmlRequirements, formatCurrencyPrice } from '@/lib/unified-store';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId') || searchParams.get('appids') || '';
  const country = searchParams.get('country') || searchParams.get('cc') || 'us';
  const language = searchParams.get('language') || searchParams.get('l') || 'en';

  // If specific appId requested
  if (appId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const upstreamUrl = `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appId)}&cc=${encodeURIComponent(country)}&l=${encodeURIComponent(language)}`;
      const res = await fetch(upstreamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const appData = json?.[appId];

        if (appData && appData.success && appData.data) {
          const d = appData.data;
          const isFree = d.is_free || false;
          const priceOverview = d.price_overview;

          let formattedBasePrice = priceOverview?.initial_formatted;
          let formattedDiscountedPrice = priceOverview?.final_formatted || (isFree ? 'Free to Play' : undefined);
          const discountPercentage = priceOverview?.discount_percent || 0;

          if (isFree) {
            formattedDiscountedPrice = 'Free to Play';
            formattedBasePrice = undefined;
          }

          // Hardware flags from Steam
          const hardwareList: string[] = [];
          if (d.platforms?.windows) hardwareList.push('windows');
          if (d.platforms?.mac) hardwareList.push('mac');
          if (d.platforms?.linux) hardwareList.push('linux');
          if (hardwareList.length === 0) hardwareList.push('pc');

          const normalizedHw = normalizeHardwarePlatforms(hardwareList);

          const minReqStr = cleanHtmlRequirements(d.pc_requirements?.minimum);
          const recReqStr = cleanHtmlRequirements(d.pc_requirements?.recommended);

          const pcReqs: PcRequirements | undefined = (minReqStr || recReqStr) ? {
            minimum: minReqStr ? { additionalNotes: minReqStr } : undefined,
            recommended: recReqStr ? { additionalNotes: recReqStr } : undefined,
          } : undefined;

          const singleItem: GameItem = {
            id: String(d.steam_appid || appId),
            title: d.name || 'Steam Game',
            platform: 'PC',
            supportedHardware: normalizedHw.length > 0 ? normalizedHw : ['pc'],
            genres: d.genres?.map((g: any) => g.description) || ['Action'],
            coverImage: d.header_image || '',
            bannerImage: d.capsule_image || d.header_image,
            price: {
              formattedBasePrice: formattedBasePrice || (discountPercentage > 0 ? formattedDiscountedPrice : undefined),
              formattedDiscountedPrice,
              discountPercentage,
              isFree,
            },
            rating: 4.8,
            releaseDate: d.release_date?.date || 'Available Now',
            developer: d.developers?.join(', ') || 'Valve / Developer',
            publisher: d.publishers?.join(', ') || 'Publisher',
            description: d.short_description || d.detailed_description?.substring(0, 300) || '',
            badges: [
              ...(d.categories?.slice(0, 3).map((c: any) => c.description) || []),
              ...(discountPercentage > 0 ? [`-${discountPercentage}% Special`] : []),
            ],
            storeUrl: `https://store.steampowered.com/app/${appId}`,
            officialStores: [
              {
                storeId: 'steam',
                name: 'Steam',
                url: `https://store.steampowered.com/app/${appId}`,
                color: '#171A21',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
                price: formattedDiscountedPrice,
              },
            ],
            pcRequirements: pcReqs,
          };

          return NextResponse.json(
            {
              success: true,
              source: 'live',
              endpoint: 'https://store.steampowered.com/api/appdetails',
              timestamp: new Date().toISOString(),
              count: 1,
              data: [singleItem],
            },
            { status: 200, headers: CORS_HEADERS }
          );
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'APP_NOT_FOUND',
              message: `Steam App ID '${appId}' does not exist or has restricted store visibility.`,
              timestamp: new Date().toISOString(),
            },
            { status: 404, headers: CORS_HEADERS }
          );
        }
      }
    } catch {
      // Fallback below
    }

    return NextResponse.json(
      {
        success: false,
        error: 'STEAM_STORE_UNAVAILABLE',
        message: `Steam Store service unavailable or app '${appId}' could not be retrieved.`,
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  // Catalog listing (featured / specials)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const featuredUrl = `https://store.steampowered.com/api/featuredcategories/?cc=${encodeURIComponent(country)}&l=${encodeURIComponent(language)}`;
    const res = await fetch(featuredUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const specials = json?.specials?.items || [];
      const topSellers = json?.top_sellers?.items || [];
      const combined = [...specials, ...topSellers];

      if (combined.length > 0) {
        const seenIds = new Set<string>();
        const formattedList: GameItem[] = [];

        for (const item of combined) {
          const strId = String(item.id);
          if (seenIds.has(strId)) continue;
          seenIds.add(strId);

          const disc = item.discount_percent || 0;
          const finalPriceCents = item.final_price || 0;
          const origPriceCents = item.original_price || finalPriceCents;
          const curr = item.currency || 'USD';

          const formattedFinal = formatCurrencyPrice(finalPriceCents, curr);
          const formattedBase = disc > 0 ? formatCurrencyPrice(origPriceCents, curr) : undefined;

          const hw: string[] = [];
          if (item.windows_available) hw.push('windows');
          if (item.mac_available) hw.push('mac');
          if (item.linux_available) hw.push('linux');
          if (hw.length === 0) hw.push('pc');

          formattedList.push({
            id: strId,
            title: item.name || 'Steam Game',
            platform: 'PC',
            supportedHardware: normalizeHardwarePlatforms(hw),
            genres: ['Action', 'Featured on Steam'],
            coverImage: item.header_image || item.large_capsule_image || '',
            bannerImage: item.large_capsule_image || item.header_image,
            price: {
              formattedBasePrice: formattedBase,
              formattedDiscountedPrice: formattedFinal,
              discountPercentage: disc,
              isFree: finalPriceCents === 0,
            },
            rating: 4.8,
            releaseDate: 'Available on Steam',
            developer: 'Valve / Steam Publisher',
            publisher: 'Steam Partner',
            description: `${item.name} is available on Steam for PC.`,
            badges: [
              ...(disc > 0 ? [`-${disc}% Sale`] : ['Top Seller']),
              'Steam Cloud',
            ],
            storeUrl: `https://store.steampowered.com/app/${strId}`,
            officialStores: [
              {
                storeId: 'steam',
                name: 'Steam',
                url: `https://store.steampowered.com/app/${strId}`,
                color: '#171A21',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
                price: formattedFinal,
              },
            ],
          });
        }

        return NextResponse.json(
          {
            success: true,
            source: 'live',
            endpoint: 'https://store.steampowered.com/api/featuredcategories',
            timestamp: new Date().toISOString(),
            count: formattedList.length,
            data: formattedList,
          },
          { status: 200, headers: CORS_HEADERS }
        );
      }
    }
  } catch {
    // Graceful fallback below
  }

  return NextResponse.json(
    {
      success: false,
      error: 'STEAM_STORE_UNAVAILABLE',
      message: 'Steam store upstream service is unavailable or returned no products.',
      timestamp: new Date().toISOString(),
      count: 0,
      data: [],
    },
    { status: 503, headers: CORS_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  return GET(request);
}
