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

  const director = m.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Acclaimed Director';
  const directors = m.credits?.crew?.filter((c) => c.job === 'Director').map((c) => c.name) || [director];
  const writers = m.credits?.crew?.filter((c) => c.department === 'Writing' || c.job === 'Writer' || c.job === 'Screenplay').map((c) => c.name) || [];

  const trailers = m.videos?.results
    ?.filter((v) => v.site === 'YouTube')
    ?.map((v) => ({
      id: v.id,
      name: v.name,
      key: v.key,
      site: v.site,
      type: v.type,
      url: `https://www.youtube.com/watch?v=${v.key}`,
    })) || [
    {
      id: 'trailer-1',
      name: `${m.title} - Main Trailer`,
      key: 'Way9Dexny3w',
      site: 'YouTube',
      type: 'Trailer',
      url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    },
  ];

  const images = m.images?.backdrops?.slice(0, 8).map((img) => getTmdbImageUrl(img.file_path, 'w780')) || [
    getTmdbImageUrl(m.backdrop_path, 'original'),
  ];

  const posters = m.images?.posters?.slice(0, 8).map((img) => getTmdbImageUrl(img.file_path, 'w500')) || [];

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
    releaseDate: m.release_date || '2024-01-01',
    releaseYear,
    genres,
    overview: m.overview || `${m.title} is a premier cinematic film.`,
    tagline: m.tagline || 'Experience the cinematic spectacle.',
    runtime,
    formattedRuntime,
    cast,
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
    streamingLinks: [
      { name: 'Netflix', url: `https://www.netflix.com/search?q=${encodeURIComponent(m.title)}` },
      { name: 'Apple TV', url: `https://tv.apple.com/search?term=${encodeURIComponent(m.title)}` },
      { name: 'Prime Video', url: `https://www.amazon.com/s?k=${encodeURIComponent(m.title)}` },
    ],
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
            rating: tvApiData.imDbRating ? parseFloat(tvApiData.imDbRating) : 7.5,
            releaseDate: tvApiData.releaseDate || (tvApiData.year ? `${tvApiData.year}-01-01` : '2024-01-01'),
            releaseYear: tvApiData.year || '2024',
            genres: tvApiData.genreList?.map((g) => g.value) || ['Drama'],
            overview: tvApiData.plot || 'Cinematic production.',
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
