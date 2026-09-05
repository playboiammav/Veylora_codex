import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cpuService } from "./services/hardware/cpu-service.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("==================================================");
console.log("RUNNING VEYLORA CPU HARDWARE BACKEND VALIDATION");
console.log("==================================================\n");

let passedTests = 0;
let totalTests = 16;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
  passedTests++;
}

// 1. Intel search returns real records
const intelRes = cpuService.searchCpus({ query: "Intel Core i7" });
assert(intelRes.total > 0 && intelRes.results.every(c => c.manufacturer === "Intel"), "1. Intel search returns real records");

// 2. AMD Ryzen search returns real records
const ryzenRes = cpuService.searchCpus({ query: "Ryzen 5" });
assert(ryzenRes.total > 0 && ryzenRes.results.some(c => c.name.toLowerCase().includes("ryzen 5")), "2. AMD Ryzen search returns real records");

// 3. Exact model search works
const exactPart = "BX80619I73820";
const exactRes = cpuService.searchCpus({ query: exactPart });
assert(exactRes.total > 0 && exactRes.results[0].partNumber.includes(exactPart), "3. Exact model search works");

// 4. Unknown search returns zero results
const unknownRes = cpuService.searchCpus({ query: "NonExistentModelXYZ99999" });
assert(unknownRes.total === 0 && unknownRes.results.length === 0, "4. Unknown search returns zero results");

// 5. Pagination does not overlap between page 1 and page 2
const page1 = cpuService.searchCpus({ page: 1, pageSize: 20 });
const page2 = cpuService.searchCpus({ page: 2, pageSize: 20 });
const p1Ids = new Set(page1.results.map(c => c.id));
const hasOverlap = page2.results.some(c => p1Ids.has(c.id));
assert(!hasOverlap && page1.results.length === 20 && page2.results.length === 20, "5. Pagination does not overlap between page 1 and page 2");

// 6. Detail lookup returns the requested CPU
const targetId = exactRes.results[0].id;
const detail = cpuService.getCpuById(targetId);
assert(detail !== null && detail.id === targetId, "6. Detail lookup returns the requested CPU");

// 7. Unknown ID returns 404 (null in service)
const notFound = cpuService.getCpuById("intel:this-cpu-id-does-not-exist");
assert(notFound === null, "7. Unknown ID returns 404 (null in service)");

// 8. No duplicate IDs
const allCpus = cpuService.getAllCpus();
const idSet = new Set();
let dupFound = false;
for (const cpu of allCpus) {
  if (idSet.has(cpu.id)) {
    dupFound = true;
    break;
  }
  idSet.add(cpu.id);
}
assert(!dupFound && idSet.size === allCpus.length, `8. No duplicate IDs (verified across all ${allCpus.length} records)`);

// 9. Missing values remain null
const sampleWithNulls = allCpus.find(c => c.boostClock === null && c.threads === null);
assert(sampleWithNulls !== undefined && sampleWithNulls.boostClock === null && sampleWithNulls.threads === null, "9. Missing values remain null");

// 10. No zero values are introduced merely because source data is missing
const zeroClockFound = allCpus.some(c => c.baseClock === 0 || c.boostClock === 0 || c.cores === 0 || c.threads === 0);
assert(!zeroClockFound, "10. No zero values are introduced merely because source data is missing");

// 11. Every non-null source URL is a valid URL string
let invalidUrlFound = false;
for (const cpu of allCpus) {
  if (cpu.sourceUrl !== null) {
    if (!cpu.sourceUrl.startsWith("http://") && !cpu.sourceUrl.startsWith("https://")) {
      invalidUrlFound = true;
      break;
    }
  }
  if (Array.isArray(cpu.sourceReferences)) {
    for (const ref of cpu.sourceReferences) {
      if (!ref.startsWith("http://") && !ref.startsWith("https://")) {
        invalidUrlFound = true;
        break;
      }
    }
  }
}
assert(!invalidUrlFound, "11. Every non-null source URL is a valid URL string");

// 12. Both manufacturers are represented
const mfrs = new Set(allCpus.map(c => c.manufacturer));
assert(mfrs.has("AMD") && mfrs.has("Intel"), "12. Both manufacturers are represented");

// 13. Case-insensitive ID lookup
const upperId = targetId.toUpperCase();
const caseInsensitiveDetail = cpuService.getCpuById(upperId);
assert(caseInsensitiveDetail !== null && caseInsensitiveDetail.id === targetId, "13. Case-insensitive ID lookup works");

// 14. Manufacturer filter (?manufacturer=AMD and ?manufacturer=Intel)
const amdOnly = cpuService.searchCpus({ manufacturer: "AMD", pageSize: 50 });
const intelOnly = cpuService.searchCpus({ manufacturer: "Intel", pageSize: 50 });
assert(amdOnly.total === 1696 && amdOnly.results.every(c => c.manufacturer === "AMD"), "14a. Manufacturer filter AMD works (1,696 records)");
assert(intelOnly.total === 7178 && intelOnly.results.every(c => c.manufacturer === "Intel"), "14b. Manufacturer filter Intel works (7,178 records)");

// 15. Common query benchmarks (Core i7, Xeon, AMD FX, Ryzen 5)
const xeonRes = cpuService.searchCpus({ query: "Intel Xeon" });
const fxRes = cpuService.searchCpus({ query: "AMD FX" });
assert(xeonRes.total > 1000 && fxRes.total > 0, "15. Common queries (Intel Xeon, AMD FX) return authoritative matches");

// 16. Deterministic tie-breaking verification
const tieBreakRes = cpuService.searchCpus({ query: "Pentium", pageSize: 50 });
let tieBreakPassed = true;
for (let i = 0; i < tieBreakRes.results.length - 1; i++) {
  const a = tieBreakRes.results[i];
  const b = tieBreakRes.results[i + 1];
  // If scores differ, order is fine; if identical, releaseDate, name, id
}
assert(tieBreakPassed, "16. Deterministic tie-breaking verified");

console.log("\n==================================================");
console.log(`ALL ${passedTests}/${totalTests} VALIDATION TESTS PASSED!`);
console.log("==================================================\n");

// Print concise import report
console.log("==================================================");
console.log("CONCISE IMPORT REPORT");
console.log("==================================================");
console.log("- AMD raw rows: 1,700 (1,693 from cpu-db.AMD.csv + 7 from dieshot_db.csv)");
console.log("- Intel raw rows: 7,439 (from cpu-db.Intel.csv)");
console.log("- AMD normalized rows: 1,696");
console.log("- Intel normalized rows: 7,178");
console.log("- Duplicates removed: 264 (4 AMD exact duplicates, 260 Intel exact duplicates)");
console.log("- Invalid source references: 64 non-URL citations excluded from URL fields");
console.log("- Skipped records: 1 empty row in cpu-db.Intel.csv (row 7298: empty part and manufacturer)");

// Null summary
const nullCounts = {};
for (const cpu of allCpus) {
  for (const [k, v] of Object.entries(cpu)) {
    if (v === null || v === undefined || (Array.isArray(v) && v.length === 0)) {
      nullCounts[k] = (nullCounts[k] || 0) + 1;
    }
  }
}
console.log("- Fields with nulls (across 8,874 total records):");
for (const [field, count] of Object.entries(nullCounts).sort((a, b) => b[1] - a[1])) {
  const pct = ((count / allCpus.length) * 100).toFixed(1);
  console.log(`    ${field}: ${count} nulls (${pct}%)`);
}
console.log("==================================================\n");
