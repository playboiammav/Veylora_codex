import { NextRequest, NextResponse } from 'next/server';
import { GameEdition } from '@/lib/game-types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-psn-store-locale-override',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function categorizeEditionType(title: string): GameEdition['editionType'] {
  const lower = title.toLowerCase();
  if (lower.includes('ultimate')) return 'ULTIMATE';
  if (lower.includes('deluxe') || lower.includes('digital deluxe') || lower.includes('super citizen')) return 'DELUXE';
  if (lower.includes('premium')) return 'PREMIUM';
  if (lower.includes('gold')) return 'GOLD';
  if (lower.includes('complete') || lower.includes("director's cut") || lower.includes('goty')) return 'COMPLETE';
  if (lower.includes('standard')) return 'STANDARD';
  return 'OTHER';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conceptId = searchParams.get('conceptId') || searchParams.get('id') || '';
  const locale = searchParams.get('locale') || 'en-us';

  if (!conceptId) {
    return NextResponse.json(
      {
        success: false,
        error: 'MISSING_PARAM',
        message: "Query parameter 'conceptId' or 'id' is required for PlayStation editions lookup.",
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Attempt upstream Sony concept fetch
  try {
    const variables = {
      conceptId,
      locale,
    };
    const sha256Hash = '9845afc0dbaab4965f6563fffc703f588c8e76792000e8610843b8d3ee9c4c09';
    const extensions = JSON.stringify({ persistedQuery: { version: 1, sha256Hash } });
    const url = `https://web.np.playstation.com/api/graphql/v1/op?operationName=categoryGridRetrieve&variables=${encodeURIComponent(JSON.stringify(variables))}&extensions=${encodeURIComponent(extensions)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'x-psn-store-locale-override': locale,
        'Origin': 'https://store.playstation.com',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      const products = json?.data?.categoryGridRetrieve?.products || [];

      if (products.length > 0) {
        const editions: GameEdition[] = products.map((p: any) => {
          const priceObj = p.price || {};
          const name = p.name || 'Standard Edition';
          return {
            id: p.id,
            name,
            editionType: categorizeEditionType(name),
            price: {
              formattedBasePrice: priceObj.basePrice || undefined,
              formattedDiscountedPrice: priceObj.discountedPrice || priceObj.basePrice || undefined,
              discountPercentage: priceObj.discountPercentage || 0,
              isFree: priceObj.isFree || false,
            },
            originalPrice: priceObj.basePrice,
            discountPercentage: priceObj.discountPercentage || 0,
            currency: 'USD',
            isFree: priceObj.isFree || false,
            storeUrl: `https://store.playstation.com/concept/${p.id}`,
            platform: 'PlayStation',
          };
        });

        return NextResponse.json(
          {
            success: true,
            source: 'live',
            conceptId,
            count: editions.length,
            data: editions,
          },
          { status: 200, headers: CORS_HEADERS }
        );
      }
    }
  } catch {
    // Upstream failure handled below
  }

  return NextResponse.json(
    {
      success: false,
      error: 'EDITIONS_NOT_FOUND',
      message: `No editions found for PlayStation concept '${conceptId}'.`,
      conceptId,
      count: 0,
      data: [],
    },
    { status: 404, headers: CORS_HEADERS }
  );
}
