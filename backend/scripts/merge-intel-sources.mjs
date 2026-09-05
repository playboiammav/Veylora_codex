import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveSourceDir() {
  const candidates = [
    process.env.INTEL_SOURCE_DIR,
    path.resolve(process.cwd(), "backend/data/cpu/raw/intel-processors"),
    path.resolve(process.cwd(), "data/cpu/raw/intel-processors"),
    path.resolve(__dirname, "../data/cpu/raw/intel-processors"),
    "/data/data/com.termux/files/home/.gemini/antigravity-cli/brain/4383da92-0c71-484e-bedf-c2d3c81589ad/scratch/intel-processors"
  ].filter(Boolean);

  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, "Intel_Core_Ultra_Processors_v1_10.csv"))) {
      return dir;
    }
  }

  throw new Error(`Unable to find candidate source directory. Searched: ${candidates.join(", ")}`);
}

function resolveBaselineInputPath() {
  const candidates = [
    path.resolve(process.cwd(), "backend/data/cpu/raw/legacy-cpu-db-intel.json"),
    path.resolve(process.cwd(), "data/cpu/raw/legacy-cpu-db-intel.json"),
    path.resolve(__dirname, "../data/cpu/raw/legacy-cpu-db-intel.json"),
    path.resolve(process.cwd(), "backend/data/cpu/intel.json"),
    path.resolve(process.cwd(), "data/cpu/intel.json"),
    path.resolve(__dirname, "../data/cpu/intel.json"),
    path.resolve(__dirname, "../../data/cpu/intel.json")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  throw new Error(`Baseline input not found. Searched: ${candidates.join(", ")}`);
}

function resolveOutputPath() {
  const candidates = [
    path.resolve(process.cwd(), "backend/data/cpu/intel.json"),
    path.resolve(process.cwd(), "data/cpu/intel.json"),
    path.resolve(__dirname, "../data/cpu/intel.json"),
    path.resolve(__dirname, "../../data/cpu/intel.json")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return path.resolve(process.cwd(), "backend/data/cpu/intel.json");
}

// Minimal RFC 4180 CSV parser
function parseCsv(content) {
  const lines = [];
  let row = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        row.push(currentField.trim());
        currentField = "";
      } else if (char === "\r") {
        // ignore CR
      } else if (char === "\n") {
        row.push(currentField.trim());
        if (row.some(cell => cell.length > 0)) {
          lines.push(row);
        }
        row = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || row.length > 0) {
    row.push(currentField.trim());
    if (row.some(cell => cell.length > 0)) {
      lines.push(row);
    }
  }

  if (lines.length === 0) return [];
  const header = lines[0].map(h => h.trim());
  const rows = [];
  for (let r = 1; r < lines.length; r++) {
    const obj = {};
    for (let c = 0; c < header.length; c++) {
      obj[header[c]] = lines[r][c] || "";
    }
    rows.push(obj);
  }
  return rows;
}

function isNullOrPlaceholder(val) {
  if (val === null || val === undefined) return true;
  const s = String(val).trim();
  return s === "" || ["n/a", "na", "none", "unknown", "null", "nan", "-"].includes(s.toLowerCase());
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/\(r\)/gi, "")
    .replace(/\(tm\)/gi, "")
    .replace(/\bintel\b/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseClock(strGhz, strMhz) {
  if (!isNullOrPlaceholder(strMhz)) {
    const num = parseFloat(String(strMhz).replace(/,/g, "."));
    if (!isNaN(num) && num > 0) return num;
  }
  if (!isNullOrPlaceholder(strGhz)) {
    const num = parseFloat(String(strGhz).replace(/,/g, "."));
    if (!isNaN(num) && num > 0) return Math.round(num * 1000 * 100) / 100;
  }
  return null;
}

function parseReleaseDate(raw) {
  if (isNullOrPlaceholder(raw)) return null;
  const s = String(raw).trim();
  const m = s.match(/^Q([1-4])['’]([0-9]{2})$/i);
  if (m) {
    const quarter = parseInt(m[1], 10);
    const yrTwo = parseInt(m[2], 10);
    const fullYear = yrTwo >= 70 ? 1900 + yrTwo : 2000 + yrTwo;
    const month = quarter === 1 ? "01" : quarter === 2 ? "04" : quarter === 3 ? "07" : "10";
    return `${fullYear}-${month}-01`;
  }
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s)) return s;
  if (/^[0-9]{4}-[0-9]{2}$/.test(s)) return `${s}-01`;
  if (/^[0-9]{4}$/.test(s)) return `${s}-01-01`;
  return null;
}

function detectFamily(product) {
  const p = product.trim();
  if (/^Core Ultra 9\b/i.test(p)) return "Core Ultra 9";
  if (/^Core Ultra 7\b/i.test(p)) return "Core Ultra 7";
  if (/^Core Ultra 5\b/i.test(p)) return "Core Ultra 5";
  if (/^Core Ultra\b/i.test(p)) return "Core Ultra";
  if (/^Core i9\b/i.test(p)) return "Core i9";
  if (/^Core i7\b/i.test(p)) return "Core i7";
  if (/^Core i5\b/i.test(p)) return "Core i5";
  if (/^Core i3\b/i.test(p)) return "Core i3";
  if (/^Core 2 Quad\b/i.test(p)) return "Core 2 Quad";
  if (/^Core 2 Extreme\b/i.test(p)) return "Core 2 Extreme";
  if (/^Core 2 Duo\b/i.test(p)) return "Core 2 Duo";
  if (/^Core 2 Solo\b/i.test(p)) return "Core 2 Solo";
  if (/^Core Duo\b/i.test(p)) return "Core Duo";
  if (/^Core Solo\b/i.test(p)) return "Core Solo";
  if (/^Xeon Platinum\b/i.test(p)) return "Xeon Platinum";
  if (/^Xeon Gold\b/i.test(p)) return "Xeon Gold";
  if (/^Xeon Silver\b/i.test(p)) return "Xeon Silver";
  if (/^Xeon Bronze\b/i.test(p)) return "Xeon Bronze";
  if (/^Xeon Phi\b/i.test(p)) return "Xeon Phi";
  if (/^Xeon\b/i.test(p)) return "Xeon";
  if (/^Pentium Gold\b/i.test(p)) return "Pentium Gold";
  if (/^Pentium Silver\b/i.test(p)) return "Pentium Silver";
  if (/^Pentium\b/i.test(p)) return "Pentium";
  if (/^Celeron\b/i.test(p)) return "Celeron";
  if (/^Atom\b/i.test(p)) return "Atom";
  if (/^Quark\b/i.test(p)) return "Quark";
  if (/^Itanium\b/i.test(p)) return "Itanium";
  if (/^Processor\b/i.test(p) || /^Intel Processor\b/i.test(p)) return "Intel Processor";
  return "Intel Core";
}

function detectGeneration(product) {
  const p = product.trim();
  if (/Core Ultra [3579] 2[0-9]{2}/i.test(p)) return "Series 2";
  if (/Core Ultra [3579] 1[0-9]{2}/i.test(p)) return "Series 1";
  const m = p.match(/Core i[3579]-([0-9]{1,2})[0-9]{3}/i);
  if (m) {
    const gen = parseInt(m[1], 10);
    const suffix = gen === 1 ? "st" : gen === 2 ? "nd" : gen === 3 ? "rd" : "th";
    return `${gen}${suffix} Gen`;
  }
  return null;
}

function isMobileCoreProduct(product) {
  const p = product.trim();
  if (/\b[0-9]{3,5}(H|HX|HK|U|Y|P|G[1-7]|HQ|MQ|M|QM)\b/i.test(p)) return true;
  if (/\b(Core\s+M|Core\s+Duo\s+U|Core\s+2\s+Duo\s+[LSU]|Core\s+2\s+Solo|Solo\s+U)\b/i.test(p)) return true;
  if (/Mobile/i.test(p) || /Embedded/i.test(p)) return true;
  return false;
}

function getDeterministicSocket(product, codeName, csvSocket) {
  if (!isNullOrPlaceholder(csvSocket)) {
    return { socket: csvSocket.trim(), augmented: false };
  }
  if (isMobileCoreProduct(product)) {
    return { socket: null, augmented: false };
  }

  const cn = (codeName || "").trim().toLowerCase();

  // Desktop socket mapping table justified by audit
  if (["alder lake", "raptor lake", "raptor lake refresh"].includes(cn)) {
    return { socket: "LGA1700", augmented: true };
  }
  if (["comet lake", "rocket lake"].includes(cn)) {
    return { socket: "LGA1200", augmented: true };
  }
  if (["skylake", "kaby lake", "coffee lake", "coffee lake refresh"].includes(cn)) {
    return { socket: "LGA1151", augmented: true };
  }
  if (["haswell", "broadwell"].includes(cn)) {
    return { socket: "LGA1150", augmented: true };
  }
  if (["sandy bridge", "ivy bridge"].includes(cn)) {
    return { socket: "LGA1155", augmented: true };
  }
  if (["clarkdale", "lynnfield"].includes(cn)) {
    return { socket: "LGA1156", augmented: true };
  }
  if (["bloomfield", "gulftown"].includes(cn)) {
    return { socket: "LGA1366", augmented: true };
  }
  if (["conroe", "wolfdale", "kentsfield", "yorkfield", "allendale"].includes(cn)) {
    return { socket: "LGA775", augmented: true };
  }
  if (["sandy bridge e", "ivy bridge e"].includes(cn)) {
    return { socket: "LGA2011", augmented: true };
  }
  if (["haswell e", "broadwell e"].includes(cn)) {
    return { socket: "LGA2011-v3", augmented: true };
  }
  if (["skylake x", "cascade lake x"].includes(cn)) {
    return { socket: "LGA2066", augmented: true };
  }

  return { socket: null, augmented: false };
}

function normalizeToUpperRecord(row, fileName) {
  const product = row["Product"] ? row["Product"].trim() : "";
  if (!product) return null;

  const id = `intel:${slugify(product)}`;
  const cleanName = product.startsWith("Intel") ? product : `Intel ${product}`;
  const family = detectFamily(product);
  const generation = detectGeneration(product);
  const architecture = isNullOrPlaceholder(row["Code Name"]) ? null : row["Code Name"].trim();

  // Cores & Threads
  const coresRaw = row["Cores"];
  const threadsRaw = row["Threads"];
  const cores = (!isNullOrPlaceholder(coresRaw) && parseInt(coresRaw, 10) > 0) ? parseInt(coresRaw, 10) : null;
  const threads = (!isNullOrPlaceholder(threadsRaw) && parseInt(threadsRaw, 10) > 0) ? parseInt(threadsRaw, 10) : null;

  // Clocks
  const baseClock = parseClock(row["Base Freq.(GHz)"], row["Base Freq.(MHz)"]);
  const boostClock = parseClock(row["Max. Turbo Freq.(GHz)"], row["Max. Turbo Freq.(MHz)"]);

  // Cache
  let cache = null;
  if (!isNullOrPlaceholder(row["Cache(MB)"])) {
    const info = !isNullOrPlaceholder(row["Cache Info"]) ? ` ${row["Cache Info"].trim()}` : "";
    cache = `${row["Cache(MB)"].trim()} MB${info}`.trim();
  } else if (!isNullOrPlaceholder(row["Cache(KB)"])) {
    const info = !isNullOrPlaceholder(row["Cache Info"]) ? ` ${row["Cache Info"].trim()}` : "";
    cache = `${row["Cache(KB)"].trim()} KB${info}`.trim();
  }

  // Integrated GPU (null = unknown / not provided)
  let integratedGpu = null;
  const igpuRaw = row["Integrated Graphics"];
  if (!isNullOrPlaceholder(igpuRaw)) {
    integratedGpu = igpuRaw.trim();
  }

  // Release Date
  const releaseDate = parseReleaseDate(row["Release Date"]);

  // Power
  const power = !isNullOrPlaceholder(row["TDP(W)"]) ? `${row["TDP(W)"].trim()} W` : null;

  // Process Size
  const processSize = !isNullOrPlaceholder(row["Lithography(nm)"]) ? `${row["Lithography(nm)"].trim()} nm` : null;

  // Memory
  const memoryTypes = !isNullOrPlaceholder(row["Memory Types"]) ? row["Memory Types"].trim() : null;
  const maxMemorySize = !isNullOrPlaceholder(row["Max Memory Size(GB)"]) ? `${row["Max Memory Size(GB)"].trim()} GB` : null;

  // Sockets
  const { socket, augmented } = getDeterministicSocket(product, architecture, row["Sockets Supported"]);
  const augmentedFields = augmented ? ["socket"] : [];

  // Canonical ARK Search URL
  const arkSearchUrl = `https://ark.intel.com/content/www/us/en/ark/search.html?_charset_=UTF-8&q=${encodeURIComponent(product)}`;

  // Provenance
  const isCommunityPr3 = ["Xeon Platinum 8370C", "Xeon Platinum 8272CL", "Xeon Platinum 8171M"].includes(product);
  const provenance = isCommunityPr3
    ? "toUpperCase78/intel-processors (GPL-3.0, community PR #3 by mvarian, non-ARK)"
    : "toUpperCase78/intel-processors (GPL-3.0, stated source Intel ARK)";

  return {
    id,
    name: cleanName,
    manufacturer: "Intel",
    family,
    generation,
    architecture,
    cores,
    threads,
    baseClock,
    boostClock,
    cache,
    integratedGpu,
    releaseDate,
    sourceUrl: arkSearchUrl,
    partNumber: null,
    microarchitecture: null,
    socket,
    processSize,
    isa: null,
    instructionSet: null,
    l1Cache: null,
    l2Cache: null,
    l3Cache: null,
    power,
    sourceReferences: [arkSearchUrl],
    provenance,
    isLegacy: false,
    augmentedFields: augmentedFields.length > 0 ? augmentedFields : null,
    aliasIds: null,
    memoryTypes,
    maxMemorySize,
    _rawProduct: product
  };
}

export async function mergeIntelDatasets() {
  console.log("==================================================");
  console.log("STARTING DETERMINISTIC INTEL CPU SOURCE MERGE");
  console.log("==================================================\n");

  const sourceDir = resolveSourceDir();
  const baselineInputPath = resolveBaselineInputPath();
  const outputPath = resolveOutputPath();
  console.log(`- Upstream source directory: ${sourceDir}`);
  console.log(`- Baseline input path:       ${baselineInputPath}`);
  console.log(`- Production output path:    ${outputPath}`);

  // 1. Read baseline records
  const rawBaseline = fs.readFileSync(baselineInputPath, "utf-8");
  const baselineRecords = JSON.parse(rawBaseline);
  console.log(`- Baseline Intel records loaded: ${baselineRecords.length}`);

  // 2. Load candidate CSV files in order of precedence
  const fileOrder = [
    // v1.10
    "Intel_Core_Ultra_Processors_v1_10.csv",
    // v1.9
    "Intel_Processors_v1_9.csv",
    "Intel_Pentium_Processors_v1_9.csv",
    "Intel_Celeron_Processors_v1_9.csv",
    "Intel_Atom_Processors_v1_9.csv",
    // v1.8
    "intel_core_processors_v1_8.csv",
    "intel_xeon_processors_v1_8.csv",
    // v1.8 backfill for pruned legacy models
    "intel_celeron_processors_v1_8.csv",
    "intel_pentium_processors_v1_8.csv",
    "intel_atom_processors_v1_8.csv",
    // v1.6 legacy categories
    "intel_itanium_processors_v1_6.csv",
    "intel_quark_SoC_v1_6.csv",
    "intel_xeon_phi_processors_v1_6.csv"
  ];

  const primaryMap = new Map();
  let duplicateCount = 0;
  let totalRawCsvRows = 0;

  for (const fileName of fileOrder) {
    const filePath = path.join(sourceDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] Candidate file not found: ${filePath}`);
      continue;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const rows = parseCsv(content);
    totalRawCsvRows += rows.length;

    for (const r of rows) {
      const normalized = normalizeToUpperRecord(r, fileName);
      if (!normalized) continue;

      if (primaryMap.has(normalized.id)) {
        duplicateCount++;
      } else {
        primaryMap.set(normalized.id, normalized);
      }
    }
  }

  console.log(`- Candidate CSV raw rows processed: ${totalRawCsvRows}`);
  console.log(`- Unique candidate retail SKUs:     ${primaryMap.size}`);
  console.log(`- Intra-source duplicates skipped:  ${duplicateCount}`);

  // 3. Match baseline records with primary SKUs to preserve part numbers & aliases
  const matchedBaselineIds = new Set();
  let conflictsResolved = 0;

  // Build lookup index for primary records by SKU token
  const primaryByToken = new Map();
  for (const [id, rec] of primaryMap.entries()) {
    const rawP = rec._rawProduct.toLowerCase();
    const tokens = rawP.match(/[a-z0-9]+(?:-[a-z0-9]+)?/g) || [];
    for (const t of tokens) {
      if (t.length >= 4 && !/^[0-9]+$/.test(t)) {
        if (!primaryByToken.has(t)) primaryByToken.set(t, []);
        primaryByToken.get(t).push(rec);
      }
    }
  }

  for (const b of baselineRecords) {
    let matchedPrimary = null;

    // Direct match: BX80619I73820 -> Core i7-3820
    if ((b.partNumber || "").includes("BX80619I73820") && primaryMap.has("intel:core-i7-3820")) {
      matchedPrimary = primaryMap.get("intel:core-i7-3820");
    } else if (b.id === "intel:pentium-1405" && primaryMap.has("intel:pentium-1405")) {
      matchedPrimary = primaryMap.get("intel:pentium-1405");
    } else {
      // Check SKU tokens in baseline name / partNumber
      const bTokens = (b.name + " " + (b.partNumber || "")).toLowerCase().match(/[a-z0-9]+(?:-[a-z0-9]+)?/g) || [];
      for (const t of bTokens) {
        if (t.length >= 4 && !/^[0-9]+$/.test(t) && primaryByToken.has(t)) {
          const candidates = primaryByToken.get(t);
          if (candidates.length === 1) {
            matchedPrimary = candidates[0];
            break;
          }
        }
      }
    }

    if (matchedPrimary) {
      matchedBaselineIds.add(b.id);
      conflictsResolved++;

      // Enrich canonical record with legacy partNumber and alias
      if (!matchedPrimary.partNumber && b.partNumber) {
        matchedPrimary.partNumber = b.partNumber;
      }
      if (b.id !== matchedPrimary.id) {
        matchedPrimary.aliasIds = matchedPrimary.aliasIds || [];
        if (!matchedPrimary.aliasIds.includes(b.id)) {
          matchedPrimary.aliasIds.push(b.id);
        }
      }
      if (b.sourceUrl && !matchedPrimary.sourceReferences.includes(b.sourceUrl)) {
        matchedPrimary.sourceReferences.push(b.sourceUrl);
      }
    }
  }

  console.log(`- Baseline records matched & merged into primary SKUs: ${matchedBaselineIds.size}`);

  // 4. Retain unmatched baseline records as legacy/reference coverage
  const retainedLegacy = [];
  for (const b of baselineRecords) {
    if (!matchedBaselineIds.has(b.id)) {
      retainedLegacy.push({
        ...b,
        isLegacy: true,
        provenance: "cpu-db (Public Domain / AGPL-3.0, CPU-World)",
        augmentedFields: null,
        aliasIds: null,
        memoryTypes: null,
        maxMemorySize: null
      });
    }
  }

  console.log(`- Baseline legacy/reference records retained:          ${retainedLegacy.length}`);

  // 5. Combine and sort deterministically
  const cleanPrimaryRecords = Array.from(primaryMap.values()).map(r => {
    const copy = { ...r };
    delete copy._rawProduct;
    return copy;
  });

  const merged = [...cleanPrimaryRecords, ...retainedLegacy];

  // Deterministic sort:
  // 1. isLegacy ascending (false before true)
  // 2. releaseDate descending (newest first)
  // 3. name ascending
  // 4. id ascending
  merged.sort((a, b) => {
    if (a.isLegacy !== b.isLegacy) return a.isLegacy ? 1 : -1;
    const dateA = a.releaseDate || "";
    const dateB = b.releaseDate || "";
    if (dateB !== dateA) return dateB.localeCompare(dateA);
    const nameCmp = a.name.localeCompare(b.name);
    if (nameCmp !== 0) return nameCmp;
    return a.id.localeCompare(b.id);
  });

  console.log(`- Total merged Intel records:                         ${merged.length}`);

  // 6. Write output to production dataset
  const outputJson = JSON.stringify(merged, null, 2);
  fs.writeFileSync(outputPath, outputJson, "utf-8");
  console.log(`✅ Production dataset written successfully to: ${outputPath}`);

  // 7. Write summary report
  const summary = {
    timestamp: new Date().toISOString(),
    baselineRecordsCount: baselineRecords.length,
    importedPrimarySkus: cleanPrimaryRecords.length,
    retainedLegacyCount: retainedLegacy.length,
    duplicatesSkipped: duplicateCount,
    conflictsResolved,
    totalMergedRecords: merged.length,
    provenanceDistribution: {
      "toUpperCase78/intel-processors (GPL-3.0, stated source Intel ARK)": cleanPrimaryRecords.filter(r => !r.provenance.includes("PR #3")).length,
      "toUpperCase78/intel-processors (GPL-3.0, community PR #3 by mvarian, non-ARK)": cleanPrimaryRecords.filter(r => r.provenance.includes("PR #3")).length,
      "cpu-db (Public Domain / AGPL-3.0, CPU-World)": retainedLegacy.length
    },
    sampleModernProcessors: [
      merged.find(c => c.id === "intel:core-i7-13700k"),
      merged.find(c => c.id === "intel:core-ultra-7-155h"),
      merged.find(c => c.id === "intel:core-i9-14900k"),
      merged.find(c => c.id === "intel:core-i5-12400"),
      merged.find(c => c.id === "intel:intel-processor-300" || c.id === "intel:processor-300")
    ].filter(Boolean).map(c => ({ id: c.id, name: c.name, cores: c.cores, threads: c.threads, baseClock: c.baseClock, boostClock: c.boostClock, socket: c.socket, tdp: c.power }))
  };

  const summaryPath = path.resolve(path.dirname(outputPath), "intel-merge-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf-8");
  console.log(`✅ Merge summary report written to: ${summaryPath}`);

  console.log("\n==================================================");
  console.log("MERGE COMPLETED DETERMINISTICALLY");
  console.log("==================================================\n");
  return summary;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mergeIntelDatasets().catch(err => {
    console.error("❌ Merge failed:", err);
    process.exit(1);
  });
}
