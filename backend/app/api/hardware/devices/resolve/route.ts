import { NextRequest, NextResponse } from "next/server";
import { deviceService } from "@/services/hardware/device-service";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const manufacturer = searchParams.get("manufacturer") ?? undefined;
    const model = searchParams.get("model") ?? undefined;
    const codename = searchParams.get("codename") ?? undefined;
    const socManufacturer = searchParams.get("socManufacturer") ?? undefined;
    const socModel = searchParams.get("socModel") ?? undefined;
    const identifier = searchParams.get("identifier") ?? undefined;

    const result = deviceService.resolveDevice({
      manufacturer,
      model,
      codename,
      socManufacturer,
      socModel,
      identifier,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
