import { NextRequest, NextResponse } from "next/server";
import { socService } from "@/services/hardware/soc-service";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "SoC ID or alias is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const soc = socService.getSocById(id);
    if (!soc) {
      return NextResponse.json(
        { error: `SoC with ID or alias '${id}' not found` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { soc, source: "real" },
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
