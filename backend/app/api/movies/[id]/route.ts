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

function normalizeTmdbMovieDetail(m: TmdbMovie): NormalizedMovie {
  const releaseYear = m.release_date ? m.release_date.split('-')[0] : '2024';
  const genres = m.genres?.map((g) => g.name) || ['Cinema', 'Drama'];
  const runtime = m.runtime || 120;
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  const formattedRuntime = `${hours}h ${minutes}m`;

  const cast = m.credits?.cast?.slice(0, 16).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profileImage: c.profile_path ? getTmdbImageUrl(c.profile_path, 'w500') : null,
  })) || [];

  const crew = m.credits?.crew?.slice(0, 16).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.job || c.department || '',
    profileImage: c.profile_path ? getTmdbImageUrl(c.profile_path, 'w500') : null,
  })) || [];

  const director = m.credits?.crew?.find((c) => c.job === 'Director')?.name || undefined;
  const directors = m.credits?.crew?.filter((c) => c.job === 'Director').map((c) => c.name) || (director ? [director] : []);
  const writers = m.credits?.crew?.filter((c) => c.department === 'Writing' || c.job === 'Writer' || c.job === 'Screenplay').map((c) => c.name) || [];

  const rawWatchProviders = m['watch/providers']?.results;
  const usProviders = rawWatchProviders?.['US'] || (rawWatchProviders ? Object.values(rawWatchProviders)[0] : undefined);
  const watchProviders: { id: number; name: string; logoUrl?: string }[] = [];
  const seenPids = new Set<number>();

  const addProviders = (list?: { provider_id: number; provider_name: string; logo_path: string }[]) => {
    if (!list) return;
    for (const p of list) {
      if (p.provider_id && !seenPids.has(p.provider_id)) {
        seenPids.add(p.provider_id);
        watchProviders.push({
          id: p.provider_id,
          name: p.provider_name || 'Streaming',
          logoUrl: p.logo_path ? `https://image.tmdb.org/t/p/w154${p.logo_path}` : undefined,
        });
      }
    }
  };

  addProviders(usProviders?.flatrate);
  addProviders(usProviders?.rent);
  addProviders(usProviders?.buy);

  const trailers = m.videos?.results
    ?.filter((v) => v.site === 'YouTube')
    ?.map((v) => ({
      id: v.id,
      name: v.name,
      key: v.key,
      site: v.site,
      type: v.type,
      url: `https://www.youtube.com/watch?v=${v.key}`,
    })) || [];

  const images = m.images?.backdrops?.slice(0, 8).map((img) => getTmdbImageUrl(img.file_path, 'w780')) || [
    getTmdbImageUrl(m.backdrop_path, 'original'),
  ];

  const posters = m.images?.posters?.slice(0, 8).map((img) => getTmdbImageUrl(img.file_path, 'w500')) || [];

  const similar = m.similar?.results?.slice(0, 6).map((s) => ({
    id: String(s.id),
    title: s.title,
    poster: getTmdbImageUrl(s.poster_path, 'w500'),
    rating: Number(s.vote_average.toFixed(1)),
    releaseYear: s.release_date ? s.release_date.split('-')[0] : '',
  })) || [];

  const companies = m.production_companies?.map((c) => ({
    id: c.id,
    name: c.name,
    logo: c.logo_path ? getTmdbImageUrl(c.logo_path, 'w500') : undefined,
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
    crew,
    director,
    directors,
    writers,
    companies,
    trailers,
    images,
    posters,
    similar,
    status: m.status || 'Released',
    budget: m.budget ? `$${(m.budget / 1000000).toFixed(0)}M` : undefined,
    revenue: m.revenue ? `$${(m.revenue / 1000000).toFixed(0)}M` : undefined,
    streamingLinks: [],
    watchProviders,
    posterPath: m.poster_path || undefined,
    backdropPath: m.backdrop_path || undefined,
    popularity: m.popularity,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    let movieData: TmdbMovie | null = null;

    // Check if ID is IMDb format (tt...)
    if (id.startsWith('tt')) {
      const findRes = await TmdbService.findByImdbId(id);
      if (findRes.success && findRes.data) {
        movieData = findRes.data;
      }
    }

    if (!movieData) {
      const movieRes = await TmdbService.getMovieDetails(id);
      if (movieRes.success && movieRes.data) {
        movieData = movieRes.data;
      }
    }

    if (!movieData) {
      // If TMDB doesn't have it, check TV-API directly
      if (id.startsWith('tt')) {
        const tvApiData = await TvApiService.getTitle(id);
        if (tvApiData && tvApiData.id) {
          const directMovie: NormalizedMovie = {
            id: tvApiData.id,
            imdbId: tvApiData.id,
            title: tvApiData.title || tvApiData.fullTitle || 'Untitled',
            poster: tvApiData.image || getTmdbImageUrl(null),
            backdrop: tvApiData.image || getTmdbImageUrl(null),
            rating: tvApiData.imDbRating ? parseFloat(tvApiData.imDbRating) : 0,
            releaseDate: tvApiData.releaseDate || (tvApiData.year ? `${tvApiData.year}-01-01` : ''),
            releaseYear: tvApiData.year || '',
            genres: tvApiData.genreList?.map((g) => g.value) || ['Drama'],
            overview: tvApiData.plot || '',
            cast: (tvApiData.actorList || []).map((a) => ({
              id: a.id,
              imdbId: a.id,
              name: a.name,
              character: a.asCharacter,
              profileImage: a.image,
            })),
            trailers: [],
            images: [],
          };
          const enrichedDirect = await TvApiService.enrichMovie(directMovie);
          return NextResponse.json(
            { success: true, data: enrichedDirect },
            { status: 200, headers: CORS_HEADERS }
          );
        }
      }

      return NextResponse.json(
        { success: false, error: `Movie ${id} not found.` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const normalized = normalizeTmdbMovieDetail(movieData);

    // Enrich with TV-API data (ratings, reviews, awards, wikipedia, etc.)
    const enriched = await TvApiService.enrichMovie(normalized);

    return NextResponse.json(
      {
        success: true,
        data: enriched,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch movie details for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
