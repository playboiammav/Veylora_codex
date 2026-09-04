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
    let trailers: { id: string; name: string; key: string; site: string; type: string; url: string }[] = [];

    const tmdbRes = await TmdbService.getMovieDetails(id);
    if (tmdbRes.success && tmdbRes.data) {
      imdbId = tmdbRes.data.imdb_id || tmdbRes.data.external_ids?.imdb_id || imdbId;
      const vids = tmdbRes.data.videos?.results?.filter((v) => v.site === 'YouTube') || [];
      trailers = vids.map((v) => ({
        id: v.id,
        name: v.name,
        key: v.key,
        site: v.site,
        type: v.type,
        url: `https://www.youtube.com/watch?v=${v.key}`,
      }));
    }

    if (imdbId) {
      const tvTrailer = await TvApiService.getTrailer(imdbId);
      if (tvTrailer && (tvTrailer.videoId || tvTrailer.linkEmbed || tvTrailer.link)) {
        trailers.unshift({
          id: tvTrailer.videoId || 'imdb-trailer',
          name: `${tvTrailer.title || 'Official'} Trailer (IMDb)`,
          key: tvTrailer.videoId || '',
          site: 'IMDb',
          type: 'Trailer',
          url: tvTrailer.linkEmbed || tvTrailer.link || tvTrailer.videoUrl || '',
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        id,
        imdbId,
        trailers,
        primaryTrailer: trailers[0] || null,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch trailer for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
