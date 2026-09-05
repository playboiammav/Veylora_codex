#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOC_DATA_DIR = path.resolve(__dirname, "../data/soc");
const RAW_SEED_DIR = path.join(SOC_DATA_DIR, "raw/seed");
const OUTPUT_FILE = path.join(SOC_DATA_DIR, "soc.json");
const SUMMARY_FILE = path.join(SOC_DATA_DIR, "soc-build-summary.json");

console.log("==================================================");
console.log("VEYLORA MOBILE SOC AUTHORITATIVE INGESTION PIPELINE");
console.log("==================================================\n");

if (!fs.existsSync(RAW_SEED_DIR)) {
  console.error(`Seed directory does not exist: ${RAW_SEED_DIR}`);
  process.exit(1);
}

const seedFiles = fs
  .readdirSync(RAW_SEED_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

console.log(`Found ${seedFiles.length} seed file(s) in ${RAW_SEED_DIR}:`);
for (const file of seedFiles) {
  console.log(` - ${file}`);
}

const allRecords = [];
const seenIds = new Set();
const validationErrors = [];

for (const file of seedFiles) {
  const filePath = path.join(RAW_SEED_DIR, file);
  const content = fs.readFileSync(filePath, "utf-8");
  let records;
  try {
    records = JSON.parse(content);
  } catch (err) {
    console.error(`Failed to parse JSON file ${filePath}:`, err.message);
    process.exit(1);
  }

  if (!Array.isArray(records)) {
    console.error(`File ${filePath} does not contain a JSON array.`);
    process.exit(1);
  }

  console.log(`Ingesting ${records.length} records from ${file}...`);

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const loc = `${file}[${i}] (${r?.name || r?.id || "unknown"})`;

    // 1. Mandatory Identity Fields
    if (!r.id || typeof r.id !== "string" || !r.id.trim()) {
      validationErrors.push(`${loc}: missing or empty 'id'`);
    }
    if (!r.name || typeof r.name !== "string" || !r.name.trim()) {
      validationErrors.push(`${loc}: missing or empty 'name'`);
    }
    if (!r.manufacturer || typeof r.manufacturer !== "string") {
      validationErrors.push(`${loc}: missing or empty 'manufacturer'`);
    }
    if (!r.family || typeof r.family !== "string") {
      validationErrors.push(`${loc}: missing or empty 'family'`);
    }

    // 2. Duplicate ID check
    const normId = r.id?.toLowerCase().trim();
    if (seenIds.has(normId)) {
      validationErrors.push(`${loc}: duplicate ID detected: '${r.id}'`);
    } else {
      seenIds.add(normId);
    }

    // 3. CPU Clusters & Core Count
    if (typeof r.cpuCores !== "number" || r.cpuCores <= 0) {
      validationErrors.push(`${loc}: 'cpuCores' must be a positive integer`);
    }
    if (!Array.isArray(r.cpuClusters) || r.cpuClusters.length === 0) {
      validationErrors.push(`${loc}: 'cpuClusters' must be a non-empty array`);
    } else {
      let clusterCoreSum = 0;
      for (let c = 0; c < r.cpuClusters.length; c++) {
        const cluster = r.cpuClusters[c];
        if (typeof cluster.cores !== "number" || cluster.cores <= 0) {
          validationErrors.push(`${loc} cluster[${c}]: cluster 'cores' must be > 0`);
        } else {
          clusterCoreSum += cluster.cores;
        }
        if (typeof cluster.maxClock !== "number" || cluster.maxClock <= 0) {
          validationErrors.push(`${loc} cluster[${c}]: cluster 'maxClock' must be > 0 MHz`);
        }
        if (!cluster.microarchitecture || typeof cluster.microarchitecture !== "string") {
          validationErrors.push(`${loc} cluster[${c}]: missing 'microarchitecture'`);
        }
      }
      if (clusterCoreSum !== r.cpuCores) {
        validationErrors.push(
          `${loc}: sum of cluster cores (${clusterCoreSum}) does not match 'cpuCores' (${r.cpuCores})`
        );
      }
    }

    if (typeof r.cpuClockMax !== "number" || r.cpuClockMax <= 0) {
      validationErrors.push(`${loc}: 'cpuClockMax' must be > 0 MHz`);
    }

    // 4. GPU & Graphics
    if (!r.gpu || typeof r.gpu !== "string") {
      validationErrors.push(`${loc}: missing or empty 'gpu'`);
    }
    if (!r.gpuFamily || typeof r.gpuFamily !== "string") {
      validationErrors.push(`${loc}: missing or empty 'gpuFamily'`);
    }

    // Vulkan checks: must be null or valid version string (e.g. "1.3", "1.2", "1.1", "1.0")
    if (r.vulkanVersion !== null && typeof r.vulkanVersion !== "string") {
      validationErrors.push(`${loc}: 'vulkanVersion' must be null or string`);
    }
    if (typeof r.vulkanVersion === "string" && !/^\d+\.\d+$/.test(r.vulkanVersion)) {
      validationErrors.push(`${loc}: 'vulkanVersion' format invalid: '${r.vulkanVersion}'`);
    }

    // 5. Form Factor
    if (!Array.isArray(r.formFactor) || r.formFactor.length === 0) {
      validationErrors.push(`${loc}: 'formFactor' must be a non-empty array`);
    } else {
      // If Apple M-Series, ensure phone is NEVER included
      if (r.family === "Apple M-Series" && r.formFactor.includes("phone")) {
        validationErrors.push(`${loc}: Apple M-Series must NEVER have 'phone' formFactor`);
      }
    }

    // 6. Provenance
    if (!r.provenance || typeof r.provenance !== "object") {
      validationErrors.push(`${loc}: missing 'provenance' metadata object`);
    } else {
      if (!r.provenance.primarySource) {
        validationErrors.push(`${loc}: missing 'provenance.primarySource'`);
      }
      if (!Array.isArray(r.provenance.sourceUrls) || r.provenance.sourceUrls.length === 0) {
        validationErrors.push(`${loc}: 'provenance.sourceUrls' must be a non-empty array`);
      }
    }

    // Normalize and sanitize aliases
    const aliasSet = new Set();
    if (Array.isArray(r.aliases)) {
      for (const a of r.aliases) {
        if (typeof a === "string" && a.trim()) {
          aliasSet.add(a.trim().toLowerCase());
        }
      }
    }
    // Auto-generate aliases from ID, partNumber, and name
    aliasSet.add(r.id.toLowerCase());
    const idSlug = r.id.includes(":") ? r.id.split(":")[1] : r.id;
    aliasSet.add(idSlug.toLowerCase());

    if (r.partNumber) {
      const cleanPart = r.partNumber.toLowerCase().trim();
      aliasSet.add(cleanPart);
      aliasSet.add(cleanPart.replace(/[^a-z0-9]/g, ""));
    }

    const nameSlug = r.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    aliasSet.add(nameSlug);

    const normalizedRecord = {
      ...r,
      aliases: Array.from(aliasSet).filter(Boolean).sort(),
    };

    allRecords.push(normalizedRecord);
  }
}

if (validationErrors.length > 0) {
  console.error(`\n❌ INGESTION FAILED WITH ${validationErrors.length} VALIDATION ERROR(S):`);
  for (const err of validationErrors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

// Deterministic Sorting:
// 1. manufacturer asc
// 2. releaseDate desc (nulls last)
// 3. name asc
// 4. id asc
allRecords.sort((a, b) => {
  if (a.manufacturer !== b.manufacturer) {
    return a.manufacturer.localeCompare(b.manufacturer);
  }
  if (a.releaseDate && b.releaseDate) {
    const cmp = b.releaseDate.localeCompare(a.releaseDate);
    if (cmp !== 0) return cmp;
  } else if (a.releaseDate && !b.releaseDate) {
    return -1;
  } else if (!a.releaseDate && b.releaseDate) {
    return 1;
  }
  if (a.name !== b.name) {
    return a.name.localeCompare(b.name);
  }
  return a.id.localeCompare(b.id);
});

console.log(`\nSuccessfully validated and sorted ${allRecords.length} SoC records.`);

// Write unified soc.json
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allRecords, null, 2) + "\n", "utf-8");
console.log(`Saved canonical dataset to: ${OUTPUT_FILE}`);

// Partition by manufacturer into backend/data/soc/
const vendorMap = new Map();
for (const r of allRecords) {
  const mfrKey = r.manufacturer.toLowerCase();
  if (!vendorMap.has(mfrKey)) {
    vendorMap.set(mfrKey, []);
  }
  vendorMap.get(mfrKey).push(r);
}

for (const [vendor, records] of vendorMap.entries()) {
  const vendorFile = path.join(SOC_DATA_DIR, `${vendor}.json`);
  fs.writeFileSync(vendorFile, JSON.stringify(records, null, 2) + "\n", "utf-8");
  console.log(`Saved ${records.length} records to partitioned file: ${vendorFile}`);
}

// Generate Build Summary
const mfrCounts = {};
const formFactorCounts = {};
const vulkanCounts = {};
let rayTracingCount = 0;
const provenanceTiers = {};

for (const r of allRecords) {
  mfrCounts[r.manufacturer] = (mfrCounts[r.manufacturer] || 0) + 1;
  for (const ff of r.formFactor) {
    formFactorCounts[ff] = (formFactorCounts[ff] || 0) + 1;
  }
  const v = r.vulkanVersion || "None / Pre-Vulkan";
  vulkanCounts[v] = (vulkanCounts[v] || 0) + 1;
  if (r.rayTracingHardware) {
    rayTracingCount++;
  }
  const pt = r.provenance?.sourceTier || "unknown";
  provenanceTiers[pt] = (provenanceTiers[pt] || 0) + 1;
}

const summary = {
  pipeline: "Veylora Authoritative Mobile SoC Ingestion",
  generatedAt: new Date().toISOString(),
  totalRecords: allRecords.length,
  byManufacturer: mfrCounts,
  byFormFactor: formFactorCounts,
  byVulkanVersion: vulkanCounts,
  hardwareRayTracingSupport: rayTracingCount,
  provenanceTierDistribution: provenanceTiers,
  validationStatus: "PASSED",
};

fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2) + "\n", "utf-8");
console.log(`Saved build summary report to: ${SUMMARY_FILE}`);

console.log("\n==================================================");
console.log("INGESTION COMPLETED SUCCESSFULLY!");
console.log(`Total SoCs: ${allRecords.length}`);
console.log("==================================================");
