import { NextRequest, NextResponse } from 'next/server';
import { TmdbService } from '@/services/tmdb/tmdb-service';
import { TvApiService } from '@/services/tv-api/tv-api-service';
import { MovieAwardItem } from '@/lib/normalized-types';

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

    if (!imdbId) {
      const tmdbRes = await TmdbService.getMovieDetails(id);
      if (tmdbRes.success && tmdbRes.data) {
        imdbId = tmdbRes.data.imdb_id || tmdbRes.data.external_ids?.imdb_id;
      }
    }

    const awards: MovieAwardItem[] = [];
    let awardsSummary = '';

    if (imdbId) {
      const awardsData = await TvApiService.getAwards(imdbId);
      if (awardsData) {
        awardsSummary = awardsData.description || '';
        if (awardsData.items) {
          for (const event of awardsData.items) {
            if (event.outcomeItems) {
              for (const outcome of event.outcomeItems) {
                const detailsText = outcome.outcomeDetails?.map((d) => d.plainText).join('; ') || '';
                awards.push({
                  awardTitle: outcome.outcomeTitle || event.eventTitle,
                  eventName: event.eventTitle,
                  category: outcome.outcomeCategory,
                  forYear: outcome.outcomeYear,
                  isWinner: outcome.isWinner !== undefined ? outcome.isWinner : outcome.outcomeTitle.toLowerCase().includes('winner'),
                  description: detailsText,
                });
              }
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
        awardsSummary,
        awards,
        totalAwards: awards.length,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to fetch awards for ${id}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
