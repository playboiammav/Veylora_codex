import { NextRequest, NextResponse } from 'next/server';
import { GameEdition } from '@/lib/game-types';

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

function categorizeEditionType(title: string): GameEdition['editionType'] {
  const lower = title.toLowerCase();
  if (lower.includes('ultimate')) return 'ULTIMATE';
  if (lower.includes('deluxe')) return 'DELUXE';
  if (lower.includes('premium')) return 'PREMIUM';
  if (lower.includes('gold')) return 'GOLD';
  if (lower.includes('complete') || lower.includes("vault")) return 'COMPLETE';
  if (lower.includes('standard')) return 'STANDARD';
  return 'OTHER';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId') || searchParams.get('id') || '';
  const market = searchParams.get('market') || 'US';

  if (!productId) {
    return NextResponse.json(
      {
        success: false,
        error: 'MISSING_PARAM',
        message: "Query parameter 'productId' or 'id' is required for Xbox editions lookup.",
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Live upstream Microsoft Display Catalog expansion
  try {
    const catalogUrl = `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${encodeURIComponent(productId)}&market=${market}&languages=en-us&MS-CV=DGU1mcuYo0WMMp`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(catalogUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const products = data.Products || [];

      if (products.length > 0) {
        const prod = products[0];
        const skus = prod.DisplaySkuAvailabilities || [];
        const editions: GameEdition[] = [];

        skus.forEach((sku: any, idx: number) => {
          const skuProperties = sku.Sku?.LocalizedProperties?.[0] || {};
          const avail = sku.Availabilities?.[0];
          const priceObj = avail?.OrderManagementData?.Price;

          const title = skuProperties.SkuTitle || prod.LocalizedProperties?.[0]?.ProductTitle || `Edition ${idx + 1}`;
          const msrp = priceObj?.MSRP;
          const current = priceObj?.ListPrice || priceObj?.WholesalePrice || msrp || 0;
          const discount = msrp && msrp > current ? Math.round(((msrp - current) / msrp) * 100) : 0;

          editions.push({
            id: sku.Sku?.SkuId || `${productId}-${idx}`,
            name: title,
            editionType: categorizeEditionType(title),
            price: {
              formattedBasePrice: msrp ? `$${msrp.toFixed(2)}` : undefined,
              formattedDiscountedPrice: current > 0 ? `$${current.toFixed(2)}` : 'Free',
              discountPercentage: discount,
              isFree: current === 0,
            },
            originalPrice: msrp ? `$${msrp.toFixed(2)}` : undefined,
            discountPercentage: discount,
            currency: 'USD',
            isFree: current === 0,
            storeUrl: `https://www.xbox.com/games/store/game/${productId}`,
            platform: 'Xbox',
          });
        });

        if (editions.length > 0) {
          return NextResponse.json(
            {
              success: true,
              source: 'live',
              productId,
              count: editions.length,
              data: editions,
            },
            { status: 200, headers: CORS_HEADERS }
          );
        }
      }
    }
  } catch {
    // Upstream failure handled below
  }

  return NextResponse.json(
    {
      success: false,
      error: 'EDITIONS_NOT_FOUND',
      message: `No editions found for Xbox product '${productId}'.`,
      productId,
      count: 0,
      data: [],
    },
    { status: 404, headers: CORS_HEADERS }
  );
}
