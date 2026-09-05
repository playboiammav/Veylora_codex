# Veylora Mobile SoC Hardware Database

Authoritative, statically-cached hardware specification database for mobile System-on-Chips (SoCs) powering smartphones, tablets, and mobile handhelds.

---

## 1. Overview & Architecture

The Veylora Mobile SoC dataset provides normalized, strongly-typed silicon specifications for mobile hardware compatibility matching, device profiling, and game emulation capability assessment.

Unlike traditional desktop CPUs and GPUs which feature homogeneous core topologies and standard ISA configurations, modern mobile SoCs utilize complex heterogeneous architectures (e.g. Prime + Performance + Efficiency core clusters, custom NPUs, and integrated mobile GPUs with varying Vulkan and hardware ray tracing support).

```
backend/data/soc/
├── README.md                   # This documentation & provenance declaration
├── soc.json                    # Unified canonical dataset loaded by SocService (87+ SoCs)
├── soc-build-summary.json      # Ingestion quality & coverage audit report
├── apple.json                  # Apple A-Series & M-Series partition
├── google.json                 # Google Tensor partition
├── hisilicon.json              # HiSilicon Kirin partition
├── mediatek.json               # MediaTek Dimensity & Helio partition
├── qualcomm.json               # Qualcomm Snapdragon partition
├── samsung.json                # Samsung Exynos partition
├── unisoc.json                 # UNISOC Tanggula & Tiger partition
└── raw/
    └── seed/                   # Authoritative verified seed JSON files
```

---

## 2. Multi-Tier Source Provenance

Every record in the Veylora Mobile SoC dataset contains an explicit `provenance` object detailing the primary authoritative source, verification registers, source URLs, and licensing classification.

| Provenance Tier | Description | Sources Utilized |
|:---|:---|:---|
| **Tier 1: First-Party Silicon Vendors** | Primary source of truth for microarchitectures, maximum clock speeds, cluster topologies, process nodes, memory channels, and ISP/modem specifications. | • Qualcomm Snapdragon Developer Specs<br/>• MediaTek Product Specifications<br/>• Samsung Semiconductor Exynos Portal<br/>• Google Store Tech Specs & AOSP Tree<br/>• Apple Official Technical Specs & Xcode SDK<br/>• Huawei / UNISOC Official Portals |
| **Tier 2: Standards & Conformance Registries** | Definitive arbiter for graphics API conformance (Vulkan version, OpenGL ES version, hardware ray tracing capability). | • Khronos Group Conformance Registry<br/>• Vulkan Hardware Database (`vulkan.gpuinfo.org`)<br/>• OpenGL ES Hardware Database (`opengles.gpuinfo.org`) |
| **Tier 3: Structured Cited Repositories** | Structural cross-referencing and historical part number mapping. | • Wikimedia Structured Tables (Licensed under **CC BY-SA 4.0** / GFDL) |

---

## 3. Data Integrity & Zero Fabrication Policy

1. **Strict Null Semantics:**
   - Unknown or unverified metrics remain strictly `null`. Under no circumstances are placeholder zeros (`0`), dummy strings, or fabricated clocks inserted.
2. **Khronos API Conformance:**
   - `vulkanVersion` is strictly populated only when official Khronos conformance or driver support is verified.
   - Apple Silicon SoCs (A-series and M-series) do not expose native Vulkan drivers in iOS/iPadOS; their `vulkanVersion` is explicitly set to `null` (not 0, not fake version).
   - Chips prior to Vulkan introduction (e.g., Snapdragon 801, Helio P35, Exynos 7420) have `vulkanVersion: null`.
3. **Cluster Sum Invariant:**
   - For every SoC, the sum of cores across all items in `cpuClusters` must mathematically equal `cpuCores`.
4. **Form Factor Segregation:**
   - Apple M-series chips (M1, M2, M3, M4) are designated `formFactor: ["tablet", "desktop"]` and `family: "Apple M-Series"`. They are strictly excluded from phone-specific compatibility queries.

---

## 4. Schema Reference (`SocDevice`)

Each SoC record conforms to the TypeScript interface `SocDevice` defined in [`backend/lib/normalized-types.ts`](../../lib/normalized-types.ts):

```typescript
export interface SocCpuCluster {
  name?: string;
  cores: number;
  microarchitecture: string;
  maxClock: number; // Peak clock in MHz
  efficiencyClass?: 'prime' | 'performance' | 'efficiency';
  isa?: string | null;
}

export interface SocDevice {
  id: string;                   // Deterministic canonical ID: "${vendor}:${family}-${model}-${partNumber}"
  name: string;                 // e.g. "Qualcomm Snapdragon 8 Gen 3"
  manufacturer: 'Qualcomm' | 'MediaTek' | 'Samsung' | 'Google' | 'Apple' | 'HiSilicon' | 'UNISOC';
  family: string;               // e.g. "Snapdragon 8", "Dimensity", "Exynos", "Tensor", "Apple A-Series"
  partNumber?: string | null;   // e.g. "SM8650-AB", "MT6991", "S5E9945", "APL1V02"
  architecture: string;         // e.g. "ARMv9.2-A", "ARMv8.5-A"
  cpuCores: number;             // Physical core count
  cpuClusters: SocCpuCluster[]; // Structured core cluster array
  cpuClockMax: number;          // Peak frequency in MHz
  cpuBitness?: number | null;   // 64 or 32
  gpu: string;                  // e.g. "Adreno 750", "Arm Immortalis-G925 MC12", "Apple 6-Core"
  gpuFamily: string;            // e.g. "Adreno 700", "Arm Immortalis", "AMD RDNA 3"
  gpuArchitecture?: string | null;
  gpuClockMhz?: number | null;
  gpuExecutionUnits?: number | null;
  npu: string | null;           // e.g. "Qualcomm Hexagon NPU", "MediaTek NPU 890"
  aiPerformance?: string | null;// e.g. "45 TOPS"
  processNode: string;          // e.g. "4 nm (TSMC N4P)", "3 nm (TSMC N3E)"
  vulkanVersion: string | null; // e.g. "1.3", "1.2", or null
  openGlEsVersion: string | null; // e.g. "3.2", "3.1", "3.0"
  rayTracingHardware?: boolean | null;
  memoryType?: string | null;   // e.g. "LPDDR5X"
  memoryChannels?: number | null;
  memoryBandwidth?: string | null;
  maxMemorySizeGb?: number | null;
  isp?: string | null;
  dsp?: string | null;
  modem?: string | null;
  videoEncode?: string[] | null;
  videoDecode?: string[] | null;
  formFactor: ('phone' | 'tablet' | 'handheld' | 'auto' | 'desktop')[];
  releaseDate: string | null;   // ISO-8601 YYYY-MM-DD
  sourceUrl: string;
  aliases: string[];            // Fast-lookup tokens (part number, colloquial slugs, etc.)
  provenance: SocProvenance;
}
```

---

## 5. Ingestion & Rebuild Instructions

To regenerate and validate the static dataset:

```bash
# 1. Run the authoritative ingestion pipeline
node backend/scripts/ingest-soc-sources.mjs

# 2. Run the comprehensive 20-point validation suite
node backend/scripts/validate-soc.mjs
```

---

## 6. Legal & Licensing Attribution

- **Factual Silicon Specifications:** Pure factual specifications (core counts, frequencies, process nodes, instruction sets, memory channels) are non-copyrightable facts under US copyright law (Feist Publications, Inc. v. Rural Telephone Service Co.) and international standards.
- **Wikimedia Structured Data:** Portions of historical part numbers and structural mappings derived from Wikimedia wikitables are provided under the **Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)**.
- **First-Party Trademarks:** Qualcomm, Snapdragon, MediaTek, Dimensity, Samsung, Exynos, Google, Tensor, Apple, Bionic, HiSilicon, Kirin, and UNISOC are trademarks of their respective holders and are used solely for descriptive identification in accordance with nominative fair use.
