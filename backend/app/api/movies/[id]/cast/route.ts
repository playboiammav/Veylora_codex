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
    let tmdbMovie = null;

    if (!imdbId) {
      const tmdbRes = await TmdbService.getMovieDetails(id);
      if (tmdbRes.success && tmdbRes.data) {
        tmdbMovie = tmdbRes.data;
        imdbId = tmdbRes.data.imdb_id || tmdbRes.data.external_ids?.imdb_id;
      }
    } else {
      const findRes = await TmdbService.findByImdbId(imdbId);
      if (findRes.success && findRes.data) {
        tmdbMovie = findRes.data;
      }
    }

    const tmdbCast = tmdbMovie?.credits?.cast?.map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profileImage: c.profile_path ? getTmdbImageUrl(c.profile_path, 'w500') : null,
    })) || [];

    const tmdbCrew = tmdbMovie?.credits?.crew?.map((c) => ({
      id: c.id,
      name: c.name,
      job: c.job,
      department: c.department,
    })) || [];

    let tvApiCast: any[] = [];
    let directors: any[] = [];
    let writers: any[] = [];

    if (imdbId) {
      const fullCast = await TvApiService.getFullCast(imdbId);
      if (fullCast) {
        tvApiCast = fullCast.actors || [];
        directors = fullCast.directors?.items || [];
        writers = fullCast.writers?.items || [];
      }
    }

    // Merge & deduplicate cast
    const seenNames = new Set<string>(tmdbCast.map((c) => c.name.toLowerCase()));
    const mergedCast = [...tmdbCast];

    for (const actor of tvApiCast) {
      if (!seenNames.has(actor.name?.toLowerCase())) {
        seenNames.add(actor.name.toLowerCase());
        mergedCast.push({
          id: actor.id || `tvapi-${actor.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: actor.name,
          character: actor.asCharacter || 'Cast Member',
          profileImage: actor.image || null,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        id,
        imdbId,
        cast: mergedCast,
        crew: tmdbCrew,
        directors,
        writers,
        totalCast: mergedCast.length,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch cast for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
