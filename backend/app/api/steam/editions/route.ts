import { NextRequest, NextResponse } from 'next/server';
import { GameEdition } from '@/lib/game-types';
import { categorizeEditionType, formatCurrencyPrice } from '@/lib/unified-store';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId') || searchParams.get('id') || '';
  const country = searchParams.get('country') || searchParams.get('cc') || 'us';
  const language = searchParams.get('language') || searchParams.get('l') || 'en';

  if (!appId) {
    return NextResponse.json(
      {
        success: false,
        error: 'MISSING_PARAM',
        message: "Query parameter 'appId' is required for Steam editions lookup.",
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Attempt live upstream fetch
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
        const mainName = d.name || 'Game';
        const isFree = d.is_free || false;
        const packageGroups = d.package_groups || [];
        const editions: GameEdition[] = [];

        if (packageGroups.length > 0) {
          for (const grp of packageGroups) {
            if (grp.subs && Array.isArray(grp.subs)) {
              for (const sub of grp.subs) {
                const subId = String(sub.packageid);
                let subName = sub.option_text || `${mainName} Option`;
                // Clean price strings from option text if attached
                if (subName.includes(' - $') || subName.includes(' - €') || subName.includes(' - £')) {
                  subName = subName.split(' - ')[0];
                }

                const disc = sub.percent_savings || 0;
                const priceCents = sub.price_in_cents_with_discount || 0;
                const formattedDiscounted = isFree || sub.is_free_license || priceCents === 0
                  ? 'Free to Play'
                  : formatCurrencyPrice(priceCents, 'USD');

                let formattedBase: string | undefined = undefined;
                if (disc > 0 && priceCents > 0) {
                  const baseCents = Math.round(priceCents / (1 - disc / 100));
                  formattedBase = formatCurrencyPrice(baseCents, 'USD');
                }

                editions.push({
                  id: `${appId}-${subId}`,
                  name: subName.trim(),
                  editionType: categorizeEditionType(subName),
                  price: {
                    formattedBasePrice: formattedBase,
                    formattedDiscountedPrice: formattedDiscounted,
                    discountPercentage: disc,
                    isFree: isFree || sub.is_free_license || priceCents === 0,
                  },
                  originalPrice: formattedBase,
                  discountPercentage: disc,
                  currency: 'USD',
                  isFree: isFree || sub.is_free_license || priceCents === 0,
                  storeUrl: `https://store.steampowered.com/app/${appId}`,
                  platform: 'PC',
                });
              }
            }
          }
        }

        if (editions.length > 0) {
          return NextResponse.json(
            {
              success: true,
              source: 'live',
              appId,
              count: editions.length,
              data: editions,
            },
            { status: 200, headers: CORS_HEADERS }
          );
        }

        // Single fallback edition from base app data
        const singlePrice = d.price_overview;
        const disc = singlePrice?.discount_percent || 0;
        const singleEdition: GameEdition[] = [
          {
            id: `${appId}-std`,
            name: `${mainName} Standard Edition`,
            editionType: 'STANDARD',
            price: {
              formattedBasePrice: singlePrice?.initial_formatted,
              formattedDiscountedPrice: singlePrice?.final_formatted || (isFree ? 'Free to Play' : ''),
              discountPercentage: disc,
              isFree,
            },
            originalPrice: singlePrice?.initial_formatted,
            discountPercentage: disc,
            currency: singlePrice?.currency || 'USD',
            isFree,
            storeUrl: `https://store.steampowered.com/app/${appId}`,
            platform: 'PC',
          },
        ];

        return NextResponse.json(
          {
            success: true,
            source: 'live',
            appId,
            count: singleEdition.length,
            data: singleEdition,
          },
          { status: 200, headers: CORS_HEADERS }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'APP_NOT_FOUND',
            message: `Steam App ID '${appId}' does not exist or has no package information.`,
            timestamp: new Date().toISOString(),
          },
          { status: 404, headers: CORS_HEADERS }
        );
      }
    }
  } catch {
    // Graceful fallback below
  }

  return NextResponse.json(
    {
      success: false,
      error: 'EDITIONS_NOT_FOUND',
      message: `No editions found for Steam App ID '${appId}'.`,
      appId,
      count: 0,
      data: [],
    },
    { status: 404, headers: CORS_HEADERS }
  );
}
