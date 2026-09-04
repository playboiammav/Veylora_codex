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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'us';
  const lang = searchParams.get('lang') || 'en';

  if (!appId) {
    return NextResponse.json(
      { success: false, error: 'App ID is required.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = await GooglePlayService.getAppDetails(appId, country, lang);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error, appId },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      success: true,
      appId,
      country,
      lang,
      source: result.source,
      data: result.data,
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
