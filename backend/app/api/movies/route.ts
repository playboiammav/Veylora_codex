import { NextRequest, NextResponse } from 'next/server';
import { TmdbService, TmdbMovie, getTmdbImageUrl } from '@/services/tmdb/tmdb-service';
import { TvApiService } from '@/services/tv-api/tv-api-service';
import { NormalizedMovie } from '@/lib/normalized-types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function normalizeTmdbMovie(m: TmdbMovie): NormalizedMovie {
  const releaseYear = m.release_date ? m.release_date.split('-')[0] : '2024';
  const genres = m.genres?.map((g) => g.name) || ['Cinema', 'Drama'];
  const runtime = m.runtime || 120;
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  const formattedRuntime = `${hours}h ${minutes}m`;

  const cast = m.credits?.cast?.slice(0, 8).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profileImage: c.profile_path ? getTmdbImageUrl(c.profile_path, 'w500') : null,
  })) || [];

  const director = m.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Acclaimed Director';

  const trailers = m.videos?.results
    ?.filter((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
    ?.map((v) => ({
      id: v.id,
      name: v.name,
      key: v.key,
      site: v.site,
      type: v.type,
      url: `https://www.youtube.com/watch?v=${v.key}`,
    })) || [];

  const images = m.images?.backdrops?.slice(0, 6).map((img) => getTmdbImageUrl(img.file_path, 'w780')) || [
    getTmdbImageUrl(m.backdrop_path, 'original'),
  ];

  const similar = m.similar?.results?.slice(0, 6).map((s) => ({
    id: String(s.id),
    title: s.title,
    poster: getTmdbImageUrl(s.poster_path, 'w500'),
    rating: Number(s.vote_average.toFixed(1)),
    releaseYear: s.release_date ? s.release_date.split('-')[0] : '2024',
  })) || [];

  const companies = m.production_companies?.map((c) => ({
    id: c.id,
    name: c.name,
    country: c.origin_country,
  }));

  const imdbId = m.imdb_id || m.external_ids?.imdb_id;

  return {
    id: String(m.id),
    tmdbId: m.id,
    imdbId,
    title: m.title,
    originalTitle: m.original_title,
    poster: getTmdbImageUrl(m.poster_path, 'w500'),
    backdrop: getTmdbImageUrl(m.backdrop_path || m.poster_path, 'original'),
    rating: Number(m.vote_average.toFixed(1)),
    voteCount: m.vote_count,
    releaseDate: m.release_date || '',
    releaseYear,
    genres,
    overview: m.overview || '',
    tagline: m.tagline || undefined,
    runtime,
    formattedRuntime,
    cast,
    director,
    directors: [director],
    companies,
    trailers,
    images,
    similar,
    status: m.status || 'Released',
    streamingLinks: [],
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'trending';
  const search = searchParams.get('search') || searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    let movies: TmdbMovie[] = [];

    if (search.trim()) {
      const res = await TmdbService.searchMovies(search, page);
      movies = res.data;
    } else if (category === 'trending') {
      const res = await TmdbService.getTrending('week', page);
      movies = res.data;
    } else if (category === 'popular') {
      const res = await TmdbService.getPopular(page);
      movies = res.data;
    } else if (category === 'top_rated' || category === 'top') {
      const res = await TmdbService.getTopRated(page);
      movies = res.data;
    } else if (category === 'now_playing' || category === 'upcoming') {
      const res = await TmdbService.getNowPlaying(page);
      movies = res.data;
    } else if (category === 'top250') {
      const tvApiTop250 = await TvApiService.getTop250Movies();
      if (tvApiTop250 && tvApiTop250.length > 0) {
        const mapped: NormalizedMovie[] = tvApiTop250.slice(0, 24).map((item) => ({
          id: item.id,
          imdbId: item.id,
          title: item.title || item.fullTitle,
          poster: item.image || getTmdbImageUrl(null),
          backdrop: item.image || getTmdbImageUrl(null),
          rating: item.imDbRating ? parseFloat(item.imDbRating) : 0,
          releaseDate: item.year ? `${item.year}-01-01` : '',
          releaseYear: item.year || '',
          genres: ['Classic', 'Drama'],
          overview: '',
          cast: (item.crew ? item.crew.split(',').map((name: string, i: number) => ({ id: i, name: name.trim(), character: 'Principal Cast', profileImage: null })) : []),
          trailers: [],
          images: [item.image].filter(Boolean),
        }));
        return NextResponse.json(
          { success: true, category, count: mapped.length, data: mapped },
          { status: 200, headers: CORS_HEADERS }
        );
      }
      const res = await TmdbService.getTopRated(page);
      movies = res.data;
    } else {
      const res = await TmdbService.getTrending('day', page);
      movies = res.data;
    }

    const normalizedData: NormalizedMovie[] = movies.map(normalizeTmdbMovie);

    return NextResponse.json(
      {
        success: true,
        category,
        page,
        count: normalizedData.length,
        data: normalizedData,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch movies.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
