import { NextRequest, NextResponse } from 'next/server';
import { TmdbService, getTmdbImageUrl } from '@/services/tmdb/tmdb-service';
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
    let backdrops: string[] = [];
    let posters: string[] = [];

    const tmdbRes = await TmdbService.getMovieDetails(id);
    if (tmdbRes.success && tmdbRes.data) {
      imdbId = tmdbRes.data.imdb_id || tmdbRes.data.external_ids?.imdb_id || imdbId;
      backdrops = tmdbRes.data.images?.backdrops?.map((b) => getTmdbImageUrl(b.file_path, 'original')) || [];
      posters = tmdbRes.data.images?.posters?.map((p) => getTmdbImageUrl(p.file_path, 'w500')) || [];
      if (tmdbRes.data.backdrop_path) {
        backdrops.unshift(getTmdbImageUrl(tmdbRes.data.backdrop_path, 'original'));
      }
      if (tmdbRes.data.poster_path) {
        posters.unshift(getTmdbImageUrl(tmdbRes.data.poster_path, 'w500'));
      }
    }

    if (imdbId) {
      const [tvPosters, tvImages] = await Promise.all([
        TvApiService.getPosters(imdbId),
        TvApiService.getImages(imdbId),
      ]);

      if (tvPosters?.posters) {
        for (const p of tvPosters.posters) {
          if (p.link && !posters.includes(p.link)) posters.push(p.link);
        }
      }
      if (tvPosters?.backdrops) {
        for (const b of tvPosters.backdrops) {
          if (b.link && !backdrops.includes(b.link)) backdrops.push(b.link);
        }
      }
      if (tvImages?.items) {
        for (const img of tvImages.items) {
          if (img.image && !backdrops.includes(img.image)) backdrops.push(img.image);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        id,
        imdbId,
        backdrops: Array.from(new Set(backdrops)),
        posters: Array.from(new Set(posters)),
        totalImages: backdrops.length + posters.length,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch images for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
