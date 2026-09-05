import { NextRequest, NextResponse } from "next/server";
import { cpuService } from "@/services/hardware/cpu-service";

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
        { error: "CPU ID is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const cpu = cpuService.getCpuById(id);
    if (!cpu) {
      return NextResponse.json(
        { error: `CPU with ID '${id}' not found` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(cpu, {
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
