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
        {
          success: false,
          error: `No IMDb ID mapping found for title ${id}`,
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const [titleData, ratingsData, reviewsData, awardsData, externalSites] = await Promise.all([
      TvApiService.getTitle(imdbId),
      TvApiService.getRatings(imdbId),
      TvApiService.getReviews(imdbId),
      TvApiService.getAwards(imdbId),
      TvApiService.getExternalSites(imdbId),
    ]);

    return NextResponse.json(
      {
        success: true,
        id,
        imdbId,
        titleData,
        ratings: ratingsData,
        reviews: reviewsData?.items || [],
        awards: awardsData?.items || [],
        awardsSummary: awardsData?.description || titleData?.awards,
        wikipedia: titleData?.wikipedia,
        externalSites: externalSites?.websites || [],
        boxOffice: titleData?.boxOffice,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch enrichment for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
