# Intel CPU Dataset Source Audit & Comparative Evaluation

**Evaluation Target:** [`toUpperCase78/intel-processors`](https://github.com/toUpperCase78/intel-processors)  
**Baseline Dataset:** Veylora Normalized Intel CPU Dataset (`backend/data/cpu/intel.json`, derived from `cpu-db-master`)  
**Audit Date:** September 2026  
**Auditor:** Antigravity AI (on behalf of Veylora Engineering)  
**Recommendation:** **MERGE** (Authoritative Modern Precedence with Socket Backfill & Legacy Retention)

---

## 1. Executive Summary

This audit deterministically compares Veylora's current production Intel CPU dataset against the third-party open-source repository [`toUpperCase78/intel-processors`](https://github.com/toUpperCase78/intel-processors).

The current Veylora Intel dataset comprises **7,178 normalized records** derived from `cpu-db-master`. However, our audit reveals that Veylora's baseline is almost exclusively an archive of **vintage silicon markings, physical sSpec stepping codes, and engineering samples from 1978 to 2010**. It contains **zero Intel Core processors from 2nd Gen (Sandy Bridge, 2011) through 14th Gen (Raptor Lake Refresh, 2024)** and **zero Core Ultra processors**. Furthermore, its specification completeness for modern gaming compatibility is critically deficient: **99.8% null threads**, **99.7% null boost clocks**, **100.0% null integrated graphics (iGPU)**, and **96.7% null sockets**.

The candidate repository [`toUpperCase78/intel-processors`](https://github.com/toUpperCase78/intel-processors) provides **2,659 processors** in its latest category datasets (and **3,657 distinct SKUs** across all historical versions). It contains full consumer marketing SKUs across all Intel generations up to **Q1 2026**, including Core Ultra (Series 1 & 2), 12th–14th Gen hybrid Core CPUs, and modern Xeons. It achieves **100% core completeness**, **89.1% thread completeness**, **98.0% TDP completeness**, **98.0% architecture/code name completeness**, and **53.2% verified iGPU naming**.

However, the candidate source has three key architectural limitations:
1. **Missing Sockets on Core & Xeon:** The `Sockets Supported` column was introduced only in version 1.9/1.10. The Core (`intel_core_processors_v1_8.csv`, 1,114 rows) and Xeon (`intel_xeon_processors_v1_8.csv`, 1,001 rows) datasets remain on schema v1.8, meaning socket data is **0% complete** for Intel Core and Xeon desktop/server processors.
2. **Zero Source URLs:** While the repository states data was obtained from Intel ARK, it does not store per-record ARK URLs.
3. **Legacy Pruning:** In updating Celeron, Pentium, and Atom to v1.9, the author pruned over 300 legacy processors that Intel ARK no longer lists.

**Definitive Decision:** **MERGE**.  
A blunt `REPLACE` would strip socket compatibility for desktop Core CPUs and eliminate provenance URLs. Instead, `toUpperCase78` should become the **authoritative primary source** for all modern Intel processor identities, performance specifications, iGPUs, and architectures, while preserving Veylora's legacy catalog and augmenting Core sockets through a deterministic mapping table.

---

## 2. Source Summary & Dataset Inventory

### 2.1 Repository Metadata
- **Repository URL:** `https://github.com/toUpperCase78/intel-processors`
- **Maintainer:** Dogan Yigit Yenigun (`toUpperCase78`), Istanbul, Turkey
- **Repository Description:** *"Datasets for All Manufactured Intel Processors"*
- **License:** GNU General Public License v3.0 (`GPL-3.0`)
- **Stated Provenance:** Intel ARK ([ark.intel.com](https://ark.intel.com/content/www/tr/tr/ark.html)) accessed page-by-page.
- **Active Branches:** `master` (HEAD: commit `2dbb105`, dated May 12, 2026).

### 2.2 Dataset File Inventory & Schema Progression

The repository maintains an incremental file release structure where different processor families reside at different schema versions:

| Dataset File | Version | Rows | Cols | Status / Family | Key Additions / Notes |
|:---|:---:|:---:|:---:|:---|:---|
| `Intel_Core_Ultra_Processors_v1_10.csv` | **v1.10** | **85** | 20 | Core Ultra (Series 1 & 2) | Includes Sockets, Channels, Max Temp, Vert. Segment |
| `Intel_Atom_Processors_v1_9.csv` | **v1.9** | **140** | 20 | Intel Atom | 20-column schema with sockets |
| `Intel_Celeron_Processors_v1_9.csv` | **v1.9** | **130** | 20 | Intel Celeron | 20-column schema with sockets; 129 legacy SKUs pruned |
| `Intel_Pentium_Processors_v1_9.csv` | **v1.9** | **123** | 20 | Intel Pentium | 20-column schema with sockets; 149 legacy SKUs pruned |
| `Intel_Processors_v1_9.csv` | **v1.9** | **14** | 20 | Unbranded Intel Processors | N100, N200, Processor 300, etc. |
| `intel_core_processors_v1_8.csv` | **v1.8** | **1,114** | 16 | Intel Core (i3/i5/i7/i9/Duo) | Has Memory & Code Name, **NO Sockets column** |
| `intel_xeon_processors_v1_8.csv` | **v1.8** | **1,001** | 16 | Intel Xeon | Has Memory & Code Name, **NO Sockets column** |
| `intel_itanium_processors_v1_6.csv` | **v1.6** | **22** | 12 | Intel Itanium | 12-column legacy schema |
| `intel_quark_SoC_v1_6.csv` | **v1.6** | **11** | 12 | Intel Quark SoC | Frequency in MHz, Cache in KB |
| `intel_xeon_phi_processors_v1_6.csv`| **v1.6** | **19** | 12 | Intel Xeon Phi | 12-column legacy schema |
| **Latest Category Selection Total** | — | **2,659** | — | **All Intel Families** | **2,658 unique SKUs (1 duplicate)** |

#### Schema Variations Across Generations
- **v1.10 & v1.9 (20 Columns):** `Product`, `Status`, `Release Date`, `Code Name`, `Vertical Segment`, `Cores`, `Threads`, `Lithography(nm)`, `Max. Turbo Freq.(GHz)`, `Base Freq.(GHz)`, `TDP(W)`, `Cache(MB)`, `Cache Info`, `Max Memory Size(GB)`, `Memory Types`, `Max Memory Speed(MHz)`, `Max Memory Channels`, `Integrated Graphics`, `Sockets Supported`, `Max Operating Temp.(°C)`
- **v1.8 (16 Columns):** Dropped `Vertical Segment`, `Max Memory Channels`, `Sockets Supported`, `Max Operating Temp.(°C)`.
- **v1.6 (12 Columns):** Dropped `Code Name`, `Max Memory Size(GB)`, `Memory Types`, `Max Memory Speed(MHz)`.
- **v1.1 & v1.2 (9 Columns, archived in subfolders):** Dropped `Lithography(nm)`, `TDP(W)`, `Threads`.

### 2.3 Category Overlap Analysis
- **Inter-Category Overlap:** Evaluating the 10 latest files reveals **0 duplicate products between categories**. Each file cleanly partitions its designated marketing family (`Core Ultra`, `Core`, `Xeon`, `Pentium`, `Celeron`, `Atom`, `Processors`, `Itanium`, `Quark`, `Xeon Phi`).
- **Intra-Category Version Overlap & Legacy Drop:**
  - `Core Ultra`: v1.10 (85 rows) completely subsumes v1.9 (61 rows) and v1.8 (11 rows).
  - `Celeron`: v1.8 contained 258 rows; v1.9 dropped 129 legacy models (e.g. Celeron 300 MHz, Celeron 420, Celeron D models released before 2012) because Intel ARK archived them.
  - `Pentium`: v1.8 contained 272 rows; v1.9 dropped 149 legacy models for the same reason.
  - `Atom`: v1.8 contained 175 rows; v1.9 dropped 43 legacy models.
  - **Total distinct SKUs across the entire repo (including historical versions): 3,657**.

---

## 3. Quantitative Comparison: Baseline vs. Candidate

### 3.1 Overall Record Counts & Duplicates

| Metric | Current Veylora Intel (`cpu-db`) | toUpperCase78 (Latest 10 Files) | toUpperCase78 (All CSVs Cumulative) |
|:---|:---:|:---:|:---:|
| **Total Rows / Records** | 7,178 | 2,659 | 11,754 |
| **Unique Processor Entities** | 7,178 | 2,658 | 3,657 |
| **Duplicate Rate** | 0.00% (260 removed during import) | 0.038% (1 duplicate row) | ~68.9% (version history overlap) |
| **Silicon / Stepping Redundancy** | **5,404 sSpec duplicates (75.3%)** | **0.00% (Clean Marketing SKUs)** | 0.00% |
| **Release Date Range** | 1978 – January 2010 | January 2002 – Q1 2026 | January 2002 – Q1 2026 |
| **Modern CPU Coverage (2011–2026)** | **0 records (0.0%)** | **1,940+ records** | **1,940+ records** |

### 3.2 Field Completeness & Null Rates

Comparing non-null, non-placeholder values across both datasets:

| Specification Field | Veylora Intel Records (N = 7,178) | Veylora Completeness (%) | toUpperCase78 Latest (N = 2,659) | toUpperCase78 Completeness (%) | Material Delta |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Processor Name / Product** | 7,178 | 100.0% | 2,659 | 100.0% | Identical |
| **Physical Cores** | 391 | 5.4% | 2,659 | **100.0%** | **+94.6%** |
| **Logical Threads** | 18 | 0.3% | 2,370 | **89.1%** | **+88.8%** |
| **Base Clock (Frequency)** | 6,042 | 84.2% | 2,496 | **93.9%** | **+9.7%** |
| **Boost / Max Turbo Clock** | 5 | 0.1% | 1,907 | **71.7%** | **+71.6%** |
| **Cache Specification** | 3,725 | 51.9% | 2,648 | **99.6%** | **+47.7%** |
| **L3 Cache Explicit** | 0 | 0.0% | 2,648 (in Cache/Info) | **99.6%** | **+99.6%** |
| **Lithography / Process Size** | 178 | 2.5% | 2,630 | **98.9%** | **+96.4%** |
| **Architecture / Code Name** | 391 | 5.4% | 2,607 | **98.0%** | **+92.6%** |
| **Integrated Graphics (iGPU)** | 1 | 0.0% | 1,414 | **53.2%** | **+53.2%** |
| **TDP / Power Rating** | 150 | 2.1% | 2,606 | **98.0%** | **+95.9%** |
| **Memory Types Supported** | 0 | 0.0% | 2,384 | **89.7%** | **+89.7%** |
| **Max Memory Capacity** | 0 | 0.0% | 2,375 | **89.3%** | **+89.3%** |
| **Sockets Supported** | 19 | 0.3% | 475 | **17.9%** | **+17.6%** |
| **Release Date** | 152 | 2.1% | 2,659 | **100.0%** | **+97.9%** |
| **Source / Provenance URL** | 6,109 | **85.1%** | 0 | **0.0%** | **-85.1%** |
| **Part Number / sSpec Code** | 7,178 | **100.0%** | 0 | **0.0%** | **-100.0%** |

---

## 4. Processor Identity Normalization & Overlap Analysis

### 4.1 Normalization Strategy
To perform deterministic comparison without corrupting distinct SKUs, we implemented an identity normalization pipeline adhering to Step 5:
- Strip manufacturer branding (`Intel`, `Processor`, `CPU`, `®`, `™`, `(R)`, `(TM)`).
- Normalize punctuation, tabs, whitespace, and case to lowercase alphanumeric tokens.
- **Preserve critical marketing suffixes:** `K`, `KF`, `F`, `KS`, `T`, `H`, `HX`, `HK`, `U`, `P`, `Y`, `G1–G7`, `E`, `UE`, `HE`. Under no circumstances are `13700K`, `13700KF`, and `13700` collapsed into the same identity.

### 4.2 Overlap Findings
When matching normalized names between Veylora and `toUpperCase78`:
- **Direct Name Identity Overlap:** Exactly **1 record** (`Pentium 1405`).
- **Why is overlap so low?**
  - In Veylora (`cpu-db`), 5,404 entries are raw sSpec steppings (e.g. `Intel Core i7 AT80601000741AA SLBCH`, `Intel A80486DX2-66 SK058`).
  - `cpu-db` does **not** include the consumer marketing model number (e.g. "Core i7-920") in the record name for 99% of its entries.
  - When extracting internal model numbers (e.g. `Q9505`, `Q9505S`, `E7600`, `Q8400`, `Q8400S`), **14 exact SKU matches** were cross-referenced.

### 4.3 Conflict Analysis
For the 14 overlapping models where specifications exist in both datasets:
- **Core count conflicts:** **0 conflicts** (100% agreement: e.g. Q9505 has 4 cores in both, E7600 has 2 cores in both).
- **Base clock conflicts:** **0 conflicts** (100% agreement within standard rounding tolerances: e.g. Q9505 is 2,833 MHz in Veylora and 2.83 GHz in toUpperCase78; E7600 is 3,067 MHz in Veylora and 3.06 GHz in toUpperCase78).
- **Boost clock / Threads / TDP:** Non-conflicting because Veylora had `null` for these fields, whereas `toUpperCase78` supplied the verified specifications.

---

## 5. Modern Processor Deep Dive

### 5.1 Core Ultra (Meteor Lake, Arrow Lake, Lunar Lake, Panther Lake)
- `Intel_Core_Ultra_Processors_v1_10.csv` contains **85 SKUs** spanning Q4 2023 through Q1 2026.
- Includes mobile series (Core Ultra 5 125H, Core Ultra 7 155H, Core Ultra 9 185H) and upcoming desktop/mobile architectures (Core Ultra 9 285K, Core Ultra 5 322).
- **Completeness for Core Ultra:** 100% Cores, 100% Threads, 100% Base Freq, 100% Turbo Freq, 100% TDP, 100% Memory Types, 100% Sockets (FCBGA2049, FCBGA2540, FCLGA1851), 100% iGPU (`Intel Arc Graphics`, `Intel Arc 140T`).

### 5.2 12th, 13th, and 14th Gen Hybrid Processors
- `intel_core_processors_v1_8.csv` includes all major hybrid architecture SKUs:
  - `Core i9-14900K`, `14900KF`, `14900KS`, `14900HX`
  - `Core i7-13700K`, `13700KF`, `13700T`, `13700F`
  - `Core i5-13600K`, `13600KF`
  - `Core i5-12600K`, `12400F`, `12100`
- **Core Count Handling:** Correctly reports total physical cores (P-cores + E-cores). For example, `Core i9-13900K` is reported as **24 cores**.
- **Thread Count Handling:** Correctly accounts for Hyper-Threading on P-cores only (e.g. 8 P-cores × 2 + 16 E-cores = **32 threads**).
- **Base Frequency Rule:** Consistent with the author's stated methodology, `Base Freq.` reflects the Performance-core base clock (e.g. 3.00 GHz for 13900K, 3.40 GHz for 13700K, 3.70 GHz for 12600K).
- **TDP / Power Rule:** For modern hybrid processors with dynamic power limits, the author systematically records the **Maximum Turbo Power (MTP / PL2)** value (e.g. 253W for 13900K/14900K, 181W for 13600K, 150W for 12600K) rather than the 125W Processor Base Power (PL1). This is beneficial for system compatibility power estimation.

---

## 6. Compatibility Engine Suitability Assessment

| Specification Attribute | Reliability in toUpperCase78 | Suitability for Veylora Compatibility Engine | Notes & Caveats |
|:---|:---:|:---:|:---|
| **Cores & Threads** | **100% / 89.1%** | **EXCELLENT** | Enables accurate evaluation of game minimum requirements (e.g. "Requires 6 cores / 12 threads"). |
| **Base & Boost Clocks** | **93.9% / 71.7%** | **EXCELLENT** | Boost clock reliably populated for all Turbo-capable CPUs; low-end non-turbo CPUs cleanly indicate N/A. |
| **Architecture & Generation** | **98.0%** | **EXCELLENT** | Code names (Raptor Lake, Alder Lake, Zen, etc.) allow IPC-tier estimation. |
| **Integrated Graphics (iGPU)** | **53.2%** | **EXCELLENT** | Critical for determining whether a user needs a dedicated GPU or can run low-end games on iGPU (Arc, UHD 770, etc.). |
| **TDP / Power** | **98.0%** | **VERY GOOD** | Consistently reflects peak turbo power for modern CPUs. Suitable for PSU wattage checks. |
| **Memory Support** | **89.7%** | **VERY GOOD** | Full memory type strings (e.g. `Up to DDR5 5600 MT/s, Up to DDR4 3200 MT/s`) enable RAM type checking. |
| **Socket** | **17.9% overall** | **CRITICAL GAP (Core v1.8)** | While v1.9/v1.10 files have 96.5% socket coverage, `intel_core_processors_v1_8.csv` **has no socket column**. Cannot check LGA1700 / LGA1200 / LGA1151 motherboard compatibility without augmentation. |

---

## 7. Provenance, Licensing & Legal Facts

1. **Upstream Source & License Facts:**
   - Source: [`https://github.com/toUpperCase78/intel-processors`](https://github.com/toUpperCase78/intel-processors)
   - License: GNU General Public License v3.0 (`GPL-3.0`).
   - Current Veylora `cpu-db`: Public Domain dedication by author in `COPYING.txt` ("The database is Public Domain. Use as you wish.") with AGPL-3.0 repository wrapper.
   - Integration Implication: Any direct inclusion of `toUpperCase78` dataset files requires preserving the GPL-3.0 license notices, author attribution, and provenance documentation.
2. **Intel ARK Provenance Verification:**
   - Stated by repository README: *"All these info in the datasets are obtained from Intel ARK website... by accessing each processor page by page and carefully inspecting each corresponding feature."*
   - Fact: This is an independent web scraping / transcription project, not an authorized or direct API feed from Intel Corporation.
3. **Flagged Community Contributions (Non-ARK):**
   - Three records in `intel_xeon_processors_v1_8.csv` were submitted via Pull Request #3 by contributor `mvarian`:
     - `Xeon Platinum 8370C`
     - `Xeon Platinum 8272CL`
     - `Xeon Platinum 8171M`
   - These are non-retail, custom hyper-scaler OEM SKUs (custom AWS/Azure silicon) not indexed on retail Intel ARK. They should be flagged with `provenance: "community-pr3"`.

---

## 8. Strategic Recommendation: MERGE

### 8.1 Why Not "KEEP CURRENT"?
Veylora's current Intel CPU backend is fundamentally broken for modern PC gaming:
- It has **zero** desktop/mobile Intel Core processors from 2011 to 2026.
- Searching for `i7-13700K`, `i5-12400`, `i7-8700K`, or `Core Ultra` returns **0 results**.
- Its records consist of ancient sSpec physical part codes with 99.8% null threads and 100% null iGPUs. Keeping current maintains a non-functional hardware backend.

### 8.2 Why Not "REPLACE"?
A blanket replacement of `intel.json` with `toUpperCase78` would introduce three severe regressions:
1. **Loss of Desktop Core Sockets:** `intel_core_processors_v1_8.csv` lacks a socket column. Replacing the dataset without backfilling would leave all 1,114 Intel Core CPUs without motherboard socket compatibility.
2. **Loss of Provenance URLs:** `toUpperCase78` has 0 per-record URLs, discarding the 6,109 reference URLs present in Veylora.
3. **Unnecessary Elimination of Legacy Depth:** `cpu-db` contains extensive vintage documentation (i960, 486, Pentium I/II/III).

### 8.3 Recommended Action: B) MERGE
We recommend a **deterministic field-level precedence merge**:
- `toUpperCase78` becomes the **authoritative primary source** for all modern marketing SKUs, performance specs, clocks, cores, threads, iGPUs, and architectures.
- Socket data for Core v1.8 is augmented via deterministic generation-to-socket mapping (e.g. Alder/Raptor Lake -> LGA1700, Comet/Rocket Lake -> LGA1200, Coffee/Kaby/Skylake -> LGA1151).
- Canonical Intel ARK search URLs are deterministically generated for `sourceUrl`.
- Veylora's baseline vintage records are preserved in a partitioned legacy tier.

---

## 9. Target Schema Mapping & Migration Plan

### 9.1 Column-to-Schema Mapping Specification

| toUpperCase78 CSV Column | Target `CpuDevice` Field | Transformation & Normalization Rules |
|:---|:---|:---|
| `Product` | `name` | Prefix with `Intel ` if missing; trim whitespace. |
| Derived slug from `Product` | `id` | Format: `intel:${slug}` (e.g. `intel:core-i7-13700k`). |
| Constant | `manufacturer` | Strictly `"Intel"`. |
| Extracted from `Product` | `family` | E.g. `"Core i7"`, `"Core Ultra 9"`, `"Xeon Silver"`, `"Pentium Gold"`. |
| Extracted from `Product` | `generation` | E.g. `"13th Gen"`, `"14th Gen"`, `"Series 1"`, or `null`. |
| `Code Name` | `architecture` | Trimmed string or `null` if N/A. |
| `Cores` | `cores` | Parse integer; strictly positive integer or `null`. |
| `Threads` | `threads` | Parse integer; strictly positive integer or `null`. |
| `Base Freq.(GHz)` | `baseClock` | Multiply by 1000 to convert GHz to MHz; numeric float or `null`. |
| `Max. Turbo Freq.(GHz)`| `boostClock` | Multiply by 1000 to convert GHz to MHz; numeric float or `null`. |
| `Cache(MB)` + `Cache Info` | `cache` | Format: `${Cache(MB)} MB ${Cache Info}` (e.g. `"30 MB Intel Smart Cache"`). |
| `Integrated Graphics` | `integratedGpu` | If not `N/A`, preserve string (e.g. `"Intel UHD Graphics 770"`), else `null`. |
| `Lithography(nm)` | `processSize` | Format: `${Lithography(nm)} nm` or `null`. |
| `TDP(W)` | `power` | Format: `${TDP(W)} W` or `null`. |
| `Sockets Supported` | `socket` | Direct string if present in CSV; if missing (Core v1.8), apply socket lookup table. |
| `Release Date` | `releaseDate` | Convert quarter string (e.g. `Q1'24` -> `2024-Q1`) or `null`. |
| Synthesized | `sourceUrl` | `https://ark.intel.com/content/www/us/en/ark/search.html?_charset_=UTF-8&q=${encodedName}`. |
| `Memory Types` | `sourceReferences` / new field | Preserve supported memory string for compatibility engine. |

### 9.2 Migration Plan (For Future Execution)

1. **Phase 1: Dataset Extraction & Normalization Script**
   - Ingest `Intel_Core_Ultra_Processors_v1_10.csv`, `Intel_Processors_v1_9.csv`, `Intel_Pentium_Processors_v1_9.csv`, `Intel_Celeron_Processors_v1_9.csv`, `Intel_Atom_Processors_v1_9.csv`, `intel_core_processors_v1_8.csv`, and `intel_xeon_processors_v1_8.csv`.
   - Backfill pruned legacy Celerons and Pentiums from v1.8.
   - Map socket standards for 1st–14th Gen Core CPUs based on architecture.
2. **Phase 2: Precedence Merge Execution**
   - Generate combined `intel.json`.
   - Ensure all 7,178 legacy sSpec records retain fallback IDs or are partitioned so search priority favors consumer SKUs.
3. **Phase 3: Validation & Compatibility Testing**
   - Run `node backend/validate-cpu.mjs` ensuring 0 regressions on existing ID lookups, exact part search, zero-clock guards, and pagination.
   - Add automated test cases for `Core i7-13700K`, `Core i5-12400F`, and `Core Ultra 7 155H`.
4. **Phase 4: Provenance & Attribution Update**
   - Update `backend/data/cpu/README.md` to document dual provenance: `cpu-db` (Public Domain) + `toUpperCase78/intel-processors` (GPL-3.0 / Intel ARK transcription).
