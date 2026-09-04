import { NextRequest, NextResponse } from 'next/server';
import { SteamService } from '@/services/steam/steam-service';

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
  const region = searchParams.get('cc') || searchParams.get('region') || 'us';
  const language = searchParams.get('l') || searchParams.get('language') || 'english';

  try {
    const result = await SteamService.getFeaturedCategories(region, language);
    return NextResponse.json(
      {
        success: true,
        region,
        language,
        source: result.source,
        data: result.data,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Steam featured categories.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
