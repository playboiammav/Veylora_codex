import { NextRequest, NextResponse } from 'next/server';
import { EpicService } from '@/services/epic/epic-service';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId') || searchParams.get('id');

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authorization Bearer token is required.',
      },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  if (!accountId) {
    return NextResponse.json(
      {
        success: false,
        error: 'MISSING_PARAM',
        message: 'accountId query parameter is required.',
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const account = await EpicService.getAccountInfo(token, accountId);
    return NextResponse.json(
      {
        success: true,
        data: account,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to fetch Epic Games account details.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
