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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('cc') || searchParams.get('region') || 'us';
  const language = searchParams.get('l') || searchParams.get('language') || 'english';

  if (!appId) {
    return NextResponse.json(
      { success: false, error: 'App ID is required.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = await SteamService.getGameDetails(appId, region, language);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        appId,
      },
      { status: result.error?.includes('RATE_LIMIT') ? 429 : 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      success: true,
      appId,
      region,
      language,
      source: result.source,
      data: result.data,
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
