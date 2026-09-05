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
    const query = searchParams.get("q") ?? undefined;
    const manufacturer = searchParams.get("manufacturer") ?? undefined;
    const formFactor = searchParams.get("formFactor") ?? undefined;
    const socId = searchParams.get("socId") ?? undefined;
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 20;

    const results = deviceService.searchDevices({
      query,
      manufacturer,
      formFactor,
      socId,
      page,
      pageSize,
    });

    return NextResponse.json(results, {
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
