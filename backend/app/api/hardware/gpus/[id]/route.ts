import { NextRequest, NextResponse } from "next/server";
import { gpuService } from "@/services/hardware/gpu-service";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
        { error: "GPU ID is required", source: "real" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const gpu = gpuService.getGpuById(id);
    if (!gpu) {
      return NextResponse.json(
        { error: "GPU with ID '" + id + "' not found", source: "real" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { gpu, source: "real" },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message, source: "real" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
