import { NextRequest, NextResponse } from 'next/server';
import { GogService } from '@/services/gog/gog-service';

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
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || searchParams.get('q') || undefined;
  const sort = searchParams.get('sort') || 'popularity';

  const result = await GogService.getCatalog(page, search, sort);

  return NextResponse.json(
    {
      success: true,
      platform: 'gog',
      source: result.source,
      page,
      count: result.data.length,
      totalCount: result.totalCount,
      data: result.data,
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
