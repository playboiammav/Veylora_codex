import { NextResponse } from 'next/server';
import { RawgService } from '@/services/rawg/rawg-service';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const result = await RawgService.getGenres();
    return NextResponse.json(
      {
        success: true,
        platform: 'rawg',
        source: result.source,
        count: result.count,
        data: result.data,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch RAWG genres.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
