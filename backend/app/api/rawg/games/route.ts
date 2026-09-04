import { NextRequest, NextResponse } from 'next/server';
import { RawgService } from '@/services/rawg/rawg-service';

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
  const pageSize = parseInt(searchParams.get('page_size') || searchParams.get('pageSize') || '20', 10);
  const search = searchParams.get('search') || searchParams.get('q') || undefined;
  const ordering = searchParams.get('ordering') || '-rating';
  const genres = searchParams.get('genres') || undefined;
  const platforms = searchParams.get('platforms') || undefined;
  const dates = searchParams.get('dates') || undefined;
  const metacritic = searchParams.get('metacritic') || undefined;

  try {
    const result = await RawgService.getGames({
      page,
      page_size: pageSize,
      search,
      ordering,
      genres,
      platforms,
      dates,
      metacritic,
    });

    return NextResponse.json(
      {
        success: true,
        platform: 'rawg',
        page,
        pageSize,
        count: result.count,
        next: result.next,
        previous: result.previous,
        source: result.source,
        data: result.data,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch games from RAWG API.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
