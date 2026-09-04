import { NextRequest, NextResponse } from 'next/server';
import { GameItem } from '@/lib/game-types';
import { normalizeHardwarePlatforms } from '@/lib/platform-utils';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-psn-store-locale-override',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

const PS_STORE_SHA256_HASH = '9845afc0dbaab4965f6563fffc703f588c8e76792000e8610843b8d3ee9c4c09';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category') || '3c64704f-124a-4424-aa6a-68df9f935c10';
  const size = searchParams.get('size') || '24';
  const offset = searchParams.get('offset') || '0';
  const locale = searchParams.get('locale') || 'en-us';

  const variables = {
    id: categoryId,
    pageArgs: {
      size: Math.min(Math.max(1, parseInt(size, 10) || 24), 60),
      offset: Math.max(0, parseInt(offset, 10) || 0),
    },
    sortBy: null,
    filterBy: [],
    facetOptions: [],
  };

  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: PS_STORE_SHA256_HASH,
    },
  };

  const url = `https://web.np.playstation.com/api/graphql/v1/op?operationName=categoryGridRetrieve&variables=${encodeURIComponent(
    JSON.stringify(variables)
  )}&extensions=${encodeURIComponent(JSON.stringify(extensions))}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let rawData: any = null;
    let gridData: any = null;
    let products: any[] = [];

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': `${locale},en;q=0.9`,
          'x-psn-store-locale-override': locale,
          'Origin': 'https://store.playstation.com',
          'Referer': `https://store.playstation.com/${locale}/pages/deals`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        rawData = await response.json();
        if (!rawData?.errors && rawData?.data?.categoryGridRetrieve) {
          gridData = rawData.data.categoryGridRetrieve;
          products = gridData.products || [];
        }
      }
    } catch {
      // Graceful timeout or upstream network isolation in container
    }

    if (products && products.length > 0) {
      const formattedProducts: GameItem[] = products.map((item: any) => {
        const priceObj = item.price || {};
        const media = item.media || [];
        const primaryImage = media.find((m: any) => m.role === 'MASTER' || m.role === 'BACKGROUND' || m.role === 'PREVIEW')?.url || media[0]?.url;
        const rawPlatforms = item.platforms || ['PS5', 'PS4'];
        const supportedHardware = normalizeHardwarePlatforms(rawPlatforms);

        return {
          id: item.id,
          title: item.name || 'PlayStation Title',
          platform: 'PlayStation',
          supportedHardware: supportedHardware.length > 0 ? supportedHardware : ['ps5', 'ps4'],
          genres: item.genres || ['Action', 'Adventure'],
          coverImage: primaryImage || '',
          bannerImage: primaryImage,
          price: {
            formattedBasePrice: priceObj.basePrice || undefined,
            formattedDiscountedPrice: priceObj.discountedPrice || priceObj.basePrice || undefined,
            discountPercentage: priceObj.discountPercentage || 0,
            isFree: priceObj.isFree || false,
          },
          rating: 4.8,
          releaseDate: item.releaseDate || '2024',
          developer: 'PlayStation Studios',
          publisher: 'Sony Interactive Entertainment',
          description: item.summary || `${item.name} for PlayStation 5 and PlayStation 4.`,
          badges: item.platforms || ['PS5', 'PS4'],
          storeUrl: `https://store.playstation.com/concept/${item.id}`,
          officialStores: [
            {
              storeId: 'playstation_store',
              name: 'PlayStation Store',
              url: `https://store.playstation.com/concept/${item.id}`,
              color: '#003791',
              logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/PlayStation_logo.svg/512px-PlayStation_logo.svg.png',
              price: priceObj.discountedPrice || priceObj.basePrice || undefined,
            },
          ],
        };
      });

      return NextResponse.json(
        {
          success: true,
          source: 'live',
          endpoint: 'https://web.np.playstation.com/api/graphql/v1/op?operationName=categoryGridRetrieve',
          sha256Hash: PS_STORE_SHA256_HASH,
          timestamp: new Date().toISOString(),
          totalItemCount: gridData?.pageInfo?.totalCount || formattedProducts.length,
          count: formattedProducts.length,
          data: formattedProducts,
          raw: rawData,
        },
        {
          status: 200,
          headers: CORS_HEADERS,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'PLAYSTATION_STORE_UNAVAILABLE',
        message: 'Sony PlayStation Store upstream service is unavailable or returned no products.',
        count: 0,
        data: [],
      },
      {
        status: 503,
        headers: CORS_HEADERS,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'PLAYSTATION_FETCH_FAILED',
        message: error?.message || 'Failed to fetch PlayStation Store games.',
        count: 0,
        data: [],
      },
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
