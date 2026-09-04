import { NextRequest, NextResponse } from 'next/server';
import { TmdbService, getTmdbImageUrl } from '@/services/tmdb/tmdb-service';
import { TvApiService } from '@/services/tv-api/tv-api-service';
import { NormalizedPerson } from '@/lib/normalized-types';

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
    let person: NormalizedPerson | null = null;

    // Check if ID is TV-API/IMDb format (nm...)
    if (id.startsWith('nm')) {
      const tvPerson = await TvApiService.getName(id);
      if (tvPerson) {
        person = tvPerson;
      }
    }

    if (!person) {
      // Lookup person via TMDB
      const tmdbRes = await TmdbService.getPersonDetails(id);
      if (tmdbRes.success && tmdbRes.data) {
        const p = tmdbRes.data;
        const imdbId = p.imdb_id || p.external_ids?.imdb_id;

        const castCredits = (p.combined_credits?.cast || []).map((m: any) => ({
          id: String(m.id),
          title: m.title || m.name || 'Untitled',
          year: (m.release_date || m.first_air_date) ? (m.release_date || m.first_air_date).split('-')[0] : undefined,
          role: m.character,
          character: m.character,
          rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : undefined,
          type: (m.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv',
          poster: m.poster_path ? getTmdbImageUrl(m.poster_path, 'w500') : undefined,
          popularity: m.popularity || 0,
        }));

        const crewCredits = (p.combined_credits?.crew || []).map((m: any) => ({
          id: String(m.id),
          title: m.title || m.name || 'Untitled',
          year: (m.release_date || m.first_air_date) ? (m.release_date || m.first_air_date).split('-')[0] : undefined,
          role: m.job || m.department,
          character: undefined,
          rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : undefined,
          type: (m.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv',
          poster: m.poster_path ? getTmdbImageUrl(m.poster_path, 'w500') : undefined,
          popularity: m.popularity || 0,
        }));

        const seenIds = new Set<string>();
        const filmography = [...castCredits, ...crewCredits]
          .filter((item) => {
            if (seenIds.has(item.id)) return false;
            seenIds.add(item.id);
            return true;
          })
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

        const knownFor = filmography.slice(0, 8).map((m) => ({
          id: m.id,
          title: m.title,
          year: m.year,
          role: m.role,
          poster: m.poster,
          rating: m.rating,
          type: m.type,
        }));

        person = {
          id: String(p.id),
          tmdbId: p.id,
          imdbId,
          name: p.name,
          role: p.known_for_department || 'Actor',
          photo: p.profile_path ? getTmdbImageUrl(p.profile_path, 'w500') : null,
          biography: p.biography || '',
          birthDate: p.birthday,
          deathDate: p.deathday,
          birthPlace: p.place_of_birth,
          popularity: p.popularity,
          knownFor,
          filmography,
        };

        // If person has imdb_id, enrich with TV-API awards
        if (imdbId) {
          const tvEnrichment = await TvApiService.getName(imdbId);
          if (tvEnrichment && person) {
            person.awardsSummary = tvEnrichment.awardsSummary;
            person.height = tvEnrichment.height;
          }
        }
      }
    }

    if (!person) {
      return NextResponse.json(
        { success: false, error: `Person ${id} not found.` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: person,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch person ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
