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
  { params }: { params: Promise<{ appId: string; subresource: string }> }
) {
  const { appId, subresource } = await params;
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'us';
  const lang = searchParams.get('lang') || 'en';
  const short = searchParams.get('short') === 'true';

  try {
    let resultData: any = null;

    switch (subresource.toLowerCase()) {
      case 'permissions':
        resultData = await GooglePlayService.getPermissions(appId, lang, short);
        break;
      case 'datasafety':
        resultData = await GooglePlayService.getDataSafety(appId, lang);
        break;
      case 'similar':
        resultData = await GooglePlayService.getSimilar(appId, country, lang);
        break;
      case 'reviews':
        resultData = await GooglePlayService.getReviews(appId, { country, lang });
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_SUBRESOURCE',
            message: `Unknown subresource '${subresource}'. Supported: permissions, datasafety, similar, reviews.`,
          },
          { status: 400, headers: CORS_HEADERS }
        );
    }

    return NextResponse.json(
      {
        success: true,
        appId,
        subresource,
        data: resultData,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch '${subresource}' for app '${appId}'.`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
