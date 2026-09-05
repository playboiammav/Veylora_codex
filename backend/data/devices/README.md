# Veylora Smartphone & Tablet Hardware Catalog

Production-grade, offline-compiled hardware specifications for mobile devices (smartphones and tablets) in the Veylora gaming and media compatibility platform.

---

## 1. Catalog Overview

The Veylora Smartphone & Tablet Catalog provides authoritative, machine-readable hardware specifications for mobile devices. It is partitioned strictly by physical form factor:
- [`smartphones.json`](backend/data/devices/smartphones.json): Handheld phones with cellular baseband and phone form factor (3,777 verified production models).
- [`tablets.json`](backend/data/devices/tablets.json): Large-format mobile computing devices (352 verified production models).

### Physical & Silicon Segregation Rules
- **Form Factor Strictness**: Every record in `smartphones.json` has `formFactor: "phone"` and `deviceType: "phone"`. Every record in `tablets.json` has `formFactor: "tablet"` and `deviceType: "tablet"`.
- **Apple M-Series iPads**: iPad Pro and iPad Air tablets powered by desktop-class Apple silicon (Apple M1, M2, M4) are strictly isolated to `tablets.json`. Under no circumstances are M-series devices classified as smartphones or permitted into the phone dataset.
- **Regional Variant Splitting**: Multi-region releases sharing identical consumer market names but housing distinct silicon (notably Samsung Galaxy S-series with Snapdragon vs. Exynos) are indexed as independent canonical records with distinct model numbers, e.g.:
  - `samsung:galaxy-s24-snapdragon-sm-s921u` (Qualcomm Snapdragon 8 Gen 3 Leading Version `SM8650-AC`)
  - `samsung:galaxy-s24-exynos-sm-s921b` (Samsung Exynos 2400 `S5E9945`)

---

## 2. Multi-Tier Source Provenance & Licensing

All hardware specifications follow Strategy C ("Authoritative Official Sources + Technical Hardware Synthesis") established in [`device-source-audit.md`](backend/data/devices/device-source-audit.md).

### Data Source Tiers
1. **Tier 1 — Official Regulatory & Certification Databases**
   - **Google Play Supported Devices Registry**: Certified Android device codenames, marketing names, and OEM part/model numbers (53,671 certified Android devices cross-referenced).
   - **Apple Regulatory & Model Number Identifiers**: Official Apple model numbers (e.g. `A3106`, `A2836`) and Darwin hardware strings (e.g. `iPhone16,2`, `iPad16,3`).
2. **Tier 2 — Technical Hardware Synthesis**
   - **GSMArena Structured Archive**: Deep technical hardware metrics (SoC part numbers, memory/storage SKU matrices, display resolutions, battery capacities, physical dimensions).
   - **Public Technical Facts**: Hardware specifications constitute non-copyrightable factual data under *Feist Publications, Inc. v. Rural Telephone Service Co.* (499 U.S. 340).
3. **Tier 3 — Brand Supplementation**
   - **Global Mobile Phone Specifications Index (2026)**: Targeted supplementation for brands under-represented in primary archives (Realme, Huawei, Honor, ASUS, Nothing).

### Provenance Object
Every device record contains a deterministic provenance audit object:
```json
{
  "primarySource": "Google Play Certified Devices & GSMArena Technical Hardware Tree",
  "sourceUrls": [
    "https://storage.googleapis.com/play_public/supported_devices.csv",
    "https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php"
  ],
  "sourceTier": "tier1-authoritative",
  "licenseClassification": "Official Device Index / Public Technical Facts (Feist)",
  "verificationNotes": "Directly cross-referenced with Google Play certification index and vendor technical hardware sheets."
}
```

---

## 3. Strict Data Quality & Neutrality Standards

The catalog operates under strict production data hygiene rules:
- **Zero Guessed or Synthetic Values**: Missing metrics remain `null`. Under no circumstances are assumed defaults (such as `displayRefreshRate: 60` or `displayWidth: 0`) injected into the data.
- **Zero Commercial Pricing / Currency**: All price fields (e.g., USD, EUR, INR, BDT, CNY) and currency symbols are completely stripped from production records.
- **Zero Editorial / Marketing Prose**: Subjective review prose, camera verdicts, and marketing commentary are purged. Only cold hardware metrics are retained.
- **Zero Clickbait / Speculative Rumors**: Filtered out unreleased mock placeholders, speculative concepts (e.g., "Trump Mobile", "iPhone 18", "Galaxy S26"), and devices claiming unreleased OS versions (`iOS > 19`, `Android > 16`).

---

## 4. Canonical SoC Authority Linkage

Device records link directly to the Veylora Mobile SoC Catalog ([`backend/data/soc/soc.json`](backend/data/soc/soc.json)) via canonical identifiers:
- **Exact Silicon Matching**: Match logic compares normalized commercial names, chipset part numbers (e.g. `SM8650-AC`, `MT6991`, `S5E9945`, `T8132`), and disambiguation tokens.
- **Strict Disambiguation**: Prevents incorrect linkage between base and high-tier SKUs (e.g. Snapdragon 7 Gen 3 vs. Snapdragon 7+ Gen 3).
- **Null Safety on Ambiguity**: When an SoC cannot be definitively verified without guessing, `socId` remains `null`. As reflected in [`device-build-summary.json`](backend/data/devices/device-build-summary.json), 1,488 models have verified canonical SoC links (36.04% linkage rate across legacy and modern devices), while unlinked legacy/budget chips remain safely unlinked.

---

## 5. Schema Specification (`DeviceRecord`)

Each device record conforms to the `DeviceRecord` TypeScript interface defined in [`backend/lib/normalized-types.ts`](backend/lib/normalized-types.ts):

```typescript
interface DeviceRecord {
  id: string;                      // Canonical slug, e.g. "samsung:galaxy-s24-ultra-sm-s928b"
  brand: string;                   // Display brand, e.g. "Samsung", "Apple", "Google"
  marketName: string;              // Commercial retail name, e.g. "Galaxy S24 Ultra"
  modelNumbers: string[];          // OEM model codes, e.g. ["SM-S928B", "SM-S928U"]
  deviceCodenames: string[];       // Android / Apple internal codenames, e.g. ["eureka", "iPhone16,2"]
  aliases: string[];               // Colloquial search terms, e.g. ["s24 ultra", "s24u"]
  deviceType: "phone" | "tablet";  // Segregated hardware type
  formFactor: "phone" | "tablet";  // Form factor classification
  socId: string | null;            // Foreign key to backend/data/soc/soc.json
  socName: string | null;          // Commercial silicon name, e.g. "Snapdragon 8 Gen 3 Leading Version"
  chipsetPartNumber: string | null;// Manufacturer silicon part number, e.g. "SM8650-AC"
  ramGb: number[];                 // All verified RAM configurations in GB, e.g. [12]
  baseRamGb: number | null;        // Smallest available RAM capacity
  maxRamGb: number | null;         // Largest available RAM capacity
  storageGb: number[];             // All verified flash storage configurations, e.g. [256, 512, 1024]
  gpu: string | null;              // GPU core identifier, e.g. "Adreno 750"
  gpuArchitecture: string | null;  // GPU microarchitecture, if verified
  displayResolution: string | null;// e.g. "1440 x 3120"
  displayWidth: number | null;     // Pixels across width (short dimension)
  displayHeight: number | null;    // Pixels across height (long dimension)
  displaySize: number | null;      // Screen diagonal in inches, e.g. 6.8
  displayRefreshRate: number | null;// Peak refresh rate in Hz, e.g. 120 (null if unverified)
  refreshRateModes: number[];      // Supported refresh rate modes in Hz, e.g. [60, 120]
  launchAndroidVersion: string | null; // Android version at factory launch, e.g. "14"
  currentAndroidVersion: string | null;// Latest officially validated Android version
  iosVersion: string | null;       // iOS / iPadOS launch version for Apple hardware, e.g. "17.0"
  androidApiLevel: number | null;  // Android API level corresponding to launch OS
  vulkanSupported: boolean | null; // Vulkan graphics capability
  vulkanVersion: string | null;    // Minimum supported Vulkan version
  openGlEsVersion: string | null;  // OpenGL ES compliance level
  releaseDate: string | null;      // ISO format "YYYY-MM-DD" or "YYYY-MM"
  regionalVariant?: string | null; // Description of regional distinction, e.g. "USA / China (Snapdragon)"
  region?: string | null;          // Regional classification code
  storageExpandable: boolean | null;// microSD / nano memory expansion support
  sourceName: string;              // Primary data source tag
  sourceTier: "tier1-authoritative" | "tier2-technical-synthesis" | "tier3-community";
  licenseClassification: string;  // Legal license classification
  provenance: DeviceProvenance;    // Full multi-source audit metadata
}
```

---

## 6. Offline Pipeline & Reproduction

The catalog is pre-compiled offline for zero runtime latency. The pipeline executes reproducibly:

```bash
# Ingestion and technical synthesis pipeline
node backend/scripts/ingest-device-sources.mjs

# Automated test suite validation
node backend/scripts/validate-devices.mjs
```

### Ingestion Engine Components
- `backend/scripts/ingest-device-engine.py`: Core data normalization engine. Cleans source tables, removes prices/rumors, parses memory/storage/display fields, indexes Google Play model numbers, and links canonical SoC IDs.
- `backend/scripts/ingest-device-sources.mjs`: Orchestration harness for Node.js workflows.
- `backend/scripts/validate-devices.mjs`: 30-assertion validation suite ensuring zero schema violations, accurate SoC linkage, variant preservation, and pricing/rumor purge.

---

## 7. Backend Service & API Routes

### In-Memory Device Service
Implemented in `backend/services/hardware/device-service.ts`:
- Singleton instance (`deviceService = DeviceService.getInstance()`).
- O(1) multi-index lookup by canonical ID, model number (e.g. `SM-S928B`), and codename (e.g. `iPhone16,2`).
- Multi-token fuzzy query scoring with brand/model token boosting.
- Umbrella brand support: querying `manufacturer: "Xiaomi"` matches `Xiaomi`, `Redmi`, and `POCO`; querying `manufacturer: "vivo"` matches `vivo` and `iQOO`.
- Deterministic pagination and sorting (`brand asc`, `releaseDate desc`, `marketName asc`, `id asc`).

### HTTP Endpoints
- `GET /api/hardware/devices`: Search and paginate mobile devices.
  - Query parameters: `q`, `manufacturer`, `formFactor` (`phone` | `tablet`), `socId`, `page`, `pageSize`.
  - Headers: Standardized CORS and Cache-Control headers (`public, s-maxage=3600, stale-while-revalidate=86400`).
- `GET /api/hardware/devices/[id]`: Retrieve single device by canonical ID or model number.
  - Returns `{ device: DeviceRecord, source: "real" }` on match.
  - Returns `{ error: "Device not found" }` with HTTP 404 status when unresolvable.
