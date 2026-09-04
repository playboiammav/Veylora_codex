import { NextRequest, NextResponse } from 'next/server';
import { EpicService } from '@/services/epic/epic-service';

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
  const state = searchParams.get('state') || undefined;
  const scope = searchParams.get('scope') || 'basic_profile';
  const redirect = searchParams.get('redirect') === 'true';

  const authUrl = EpicService.getAuthorizationUrl(state, scope);

  if (redirect) {
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.json(
    {
      success: true,
      authorizationUrl: authUrl,
      instructions: 'Navigate user to authorizationUrl or use redirect=true parameter.',
      service: 'epic_eos',
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
