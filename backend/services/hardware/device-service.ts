import fs from "fs";
import path from "path";
import type {
  DeviceRecord,
  DeviceSearchResponse,
  DeviceDetailResponse,
  SocDevice,
} from "@/lib/normalized-types";
import { socService } from "./soc-service";

export interface DeviceSearchParams {
  query?: string;
  manufacturer?: string;
  formFactor?: string;
  socId?: string;
  page?: number;
  pageSize?: number;
}

export interface DeviceResolutionParams {
  manufacturer?: string;
  model?: string;
  codename?: string;
  socManufacturer?: string;
  socModel?: string;
  identifier?: string;
}

export interface DeviceResolutionResult {
  device: DeviceRecord | null;
  soc: SocDevice | null;
  matchedBy: "manufacturer_model" | "manufacturer_codename" | "soc" | "identifier" | null;
  source: "real";
}

function normalizeString(str?: string | null): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
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

function resolveDeviceDataDir(): string {
  const baseDir = getDirname();
  const candidates = [
    path.join(process.cwd(), "data", "devices"),
    path.join(process.cwd(), "backend", "data", "devices"),
    path.resolve(baseDir, "..", "..", "data", "devices"),
    path.resolve(baseDir, "..", "data", "devices"),
    path.resolve(baseDir, "data", "devices"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "smartphones.json"))) {
      return dir;
    }
  }

  const fallback = path.resolve(baseDir, "../../../../backend/data/devices");
  if (fs.existsSync(path.join(fallback, "smartphones.json"))) {
    return fallback;
  }

  throw new Error(`Device dataset directory not found. Searched paths: ${candidates.join(", ")}`);
}

export class DeviceService {
  private static instance: DeviceService;
  private devices: DeviceRecord[] = [];
  private smartphones: DeviceRecord[] = [];
  private tablets: DeviceRecord[] = [];
  private idMap: Map<string, DeviceRecord> = new Map();
  private modelMap: Map<string, DeviceRecord> = new Map();
  private isLoaded = false;

  public static getInstance(): DeviceService {
    if (!DeviceService.instance) {
      DeviceService.instance = new DeviceService();
    }
    return DeviceService.instance;
  }

  private ensureLoaded(): void {
    if (this.isLoaded) return;

    const dataDir = resolveDeviceDataDir();
    const phonesPath = path.join(dataDir, "smartphones.json");
    const tabletsPath = path.join(dataDir, "tablets.json");

    if (!fs.existsSync(phonesPath)) {
      throw new Error(`Smartphones dataset not found: ${phonesPath}`);
    }
    if (!fs.existsSync(tabletsPath)) {
      throw new Error(`Tablets dataset not found: ${tabletsPath}`);
    }

    const loadedPhones = JSON.parse(fs.readFileSync(phonesPath, "utf-8")) as DeviceRecord[];
    const loadedTablets = JSON.parse(fs.readFileSync(tabletsPath, "utf-8")) as DeviceRecord[];
    const allRecords = [...loadedPhones, ...loadedTablets];

    const newIdMap = new Map<string, DeviceRecord>();
    const newModelMap = new Map<string, DeviceRecord>();

    for (const record of allRecords) {
      if (!record.id || !record.marketName) continue;

      const normId = record.id.toLowerCase().trim();
      newIdMap.set(normId, record);

      // Bare ID without brand prefix (e.g. "galaxy-s24-ultra-sm-s928b")
      if (normId.includes(":")) {
        const bareId = normId.split(":")[1];
        if (bareId && !newIdMap.has(bareId)) {
          newIdMap.set(bareId, record);
        }
      }

      // Index model numbers
      if (Array.isArray(record.modelNumbers)) {
        for (const model of record.modelNumbers) {
          if (!model) continue;
          const cleanModel = model.toLowerCase().trim();
          if (!newIdMap.has(cleanModel)) {
            newIdMap.set(cleanModel, record);
          }
          if (!newModelMap.has(cleanModel)) {
            newModelMap.set(cleanModel, record);
          }
          const stripped = cleanModel.replace(/[^a-z0-9]/g, "");
          if (stripped && !newIdMap.has(stripped)) {
            newIdMap.set(stripped, record);
          }
        }
      }

      // Index device codenames
      if (Array.isArray(record.deviceCodenames)) {
        for (const codename of record.deviceCodenames) {
          if (!codename) continue;
          const cleanCode = codename.toLowerCase().trim();
          if (!newIdMap.has(cleanCode)) {
            newIdMap.set(cleanCode, record);
          }
          if (!newModelMap.has(cleanCode)) {
            newModelMap.set(cleanCode, record);
          }
        }
      }

      // Index aliases
      if (Array.isArray(record.aliases)) {
        for (const alias of record.aliases) {
          if (!alias) continue;
          const cleanAlias = alias.toLowerCase().trim();
          if (!newIdMap.has(cleanAlias)) {
            newIdMap.set(cleanAlias, record);
          }
        }
      }
    }

    this.smartphones = loadedPhones;
    this.tablets = loadedTablets;
    this.devices = allRecords;
    this.idMap = newIdMap;
    this.modelMap = newModelMap;
    this.isLoaded = true;
  }

  public getAllDevices(): DeviceRecord[] {
    this.ensureLoaded();
    return this.devices;
  }

  public getSmartphones(): DeviceRecord[] {
    this.ensureLoaded();
    return this.smartphones;
  }

  public getTablets(): DeviceRecord[] {
    this.ensureLoaded();
    return this.tablets;
  }

  public getDeviceById(id: string): DeviceRecord | null {
    this.ensureLoaded();
    if (!id) return null;
    const cleanId = id.toLowerCase().trim();
    return this.idMap.get(cleanId) ?? null;
  }

  public getDeviceByModel(model: string): DeviceRecord | null {
    this.ensureLoaded();
    if (!model) return null;
    const cleanModel = model.toLowerCase().trim();
    return this.modelMap.get(cleanModel) ?? this.idMap.get(cleanModel) ?? null;
  }

  public resolveDevice(params: DeviceResolutionParams): DeviceResolutionResult {
    this.ensureLoaded();

    const normMfr = params.manufacturer ? params.manufacturer.toLowerCase().trim() : undefined;
    const cleanModel = params.model ? params.model.toLowerCase().trim() : undefined;
    const strippedModel = cleanModel ? cleanModel.replace(/[^a-z0-9]/g, "") : undefined;
    const cleanCodename = params.codename ? params.codename.toLowerCase().trim() : undefined;
    const cleanIdent = params.identifier ? params.identifier.toLowerCase().trim() : undefined;

    const filterByManufacturer = (records: DeviceRecord[], mfr?: string): DeviceRecord[] => {
      if (!mfr) return records;
      return records.filter((d) => {
        const b = d.brand.toLowerCase();
        if (b === mfr) return true;
        // Umbrella brand aliases
        if (mfr === "xiaomi" && (b === "redmi" || b === "poco" || b === "black shark")) return true;
        if (mfr === "vivo" && b === "iqoo") return true;
        if (mfr === "oppo" && (b === "oneplus" || b === "realme")) return true;
        return false;
      });
    };

    const mfrPool = filterByManufacturer(this.devices, normMfr);

    // 1. Deterministic Match: manufacturer + model
    if (normMfr && cleanModel) {
      // 1a. Exact model number match in manufacturer pool
      for (const d of mfrPool) {
        if (Array.isArray(d.modelNumbers)) {
          for (const mn of d.modelNumbers) {
            const cleanMn = mn.toLowerCase().trim();
            const strippedMn = cleanMn.replace(/[^a-z0-9]/g, "");
            if (cleanMn === cleanModel || (strippedModel && strippedMn === strippedModel)) {
              const soc = d.socId ? socService.getSocById(d.socId) : null;
              return { device: d, soc, matchedBy: "manufacturer_model", source: "real" };
            }
          }
        }
      }
      // 1b. Exact market name match in manufacturer pool
      for (const d of mfrPool) {
        const cleanMkt = d.marketName.toLowerCase().trim();
        if (cleanMkt === cleanModel) {
          const soc = d.socId ? socService.getSocById(d.socId) : null;
          return { device: d, soc, matchedBy: "manufacturer_model", source: "real" };
        }
      }
    }

    // 2. Deterministic Match: manufacturer + device codename
    if (normMfr && cleanCodename) {
      for (const d of mfrPool) {
        if (Array.isArray(d.deviceCodenames)) {
          for (const cn of d.deviceCodenames) {
            if (cn.toLowerCase().trim() === cleanCodename) {
              const soc = d.socId ? socService.getSocById(d.socId) : null;
              return { device: d, soc, matchedBy: "manufacturer_codename", source: "real" };
            }
          }
        }
      }
    }

    // 3. Deterministic Match: SoC manufacturer + SoC model
    if (params.socModel) {
      const resolvedSoc = socService.resolveSoc(params.socModel, params.socManufacturer);
      if (resolvedSoc) {
        // If we have a manufacturer and/or model, check if any device in pool matches this SoC
        if (normMfr && cleanModel) {
          const deviceWithSoc = mfrPool.find((d) => {
            if (d.socId !== resolvedSoc.id) return false;
            const mkt = d.marketName.toLowerCase();
            return mkt.includes(cleanModel) || cleanModel.includes(mkt);
          });
          if (deviceWithSoc) {
            return { device: deviceWithSoc, soc: resolvedSoc, matchedBy: "soc", source: "real" };
          }
        }
        // Even if full device record is not matched, return resolved SoC with matchedBy: "soc"
        return { device: null, soc: resolvedSoc, matchedBy: "soc", source: "real" };
      }
    }

    // 4. Deterministic Match: known aliases / identifiers
    if (cleanIdent) {
      const byId = this.getDeviceById(cleanIdent);
      if (byId) {
        const soc = byId.socId ? socService.getSocById(byId.socId) : null;
        return { device: byId, soc, matchedBy: "identifier", source: "real" };
      }
      // Check if identifier resolves directly as SoC
      const bySoc = socService.resolveSoc(cleanIdent);
      if (bySoc) {
        return { device: null, soc: bySoc, matchedBy: "identifier", source: "real" };
      }
    }

    // 5. Runtime-only fallback: catalog miss
    return { device: null, soc: null, matchedBy: null, source: "real" };
  }

  private scoreDevice(device: DeviceRecord, query: string): number {
    const qNorm = normalizeString(query);
    if (!qNorm) return 0;

    const idClean = device.id.toLowerCase();
    const idBare = idClean.includes(":") ? idClean.split(":")[1] : idClean;
    const mktClean = device.marketName.toLowerCase();
    const brandClean = device.brand.toLowerCase();
    const fullNameClean = `${brandClean} ${mktClean}`;

    // Exact ID match
    if (idClean === query.toLowerCase().trim() || idBare === query.toLowerCase().trim()) {
      return 1000;
    }

    // Exact model number match
    if (Array.isArray(device.modelNumbers)) {
      for (const m of device.modelNumbers) {
        if (m.toLowerCase().trim() === query.toLowerCase().trim()) {
          return 900;
        }
        if (m.toLowerCase().includes(query.toLowerCase().trim())) {
          return 500;
        }
      }
    }

    // Exact codename match
    if (Array.isArray(device.deviceCodenames)) {
      for (const c of device.deviceCodenames) {
        if (c.toLowerCase().trim() === query.toLowerCase().trim()) {
          return 850;
        }
      }
    }

    // Exact market name match
    if (mktClean === query.toLowerCase().trim() || fullNameClean === query.toLowerCase().trim()) {
      return 700;
    }

    const qTokens = qNorm.split(" ").filter(Boolean);
    const targetNorm = normalizeString(`${device.brand} ${device.marketName} ${device.modelNumbers.join(" ")} ${device.socName || ""} ${(device.aliases || []).join(" ")}`);

    let score = 0;
    let allTokensFound = true;

    for (const token of qTokens) {
      if (targetNorm.includes(token)) {
        score += 50;
        if (mktClean.includes(token)) score += 30;
        if (brandClean.includes(token)) score += 20;
      } else {
        allTokensFound = false;
      }
    }

    if (!allTokensFound) return 0;
    return score;
  }

  public searchDevices(params: DeviceSearchParams = {}): DeviceSearchResponse {
    this.ensureLoaded();

    const {
      query,
      manufacturer,
      formFactor,
      socId,
      page = 1,
      pageSize = 20,
    } = params;

    let dataset = this.devices;

    // Filter by formFactor / deviceType
    if (formFactor) {
      const ffNorm = formFactor.toLowerCase().trim();
      if (ffNorm === "phone" || ffNorm === "smartphone") {
        dataset = this.smartphones;
      } else if (ffNorm === "tablet") {
        dataset = this.tablets;
      }
    }

    // Filter by manufacturer / brand
    if (manufacturer) {
      const mfrNorm = manufacturer.toLowerCase().trim();
      dataset = dataset.filter((d) => {
        const bNorm = d.brand.toLowerCase();
        if (bNorm === mfrNorm) return true;
        // Xiaomi / Redmi / POCO umbrella
        if (mfrNorm === "xiaomi" && (bNorm === "xiaomi" || bNorm === "redmi" || bNorm === "poco")) return true;
        // vivo / iQOO umbrella
        if (mfrNorm === "vivo" && (bNorm === "vivo" || bNorm === "iqoo")) return true;
        return false;
      });
    }

    // Filter by socId
    if (socId) {
      const socNorm = socId.toLowerCase().trim();
      dataset = dataset.filter((d) => d.socId && d.socId.toLowerCase() === socNorm);
    }

    let matched: DeviceRecord[] = [];

    if (query && query.trim()) {
      const scored: { device: DeviceRecord; score: number }[] = [];
      for (const device of dataset) {
        const score = this.scoreDevice(device, query);
        if (score > 0) {
          scored.push({ device, score });
        }
      }

      // Stable sorting for search queries:
      // score desc, releaseDate desc (nulls last), marketName asc, id asc
      scored.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        const dateA = a.device.releaseDate || "";
        const dateB = b.device.releaseDate || "";
        if (dateA !== dateB) {
          return dateB.localeCompare(dateA);
        }
        const mktComp = a.device.marketName.localeCompare(b.device.marketName);
        if (mktComp !== 0) return mktComp;
        return a.device.id.localeCompare(b.device.id);
      });

      matched = scored.map((s) => s.device);
    } else {
      // Default stable sorting:
      // brand asc, releaseDate desc (nulls last), marketName asc, id asc
      matched = [...dataset].sort((a, b) => {
        const brandComp = a.brand.localeCompare(b.brand);
        if (brandComp !== 0) return brandComp;
        const dateA = a.releaseDate || "";
        const dateB = b.releaseDate || "";
        if (dateA !== dateB) {
          return dateB.localeCompare(dateA);
        }
        const mktComp = a.marketName.localeCompare(b.marketName);
        if (mktComp !== 0) return mktComp;
        return a.id.localeCompare(b.id);
      });
    }

    const total = matched.length;
    const validatedPage = Math.max(1, page);
    const validatedPageSize = Math.max(1, Math.min(100, pageSize));
    const totalPages = Math.ceil(total / validatedPageSize) || 0;
    const offset = (validatedPage - 1) * validatedPageSize;
    const results = matched.slice(offset, offset + validatedPageSize);

    return {
      query: query || undefined,
      manufacturer: manufacturer || undefined,
      formFactor: formFactor || undefined,
      socId: socId || undefined,
      total,
      page: validatedPage,
      pageSize: validatedPageSize,
      totalPages,
      results,
    };
  }
}

export const deviceService = DeviceService.getInstance();
