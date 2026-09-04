import { NextResponse } from 'next/server';
import { GooglePlayService } from '@/services/google-play/google-play-service';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const categories = await GooglePlayService.getCategories();
    return NextResponse.json(
      {
        success: true,
        count: Array.isArray(categories) ? categories.length : Object.keys(categories || {}).length,
        data: categories,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Google Play categories.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
