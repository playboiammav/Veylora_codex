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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? searchParams.get("model") ?? searchParams.get("id") ?? undefined;
    const manufacturer = searchParams.get("manufacturer") ?? undefined;

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q', 'model', or 'id' is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const soc = socService.resolveSoc(query, manufacturer);

    return NextResponse.json(
      {
        soc,
        matchedBy: soc ? (soc.id === query.toLowerCase() ? "id" : "canonical_or_alias") : null,
        source: "real",
      },
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
