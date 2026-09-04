import { NextRequest, NextResponse } from 'next/server';
import { TmdbService } from '@/services/tmdb/tmdb-service';
import { TvApiService } from '@/services/tv-api/tv-api-service';
import { MovieRatingSource } from '@/lib/normalized-types';

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
    let tmdbVoteAvg = 8.0;
    let tmdbVoteCount = 1000;

    const tmdbRes = await TmdbService.getMovieDetails(id);
    if (tmdbRes.success && tmdbRes.data) {
      imdbId = tmdbRes.data.imdb_id || tmdbRes.data.external_ids?.imdb_id || imdbId;
      tmdbVoteAvg = tmdbRes.data.vote_average;
      tmdbVoteCount = tmdbRes.data.vote_count;
    }

    const ratings: MovieRatingSource[] = [
      {
        source: 'TMDB',
        score: `${tmdbVoteAvg.toFixed(1)}/10`,
        scoreValue: Number(tmdbVoteAvg.toFixed(1)),
        maxScore: '10',
        votes: tmdbVoteCount,
        percentage: Math.round(tmdbVoteAvg * 10),
      },
    ];

    if (imdbId) {
      const tvApiRatings = await TvApiService.getRatings(imdbId);
      if (tvApiRatings) {
        if (tvApiRatings.imDb && tvApiRatings.imDb !== '0') {
          const val = parseFloat(tvApiRatings.imDb);
          if (!isNaN(val) && val > 0) {
            ratings.push({
              source: 'IMDb',
              score: `${val.toFixed(1)}/10`,
              scoreValue: val,
              maxScore: '10',
              percentage: Math.round(val * 10),
            });
          }
        }
        if (tvApiRatings.metacritic) {
          const val = parseInt(tvApiRatings.metacritic, 10);
          if (!isNaN(val) && val > 0) {
            ratings.push({
              source: 'Metacritic',
              score: `${val}/100`,
              scoreValue: val,
              maxScore: '100',
              percentage: val,
            });
          }
        }
        if (tvApiRatings.rottenTomatoes) {
          const val = parseInt(tvApiRatings.rottenTomatoes.replace('%', ''), 10);
          if (!isNaN(val) && val > 0) {
            ratings.push({
              source: 'Rotten Tomatoes',
              score: `${val}%`,
              scoreValue: val,
              maxScore: '100%',
              percentage: val,
            });
          }
        }
        if (tvApiRatings.tV_com && tvApiRatings.tV_com !== '0') {
          const val = parseFloat(tvApiRatings.tV_com);
          if (!isNaN(val) && val > 0) {
            ratings.push({
              source: 'TV.com',
              score: `${val.toFixed(1)}/10`,
              scoreValue: val,
              maxScore: '10',
              percentage: Math.round(val * 10),
            });
          }
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        id,
        imdbId,
        ratings,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch ratings for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
