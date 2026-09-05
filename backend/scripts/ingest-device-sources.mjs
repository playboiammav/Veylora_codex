#!/usr/bin/env node
/**
 * Veylora Smartphone & Tablet Ingestion Pipeline
 * Entry point: node backend/scripts/ingest-device-sources.mjs
 *
 * Implements Strategy C (Authoritative Official Sources + Technical Hardware Synthesis)
 * Reproducibly ingests:
 * 1. Google Play Supported Devices registry
 * 2. Apple Developer Hardware Specifications
 * 3. GSMArena Factual Technical Hardware Tree
 * 4. Secondary Technical Specification Registry (missing brands)
 * 5. Canonical SoC Linkage (backend/data/soc/soc.json)
 *
 * Outputs:
 * - backend/data/devices/smartphones.json
 * - backend/data/devices/tablets.json
 * - backend/data/devices/device-build-summary.json
 */

import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const enginePath = path.resolve(__dirname, "ingest-device-engine.py");

console.log("==================================================");
console.log("LAUNCHING VEYLORA DEVICE INGESTION PIPELINE");
console.log(`Engine: ${enginePath}`);
console.log("==================================================\n");

if (!fs.existsSync(enginePath)) {
  console.error(`❌ Engine script not found at ${enginePath}`);
  process.exit(1);
}

const child = spawn("python3", [enginePath], {
  cwd: projectRoot,
  stdio: "inherit",
});

child.on("error", (err) => {
  console.error("❌ Failed to launch Python ingestion engine:", err);
  process.exit(1);
});

child.on("close", (code) => {
  if (code !== 0) {
    console.error(`❌ Ingestion engine exited with code ${code}`);
    process.exit(code ?? 1);
  }

  // Verify generated datasets
  const devicesDir = path.resolve(projectRoot, "data", "devices");
  const phonesPath = path.join(devicesDir, "smartphones.json");
  const tabletsPath = path.join(devicesDir, "tablets.json");
  const summaryPath = path.join(devicesDir, "device-build-summary.json");

  let allExist = true;
  for (const [name, p] of [["smartphones.json", phonesPath], ["tablets.json", tabletsPath], ["device-build-summary.json", summaryPath]]) {
    if (!fs.existsSync(p)) {
      console.error(`❌ Expected output missing: ${name}`);
      allExist = false;
    }
  }

  if (!allExist) {
    process.exit(1);
  }

  const phones = JSON.parse(fs.readFileSync(phonesPath, "utf-8"));
  const tablets = JSON.parse(fs.readFileSync(tabletsPath, "utf-8"));
  const summary = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));

  console.log("\n==================================================");
  console.log("INGESTION SUCCESSFUL & VERIFIED");
  console.log(`Total Smartphones: ${phones.length}`);
  console.log(`Total Tablets:     ${tablets.length}`);
  console.log(`SoC Linkage Rate:  ${summary.socLinkageRate}`);
  console.log("==================================================");
});
