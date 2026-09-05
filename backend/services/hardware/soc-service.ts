import fs from "fs";
import path from "path";
import type {
  SocDevice,
  SocSearchResponse,
  SocDetailResponse,
} from "@/lib/normalized-types";

export interface SocSearchParams {
  query?: string;
  manufacturer?: string;
  formFactor?: string;
  page?: number;
  pageSize?: number;
}

function normalizeString(str?: string | null): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function stripManufacturerPrefix(str: string): string {
  return str.replace(/^(qualcomm|mediatek|samsung|google|apple|hisilicon|unisoc)\s+/i, "").trim();
}

function getDirname(): string {
  if (typeof __dirname !== "undefined") {
    return __dirname;
  }
  try {
    return path.dirname(new URL(import.meta.url).pathname);
  } catch {
    return process.cwd();
  }
}

function resolveSocDataDir(): string {
  const baseDir = getDirname();
  const candidates = [
    path.join(process.cwd(), "data", "soc"),
    path.join(process.cwd(), "backend", "data", "soc"),
    path.resolve(baseDir, "..", "..", "data", "soc"),
    path.resolve(baseDir, "..", "data", "soc"),
    path.resolve(baseDir, "data", "soc"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "soc.json"))) {
      return dir;
    }
  }

  const fallback = path.resolve(baseDir, "../../../../backend/data/soc");
  if (fs.existsSync(path.join(fallback, "soc.json"))) {
    return fallback;
  }

  throw new Error(`SoC dataset directory not found. Searched paths: ${candidates.join(", ")}`);
}

export class SocService {
  private static instance: SocService;
  private socs: SocDevice[] = [];
  private socMap: Map<string, SocDevice> = new Map();
  private isLoaded = false;

  public static getInstance(): SocService {
    if (!SocService.instance) {
      SocService.instance = new SocService();
    }
    return SocService.instance;
  }

  private ensureLoaded(): void {
    if (this.isLoaded) return;

    const dataDir = resolveSocDataDir();
    const filePath = path.join(dataDir, "soc.json");
    if (!fs.existsSync(filePath)) {
      throw new Error(`Authoritative SoC dataset file not found: ${filePath}`);
    }

    const rawContent = fs.readFileSync(filePath, "utf-8");
    const parsedRecords = JSON.parse(rawContent) as SocDevice[];

    const loadedSocs: SocDevice[] = [];
    const loadedMap: Map<string, SocDevice> = new Map();

    for (const record of parsedRecords) {
      if (!record.id || !record.name) continue;
      loadedSocs.push(record);

      const normId = record.id.toLowerCase().trim();
      loadedMap.set(normId, record);

      if (normId.includes(":")) {
        const bareId = normId.split(":")[1];
        if (bareId && !loadedMap.has(bareId)) {
          loadedMap.set(bareId, record);
        }
      }

      if (record.partNumber) {
        const cleanPart = record.partNumber.toLowerCase().trim();
        if (!loadedMap.has(cleanPart)) {
          loadedMap.set(cleanPart, record);
        }
        const strippedPart = cleanPart.replace(/[^a-z0-9]/g, "");
        if (strippedPart && !loadedMap.has(strippedPart)) {
          loadedMap.set(strippedPart, record);
        }
      }

      if (Array.isArray(record.aliases)) {
        for (const alias of record.aliases) {
          const cleanAlias = alias?.toLowerCase().trim();
          if (cleanAlias && !loadedMap.has(cleanAlias)) {
            loadedMap.set(cleanAlias, record);
          }
        }
      }
    }

    this.socs = loadedSocs;
    this.socMap = loadedMap;
    this.isLoaded = true;
  }

  public getAllSocs(): SocDevice[] {
    this.ensureLoaded();
    return this.socs;
  }

  public getSocById(id: string): SocDevice | null {
    this.ensureLoaded();
    if (!id) return null;
    return this.socMap.get(id.toLowerCase().trim()) ?? null;
  }

  private scoreSoc(soc: SocDevice, query: string): number {
    const qNorm = normalizeString(query);
    if (!qNorm) return 0;

    const nameNorm = normalizeString(soc.name);
    const mfrNorm = normalizeString(soc.manufacturer);
    const familyNorm = normalizeString(soc.family);
    const partNorm = normalizeString(soc.partNumber);
    const gpuNorm = normalizeString(soc.gpu);
    const idNorm = normalizeString(soc.id.replace(/^[a-z0-9]+:/i, ""));
    const fullNameNorm = normalizeString(`${soc.manufacturer} ${soc.family || ""} ${soc.name} ${soc.partNumber || ""}`);

    const strippedNameNorm = stripManufacturerPrefix(nameNorm);
    const strippedQNorm = stripManufacturerPrefix(qNorm);
    const qTokens = qNorm.split(/\s+/).filter(Boolean);

    let baseScore = 0;

    // 1. Exact full-name match
    if (nameNorm === qNorm || fullNameNorm === qNorm) {
      baseScore = 1000;
    }
    // 1b. Exact stripped match
    else if (strippedNameNorm === strippedQNorm || (strippedNameNorm === qNorm && strippedNameNorm.length > 0)) {
      baseScore = 980;
    }
    // 2. Exact part or ID match
    else if ((partNorm && partNorm === qNorm) || idNorm === qNorm) {
      baseScore = 950;
    }
    // 3. Exact alias match
    else if (soc.aliases?.some((a) => a.toLowerCase() === qNorm || a.toLowerCase().replace(/[^a-z0-9]/g, "") === qNorm.replace(/[^a-z0-9]/g, ""))) {
      baseScore = 920;
    }
    // 4. Name starts with query
    else if (nameNorm.startsWith(qNorm) || strippedNameNorm.startsWith(strippedQNorm)) {
      baseScore = 850;
    }
    // 5. Name contains full query as substring
    else if (nameNorm.includes(qNorm) || strippedNameNorm.includes(strippedQNorm)) {
      baseScore = 700;
    }
    // 6. Any alias contains or starts with query
    else if (soc.aliases?.some((a) => a.toLowerCase().includes(qNorm) || qNorm.includes(a.toLowerCase()))) {
      baseScore = 600;
    }
    // 7. GPU exact or contains query
    else if (gpuNorm.includes(qNorm)) {
      baseScore = 500;
    }
    // 8. All tokens match across combined text fields
    else {
      const combined = `${fullNameNorm} ${idNorm} ${gpuNorm} ${(soc.aliases || []).join(" ")}`;
      const allTokensMatch = qTokens.length > 0 && qTokens.every((tok) => combined.includes(tok));
      if (allTokensMatch) {
        baseScore = 400 + qTokens.length * 20;
      } else {
        const matchedTokens = qTokens.filter((tok) => combined.includes(tok));
        if (matchedTokens.length >= 2 || (qTokens.length === 1 && matchedTokens.length === 1 && qTokens[0].length >= 3)) {
          baseScore = (matchedTokens.length / qTokens.length) * 300;
        }
      }
    }

    if (baseScore === 0) return 0;

    // Recency bonus (newer SoCs get slight edge in ties)
    let bonus = 0;
    if (soc.releaseDate) {
      const year = parseInt(soc.releaseDate.substring(0, 4), 10);
      if (!isNaN(year) && year >= 2020) {
        bonus += (year - 2020) * 2;
      }
    }

    // Flagship / higher clock bonus
    if (soc.cpuClockMax) {
      bonus += Math.min(soc.cpuClockMax / 1000, 5);
    }

    return baseScore + bonus;
  }

  public searchSocs(params: SocSearchParams = {}): SocSearchResponse {
    this.ensureLoaded();

    const {
      query,
      manufacturer,
      formFactor,
      page = 1,
      pageSize = 20,
    } = params;

    const cleanPage = Math.max(1, page);
    const cleanPageSize = Math.min(100, Math.max(1, pageSize));

    let filtered = this.socs;

    // Filter by manufacturer if requested
    if (manufacturer && manufacturer.trim()) {
      const normMfr = manufacturer.trim().toLowerCase();
      filtered = filtered.filter((s) => s.manufacturer.toLowerCase() === normMfr);
    }

    // Filter by formFactor if requested
    if (formFactor && formFactor.trim()) {
      const normFF = formFactor.trim().toLowerCase();
      filtered = filtered.filter((s) =>
        s.formFactor.some((f) => f.toLowerCase() === normFF)
      );
    }

    let scored: { soc: SocDevice; score: number }[];

    if (query && query.trim()) {
      const q = query.trim();
      scored = filtered
        .map((soc) => ({ soc, score: this.scoreSoc(soc, q) }))
        .filter((item) => item.score > 0);

      // Sort by score descending, then deterministic tie-breakers
      scored.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        if (a.soc.releaseDate && b.soc.releaseDate) {
          const cmp = b.soc.releaseDate.localeCompare(a.soc.releaseDate);
          if (cmp !== 0) return cmp;
        } else if (a.soc.releaseDate && !b.soc.releaseDate) {
          return -1;
        } else if (!a.soc.releaseDate && b.soc.releaseDate) {
          return 1;
        }
        if (b.soc.cpuClockMax !== a.soc.cpuClockMax) {
          return b.soc.cpuClockMax - a.soc.cpuClockMax;
        }
        if (a.soc.name !== b.soc.name) {
          return a.soc.name.localeCompare(b.soc.name);
        }
        return a.soc.id.localeCompare(b.soc.id);
      });
    } else {
      // Default deterministic ordering when no query
      const sorted = [...filtered].sort((a, b) => {
        if (a.releaseDate && b.releaseDate) {
          const cmp = b.releaseDate.localeCompare(a.releaseDate);
          if (cmp !== 0) return cmp;
        } else if (a.releaseDate && !b.releaseDate) {
          return -1;
        } else if (!a.releaseDate && b.releaseDate) {
          return 1;
        }
        if (b.cpuClockMax !== a.cpuClockMax) {
          return b.cpuClockMax - a.cpuClockMax;
        }
        if (a.name !== b.name) {
          return a.name.localeCompare(b.name);
        }
        return a.id.localeCompare(b.id);
      });
      scored = sorted.map((soc) => ({ soc, score: 1 }));
    }

    const total = scored.length;
    const totalPages = Math.ceil(total / cleanPageSize) || 0;
    const startIndex = (cleanPage - 1) * cleanPageSize;
    const pagedResults = scored
      .slice(startIndex, startIndex + cleanPageSize)
      .map((item) => item.soc);

    return {
      total,
      page: cleanPage,
      pageSize: cleanPageSize,
      totalPages,
      results: pagedResults,
    };
  }
}

export const socService = SocService.getInstance();
