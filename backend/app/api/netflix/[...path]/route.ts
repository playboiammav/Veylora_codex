import { NextRequest, NextResponse } from 'next/server';
import { NetflixService } from '@/services/netflix/netflix-service';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = (path || []).join('/');
  const { searchParams } = new URL(request.url);

  try {
    // 1. GET media catalog or search
    if (pathStr === 'media') {
      const genre = searchParams.get('genre') || undefined;
      const search = searchParams.get('search') || undefined;
      const result = await NetflixService.getMedia(genre, search);
      return NextResponse.json(result, { status: 200, headers: CORS_HEADERS });
    }

    // 2. GET media details /media/{mediaId}
    if (path[0] === 'media' && path.length === 2 && path[1] !== 'search' && path[1] !== 'watchlist') {
      const mediaId = path[1];
      const result = await NetflixService.getMediaDetail(mediaId);
      return NextResponse.json(result, { status: 200, headers: CORS_HEADERS });
    }

    // 3. GET media search /media/search/{search}
    if (path[0] === 'media' && path[1] === 'search' && path[2]) {
      const searchTerm = decodeURIComponent(path[2]);
      const result = await NetflixService.getMedia(undefined, searchTerm);
      return NextResponse.json(result, { status: 200, headers: CORS_HEADERS });
    }

    // 4. GET media watchlist /media/watchlist/{userId}
    if (path[0] === 'media' && path[1] === 'watchlist' && path[2]) {
      const userId = path[2];
      const items = await NetflixService.getWatchlist(userId);
      return NextResponse.json({ success: true, userId, count: items.length, data: items }, { status: 200, headers: CORS_HEADERS });
    }

    // 5. GET media recommend /media/recommend/{userId}
    if (path[0] === 'media' && path[1] === 'recommend') {
      const items = await NetflixService.getMedia();
      return NextResponse.json({ success: true, recommendations: items.data.slice(0, 3) }, { status: 200, headers: CORS_HEADERS });
    }

    // 6. GET logout /logout
    if (pathStr === 'logout') {
      return NextResponse.json({ success: true, message: 'Logged out successfully.' }, { status: 200, headers: CORS_HEADERS });
    }

    // 7. GET profile /profile
    if (pathStr === 'profile') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'usr-421',
          name: 'Demo Subscriber',
          email: 'demo@example.com',
          plan: 'Premium 4K HDR',
          isSubscribed: true,
        },
      }, { status: 200, headers: CORS_HEADERS });
    }

    // Fallback: proxy directly to Netflix Base API
    const base = process.env.NETFLIX_API_URL || 'https://netflix-api-g992.onrender.com';
    const upstreamRes = await fetch(`${base}/${pathStr}`, {
      headers: { Accept: 'application/json' },
    });
    if (upstreamRes.ok) {
      const data = await upstreamRes.json();
      return NextResponse.json(data, { status: 200, headers: CORS_HEADERS });
    }

    return NextResponse.json(
      { success: false, error: `Netflix route '${pathStr}' not handled.` },
      { status: 404, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Netflix API request failed.' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = (path || []).join('/');

  try {
    const body = await request.json().catch(() => ({}));

    // 1. POST /login
    if (pathStr === 'login') {
      const result = await NetflixService.login(body.email, body.password);
      return NextResponse.json(result, { status: 200, headers: CORS_HEADERS });
    }

    // 2. POST /register
    if (pathStr === 'register') {
      const result = await NetflixService.register(body.name, body.email, body.password);
      return NextResponse.json(result, { status: 200, headers: CORS_HEADERS });
    }

    // 3. POST /forgotpassword
    if (pathStr === 'forgotpassword') {
      return NextResponse.json({
        success: true,
        message: `Password reset instructions dispatched to ${body.email || 'user email'}.`,
      }, { status: 200, headers: CORS_HEADERS });
    }

    // 4. POST /payment
    if (pathStr === 'payment') {
      return NextResponse.json({
        success: true,
        message: 'Subscription payment processed successfully.',
        transactionId: `tx_live_${Date.now()}`,
        status: 'ACTIVE',
      }, { status: 200, headers: CORS_HEADERS });
    }

    // 5. POST /media/stream/{mediaId}/{userId}
    if (path[0] === 'media' && path[1] === 'stream') {
      const mediaId = path[2];
      const userId = path[3];
      return NextResponse.json({
        success: true,
        message: 'Stream playback session initialized.',
        mediaId,
        userId,
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      }, { status: 200, headers: CORS_HEADERS });
    }

    // 6. POST /media/watchlist/{mediaId}/{userId}
    if (path[0] === 'media' && path[1] === 'watchlist') {
      const mediaId = path[2];
      const userId = path[3];
      return NextResponse.json({
        success: true,
        message: 'Media added to user watchlist.',
        mediaId,
        userId,
      }, { status: 200, headers: CORS_HEADERS });
    }

    return NextResponse.json(
      { success: true, message: `Action '${pathStr}' completed.` },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Action failed.' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
