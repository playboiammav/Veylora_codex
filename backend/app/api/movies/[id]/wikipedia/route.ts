import { NextRequest, NextResponse } from 'next/server';
import { TmdbService } from '@/services/tmdb/tmdb-service';
import { TvApiService } from '@/services/tv-api/tv-api-service';

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

  try {
    let imdbId = id.startsWith('tt') ? id : undefined;

    if (!imdbId) {
      const tmdbRes = await TmdbService.getMovieDetails(id);
      if (tmdbRes.success && tmdbRes.data) {
        imdbId = tmdbRes.data.imdb_id || tmdbRes.data.external_ids?.imdb_id;
      }
    }

    if (!imdbId) {
      return NextResponse.json(
        { success: false, error: `No IMDb ID found for ${id}` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const wiki = await TvApiService.getWikipedia(imdbId);

    return NextResponse.json(
      {
        success: true,
        id,
        imdbId,
        title: wiki?.title,
        url: wiki?.url,
        plotShort: wiki?.plotShort?.plainText,
        plotFull: wiki?.plotFull?.plainText,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch wikipedia for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
