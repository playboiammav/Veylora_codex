import { NextRequest, NextResponse } from 'next/server';
import { TmdbService } from '@/services/tmdb/tmdb-service';
import { TvApiService } from '@/services/tv-api/tv-api-service';
import { MovieReviewItem } from '@/lib/normalized-types';

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

    const reviews: MovieReviewItem[] = [];

    if (imdbId) {
      const [tvReviews, mcReviews] = await Promise.all([
        TvApiService.getReviews(imdbId),
        TvApiService.getMetacriticReviews(imdbId),
      ]);

      if (tvReviews?.items) {
        for (const item of tvReviews.items) {
          const rateNum = item.rate ? parseInt(item.rate, 10) : undefined;
          reviews.push({
            id: `imdb-${item.username}-${item.date}`,
            author: item.username,
            title: item.reviewTitle,
            content: item.reviewText,
            date: item.date,
            rating: !isNaN(Number(rateNum)) ? rateNum : undefined,
            source: 'IMDb',
            url: item.userUrl,
          });
        }
      }

      if (mcReviews?.items) {
        for (const item of mcReviews.items) {
          reviews.push({
            id: `metacritic-${item.publisher || item.author}-${item.date || Math.random()}`,
            author: item.publisher || item.author || 'Critic',
            content: item.content || item.review || '',
            date: item.date,
            rating: item.rate ? parseInt(item.rate, 10) : undefined,
            source: 'Metacritic',
            url: item.link,
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        id,
        imdbId,
        reviews,
        totalReviews: reviews.length,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch reviews for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
