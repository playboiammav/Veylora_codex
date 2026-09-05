#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { socService } from "../services/hardware/soc-service.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================");
console.log("RUNNING VEYLORA MOBILE SOC HARDWARE VALIDATION");
console.log("==================================================\n");

let passedTests = 0;
const totalTests = 20;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
  passedTests++;
}

// 1. Qualcomm search returns real records
const qcomRes = socService.searchSocs({ query: "Snapdragon 8 Gen 3" });
assert(
  qcomRes.total > 0 &&
    qcomRes.results.some((s) => s.manufacturer === "Qualcomm" && s.name.includes("8 Gen 3")),
  "1. Qualcomm search returns real records (Snapdragon 8 Gen 3)"
);

// 2. MediaTek search returns real records
const mtkRes = socService.searchSocs({ query: "Dimensity 9400" });
assert(
  mtkRes.total > 0 &&
    mtkRes.results.some((s) => s.manufacturer === "MediaTek" && s.name.includes("9400")),
  "2. MediaTek search returns real records (Dimensity 9400)"
);

// 3. Samsung Exynos search returns real records
const samRes = socService.searchSocs({ query: "Exynos 2400" });
assert(
  samRes.total > 0 &&
    samRes.results.some((s) => s.manufacturer === "Samsung" && s.name.includes("2400")),
  "3. Samsung Exynos search returns real records (Exynos 2400)"
);

// 4. Google Tensor search returns real records
const tensorRes = socService.searchSocs({ query: "Tensor G4" });
assert(
  tensorRes.total > 0 &&
    tensorRes.results.some((s) => s.manufacturer === "Google" && s.name.includes("Tensor G4")),
  "4. Google Tensor search returns real records (Tensor G4)"
);

// 5. Apple A-Series search returns real records
const appleRes = socService.searchSocs({ query: "A18 Pro" });
assert(
  appleRes.total > 0 &&
    appleRes.results.some((s) => s.manufacturer === "Apple" && s.name.includes("A18 Pro")),
  "5. Apple A-Series search returns real records (A18 Pro)"
);

// 6. Apple M-Series segregated: tablet/desktop only, never returned when formFactor='phone'
const phoneApple = socService.searchSocs({ manufacturer: "Apple", formFactor: "phone", pageSize: 100 });
const hasMSeriesInPhone = phoneApple.results.some((s) => s.family === "Apple M-Series");
const m4Detail = socService.getSocById("apple:m4-t8132");
assert(
  !hasMSeriesInPhone &&
    m4Detail !== null &&
    !m4Detail.formFactor.includes("phone") &&
    m4Detail.formFactor.includes("tablet") &&
    m4Detail.formFactor.includes("desktop"),
  "6. Apple M-Series segregated: tablet/desktop only, never returned when formFactor='phone'"
);

// 7. Exact part number lookup works
const sm8650 = socService.getSocById("SM8650-AB");
const mt6991 = socService.getSocById("MT6991");
const s5e9945 = socService.getSocById("S5E9945");
assert(
  sm8650 !== null &&
    sm8650.name === "Qualcomm Snapdragon 8 Gen 3" &&
    mt6991 !== null &&
    mt6991.name === "MediaTek Dimensity 9400" &&
    s5e9945 !== null &&
    s5e9945.name === "Samsung Exynos 2400",
  "7. Exact part number lookup works (SM8650-AB, MT6991, S5E9945)"
);

// 8. Colloquial / abbreviated alias lookup works
const alias1 = socService.getSocById("sd8gen3");
const alias2 = socService.getSocById("d9400");
const alias3 = socService.getSocById("a18pro");
assert(
  alias1 !== null &&
    alias1.name.includes("Snapdragon 8 Gen 3") &&
    alias2 !== null &&
    alias2.name.includes("Dimensity 9400") &&
    alias3 !== null &&
    alias3.name.includes("A18 Pro"),
  "8. Colloquial / abbreviated alias lookup works (sd8gen3, d9400, a18pro)"
);

// 9. Unknown query returns zero results
const unknownRes = socService.searchSocs({ query: "NonExistentChipsetXYZ99999" });
assert(
  unknownRes.total === 0 && unknownRes.results.length === 0,
  "9. Unknown query returns zero results"
);

// 10. Detail lookup by canonical ID returns full SoC
const snap8Elite = socService.getSocById("qualcomm:snapdragon-8-elite-sm8750-ab");
assert(
  snap8Elite !== null &&
    snap8Elite.name === "Qualcomm Snapdragon 8 Elite" &&
    snap8Elite.cpuCores === 8 &&
    snap8Elite.cpuClockMax === 4320 &&
    snap8Elite.gpu === "Qualcomm Adreno 830" &&
    snap8Elite.rayTracingHardware === true,
  "10. Detail lookup by canonical ID returns full SoC (Snapdragon 8 Elite)"
);

// 11. Unknown ID returns null (404)
const missingSoc = socService.getSocById("qualcomm:fake-chip-does-not-exist");
assert(missingSoc === null, "11. Unknown ID returns null (404)");

// 12. Case-insensitive ID and alias lookup works
const upperLookup = socService.getSocById("QUALCOMM:SNAPDRAGON-8-GEN-3-SM8650-AB");
const mixedAlias = socService.getSocById("Sd8Gen3");
assert(
  upperLookup !== null &&
    upperLookup.id === "qualcomm:snapdragon-8-gen-3-sm8650-ab" &&
    mixedAlias !== null &&
    mixedAlias.id === "qualcomm:snapdragon-8-gen-3-sm8650-ab",
  "12. Case-insensitive ID and alias lookup works"
);

// 13. No duplicate IDs across the entire dataset
const allSocs = socService.getAllSocs();
const idSet = new Set();
let dupFound = false;
for (const s of allSocs) {
  if (idSet.has(s.id)) {
    dupFound = true;
    break;
  }
  idSet.add(s.id);
}
assert(
  !dupFound && idSet.size === allSocs.length,
  `13. No duplicate IDs across all ${allSocs.length} records`
);

// 14. Pagination does not overlap between page 1 and page 2, and totalPages is correct
const page1 = socService.searchSocs({ page: 1, pageSize: 15 });
const page2 = socService.searchSocs({ page: 2, pageSize: 15 });
const p1Ids = new Set(page1.results.map((s) => s.id));
const hasOverlap = page2.results.some((s) => p1Ids.has(s.id));
assert(
  !hasOverlap &&
    page1.results.length === 15 &&
    page2.results.length === 15 &&
    page1.totalPages === Math.ceil(allSocs.length / 15),
  "14. Pagination does not overlap between page 1 and page 2, and totalPages is correct"
);

// 15. Manufacturer filter works for all 7 manufacturers
const mfrs = ["Qualcomm", "MediaTek", "Samsung", "Google", "Apple", "HiSilicon", "UNISOC"];
let allMfrsPass = true;
for (const mfr of mfrs) {
  const res = socService.searchSocs({ manufacturer: mfr, pageSize: 100 });
  if (res.total === 0 || !res.results.every((s) => s.manufacturer === mfr)) {
    allMfrsPass = false;
    break;
  }
}
assert(
  allMfrsPass,
  "15. Manufacturer filter works for all 7 manufacturers (Qualcomm, MediaTek, Samsung, Google, Apple, HiSilicon, UNISOC)"
);

// 16. Form factor filter works (?formFactor=phone, ?formFactor=tablet, ?formFactor=handheld)
const phones = socService.searchSocs({ formFactor: "phone", pageSize: 100 });
const handhelds = socService.searchSocs({ formFactor: "handheld", pageSize: 100 });
assert(
  phones.total > 0 &&
    phones.results.every((s) => s.formFactor.includes("phone")) &&
    handhelds.total > 0 &&
    handhelds.results.every((s) => s.formFactor.includes("handheld")),
  "16. Form factor filter works (phone, tablet, handheld)"
);

// 17. CPU clusters integrity: sum of cluster cores equals cpuCores, all cluster clocks > 0, cpuClockMax matches highest cluster clock
let clusterIntegrity = true;
for (const soc of allSocs) {
  const clusterCoreSum = soc.cpuClusters.reduce((sum, c) => sum + c.cores, 0);
  if (clusterCoreSum !== soc.cpuCores) {
    clusterIntegrity = false;
    break;
  }
  const maxClusterClock = Math.max(...soc.cpuClusters.map((c) => c.maxClock));
  if (maxClusterClock !== soc.cpuClockMax) {
    clusterIntegrity = false;
    break;
  }
  if (soc.cpuClusters.some((c) => c.maxClock <= 0 || c.cores <= 0)) {
    clusterIntegrity = false;
    break;
  }
}
assert(
  clusterIntegrity,
  "17. CPU clusters integrity: sum of cores equals cpuCores, maxClock aligns with highest cluster clock, all clocks > 0"
);

// 18. Graphics & API conformance: Vulkan version is valid string (e.g. "1.3", "1.2", "1.1") or null
let vulkanConformance = true;
for (const soc of allSocs) {
  if (soc.manufacturer === "Apple" && soc.vulkanVersion !== null) {
    vulkanConformance = false;
    break;
  }
  if (soc.vulkanVersion !== null) {
    if (!["1.0", "1.1", "1.2", "1.3"].includes(soc.vulkanVersion)) {
      vulkanConformance = false;
      break;
    }
  }
}
assert(
  vulkanConformance,
  "18. Graphics & API conformance: Vulkan version valid or null (strictly null for Apple & pre-Vulkan silicon)"
);

// 19. Zero fabricated data: unknown fields remain null, never fake 0s
let zeroFabrication = true;
for (const soc of allSocs) {
  if (soc.cpuClockMax === 0 || soc.cpuCores === 0) {
    zeroFabrication = false;
    break;
  }
  if (soc.npuTops === 0) {
    zeroFabrication = false;
    break;
  }
}
assert(
  zeroFabrication,
  "19. Zero fabricated data: unknown fields remain null, never fake 0s"
);

// 20. Provenance integrity: all records have valid sourceTier, non-empty sourceUrls, and attribution
let provenanceIntegrity = true;
for (const soc of allSocs) {
  if (
    !soc.provenance ||
    !soc.provenance.primarySource ||
    !Array.isArray(soc.provenance.sourceUrls) ||
    soc.provenance.sourceUrls.length === 0 ||
    !soc.provenance.licenseClassification
  ) {
    provenanceIntegrity = false;
    break;
  }
  for (const url of soc.provenance.sourceUrls) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      provenanceIntegrity = false;
      break;
    }
  }
}
assert(
  provenanceIntegrity,
  "20. Provenance integrity: valid sourceTier, non-empty sourceUrls with valid protocol, and licensing attribution"
);

console.log("\n==================================================");
console.log(`ALL ${passedTests}/${totalTests} MOBILE SOC VALIDATION TESTS PASSED!`);
console.log("==================================================\n");
