import { NextRequest, NextResponse } from 'next/server';
import { TmdbService, getTmdbImageUrl } from '@/services/tmdb/tmdb-service';
import { TvApiService } from '@/services/tv-api/tv-api-service';
import { RawgService } from '@/services/rawg/rawg-service';
import { NormalizedCompany } from '@/lib/normalized-types';

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
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    let company: NormalizedCompany | null = null;

    if (type === 'developer' || type === 'publisher') {
      const rawgRes = await RawgService.getCompany(id, type);
      if (rawgRes.success && rawgRes.data) {
        const rc = rawgRes.data;
        company = {
          id: String(rc.id),
          name: rc.name,
          slug: rc.slug,
          description: rc.description || undefined,
          imageUrl: rc.image_background,
          gamesCount: rc.games_count,
          type: type,
        };
      }
    }

    // Check if ID is TV-API format (co...)
    if (!company && id.startsWith('co')) {
      const tvCompany = await TvApiService.getCompany(id);
      if (tvCompany) {
        company = tvCompany;
      }
    }

    if (!company) {
      const tmdbRes = await TmdbService.getCompanyDetails(id);
      if (tmdbRes.success && tmdbRes.data) {
        const c = tmdbRes.data;
        company = {
          id: String(c.id),
          name: c.name,
          description: c.description || undefined,
          headquarters: c.headquarters,
          country: c.origin_country,
          website: c.homepage,
          logo: c.logo_path ? getTmdbImageUrl(c.logo_path, 'w500') : undefined,
          type: 'production',
        };
      }
    }

    if (!company) {
      // Try RAWG developer or publisher fallback lookup
      const devRes = await RawgService.getCompany(id, 'developer');
      if (devRes.success && devRes.data) {
        const rc = devRes.data;
        company = {
          id: String(rc.id),
          name: rc.name,
          slug: rc.slug,
          description: rc.description || undefined,
          imageUrl: rc.image_background,
          gamesCount: rc.games_count,
          type: 'developer',
        };
      } else {
        const pubRes = await RawgService.getCompany(id, 'publisher');
        if (pubRes.success && pubRes.data) {
          const rc = pubRes.data;
          company = {
            id: String(rc.id),
            name: rc.name,
            slug: rc.slug,
            description: rc.description || undefined,
            imageUrl: rc.image_background,
            gamesCount: rc.games_count,
            type: 'publisher',
          };
        }
      }
    }

    if (!company) {
      return NextResponse.json(
        { success: false, error: `Company ${id} not found.` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: company,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch company ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
