# CPU Hardware Specifications Dataset

## 1. Original Dataset & Provenance
- **Dataset Name:** `cpu-db` (`cpu-db-master`)
- **Original Source / Project:** CPU-DB (open hardware CPU specification database)
- **Snapshot Date / Version:** `2023-05-12` (from snapshot archive `cpu-db-master.zip`)
- **License:** AGPL-3.0 (also dedicated as Public Domain by upstream author in `COPYING.txt`: *"The database is Public Domain. Use as you wish."*)

## 2. Imported Files
The runtime normalized datasets in this directory (`amd.json` and `intel.json`) are imported from the following files in `cpu-db-master.zip`:
- `cpu-db-master/cpu-db.AMD.csv` (1,693 raw rows)
- `cpu-db-master/cpu-db.Intel.csv` (7,439 raw rows)
- `cpu-db-master/spreadsheet_files/dieshot_db.csv` (7 real AMD Zen/Ryzen CPU entries)

## 3. Dataset Summary & Counts
- **AMD Raw Rows:** 1,700 (1,693 from `cpu-db.AMD.csv` + 7 from `dieshot_db.csv`)
- **AMD Duplicates Removed:** 4 exact duplicates
- **AMD Skipped Records:** 0
- **AMD Normalized Records:** 1,696
- **Intel Raw Rows:** 7,439
- **Intel Duplicates Removed:** 260 exact duplicates
- **Intel Skipped Records:** 1 (empty blank line with no part number or manufacturer)
- **Intel Normalized Records:** 7,178
- **Total CPU Records:** 8,874

## 4. Normalization Rules Performed
1. **Deduplication:**
   - Exact duplicate CSV rows are removed deterministically.
   - Historical variants sharing a part number but having distinct families or chip properties are preserved.
2. **Stable Deterministic IDs:**
   - Format: `amd:<normalized-part-number-or-stable-slug>` and `intel:<normalized-part-number-or-stable-slug>`.
   - Where duplicate part keys existed across separate variants, a deterministic SHA-256 hash digest is appended to ensure 100% collision-free, stable, non-array-dependent IDs.
3. **Clock Parsing:**
   - Frequencies are safely converted to numbers representing megahertz (MHz).
   - Ambiguous, range-based without separator, or non-numeric entries (e.g. `DC`, `33?`, `120/133`, `N/A`) are preserved as `null`.
   - When separate minimum and maximum frequencies exist, `baseClock` is set to minimum and `boostClock` to maximum. When only one frequency is specified, it is set to `baseClock` and `boostClock` remains `null`.
4. **Cores and Threads:**
   - Strictly parsed as integers only when positive numbers are explicitly present in the source dataset.
   - Blank, non-numeric, or `NA` entries remain `null`. No default or guessed values are inserted.
5. **Cache Information:**
   - L1, L2, L3 caches are preserved with original units from the source dataset (e.g., `1024KiB`, `256KiB`, `12288KiB`).
   - Placeholder values such as `none`, `NA`, `0`, or `0KiB` are converted to `null`.
6. **Release Dates:**
   - Standardized to ISO 8601 strings (`YYYY-MM-DD`, `YYYY-MM`, or `YYYY`) where parseable.
   - Unparseable or absent dates remain `null`.
7. **Source & Reference URLs:**
   - All URLs in `sourceUrl` and `sourceReferences` are verified to be valid `http://` or `https://` URLs.
   - Non-URL bibliographic citations (e.g. datasheet names without links) are excluded from URL arrays.

## 5. Fields That May Be Null
In accordance with the strict requirement not to fabricate or guess missing specifications, records may contain `null` for any of the following fields when not explicitly provided in the upstream dataset:
- `family`
- `generation`
- `architecture`
- `cores`
- `threads`
- `baseClock`
- `boostClock`
- `cache`
- `integratedGpu`
- `releaseDate`
- `sourceUrl`
- `partNumber`
- `microarchitecture`
- `socket`
- `processSize`
- `isa`
- `instructionSet`
- `l1Cache`
- `l2Cache`
- `l3Cache`
- `power`
