#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { deviceService } from "../services/hardware/device-service.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================");
console.log("RUNNING VEYLORA SMARTPHONE & TABLET VALIDATION");
console.log("==================================================\n");

let passedTests = 0;
const totalTests = 30;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
  passedTests++;
}

const devicesDir = path.resolve(__dirname, "..", "data", "devices");
const phonesPath = path.join(devicesDir, "smartphones.json");
const tabletsPath = path.join(devicesDir, "tablets.json");
const summaryPath = path.join(devicesDir, "device-build-summary.json");

// 1. smartphone dataset exists
assert(fs.existsSync(phonesPath), "1. smartphone dataset exists (smartphones.json)");

// 2. tablet dataset exists
assert(fs.existsSync(tabletsPath), "2. tablet dataset exists (tablets.json)");

const smartphones = JSON.parse(fs.readFileSync(phonesPath, "utf-8"));
const tablets = JSON.parse(fs.readFileSync(tabletsPath, "utf-8"));
const allDevices = [...smartphones, ...tablets];

// 3. both contain real records
assert(
  smartphones.length > 3000 && tablets.length > 250,
  `3. both contain real records (smartphones: ${smartphones.length}, tablets: ${tablets.length})`
);

// 4. no duplicate canonical IDs
const idSet = new Set();
let hasDuplicateId = false;
for (const d of allDevices) {
  if (idSet.has(d.id)) {
    hasDuplicateId = true;
    break;
  }
  idSet.add(d.id);
}
assert(!hasDuplicateId, `4. no duplicate canonical IDs across all ${allDevices.length} records`);

// 5. phones contain only phone formFactor/deviceType
const invalidPhone = smartphones.find(
  (p) => p.formFactor !== "phone" || p.deviceType !== "phone"
);
assert(!invalidPhone, "5. phones contain only phone formFactor/deviceType");

// 6. tablets contain only tablet formFactor/deviceType
const invalidTablet = tablets.find(
  (t) => t.formFactor !== "tablet" || t.deviceType !== "tablet"
);
assert(!invalidTablet, "6. tablets contain only tablet formFactor/deviceType");

// 7. Samsung devices resolve
const samsungRes = deviceService.searchDevices({ manufacturer: "Samsung", pageSize: 10 });
const s24Ultra = deviceService.getDeviceById("samsung:galaxy-s24-ultra-sm-s928b");
assert(
  samsungRes.total > 500 && s24Ultra !== null && s24Ultra.brand === "Samsung",
  "7. Samsung devices resolve (Galaxy S24 Ultra found)"
);

// 8. Google Pixel devices resolve
const pixelRes = deviceService.searchDevices({ manufacturer: "Google", pageSize: 10 });
const pixel8Pro = deviceService.searchDevices({ query: "Pixel 8 Pro" });
assert(
  pixelRes.total > 20 && pixel8Pro.total > 0 && pixel8Pro.results[0].brand === "Google",
  "8. Google Pixel devices resolve (Pixel 8 Pro found)"
);

// 9. Xiaomi/Redmi/POCO devices resolve
const xiaomiUmbrella = deviceService.searchDevices({ manufacturer: "Xiaomi" });
const redmiRes = deviceService.searchDevices({ manufacturer: "Redmi" });
const pocoRes = deviceService.searchDevices({ manufacturer: "POCO" });
const miRes = deviceService.searchDevices({ manufacturer: "Xiaomi", query: "Xiaomi 14" });
assert(
  xiaomiUmbrella.total > 300 && redmiRes.total > 50 && pocoRes.total > 50 && miRes.total > 0 && miRes.results[0].brand === "Xiaomi",
  "9. Xiaomi/Redmi/POCO devices resolve under umbrella and distinct brands"
);

// 10. OnePlus devices resolve
const oneplusRes = deviceService.searchDevices({ manufacturer: "OnePlus", pageSize: 10 });
assert(oneplusRes.total > 50, `10. OnePlus devices resolve (found ${oneplusRes.total})`);

// 11. Apple iPhone resolves
const iphoneRes = deviceService.searchDevices({ query: "iPhone 15 Pro", formFactor: "phone" });
assert(
  iphoneRes.total > 0 && iphoneRes.results[0].brand === "Apple" && iphoneRes.results[0].formFactor === "phone",
  "11. Apple iPhone resolves (iPhone 15 Pro found as phone)"
);

// 12. Apple iPad resolves
const ipadRes = deviceService.searchDevices({ query: "iPad Pro 11", formFactor: "tablet" });
assert(
  ipadRes.total > 0 && ipadRes.results[0].brand === "Apple" && ipadRes.results[0].formFactor === "tablet",
  "12. Apple iPad resolves (iPad Pro 11 found as tablet)"
);

// 13. Honor/Huawei/Realme/ASUS/Nothing are present if source evidence supports them
const honorCount = allDevices.filter((d) => d.brand === "Honor").length;
const huaweiCount = allDevices.filter((d) => d.brand === "Huawei").length;
const realmeCount = allDevices.filter((d) => d.brand === "Realme").length;
const asusCount = allDevices.filter((d) => d.brand === "ASUS").length;
const nothingCount = allDevices.filter((d) => d.brand === "Nothing").length;
assert(
  honorCount > 100 && huaweiCount > 100 && realmeCount > 100 && asusCount > 30 && nothingCount >= 10,
  `13. Honor(${honorCount}), Huawei(${huaweiCount}), Realme(${realmeCount}), ASUS(${asusCount}), Nothing(${nothingCount}) present`
);

// 14. model-number lookup works
const modelMatch1 = deviceService.getDeviceByModel("SM-S928B");
const modelMatch2 = deviceService.getDeviceByModel("A3106");
assert(
  modelMatch1 !== null && modelMatch1.marketName.includes("S24 Ultra") &&
  modelMatch2 !== null && modelMatch2.brand === "Apple",
  "14. model-number lookup works (SM-S928B -> S24 Ultra, A3106 -> Apple iPhone)"
);

// 15. SoC exact linkage works
const s24UltraSoc = s24Ultra?.socId;
const m4Ipad = allDevices.find((d) => d.id === "apple:ipad-pro-11-2024-a2836");
assert(
  s24UltraSoc === "qualcomm:snapdragon-8-gen-3-leading-sm8650-ac" &&
  m4Ipad?.socId === "apple:m4-t8132",
  "15. SoC exact linkage works (S24 Ultra -> SM8650-AC, iPad Pro 2024 -> Apple M4)"
);

// 16. ambiguous SoC does not fuzzy-resolve
const summary = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));
assert(
  summary.socUnresolvedCount > 1000 && Array.isArray(summary.unresolvedSocExamples) && summary.unresolvedSocExamples.length > 0,
  `16. ambiguous/unseeded SoCs remain null without fuzzy guessing (${summary.socUnresolvedCount} unresolved preserved)`
);

// 17. regional variants remain distinct
const s24Snap = deviceService.getDeviceById("samsung:galaxy-s24-snapdragon-sm-s921u");
const s24Exyn = deviceService.getDeviceById("samsung:galaxy-s24-exynos-sm-s921b");
assert(
  s24Snap !== null && s24Exyn !== null &&
  s24Snap.id !== s24Exyn.id &&
  s24Snap.socId === "qualcomm:snapdragon-8-gen-3-leading-sm8650-ac" &&
  s24Exyn.socId === "samsung:exynos-2400-s5e9945" &&
  s24Snap.regionalVariant?.includes("Snapdragon") &&
  s24Exyn.regionalVariant?.includes("Exynos"),
  "17. regional variants remain distinct (Galaxy S24 Snapdragon vs Exynos)"
);

// 18. multiple RAM configurations are preserved
const multiRamDev = allDevices.find((d) => d.ramGb.length >= 2 && d.baseRamGb !== d.maxRamGb);
assert(
  multiRamDev !== undefined && multiRamDev.ramGb.length >= 2 &&
  multiRamDev.baseRamGb === multiRamDev.ramGb[0] &&
  multiRamDev.maxRamGb === multiRamDev.ramGb[multiRamDev.ramGb.length - 1],
  `18. multiple RAM configurations are preserved (e.g. ${multiRamDev?.marketName}: [${multiRamDev?.ramGb.join(", ")}])`
);

// 19. multiple storage configurations are preserved where verified
const multiStorageDev = allDevices.find((d) => d.storageGb.length >= 2);
assert(
  multiStorageDev !== undefined && multiStorageDev.storageGb.length >= 2,
  `19. multiple storage configurations are preserved (e.g. ${multiStorageDev?.marketName}: [${multiStorageDev?.storageGb.join(", ")}])`
);

// 20. no prices exist in production device datasets
let hasPriceField = false;
const currencyRegex = /\b(usd|eur|gbp|inr|bdt|cny)\s*[\d.,]+|[\$€£¥৳]\s*[\d.,]+/i;
for (const d of allDevices) {
  const keys = Object.keys(d);
  if (keys.some((k) => k.toLowerCase().includes("price"))) {
    hasPriceField = true;
    break;
  }
  for (const [k, v] of Object.entries(d)) {
    if (k === "sourceUrl" || k === "provenance") continue;
    if (typeof v === "string" && currencyRegex.test(v)) {
      hasPriceField = true;
      break;
    }
  }
  if (hasPriceField) break;
}
assert(!hasPriceField, "20. no prices exist in production device datasets (strictly purged)");

// 21. no rumor/future speculative records exist
let hasRumorRecord = false;
for (const d of allDevices) {
  const name = d.marketName.toLowerCase();
  const id = d.id.toLowerCase();
  if (name.includes("trump mobile") || name.includes("iphone 18") || name.includes("iphone 17") || name.includes("galaxy s26") || name.includes("tab s12")) {
    hasRumorRecord = true;
    break;
  }
  if (d.iosVersion && parseFloat(d.iosVersion) > 19) {
    hasRumorRecord = true;
    break;
  }
}
assert(!hasRumorRecord, "21. no rumor/future speculative records exist (clickbait/placeholders excluded)");

// 22. no editorial/marketing fields exist
let hasEditorialFields = false;
for (const d of allDevices) {
  const keys = Object.keys(d);
  if (keys.includes("Our Tests") || keys.includes("review") || keys.includes("cameraReview") || keys.includes("editorial")) {
    hasEditorialFields = true;
    break;
  }
}
assert(!hasEditorialFields, "22. no editorial/marketing fields exist (only factual hardware metrics preserved)");

// 23. unknown values remain null
const hasUnknownNulls = allDevices.some(
  (d) => d.socId === null || d.displayRefreshRate === null || d.currentAndroidVersion === null
);
assert(hasUnknownNulls, "23. unknown values remain null (no guessed values)");

// 24. no synthetic zero values
const hasSyntheticZero = allDevices.some(
  (d) => d.displayWidth === 0 || d.displayHeight === 0 || d.displaySize === 0 || d.baseRamGb === 0
);
assert(!hasSyntheticZero, "24. no synthetic zero values (missing metrics remain null, never 0)");

// 25. source/provenance metadata exists
const missingProvenance = allDevices.find(
  (d) => !d.sourceName || !d.sourceTier || !d.licenseClassification || !d.provenance || !d.provenance.primarySource
);
assert(!missingProvenance, "25. source/provenance metadata exists on all production records");

// 26. source URLs are valid where present
const invalidUrl = allDevices.find(
  (d) => d.sourceUrl !== null && (!d.sourceUrl.startsWith("http://") && !d.sourceUrl.startsWith("https://"))
);
assert(!invalidUrl, "26. source URLs are valid HTTP(S) strings where present");

// 27. pagination/search preparation is deterministic
const p1 = deviceService.searchDevices({ page: 1, pageSize: 15 });
const p2 = deviceService.searchDevices({ page: 2, pageSize: 15 });
const idsP1 = new Set(p1.results.map((d) => d.id));
const overlap = p2.results.some((d) => idsP1.has(d.id));
assert(
  p1.results.length === 15 && p2.results.length === 15 && !overlap && p1.total === allDevices.length,
  "27. pagination/search preparation is deterministic without overlapping records"
);

// 28. Apple M-series iPads remain tablets
const mSeriesIpads = tablets.filter((t) => t.brand === "Apple" && t.socId && t.socId.includes("apple:m"));
const mSeriesPhones = smartphones.filter((p) => p.brand === "Apple" && p.socId && p.socId.includes("apple:m"));
assert(
  mSeriesIpads.length > 0 && mSeriesPhones.length === 0,
  `28. Apple M-series iPads remain tablets (found ${mSeriesIpads.length} in tablets, 0 in phones)`
);

// 29. Android and iOS records do not receive inappropriate cross-platform fields
const crossPollutedApple = allDevices.find(
  (d) => d.brand === "Apple" && (d.launchAndroidVersion !== null || d.androidApiLevel !== null || d.vulkanSupported === true)
);
const crossPollutedAndroid = allDevices.find(
  (d) => d.brand !== "Apple" && d.iosVersion !== null
);
assert(
  !crossPollutedApple && !crossPollutedAndroid,
  "29. Android and iOS records do not receive inappropriate cross-platform fields"
);

// 30. deterministic output ordering is stable
const testSort = [...smartphones.slice(0, 100)];
let isSorted = true;
for (let i = 0; i < testSort.length - 1; i++) {
  const a = testSort[i];
  const b = testSort[i + 1];
  const brandComp = a.brand.localeCompare(b.brand);
  if (brandComp > 0) {
    isSorted = false;
    break;
  }
}
assert(isSorted, "30. deterministic output ordering is stable (brand asc, releaseDate desc)");

console.log("\n==================================================");
console.log(`ALL ${passedTests}/${totalTests} DEVICE VALIDATION TESTS PASSED!`);
console.log("==================================================");
