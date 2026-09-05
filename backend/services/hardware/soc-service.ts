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

const CANONICAL_OVERRIDES: Record<string, string> = {
  // Qualcomm 8 Gen 1 vs 8+ Gen 1
  "qualcomm-snapdragon-8-gen-1": "qualcomm:snapdragon-8-gen-1-sm8450",
  "snapdragon-8-gen-1": "qualcomm:snapdragon-8-gen-1-sm8450",
  "snapdragon 8 gen 1": "qualcomm:snapdragon-8-gen-1-sm8450",
  "sd8gen1": "qualcomm:snapdragon-8-gen-1-sm8450",
  "sm8450": "qualcomm:snapdragon-8-gen-1-sm8450",
  "qualcomm-snapdragon-8-plus-gen-1": "qualcomm:snapdragon-8-plus-gen-1-sm8475",
  "snapdragon-8-plus-gen-1": "qualcomm:snapdragon-8-plus-gen-1-sm8475",
  "snapdragon 8+ gen 1": "qualcomm:snapdragon-8-plus-gen-1-sm8475",
  "snapdragon 8 plus gen 1": "qualcomm:snapdragon-8-plus-gen-1-sm8475",
  "sd8plusgen1": "qualcomm:snapdragon-8-plus-gen-1-sm8475",
  "sm8475": "qualcomm:snapdragon-8-plus-gen-1-sm8475",
  // Qualcomm 7 Gen 3 vs 7+ Gen 3
  "qualcomm-snapdragon-7-gen-3": "qualcomm:snapdragon-7-gen-3-sm7550-ab",
  "snapdragon-7-gen-3": "qualcomm:snapdragon-7-gen-3-sm7550-ab",
  "snapdragon 7 gen 3": "qualcomm:snapdragon-7-gen-3-sm7550-ab",
  "sd7gen3": "qualcomm:snapdragon-7-gen-3-sm7550-ab",
  "sm7550": "qualcomm:snapdragon-7-gen-3-sm7550-ab",
  "sm7550-ab": "qualcomm:snapdragon-7-gen-3-sm7550-ab",
  "sm7550ab": "qualcomm:snapdragon-7-gen-3-sm7550-ab",
  "qualcomm-snapdragon-7-plus-gen-3": "qualcomm:snapdragon-7-plus-gen-3-sm7675",
  "snapdragon-7-plus-gen-3": "qualcomm:snapdragon-7-plus-gen-3-sm7675",
  "snapdragon 7+ gen 3": "qualcomm:snapdragon-7-plus-gen-3-sm7675",
  "sm7675": "qualcomm:snapdragon-7-plus-gen-3-sm7675",
  // Qualcomm 8 Gen 3 Standard vs Galaxy
  "qualcomm-snapdragon-8-gen-3": "qualcomm:snapdragon-8-gen-3-sm8650-ab",
  "snapdragon-8-gen-3": "qualcomm:snapdragon-8-gen-3-sm8650-ab",
  "snapdragon 8 gen 3": "qualcomm:snapdragon-8-gen-3-sm8650-ab",
  "sm8650": "qualcomm:snapdragon-8-gen-3-sm8650-ab",
  "sm8650-ab": "qualcomm:snapdragon-8-gen-3-sm8650-ab",
  "sm8650ab": "qualcomm:snapdragon-8-gen-3-sm8650-ab",
  "qualcomm-snapdragon-8-gen-3-for-galaxy": "qualcomm:snapdragon-8-gen-3-leading-sm8650-ac",
  "snapdragon 8 gen 3 for galaxy": "qualcomm:snapdragon-8-gen-3-leading-sm8650-ac",
  "sm8650-ac": "qualcomm:snapdragon-8-gen-3-leading-sm8650-ac",
  "sm8650ac": "qualcomm:snapdragon-8-gen-3-leading-sm8650-ac",
  // Qualcomm 888 vs 888+
  "qualcomm-snapdragon-888-5g": "qualcomm:snapdragon-888-5g-sm8350",
  "snapdragon-888": "qualcomm:snapdragon-888-5g-sm8350",
  "snapdragon 888": "qualcomm:snapdragon-888-5g-sm8350",
  "sd888": "qualcomm:snapdragon-888-5g-sm8350",
  "sm8350": "qualcomm:snapdragon-888-5g-sm8350",
  "qualcomm-snapdragon-888-plus-5g": "qualcomm:snapdragon-888-plus-5g-sm8350-ac",
  "snapdragon-888-plus": "qualcomm:snapdragon-888-plus-5g-sm8350-ac",
  "snapdragon 888+": "qualcomm:snapdragon-888-plus-5g-sm8350-ac",
  "sm8350-ac": "qualcomm:snapdragon-888-plus-5g-sm8350-ac",
  // Qualcomm 865 vs 865+
  "qualcomm-snapdragon-865-5g": "qualcomm:snapdragon-865-5g-sm8250",
  "snapdragon-865": "qualcomm:snapdragon-865-5g-sm8250",
  "snapdragon 865": "qualcomm:snapdragon-865-5g-sm8250",
  "sd865": "qualcomm:snapdragon-865-5g-sm8250",
  "sm8250": "qualcomm:snapdragon-865-5g-sm8250",
  "qualcomm-snapdragon-865-plus-5g": "qualcomm:snapdragon-865-plus-5g-sm8250-ab",
  "snapdragon-865-plus": "qualcomm:snapdragon-865-plus-5g-sm8250-ab",
  "snapdragon 865+": "qualcomm:snapdragon-865-plus-5g-sm8250-ab",
  "sm8250-ab": "qualcomm:snapdragon-865-plus-5g-sm8250-ab",
  // Qualcomm 855 vs 855+
  "qualcomm-snapdragon-855": "qualcomm:snapdragon-855-sm8150",
  "snapdragon-855": "qualcomm:snapdragon-855-sm8150",
  "snapdragon 855": "qualcomm:snapdragon-855-sm8150",
  "sm8150": "qualcomm:snapdragon-855-sm8150",
  "qualcomm-snapdragon-855-plus": "qualcomm:snapdragon-855-plus-sm8150-ac",
  "snapdragon-855-plus": "qualcomm:snapdragon-855-plus-sm8150-ac",
  "snapdragon 855+": "qualcomm:snapdragon-855-plus-sm8150-ac",
  "sm8150-ac": "qualcomm:snapdragon-855-plus-sm8150-ac",
  // Dimensity 9300 vs 9300+
  "mediatek-dimensity-9300": "mediatek:dimensity-9300-mt6989",
  "dimensity 9300": "mediatek:dimensity-9300-mt6989",
  "dimensity-9300": "mediatek:dimensity-9300-mt6989",
  "mt6989": "mediatek:dimensity-9300-mt6989",
  "mediatek-dimensity-9300-plus": "mediatek:dimensity-9300-plus-mt6989z",
  "dimensity 9300+": "mediatek:dimensity-9300-plus-mt6989z",
  "mt6989z": "mediatek:dimensity-9300-plus-mt6989z",
  // Dimensity 9200 vs 9200+
  "mediatek-dimensity-9200": "mediatek:dimensity-9200-mt6985",
  "dimensity 9200": "mediatek:dimensity-9200-mt6985",
  "dimensity-9200": "mediatek:dimensity-9200-mt6985",
  "mt6985": "mediatek:dimensity-9200-mt6985",
  "mediatek-dimensity-9200-plus": "mediatek:dimensity-9200-plus-mt6985w",
  "dimensity 9200+": "mediatek:dimensity-9200-plus-mt6985w",
  "mt6985w": "mediatek:dimensity-9200-plus-mt6985w",
  // MT6833 (Dimensity 700 canonical, Dimensity 6020 rebrand)
  "mt6833": "mediatek:dimensity-700-mt6833",
  "dimensity 700": "mediatek:dimensity-700-mt6833",
  "dimensity 6020": "mediatek:dimensity-6020-mt6833",
  // UMS9230 family
  "ums9230": "unisoc:t760-ums9230",
  "t760": "unisoc:t760-ums9230",
  "tiger t606": "unisoc:tiger-t606-ums9230",
  "t606": "unisoc:tiger-t606-ums9230",
  "tiger t616": "unisoc:tiger-t616-ums9230",
  "t616": "unisoc:tiger-t616-ums9230",
  "tiger t612": "unisoc:tiger-t612-ums9230",
  "t612": "unisoc:tiger-t612-ums9230",
  // HiSilicon HI36A0
  "hi36a0": "hisilicon:kirin-9000-hi36a0",
  "kirin 9000": "hisilicon:kirin-9000-hi36a0",
  "kirin 9000s": "hisilicon:kirin-9000s-hi36a0",
  "kirin 9010": "hisilicon:kirin-9010-hi36a0",
  // Apple APL1V02
  "apl1v02": "apple:a18-pro-apl1v02",
  "a18 pro": "apple:a18-pro-apl1v02",
  "a17 pro": "apple:a17-pro-apl1v02-t8130",
  "t8130": "apple:a17-pro-apl1v02-t8130",
  // Apple T8112
  "t8112": "apple:m2-t8112",
  "m2": "apple:m2-t8112",
  "m3": "apple:m3-t8112"
};

export class SocService {
  private static instance: SocService;
  private socs: SocDevice[] = [];
  private socMap: Map<string, SocDevice> = new Map();
  private partNumberMap: Map<string, SocDevice[]> = new Map();
  private aliasMap: Map<string, SocDevice[]> = new Map();
  private nameMap: Map<string, SocDevice> = new Map();
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
    const loadedPartMap: Map<string, SocDevice[]> = new Map();
    const loadedAliasMap: Map<string, SocDevice[]> = new Map();
    const loadedNameMap: Map<string, SocDevice> = new Map();

    for (const record of parsedRecords) {
      if (!record.id || !record.name) continue;
      loadedSocs.push(record);

      const normId = record.id.toLowerCase().trim();
      loadedMap.set(normId, record);

      if (normId.includes(":")) {
        const bareId = normId.split(":")[1];
        if (bareId) {
          loadedMap.set(bareId, record);
        }
      }

      // Name mapping
      const cleanName = record.name.toLowerCase().trim();
      loadedNameMap.set(cleanName, record);
      const strippedName = stripManufacturerPrefix(cleanName);
      if (strippedName && !loadedNameMap.has(strippedName)) {
        loadedNameMap.set(strippedName, record);
      }

      // Part number mapping (supporting multiple records per part number)
      if (record.partNumber) {
        const cleanPart = record.partNumber.toLowerCase().trim();
        if (!loadedPartMap.has(cleanPart)) loadedPartMap.set(cleanPart, []);
        loadedPartMap.get(cleanPart)!.push(record);

        const strippedPart = cleanPart.replace(/[^a-z0-9]/g, "");
        if (strippedPart && strippedPart !== cleanPart) {
          if (!loadedPartMap.has(strippedPart)) loadedPartMap.set(strippedPart, []);
          loadedPartMap.get(strippedPart)!.push(record);
        }
      }

      // Alias mapping (supporting multiple records per alias)
      if (Array.isArray(record.aliases)) {
        for (const alias of record.aliases) {
          const cleanAlias = alias?.toLowerCase().trim();
          if (!cleanAlias) continue;
          if (!loadedAliasMap.has(cleanAlias)) loadedAliasMap.set(cleanAlias, []);
          loadedAliasMap.get(cleanAlias)!.push(record);

          const strippedAlias = cleanAlias.replace(/[^a-z0-9]/g, "");
          if (strippedAlias && strippedAlias !== cleanAlias) {
            if (!loadedAliasMap.has(strippedAlias)) loadedAliasMap.set(strippedAlias, []);
            loadedAliasMap.get(strippedAlias)!.push(record);
          }
        }
      }
    }

    // Populate fallback aliases into loadedMap if not already set by exact ID
    for (const [alias, records] of loadedAliasMap.entries()) {
      if (!loadedMap.has(alias)) {
        // Deterministically pick canonical override or base non-plus variant
        const overrideId = CANONICAL_OVERRIDES[alias];
        if (overrideId) {
          const matched = loadedMap.get(overrideId);
          if (matched) {
            loadedMap.set(alias, matched);
            continue;
          }
        }
        // If query has no "plus" / "+", pick record without plus
        const nonPlus = records.find(
          (r) => !r.name.toLowerCase().includes("plus") && !r.name.includes("+") && !r.id.toLowerCase().includes("plus")
        );
        loadedMap.set(alias, nonPlus ?? records[0]);
      }
    }

    for (const [part, records] of loadedPartMap.entries()) {
      if (!loadedMap.has(part)) {
        const overrideId = CANONICAL_OVERRIDES[part];
        if (overrideId) {
          const matched = loadedMap.get(overrideId);
          if (matched) {
            loadedMap.set(part, matched);
            continue;
          }
        }
        loadedMap.set(part, records[0]);
      }
    }

    this.socs = loadedSocs;
    this.socMap = loadedMap;
    this.partNumberMap = loadedPartMap;
    this.aliasMap = loadedAliasMap;
    this.nameMap = loadedNameMap;
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

  public resolveSoc(query: string, manufacturer?: string): SocDevice | null {
    this.ensureLoaded();
    if (!query || !query.trim()) return null;

    const raw = query.trim();
    const cleanQuery = raw.toLowerCase();
    const strippedQuery = cleanQuery.replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
    const noPunctQuery = cleanQuery.replace(/[^a-z0-9]/g, "");
    const normMfr = manufacturer?.trim().toLowerCase();

    // 1. Canonical collision override check
    const overrideId =
      CANONICAL_OVERRIDES[cleanQuery] ??
      CANONICAL_OVERRIDES[strippedQuery] ??
      CANONICAL_OVERRIDES[noPunctQuery];
    if (overrideId) {
      const match = this.getSocById(overrideId);
      if (match) return match;
    }

    // 2. Exact ID or Bare ID match
    const byId = this.socMap.get(cleanQuery) ?? this.socMap.get(noPunctQuery);
    if (byId) return byId;

    // 3. Exact Name match
    const byName = this.nameMap.get(cleanQuery) ?? this.nameMap.get(strippedQuery);
    if (byName) return byName;

    // 4. Exact Part Number match (with deterministic disambiguation)
    const partMatches = this.partNumberMap.get(cleanQuery) ?? this.partNumberMap.get(noPunctQuery);
    if (partMatches && partMatches.length > 0) {
      if (partMatches.length === 1) return partMatches[0];

      // Disambiguate by commercial variant indicators in query
      const wantsPlus = cleanQuery.includes("plus") || cleanQuery.includes("+");
      const wantsGalaxy = cleanQuery.includes("galaxy") || cleanQuery.includes("-ac");
      const filtered = partMatches.filter((r) => {
        if (normMfr && r.manufacturer.toLowerCase() !== normMfr) return false;
        return true;
      });

      const pool = filtered.length > 0 ? filtered : partMatches;
      if (wantsGalaxy) {
        const galaxyRec = pool.find((r) => r.name.toLowerCase().includes("galaxy") || r.id.toLowerCase().includes("ac"));
        if (galaxyRec) return galaxyRec;
      }
      if (wantsPlus) {
        const plusRec = pool.find((r) => r.name.toLowerCase().includes("plus") || r.name.includes("+") || r.id.includes("plus"));
        if (plusRec) return plusRec;
      } else {
        const baseRec = pool.find((r) => !r.name.toLowerCase().includes("plus") && !r.name.includes("+") && !r.id.includes("plus"));
        if (baseRec) return baseRec;
      }
      return pool[0];
    }

    // 5. Alias match (with deterministic disambiguation)
    const aliasMatches = this.aliasMap.get(cleanQuery) ?? this.aliasMap.get(noPunctQuery);
    if (aliasMatches && aliasMatches.length > 0) {
      if (aliasMatches.length === 1) return aliasMatches[0];

      const wantsPlus = cleanQuery.includes("plus") || cleanQuery.includes("+");
      const pool = normMfr
        ? aliasMatches.filter((r) => r.manufacturer.toLowerCase() === normMfr)
        : aliasMatches;
      const candidates = pool.length > 0 ? pool : aliasMatches;

      if (wantsPlus) {
        const plusRec = candidates.find((r) => r.name.toLowerCase().includes("plus") || r.name.includes("+") || r.id.includes("plus"));
        if (plusRec) return plusRec;
      } else {
        const baseRec = candidates.find((r) => !r.name.toLowerCase().includes("plus") && !r.name.includes("+") && !r.id.includes("plus"));
        if (baseRec) return baseRec;
      }
      return candidates[0];
    }

    // 6. Filtered scored search fallback
    const searchRes = this.searchSocs({
      query: raw,
      manufacturer: normMfr,
      pageSize: 5,
    });

    if (searchRes.results.length > 0) {
      // Pick top result if query tokens match sufficiently
      return searchRes.results[0];
    }

    return null;
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
