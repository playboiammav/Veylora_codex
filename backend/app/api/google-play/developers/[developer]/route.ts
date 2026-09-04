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
  { params }: { params: Promise<{ developer: string }> }
) {
  const { developer } = await params;
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'us';
  const lang = searchParams.get('lang') || 'en';
  const num = parseInt(searchParams.get('num') || '20', 10);

  try {
    const apps = await GooglePlayService.getDeveloperApps(developer, country, lang, num);
    return NextResponse.json(
      {
        success: true,
        developer,
        count: apps.length,
        data: apps,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch apps for developer '${developer}'.`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
