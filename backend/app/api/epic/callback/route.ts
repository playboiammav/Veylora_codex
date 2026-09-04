import { NextRequest, NextResponse } from 'next/server';
import { EpicService } from '@/services/epic/epic-service';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error,
        description: errorDescription,
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        error: 'MISSING_CODE',
        message: 'No authorization code was returned by Epic Games.',
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const tokenData = await EpicService.exchangeCodeForToken(code);
    return NextResponse.json(
      {
        success: true,
        message: 'Epic Games OAuth2 authentication successful.',
        data: tokenData,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'OAUTH_EXCHANGE_FAILED',
        message: err.message || 'Failed to exchange authorization code with Epic Games EOS.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
