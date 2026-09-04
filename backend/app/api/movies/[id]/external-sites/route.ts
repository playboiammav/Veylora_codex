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
    let tmdbId = id;

    if (!imdbId) {
      const tmdbRes = await TmdbService.getMovieDetails(id);
      if (tmdbRes.success && tmdbRes.data) {
        imdbId = tmdbRes.data.imdb_id || tmdbRes.data.external_ids?.imdb_id;
        tmdbId = String(tmdbRes.data.id);
      }
    }

    const sites: { name: string; url: string; category?: string }[] = [];

    if (imdbId) {
      sites.push({ name: 'IMDb', url: `https://www.imdb.com/title/${imdbId}/`, category: 'Official Database' });
    }
    if (tmdbId && !tmdbId.startsWith('tt')) {
      sites.push({ name: 'TheMovieDB', url: `https://www.themoviedb.org/movie/${tmdbId}`, category: 'Movie Community' });
    }

    if (imdbId) {
      const ext = await TvApiService.getExternalSites(imdbId);
      if (ext) {
        if (ext.officialWebsite) sites.push({ name: 'Official Website', url: ext.officialWebsite, category: 'Official' });
        if (ext.rottenTomatoes?.url) sites.push({ name: 'Rotten Tomatoes', url: ext.rottenTomatoes.url, category: 'Reviews' });
        if (ext.metacritic?.url) sites.push({ name: 'Metacritic', url: ext.metacritic.url, category: 'Reviews' });
        if (ext.netflix?.url) sites.push({ name: 'Netflix', url: ext.netflix.url, category: 'Streaming' });
        if (ext.amazonPrime?.url) sites.push({ name: 'Prime Video', url: ext.amazonPrime.url, category: 'Streaming' });
        if (ext.websites) {
          for (const w of ext.websites) {
            if (!sites.some((s) => s.url === w.url)) {
              sites.push({ name: w.name, url: w.url, category: 'Reference' });
            }
          }
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        id,
        imdbId,
        sites,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch external sites for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
