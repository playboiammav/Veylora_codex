import { NextRequest, NextResponse } from 'next/server';
import { GogService } from '@/services/gog/gog-service';

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

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Product ID or slug is required.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = await GogService.getGameDetails(id);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error || 'GOG product not found.' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      success: true,
      platform: 'gog',
      source: result.source,
      data: result.data,
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
