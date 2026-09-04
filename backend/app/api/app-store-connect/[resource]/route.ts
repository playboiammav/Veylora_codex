import { NextRequest, NextResponse } from 'next/server';
import { AppStoreConnectService } from '@/services/app-store-connect/app-store-connect-service';

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
  { params }: { params: Promise<{ resource: string }> }
) {
  const { resource } = await params;
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId') || '6443892110';

  try {
    switch (resource.toLowerCase()) {
      case 'apps': {
        const apps = await AppStoreConnectService.listApps();
        return NextResponse.json(
          {
            success: true,
            resource: 'apps',
            source: apps.source,
            count: apps.data.length,
            data: apps.data,
          },
          { status: 200, headers: CORS_HEADERS }
        );
      }

      case 'versions': {
        const versions = await AppStoreConnectService.listVersions(appId);
        return NextResponse.json(
          { success: true, resource: 'versions', appId, data: versions },
          { status: 200, headers: CORS_HEADERS }
        );
      }

      case 'builds': {
        const builds = await AppStoreConnectService.listBuilds(appId);
        return NextResponse.json(
          { success: true, resource: 'builds', appId, data: builds },
          { status: 200, headers: CORS_HEADERS }
        );
      }

      case 'review': {
        const review = await AppStoreConnectService.getReviewStatus(appId);
        return NextResponse.json(
          { success: true, resource: 'review', data: review },
          { status: 200, headers: CORS_HEADERS }
        );
      }

      case 'validate':
      case 'status': {
        const hasKeyId = Boolean(process.env.APPLE_KEY_ID);
        const hasIssuerId = Boolean(process.env.APPLE_ISSUER_ID);
        const hasKey = Boolean(process.env.APPLE_PRIVATE_KEY || process.env.APPLE_PRIVATE_KEY_PATH);
        const isConfigured = hasKeyId && hasIssuerId && hasKey;

        return NextResponse.json(
          {
            success: true,
            resource,
            status: isConfigured ? 'CONFIGURED' : 'SANDBOX_SAMPLE_MODE',
            isConfigured,
            supportedPlatforms: ['iOS', 'macOS', 'tvOS', 'visionOS'],
            timestamp: new Date().toISOString(),
          },
          { status: 200, headers: CORS_HEADERS }
        );
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_RESOURCE',
            message: `Resource '${resource}' is not supported. Use: apps, versions, builds, review, validate, status.`,
          },
          { status: 400, headers: CORS_HEADERS }
        );
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'App Store Connect API request failed.',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
