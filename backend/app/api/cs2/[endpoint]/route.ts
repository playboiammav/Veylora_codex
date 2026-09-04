import { NextRequest, NextResponse } from 'next/server';
import { Cs2Service, Cs2Endpoint } from '@/services/cs2/cs2-service';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const VALID_ENDPOINTS = new Set([
  'all',
  'skins',
  'stickers',
  'collections',
  'crates',
  'keys',
  'collectibles',
  'agents',
  'patches',
  'graffiti',
  'music_kits',
]);

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ endpoint: string }> }
) {
  const { endpoint } = await params;
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('lang') || searchParams.get('language') || 'en';
  const search = searchParams.get('search') || searchParams.get('q') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const cleanEndpoint = endpoint.toLowerCase().replace(/\.json$/, '');

  if (!VALID_ENDPOINTS.has(cleanEndpoint)) {
    return NextResponse.json(
      {
        success: false,
        error: 'INVALID_ENDPOINT',
        validEndpoints: Array.from(VALID_ENDPOINTS),
        message: `Endpoint '${endpoint}' is invalid. Use one of: ${Array.from(VALID_ENDPOINTS).join(', ')}`,
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = await Cs2Service.getItems(cleanEndpoint as Cs2Endpoint, language, search, limit);

  return NextResponse.json(
    {
      success: true,
      platform: 'cs2',
      endpoint: cleanEndpoint,
      language: result.language,
      count: result.count,
      source: result.source,
      data: result.data,
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
