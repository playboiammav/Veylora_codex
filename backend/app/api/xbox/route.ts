import { NextRequest, NextResponse } from 'next/server';
import { GameItem } from '@/lib/game-types';
import { normalizeHardwarePlatforms } from '@/lib/platform-utils';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
  const listType = searchParams.get('listType') || 'Deal';
  const market = searchParams.get('market') || 'US';
  const language = searchParams.get('language') || 'en-us';
  const itemType = searchParams.get('itemType') || 'Game';
  const deviceFamily = searchParams.get('deviceFamily') || 'Windows.Xbox';
  const count = searchParams.get('count') || '20';
  const enrich = searchParams.get('enrich') !== 'false';

  const recoUrl = `https://reco-public.rec.mp.microsoft.com/channels/Reco/V8.0/Lists/api/list/Computed/${listType}?market=${market}&language=${language}&itemType=${itemType}&deviceFamily=${deviceFamily}&count=${count}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let recoData: any = null;
    let items: any[] = [];

    try {
      const response = await fetch(recoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        recoData = await response.json();
        items = recoData?.Items || [];
      }
    } catch {
      // Graceful timeout or upstream network isolation in container
    }

    const productIds: string[] = items.map((item: any) => item.Id || item.id).filter(Boolean);
    let enrichedProducts: GameItem[] = [];

    if (enrich && productIds.length > 0) {
      try {
        const bigIdsParam = productIds.slice(0, 20).join(',');
        const catalogUrl = `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${bigIdsParam}&market=${market}&languages=${language}&MS-CV=DGU1mcuYo0WMMp`;

        const catalogResponse = await fetch(catalogUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
        });

        if (catalogResponse.ok) {
          const catalogData = await catalogResponse.json();
          const products = catalogData.Products || [];

          enrichedProducts = products.map((prod: any) => {
            const locProps = prod.LocalizedProperties?.[0] || {};
            const images = locProps.Images || [];
            const posterImage =
              images.find((img: any) => img.ImagePurpose === 'Poster' || img.ImagePurpose === 'BoxArt')?.Uri ||
              images[0]?.Uri;
            const heroImage =
              images.find((img: any) => img.ImagePurpose === 'SuperHeroArt' || img.ImagePurpose === 'HeroArt')?.Uri ||
              posterImage;

            const sku = prod.DisplaySkuAvailabilities?.[0];
            const avail = sku?.Availabilities?.[0];
            const price = avail?.OrderManagementData?.Price;

            const msrp = price?.MSRP;
            const currentPrice = price?.ListPrice ?? price?.WholesalePrice ?? msrp;
            const discountPercentage = msrp && currentPrice !== undefined && msrp > currentPrice ? Math.round(((msrp - currentPrice) / msrp) * 100) : 0;
            const isFree = currentPrice === 0;

            const rawPlatforms = ['Xbox Series X|S', 'Xbox One', 'PC'];
            const supportedHardware = normalizeHardwarePlatforms(rawPlatforms);

            return {
              id: prod.ProductId,
              title: locProps.ProductTitle || 'Xbox Title',
              platform: 'Xbox' as const,
              supportedHardware,
              genres: locProps.Categories || ['Action', 'Adventure'],
              coverImage: posterImage ? `https:${posterImage}` : '',
              bannerImage: heroImage ? `https:${heroImage}` : undefined,
              price: {
                formattedBasePrice: msrp ? `$${msrp.toFixed(2)}` : undefined,
                formattedDiscountedPrice: currentPrice !== undefined && currentPrice !== null ? `$${currentPrice.toFixed(2)}` : (isFree ? 'Free' : undefined),
                discountPercentage,
                isFree,
              },
              rating: 4.7,
              releaseDate: prod.MarketProperties?.[0]?.OriginalReleaseDate?.slice(0, 10) || '2023',
              developer: locProps.DeveloperName || 'Xbox Game Studios',
              publisher: locProps.PublisherName || 'Microsoft',
              description: locProps.ProductDescription || 'Xbox game title.',
              badges: ['Xbox Game Pass', 'Series X|S'],
              storeUrl: `https://www.xbox.com/games/store/game/${prod.ProductId}`,
              officialStores: [
                {
                  storeId: 'xbox_store' as const,
                  name: 'Xbox Store',
                  url: `https://www.xbox.com/games/store/game/${prod.ProductId}`,
                  color: '#107C10',
                  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Xbox_Logo.svg/512px-Xbox_Logo.svg.png',
                  price: currentPrice !== undefined && currentPrice !== null ? `$${currentPrice.toFixed(2)}` : (isFree ? 'Free' : undefined),
                },
              ],
            };
          });
        }
      } catch {
        // Fall back to available items
      }
    }

    if (enrichedProducts.length > 0) {
      return NextResponse.json(
        {
          success: true,
          source: 'live',
          endpoint: recoUrl,
          timestamp: new Date().toISOString(),
          count: enrichedProducts.length,
          data: enrichedProducts,
          raw: recoData,
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
        error: 'XBOX_STORE_UNAVAILABLE',
        message: 'Xbox store upstream service is unavailable or returned no products.',
        endpoint: recoUrl,
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
        error: 'XBOX_FETCH_FAILED',
        message: error?.message || 'Failed to fetch Xbox store games.',
        endpoint: recoUrl,
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
