import fs from "fs";
import path from "path";
import type { GpuDevice, GpuSearchResponse } from "@/lib/normalized-types";

interface RawGpuRecord {
  id: string;
  name: string;
  vendor?: string;
  manufacturer?: string;
  gpuName?: string;
  architecture?: string;
  generation?: string;
  releaseDate?: string;
  memorySize?: number;
  memoryType?: string;
  memoryBus?: number;
  memoryBandwidth?: number;
  baseClock?: number;
  boostClock?: number;
  fp32?: number;
  directX?: string | number;
  openGL?: string | number;
  vulkan?: string | number;
  url?: string;
  [key: string]: unknown;
}

function normalizeString(str?: string | null): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function stripVendorPrefix(str: string): string {
  return str.replace(/^(geforce|radeon|arc|intel|amd|nvidia|ati)\s+/i, "").trim();
}

function resolveGpuDataDir(): string {
  const candidates = [
    path.join(process.cwd(), "data", "gpu"),
    path.join(process.cwd(), "backend", "data", "gpu"),
    path.resolve(__dirname, "..", "..", "data", "gpu"),
    path.resolve(__dirname, "..", "data", "gpu"),
    path.resolve(__dirname, "data", "gpu"),
  ];

  for (const dir of candidates) {
    if (
      fs.existsSync(path.join(dir, "amd.json")) &&
      fs.existsSync(path.join(dir, "intel.json")) &&
      fs.existsSync(path.join(dir, "nvidia.json"))
    ) {
      return dir;
    }
  }

  // Fallback: check relative to root of repository if reachable
  const fallback = path.resolve(__dirname, "../../../../backend/data/gpu");
  if (fs.existsSync(path.join(fallback, "amd.json"))) {
    return fallback;
  }

  throw new Error(`GPU dataset directory not found. Searched paths: ${candidates.join(", ")}`);
}

function mapRawToGpuDevice(raw: RawGpuRecord): GpuDevice {
  return {
    id: raw.id,
    name: raw.name,
    vendor: raw.vendor ?? null,
    manufacturer: raw.manufacturer ?? null,
    architecture: raw.architecture ?? null,
    generation: raw.generation ?? null,
    releaseDate: raw.releaseDate ?? null,
    vram: typeof raw.memorySize === "number" ? raw.memorySize : null,
    memoryType: raw.memoryType ?? null,
    memoryBus: typeof raw.memoryBus === "number" ? raw.memoryBus : null,
    memoryBandwidth: typeof raw.memoryBandwidth === "number" ? raw.memoryBandwidth : null,
    baseClock: typeof raw.baseClock === "number" ? raw.baseClock : null,
    boostClock: typeof raw.boostClock === "number" ? raw.boostClock : null,
    fp32: typeof raw.fp32 === "number" ? raw.fp32 : null,
    directX: raw.directX != null ? String(raw.directX) : null,
    openGL: raw.openGL != null ? String(raw.openGL) : null,
    vulkan: raw.vulkan != null ? String(raw.vulkan) : null,
    sourceUrl: raw.url ?? null,
    gpuName: raw.gpuName ?? null,
  };
}

export class GpuService {
  private static instance: GpuService;
  private gpus: GpuDevice[] = [];
  private gpuMap: Map<string, GpuDevice> = new Map();
  private isLoaded = false;

  public static getInstance(): GpuService {
    if (!GpuService.instance) {
      GpuService.instance = new GpuService();
    }
    return GpuService.instance;
  }

  private ensureLoaded(): void {
    if (this.isLoaded) return;

    const dataDir = resolveGpuDataDir();
    const files = ["amd.json", "intel.json", "nvidia.json"];
    const loadedGpus: GpuDevice[] = [];
    const loadedMap: Map<string, GpuDevice> = new Map();

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Authoritative GPU dataset file not found: ${filePath}`);
      }
      const rawContent = fs.readFileSync(filePath, "utf-8");
      const parsedRecords = JSON.parse(rawContent) as RawGpuRecord[];

      for (const record of parsedRecords) {
        if (!record.id || !record.name) continue;
        const mapped = mapRawToGpuDevice(record);
        loadedGpus.push(mapped);
        loadedMap.set(mapped.id.toLowerCase(), mapped);
      }
    }

    this.gpus = loadedGpus;
    this.gpuMap = loadedMap;
    this.isLoaded = true;
  }

  public getAllGpus(): GpuDevice[] {
    this.ensureLoaded();
    return this.gpus;
  }

  public getGpuById(id: string): GpuDevice | null {
    this.ensureLoaded();
    if (!id) return null;
    return this.gpuMap.get(id.toLowerCase().trim()) ?? null;
  }

  private scoreGpu(gpu: GpuDevice, query: string): number {
    const qNorm = normalizeString(query);
    if (!qNorm) return 0;

    const nameNorm = normalizeString(gpu.name);
    const vendorNorm = normalizeString(gpu.vendor);
    const mfrNorm = normalizeString(gpu.manufacturer);
    const fullNameNorm = normalizeString(`${gpu.manufacturer || gpu.vendor || ""} ${gpu.name}`);
    const gpuNameNorm = normalizeString(gpu.gpuName);
    const archNorm = normalizeString(gpu.architecture);
    const genNorm = normalizeString(gpu.generation);

    const strippedNameNorm = stripVendorPrefix(nameNorm);
    const strippedQNorm = stripVendorPrefix(qNorm);
    const qTokens = qNorm.split(/\s+/).filter(Boolean);

    let baseScore = 0;

    // 1. Exact match on name or fullName
    if (nameNorm === qNorm || fullNameNorm === qNorm) {
      baseScore = 1000;
    }
    // 1b. Exact match on stripped name (e.g. "rtx 4070" matches "geforce rtx 4070")
    else if (strippedNameNorm === strippedQNorm || strippedNameNorm === qNorm) {
      baseScore = 980;
    }
    // 2. Exact match on gpuName
    else if (gpuNameNorm === qNorm) {
      baseScore = 900;
    }
    // 3. Prefix match
    else if (nameNorm.startsWith(qNorm) || fullNameNorm.startsWith(qNorm)) {
      baseScore = 850;
    }
    else if (strippedNameNorm.startsWith(strippedQNorm) || strippedNameNorm.startsWith(qNorm)) {
      baseScore = 820;
    }
    // 4. Substring phrase match in name or fullName
    else if (nameNorm.includes(qNorm) || fullNameNorm.includes(qNorm)) {
      baseScore = 750;
    }
    else {
      // 5. Token matching across all fields
      const allSearchText = `${fullNameNorm} ${nameNorm} ${vendorNorm} ${mfrNorm} ${gpuNameNorm} ${archNorm} ${genNorm}`;
      const allTokensMatch = qTokens.every(t => allSearchText.includes(t));
      if (allTokensMatch) {
        baseScore = 600;
        const nameTokensMatch = qTokens.every(t => nameNorm.includes(t));
        if (nameTokensMatch) baseScore += 100;
      }
    }

    if (baseScore === 0) return 0;

    let score = baseScore;

    // Penalties for modifiers not requested in query
    const modifiers = ["ti", "super", "xt", "xtx", "gre", "mobile", "max-q", "max q"];
    for (const mod of modifiers) {
      const modClean = mod.replace("-", " ");
      if (!qNorm.includes(modClean) && (nameNorm.includes(modClean) || (gpu.name || "").toLowerCase().includes(mod))) {
        score -= (modClean === "mobile" || modClean.includes("max")) ? 60 : 30;
      }
    }

    // Length difference penalty to favor concise matches
    const lenDiff = Math.abs(strippedNameNorm.length - strippedQNorm.length);
    score -= Math.min(lenDiff * 2, 80);

    return Math.max(score, 1);
  }

  public searchGpus(query?: string, page = 1, pageSize = 20): GpuSearchResponse {
    this.ensureLoaded();

    const sanitizedPage = Math.max(1, Math.floor(page || 1));
    const sanitizedPageSize = Math.max(1, Math.min(100, Math.floor(pageSize || 20)));
    const trimmedQuery = (query || "").trim();

    let matched: { gpu: GpuDevice; score: number }[] = [];

    if (!trimmedQuery) {
      // If query is empty, return all GPUs ordered by releaseDate desc
      matched = this.gpus.map((gpu) => ({ gpu, score: 1 }));
    } else {
      for (const gpu of this.gpus) {
        const score = this.scoreGpu(gpu, trimmedQuery);
        if (score > 0) {
          matched.push({ gpu, score });
        }
      }
    }

    // Deterministic sorting
    matched.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const dateA = a.gpu.releaseDate || "";
      const dateB = b.gpu.releaseDate || "";
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      return a.gpu.name.localeCompare(b.gpu.name);
    });

    const total = matched.length;
    const totalPages = Math.ceil(total / sanitizedPageSize) || 1;
    const startIndex = (sanitizedPage - 1) * sanitizedPageSize;
    const paginatedResults = matched.slice(startIndex, startIndex + sanitizedPageSize).map((m) => m.gpu);

    return {
      query: trimmedQuery,
      results: paginatedResults,
      pagination: {
        page: sanitizedPage,
        pageSize: sanitizedPageSize,
        total,
        totalPages,
      },
      source: "real",
    };
  }
}

export const gpuService = GpuService.getInstance();
