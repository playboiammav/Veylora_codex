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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const includeScreenshots = searchParams.get('screenshots') === 'true';
  const includeMovies = searchParams.get('movies') === 'true';

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Game ID or slug is required.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const gameResult = await RawgService.getGameDetails(id);

    if (!gameResult.success || !gameResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: gameResult.error || `RAWG Game '${id}' not found.`,
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    let screenshots: any[] | undefined = undefined;
    let movies: any[] | undefined = undefined;

    if (includeScreenshots) {
      const sResult = await RawgService.getGameScreenshots(id);
      screenshots = sResult.data;
    }

    if (includeMovies) {
      const mResult = await RawgService.getGameMovies(id);
      movies = mResult.data;
    }

    return NextResponse.json(
      {
        success: true,
        platform: 'rawg',
        id,
        source: gameResult.source,
        data: {
          ...gameResult.data,
          ...(screenshots ? { screenshots } : {}),
          ...(movies ? { movies } : {}),
        },
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch RAWG game details.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
