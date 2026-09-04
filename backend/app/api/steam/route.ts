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

const FALLBACK_STEAM_GAMES: GameItem[] = [
  {
    id: '1245620',
    title: 'ELDEN RING',
    platform: 'Cross-Platform',
    supportedHardware: ['pc'],
    genres: ['Action RPG', 'Open World', 'Dark Fantasy'],
    coverImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    bannerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_616x353.jpg',
    price: {
      formattedBasePrice: '$59.99',
      formattedDiscountedPrice: '$39.59',
      discountPercentage: 34,
      isFree: false,
    },
    rating: 4.9,
    releaseDate: '2022-02-24',
    developer: 'FromSoftware Inc.',
    publisher: 'Bandai Namco Entertainment',
    description: 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
    badges: ['Steam Top Seller', 'Controller Support', 'Steam Cloud'],
    storeUrl: 'https://store.steampowered.com/app/1245620',
    officialStores: [
      {
        storeId: 'steam',
        name: 'Steam',
        url: 'https://store.steampowered.com/app/1245620',
        color: '#171A21',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
        price: '$39.59',
      },
    ],
    pcRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i5-8400 or AMD Ryzen 3 3300X',
        memory: '12 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1060 3 GB or AMD Radeon RX 580 4 GB',
        vram: '3 GB',
        directx: 'Version 12 (Feature Level 12_0)',
        storage: '60 GB available space',
        additionalNotes: 'DirectX compatible soundcard.',
      },
      recommended: {
        os: 'Windows 10/11 64-bit',
        processor: 'Intel Core i7-8700K or AMD Ryzen 5 3600X',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1070 8 GB or AMD Radeon RX VEGA 56 8 GB',
        vram: '8 GB',
        directx: 'Version 12 (Feature Level 12_0)',
        storage: '60 GB SSD space',
        additionalNotes: 'Recommended for High quality 60FPS.',
      },
    },
  },
  {
    id: '1091500',
    title: 'Cyberpunk 2077',
    platform: 'Cross-Platform',
    supportedHardware: ['pc'],
    genres: ['Open World', 'Cyberpunk', 'RPG', 'Action'],
    coverImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    bannerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_616x353.jpg',
    price: {
      formattedBasePrice: '$59.99',
      formattedDiscountedPrice: '$29.99',
      discountPercentage: 50,
      isFree: false,
    },
    rating: 4.7,
    releaseDate: '2020-12-10',
    developer: 'CD PROJEKT RED',
    publisher: 'CD PROJEKT RED',
    description: 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary.',
    badges: ['Ray Tracing Overdrive', 'Steam Deck Verified', 'DLSS 3.5'],
    storeUrl: 'https://store.steampowered.com/app/1091500',
    officialStores: [
      {
        storeId: 'steam',
        name: 'Steam',
        url: 'https://store.steampowered.com/app/1091500',
        color: '#171A21',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
        price: '$29.99',
      },
    ],
    pcRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i7-6700 or AMD Ryzen 5 1600',
        memory: '12 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580 8GB',
        vram: '6 GB',
        directx: 'Version 12',
        storage: '70 GB SSD',
        additionalNotes: 'SSD recommended.',
      },
      recommended: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i7-12700 or AMD Ryzen 7 7800X3D',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce RTX 2060 SUPER or AMD Radeon RX 5700 XT',
        vram: '8 GB',
        directx: 'Version 12',
        storage: '70 GB SSD',
        additionalNotes: 'SSD required for Ultra / Ray Tracing.',
      },
    },
  },
  {
    id: '730',
    title: 'Counter-Strike 2',
    platform: 'PC',
    supportedHardware: ['pc', 'linux'],
    genres: ['FPS', 'Shooter', 'Multiplayer', 'Competitive'],
    coverImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    bannerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/capsule_616x353.jpg',
    price: {
      formattedDiscountedPrice: 'Free to Play',
      discountPercentage: 0,
      isFree: true,
    },
    rating: 4.8,
    releaseDate: '2023-09-27',
    developer: 'Valve',
    publisher: 'Valve',
    description: 'For over two decades, Counter-Strike has offered an elite competitive experience. Now the next chapter arrives with Counter-Strike 2.',
    badges: ['Free to Play', 'Valve Anti-Cheat', 'Source 2 Engine'],
    storeUrl: 'https://store.steampowered.com/app/730',
    officialStores: [
      {
        storeId: 'steam',
        name: 'Steam',
        url: 'https://store.steampowered.com/app/730',
        color: '#171A21',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
        price: 'Free to Play',
      },
    ],
    pcRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: '4 hardware CPU threads - Intel Core i5 750 or higher',
        memory: '8 GB RAM',
        graphics: 'Video card must be 1 GB or more and should be DirectX 11-compatible',
        directx: 'Version 11',
        storage: '85 GB available space',
      },
    },
  },
  {
    id: '2322010',
    title: 'God of War Ragnarök',
    platform: 'Cross-Platform',
    supportedHardware: ['pc'],
    genres: ['Action', 'Mythology', 'Adventure', 'Singleplayer'],
    coverImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2322010/header.jpg',
    bannerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2322010/capsule_616x353.jpg',
    price: {
      formattedBasePrice: '$59.99',
      formattedDiscountedPrice: '$59.99',
      discountPercentage: 0,
      isFree: false,
    },
    rating: 4.9,
    releaseDate: '2024-09-19',
    developer: 'Santa Monica Studio, Jetpack Interactive',
    publisher: 'PlayStation Publishing LLC',
    description: 'Kratos and Atreus embark on an epic and heartfelt journey as they struggle with holding on and letting go.',
    badges: ['PlayStation PC', 'DualSense Support', 'Ultrawide 21:9'],
    storeUrl: 'https://store.steampowered.com/app/2322010',
    officialStores: [
      {
        storeId: 'steam',
        name: 'Steam',
        url: 'https://store.steampowered.com/app/2322010',
        color: '#171A21',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
        price: '$59.99',
      },
    ],
    pcRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i5-6600K or AMD Ryzen 5 2400 G',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GeForce GTX 960 (4 GB) or AMD Radeon R9 290X (4 GB)',
        vram: '4 GB',
        directx: 'Version 12',
        storage: '190 GB SSD',
        additionalNotes: 'SSD is required for performance.',
      },
      recommended: {
        os: 'Windows 10 64-bit / Windows 11',
        processor: 'Intel Core i5-8600 or AMD Ryzen 5 3600',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce RTX 2060 Super (6 GB) or AMD Radeon RX 5700 (8 GB)',
        vram: '6 GB+',
        directx: 'Version 12',
        storage: '190 GB SSD',
        additionalNotes: 'SSD strongly recommended for 1080p 60FPS.',
      },
    },
  },
];

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
          let formattedDiscountedPrice = priceOverview?.final_formatted || (isFree ? 'Free to Play' : '$59.99');
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
            coverImage: d.header_image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
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

    const matchedFallback = FALLBACK_STEAM_GAMES.filter((g) => g.id === appId);
    if (matchedFallback.length > 0) {
      return NextResponse.json(
        {
          success: true,
          source: 'cached-resilient',
          endpoint: 'https://store.steampowered.com/api/appdetails',
          timestamp: new Date().toISOString(),
          count: matchedFallback.length,
          data: matchedFallback,
        },
        { status: 200, headers: CORS_HEADERS }
      );
    }
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
            coverImage: item.header_image || item.large_capsule_image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
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
      success: true,
      source: 'cached-resilient',
      endpoint: 'https://store.steampowered.com/api/featuredcategories',
      timestamp: new Date().toISOString(),
      count: FALLBACK_STEAM_GAMES.length,
      data: FALLBACK_STEAM_GAMES,
    },
    { status: 200, headers: CORS_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  return GET(request);
}
