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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || searchParams.get('query') || '';
  const type = (searchParams.get('type') || 'movie') as 'all' | 'movie' | 'series' | 'name' | 'company' | 'title';
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (!q.trim()) {
    return NextResponse.json(
      { success: true, count: 0, data: [] },
      { status: 200, headers: CORS_HEADERS }
    );
  }

  try {
    // 1. Try TMDB search as primary fast catalog
    let tmdbResults: any[] = [];
    if (type === 'name') {
      // search person on TMDB
      const res = await TmdbService.searchPerson(q, page);
      tmdbResults = res.data.map((p: any) => ({
        id: String(p.id),
        tmdbId: p.id,
        name: p.name,
        role: p.known_for_department || 'Artist',
        photo: p.profile_path ? getTmdbImageUrl(p.profile_path, 'w500') : null,
        type: 'person',
        knownFor: p.known_for?.map((k: any) => ({
          id: String(k.id),
          title: k.title || k.name,
          poster: k.poster_path ? getTmdbImageUrl(k.poster_path, 'w500') : null,
          rating: k.vote_average,
        })),
      }));
    } else {
      const res = await TmdbService.searchMovies(q, page);
      tmdbResults = res.data.map((m) => ({
        id: String(m.id),
        tmdbId: m.id,
        imdbId: m.imdb_id,
        title: m.title,
        poster: getTmdbImageUrl(m.poster_path, 'w500'),
        backdrop: getTmdbImageUrl(m.backdrop_path || m.poster_path, 'original'),
        rating: Number(m.vote_average.toFixed(1)),
        releaseDate: m.release_date || '2024-01-01',
        releaseYear: m.release_date ? m.release_date.split('-')[0] : '2024',
        genres: m.genres?.map((g) => g.name) || ['Cinema'],
        overview: m.overview,
        type: 'movie',
      }));
    }

    // 2. Also query TV-API for supplementary / exact matches
    const tvApiRes = await TvApiService.search(q, type);

    return NextResponse.json(
      {
        success: true,
        query: q,
        type,
        page,
        count: tmdbResults.length,
        data: tmdbResults,
        tvApiResults: tvApiRes.data || [],
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to search for "${q}"`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
