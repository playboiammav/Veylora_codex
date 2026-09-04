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
  const count = parseInt(searchParams.get('count') || '5', 10);
  const maxLength = parseInt(searchParams.get('maxlength') || '300', 10);

  if (!appId) {
    return NextResponse.json(
      { success: false, error: 'App ID is required.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = await SteamService.getGameNews(appId, count, maxLength);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        appId,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      success: true,
      appId,
      count: result.data?.length || 0,
      source: result.source,
      data: result.data,
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
