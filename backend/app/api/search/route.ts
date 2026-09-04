import { NextRequest, NextResponse } from 'next/server';
import { UnifiedSearchService, UnifiedPlatformType, UnifiedItemType } from '@/services/unified-search/unified-search-service';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query') || '';
  const platform = (searchParams.get('platform') || 'all') as UnifiedPlatformType | 'all';
  const type = (searchParams.get('type') || 'all') as UnifiedItemType | 'all';
  const category = searchParams.get('category') || undefined;
  const language = searchParams.get('lang') || searchParams.get('language') || 'en';
  const country = searchParams.get('country') || searchParams.get('cc') || 'us';
  const limit = parseInt(searchParams.get('limit') || '40', 10);

  try {
    const results = await UnifiedSearchService.search({
      query,
      platform,
      type,
      category,
      language,
      country,
      limit,
    });

    return NextResponse.json(results, { status: 200, headers: CORS_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unified search query failed.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
