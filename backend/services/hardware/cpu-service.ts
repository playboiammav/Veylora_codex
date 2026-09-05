import fs from "fs";
import path from "path";
import type { CpuDevice, CpuSearchResponse } from "@/lib/normalized-types";

function normalizeString(str?: string | null): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function stripManufacturerPrefix(str: string): string {
  return str.replace(/^(intel|amd)\s+/i, "").trim();
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

function resolveCpuDataDir(): string {
  const baseDir = getDirname();
  const candidates = [
    path.join(process.cwd(), "data", "cpu"),
    path.join(process.cwd(), "backend", "data", "cpu"),
    path.resolve(baseDir, "..", "..", "data", "cpu"),
    path.resolve(baseDir, "..", "data", "cpu"),
    path.resolve(baseDir, "data", "cpu"),
  ];

  for (const dir of candidates) {
    if (
      fs.existsSync(path.join(dir, "amd.json")) &&
      fs.existsSync(path.join(dir, "intel.json"))
    ) {
      return dir;
    }
  }

  const fallback = path.resolve(baseDir, "../../../../backend/data/cpu");
  if (fs.existsSync(path.join(fallback, "amd.json"))) {
    return fallback;
  }

  throw new Error(`CPU dataset directory not found. Searched paths: ${candidates.join(", ")}`);
}

export class CpuService {
  private static instance: CpuService;
  private cpus: CpuDevice[] = [];
  private cpuMap: Map<string, CpuDevice> = new Map();
  private isLoaded = false;

  public static getInstance(): CpuService {
    if (!CpuService.instance) {
      CpuService.instance = new CpuService();
    }
    return CpuService.instance;
  }

  private ensureLoaded(): void {
    if (this.isLoaded) return;

    const dataDir = resolveCpuDataDir();
    const files = ["amd.json", "intel.json"];
    const loadedCpus: CpuDevice[] = [];
    const loadedMap: Map<string, CpuDevice> = new Map();

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Authoritative CPU dataset file not found: ${filePath}`);
      }
      const rawContent = fs.readFileSync(filePath, "utf-8");
      const parsedRecords = JSON.parse(rawContent) as CpuDevice[];

      for (const record of parsedRecords) {
        if (!record.id || !record.name) continue;
        loadedCpus.push(record);
        loadedMap.set(record.id.toLowerCase().trim(), record);
        if (Array.isArray(record.aliasIds)) {
          for (const alias of record.aliasIds) {
            const cleanAlias = alias?.toLowerCase().trim();
            if (cleanAlias && !loadedMap.has(cleanAlias)) {
              loadedMap.set(cleanAlias, record);
            }
          }
        }
      }
    }

    this.cpus = loadedCpus;
    this.cpuMap = loadedMap;
    this.isLoaded = true;
  }

  public getAllCpus(): CpuDevice[] {
    this.ensureLoaded();
    return this.cpus;
  }

  public getCpuById(id: string): CpuDevice | null {
    this.ensureLoaded();
    if (!id) return null;
    return this.cpuMap.get(id.toLowerCase().trim()) ?? null;
  }

  private scoreCpu(cpu: CpuDevice, query: string): number {
    const qNorm = normalizeString(query);
    if (!qNorm) return 0;

    const nameNorm = normalizeString(cpu.name);
    const mfrNorm = normalizeString(cpu.manufacturer);
    const familyNorm = normalizeString(cpu.family);
    const partNorm = normalizeString(cpu.partNumber);
    const archNorm = normalizeString(cpu.architecture);
    const microNorm = normalizeString(cpu.microarchitecture);
    const idNorm = normalizeString(cpu.id.replace(/^(intel|amd):/i, ""));
    const fullNameNorm = normalizeString(`${cpu.manufacturer} ${cpu.family || ""} ${cpu.name} ${cpu.partNumber || ""}`);

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
    // 3. Exact family match
    else if (familyNorm && (familyNorm === qNorm || familyNorm === strippedQNorm)) {
      baseScore = 900;
    }
    // 4. Prefix match
    else if (nameNorm.startsWith(qNorm) || fullNameNorm.startsWith(qNorm)) {
      baseScore = 850;
    } else if (strippedNameNorm.startsWith(strippedQNorm) && strippedQNorm.length > 0) {
      baseScore = 820;
    } else if (partNorm && partNorm.startsWith(qNorm)) {
      baseScore = 800;
    }
    // 5. Substring match
    else if (nameNorm.includes(qNorm) || fullNameNorm.includes(qNorm)) {
      baseScore = 750;
    } else if (partNorm && partNorm.includes(qNorm)) {
      baseScore = 720;
    } else if (familyNorm && familyNorm.includes(qNorm)) {
      baseScore = 700;
    }
    // 6. Multi-token relevance
    else {
      const allSearchText = `${fullNameNorm} ${nameNorm} ${partNorm} ${familyNorm} ${archNorm} ${microNorm} ${mfrNorm} ${idNorm}`;
      const allTokensMatch = qTokens.every((t) => allSearchText.includes(t));
      if (allTokensMatch) {
        baseScore = 600;
        if (qTokens.every((t) => nameNorm.includes(t))) {
          baseScore += 100;
        }
        if (partNorm && qTokens.some((t) => partNorm.includes(t))) {
          baseScore += 50;
        }
        if (familyNorm && qTokens.some((t) => familyNorm.includes(t))) {
          baseScore += 40;
        }
      }
    }

    if (baseScore === 0) return 0;

    let score = baseScore;

    // Length difference penalty to favor concise matches
    const lenDiff = Math.abs(strippedNameNorm.length - strippedQNorm.length);
    score -= Math.min(lenDiff, 60);

    return Math.max(score, 1);
  }

  public searchCpus(options?: {
    query?: string;
    manufacturer?: string;
    page?: number;
    pageSize?: number;
  }): CpuSearchResponse {
    this.ensureLoaded();

    const sanitizedPage = Math.max(1, Math.floor(options?.page || 1));
    const sanitizedPageSize = Math.max(1, Math.min(100, Math.floor(options?.pageSize || 20)));
    const trimmedQuery = (options?.query || "").trim();
    const targetMfr = options?.manufacturer?.trim().toLowerCase();

    let candidateList = this.cpus;
    if (targetMfr) {
      candidateList = candidateList.filter(
        (cpu) => cpu.manufacturer.toLowerCase() === targetMfr
      );
    }

    let matched: { cpu: CpuDevice; score: number }[] = [];

    if (!trimmedQuery) {
      matched = candidateList.map((cpu) => ({ cpu, score: 1 }));
    } else {
      for (const cpu of candidateList) {
        const score = this.scoreCpu(cpu, trimmedQuery);
        if (score > 0) {
          matched.push({ cpu, score });
        }
      }
    }

    // Deterministic tie breakers:
    // 1. score descending
    // 2. release date descending when available
    // 3. name ascending
    // 4. id ascending
    matched.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const dateA = a.cpu.releaseDate || "";
      const dateB = b.cpu.releaseDate || "";
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      const nameCmp = a.cpu.name.localeCompare(b.cpu.name);
      if (nameCmp !== 0) return nameCmp;
      return a.cpu.id.localeCompare(b.cpu.id);
    });

    const total = matched.length;
    const startIndex = (sanitizedPage - 1) * sanitizedPageSize;
    const paginatedResults = matched
      .slice(startIndex, startIndex + sanitizedPageSize)
      .map((m) => m.cpu);

    return {
      total,
      page: sanitizedPage,
      pageSize: sanitizedPageSize,
      results: paginatedResults,
    };
  }
}

export const cpuService = CpuService.getInstance();
