# CPU Hardware Specifications Dataset

## 1. Dual-Provenance Dataset Architecture

The Veylora CPU dataset implements a deterministic multi-source architecture combining authoritative modern retail processor specifications with comprehensive historical silicon archives:

### A. Primary Modern Intel Specification Source
- **Repository / Author:** [`toUpperCase78/intel-processors`](https://github.com/toUpperCase78/intel-processors) (Dogan Yigit Yenigun)
- **Stated Upstream Provenance:** Intel ARK ([ark.intel.com](https://ark.intel.com/content/www/tr/tr/ark.html)), accessed and transcribed page-by-page.
- **License:** GNU General Public License v3.0 (`GPL-3.0`). See [`backend/data/cpu/raw/intel-processors/LICENSE.md`](file:///storage/emulated/0/Download/Veylora_codex_source/backend/data/cpu/raw/intel-processors/LICENSE.md).
- **Scope:** 2,979 clean retail SKUs spanning Core Ultra (Series 1 & 2 up to Q1 2026), 1st–14th Gen Intel Core (Desktop and Mobile), Xeon Scalable (Emerald/Sapphire Rapids), Pentium Gold/Silver, Celeron, Atom, and unbranded Intel Processors.
- **Community Non-ARK Flag:** Three custom cloud OEM SKUs contributed via PR #3 by `mvarian` (`Xeon Platinum 8370C`, `8272CL`, `8171M`) are preserved with provenance notation `toUpperCase78/intel-processors (GPL-3.0, community PR #3 by mvarian, non-ARK)`.

### B. Baseline Historical & Reference Coverage
- **Dataset Name:** `cpu-db` (`cpu-db-master`)
- **Original Source / Project:** CPU-DB (open hardware CPU specification database compiled from CPU-World, ChipDB, and collector archives).
- **License:** AGPL-3.0 (dedicated as Public Domain by upstream author in `COPYING.txt`: *"The database is Public Domain. Use as you wish."*)
- **Scope:** 7,161 preserved legacy Intel reference records (vintage 8086, 186, 286, 386, 486, Pentium I/II/III/4, vintage Xeon, and i960 from 1978 to 2010), plus 1,696 AMD processor records.

---

## 2. Dataset Summary & Counts

| Family / Segment | Baseline (`cpu-db`) | Imported Modern (`toUpperCase78`) | Total Normalized Records |
|:---|:---:|:---:|:---:|
| **Intel Modern Retail SKUs (`isLegacy: false`)** | — | 2,979 | **2,979** |
| **Intel Retained Legacy (`isLegacy: true`)** | 7,161 | — | **7,161** |
| **Total Intel Processors** | 7,178 (17 merged) | 2,979 | **10,140** |
| **AMD Processors** | 1,696 | — | **1,696** |
| **Total Production CPU Records** | — | — | **11,836** |

---

## 3. Merge Strategy & Normalization Rules

The merge is executed deterministically by [`backend/scripts/merge-intel-sources.mjs`](file:///storage/emulated/0/Download/Veylora_codex_source/backend/scripts/merge-intel-sources.mjs):

1. **Precedence:** `toUpperCase78` is the authoritative primary source for modern retail SKUs, core counts, thread counts, base clocks, boost clocks, architectures/code names, integrated graphics, TDP, and memory types.
2. **Deterministic Identity:**
   - Format: `intel:<canonical-slug>` (e.g. `intel:core-i7-13700k`, `intel:core-ultra-7-155h`).
   - Meaningful suffixes (`K`, `KF`, `KS`, `F`, `T`, `H`, `HX`, `HK`, `U`, `P`, `Y`, `G1–G7`) are strictly preserved.
3. **Deterministic Socket Augmentation:**
   - Processors from v1.10 and v1.9 datasets use their native `Sockets Supported` values (`FCBGA2540`, `FCBGA2049`, `FCLGA1851`, `FCLGA1700`, etc.).
   - Desktop Core v1.8 processors are augmented using an explicit, reviewable architecture-to-socket lookup table (e.g. Alder/Raptor Lake -> `LGA1700`, Comet/Rocket Lake -> `LGA1200`, Coffee/Kaby/Skylake -> `LGA1151`, Haswell -> `LGA1150`, Sandy/Ivy Bridge -> `LGA1155`, Core 2 -> `LGA775`).
   - Mobile, embedded, or non-deterministic sockets safely remain `null`.
4. **Canonical ARK Search URLs:**
   - Synthesized using standard URL encoding: `https://ark.intel.com/content/www/us/en/ark/search.html?_charset_=UTF-8&q=${encodeURIComponent(product)}`.
5. **iGPU Null Guard:**
   - `integratedGpu: null` strictly denotes "unknown or not provided", never an inferred "no iGPU".
   - Processors with discrete-only requirements (e.g. F-series `13700KF`, `14900KF`) cleanly preserve `integratedGpu: null`.
6. **No Value Fabrication:**
   - Missing frequencies, cores, threads, dates, or caches remain `null`. Zero values are never introduced for missing specifications.

---

## 4. Reproducing the Dataset

To re-run the deterministic merge from source CSVs:

```bash
node backend/scripts/merge-intel-sources.mjs
```

To run the full validation suite:

```bash
node backend/scripts/validate-cpu.mjs
```
