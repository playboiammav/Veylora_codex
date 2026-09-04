import { NextRequest, NextResponse } from 'next/server';
import { GooglePlayService } from '@/services/google-play/google-play-service';

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
  const q = searchParams.get('q');
  const suggest = searchParams.get('suggest');
  const collection = searchParams.get('collection') || 'TOP_FREE';
  const category = searchParams.get('category') || undefined;
  const country = searchParams.get('country') || 'us';
  const lang = searchParams.get('lang') || 'en';
  const num = parseInt(searchParams.get('num') || '24', 10);
  const fullDetail = searchParams.get('fullDetail') === 'true';

  try {
    // 1. Search suggestions
    if (suggest) {
      const suggestions = await GooglePlayService.suggest(suggest);
      return NextResponse.json(
        { success: true, suggest, data: suggestions },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // 2. Search query
    if (q) {
      const searchResults = await GooglePlayService.search(q, num, country, lang);
      return NextResponse.json(
        { success: true, query: q, count: searchResults.length, data: searchResults },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // 3. Collection / Top list
    const result = await GooglePlayService.getApps({
      collection,
      category,
      country,
      lang,
      num,
      fullDetail,
    });

    return NextResponse.json(
      {
        success: true,
        collection,
        category: category || 'ALL',
        country,
        lang,
        fullDetail,
        count: result.count,
        source: result.source,
        data: result.data,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to query Google Play API.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
