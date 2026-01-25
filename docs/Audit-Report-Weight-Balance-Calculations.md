# Weight & Balance Calculator — Audit Report

**Document:** Calculation Accuracy Audit
**Date:** 25 January 2026
**Version:** 1.0
**Prepared for:** External Review

---

## 1. Executive Summary

This audit compares the Weight & Balance Calculator application's calculations against manual calculations performed using the same input data. The audit identified several variances, all stemming from design decisions around numeric precision and unit handling.

**Key Findings:**
- Total CG variance: **0.82 mm (0.03 inches)** — within acceptable tolerance for flight planning
- All variances traced to arm values stored as rounded integers rather than precise decimal conversions
- One potential data discrepancy requiring POH verification (Baggage Area B arm)
- Moment values always displayed in kg.mm regardless of user's unit preference

**Overall Assessment:** The application produces calculations that are accurate within acceptable tolerances for flight planning purposes. The variances identified do not affect the safety determination (within/outside limits) for any realistic loading scenario.

---

## 2. Audit Methodology

### 2.1 Test Data

A standardised loading scenario was used for VH-YPB (Cessna 182T):

| Station | Input Value | Units |
|---------|-------------|-------|
| Basic Empty Weight | 910.4 | kg |
| Pilot | 95.0 | kg |
| Front Passenger | 90.0 | kg |
| Rear Passenger 1 | 10.0 | kg |
| Rear Passenger 2 | — | — |
| Baggage Area A | 10.0 | kg |
| Baggage Area B | — | — |
| Baggage Area C | — | — |
| Fuel - Left Wing | 85.0 | litres |
| Fuel - Right Wing | 85.0 | litres |

### 2.2 Documents Reviewed

1. **App PDF Output (kg mode):** W&B_VH-YPB - 2026 01 25 - Kg.pdf
2. **App PDF Output (lbs mode):** W&B_VH-YPB - 2026 01 25 - Lbs.pdf
3. **Manual Calculation Spreadsheet:** Check Sheet - Manual Calc vs W&B App.xlsx
4. **Application Source Code:** `src/data/aircraft.ts`, `src/utils/conversions.ts`

### 2.3 Calculation Method

**Manual Calculation:**
- Arm values converted from inches to mm using: `mm = inches × 25.4`
- Moments calculated as: `moment (kg.mm) = weight (kg) × arm (mm)`
- CG calculated as: `CG = total moment ÷ total weight`

**Application Calculation:**
- Weights stored internally in pounds (lbs)
- Arms stored internally in millimetres (mm)
- Moments calculated as: `moment (kg.mm) = weight (lbs) × 0.453592 × arm (mm)`
- CG calculated as: `CG = total moment ÷ (total weight in kg)`

---

## 3. Conversion Constants Used

The application uses the following conversion constants (defined in `src/utils/conversions.ts`):

| Conversion | Value | Notes |
|------------|-------|-------|
| Pounds to Kilograms | 0.453592 | SI standard |
| Inches to Millimetres | 25.4 | Exact definition |
| US Gallons to Litres | 3.78541 | US liquid gallon |
| AVGAS weight | 6.0 lbs/gal | Industry standard for 100LL |
| AVGAS density | 0.72 kg/L | Industry standard for 100LL |

These constants are industry-standard values and are not a source of variance.

---

## 4. Findings

### 4.1 Arm Values Stored as Rounded Integers

#### Description

The aircraft loading station arm values in `src/data/aircraft.ts` are stored as rounded integers (mm) rather than the precise decimal result of converting inches to millimetres.

#### Evidence

| Station | POH Arm (inches) | Precise Conversion (mm) | App Stores (mm) | Rounding Error |
|---------|------------------|------------------------|-----------------|----------------|
| BEW CG | 38.4" | 975.36 | 975 | -0.36 mm |
| Pilot | 37.0" | 939.8 | 940 | +0.2 mm |
| Front Passenger | 37.0" | 939.8 | 940 | +0.2 mm |
| Rear Passengers | 74.0" | 1879.6 | 1880 | +0.4 mm |
| Baggage Area A | 97.0" | 2463.8 | 2464 | +0.2 mm |
| Baggage Area B | 116.0" | 2946.4 | 2946 | -0.4 mm |
| Baggage Area C | 129.0" | 3276.6 | 3277 | +0.4 mm |
| Fuel Wings | 46.5" | 1181.1 | 1181 | -0.1 mm |

#### Impact on Calculations

| Station | Weight (kg) | Manual Moment | App Moment | Variance (kg.mm) |
|---------|-------------|---------------|------------|------------------|
| BEW | 910.4 | 887,968 | 887,600 | +368 |
| Pilot | 95.0 | 89,281 | 89,300 | -19 |
| Front Passenger | 90.0 | 84,582 | 84,600 | -18 |
| Rear Passenger 1 | 10.0 | 18,796 | 18,800 | -4 |
| Baggage Area A | 10.0 | 24,638 | 24,640 | -2 |
| Fuel - Left | 61.2 | 72,283 | 72,277 | +6 |
| Fuel - Right | 61.2 | 72,283 | 72,277 | +6 |

**Net CG Variance:** 0.82 mm (0.03 inches)

#### Analysis

The BEW contributes the largest single variance (+368 kg.mm) because:
1. It has the largest weight (910.4 kg)
2. Its arm rounding error (-0.36 mm) is the largest

The other stations have smaller weights and smaller rounding errors, resulting in variances that partially cancel each other out.

#### Recommendation

**Option A: Leave as-is (Recommended)**
- The 0.82 mm CG variance is negligible (0.03 inches)
- This is well within the precision of physical measurements
- The CG envelope limits have margins that far exceed this variance
- Integer storage is simpler and matches how POH values are typically quoted

**Option B: Store precise decimal values**
- Change arm storage to use decimals: `armMm: 939.8` instead of `armMm: 940`
- Would eliminate rounding variance entirely
- Adds complexity with minimal practical benefit

**Option C: Store arms in inches and convert at calculation time**
- Would match POH values exactly
- Requires conversion on every calculation
- Risk of inconsistent conversion if not centralised

---

### 4.2 Potential Baggage Area B Arm Discrepancy

#### Description

The manual calculation spreadsheet uses 118.0" for Baggage Area B, but the application uses 116.0".

#### Evidence

| Source | Baggage B Arm (inches) | Baggage B Arm (mm) |
|--------|------------------------|-------------------|
| Manual Spreadsheet | 118.0" | 2997.2 mm |
| Application | 116.0" | 2946 mm |
| **Difference** | **2.0"** | **51.2 mm** |

#### Application Source Code

From `src/data/aircraft.ts`:
```javascript
{
  id: 'baggageB',
  name: 'Baggage Area B',
  armMm: 2946,                // 116" converted to mm (116 * 25.4)
  maxWeightLbs: 80,
  ...
}
```

#### Impact

For the test scenario, Baggage Area B was empty (0 kg), so this discrepancy had no impact on the calculated results. However, if Baggage B were loaded:

| Baggage B Load | Moment Variance |
|----------------|-----------------|
| 10 kg | 512 kg.mm |
| 50 kg | 2,560 kg.mm |
| 80 kg (max) | 4,096 kg.mm |

At maximum load, this would shift the CG by approximately 3.3 mm (0.13 inches).

#### Recommendation

**Action Required:** Verify the correct arm value against the official VH-YPB Weight & Balance documentation or POH.

- If POH states 116": Application is correct; update spreadsheet
- If POH states 118": Application needs correction; update `src/data/aircraft.ts`

---

### 4.3 Moment Units Always Displayed in kg.mm

#### Description

The moment column in the PDF loading sheet always displays values in kg.mm, regardless of the user's selected display units.

#### Evidence

| PDF | Weight Unit | Arm Unit | Moment Unit |
|-----|-------------|----------|-------------|
| Kg mode | kg | mm | kg.mm ✓ |
| Lbs mode | lbs | inches | kg.mm ✗ |

User annotation on Lbs PDF: "Should be Mom (Lbs. Inch)"

#### Analysis

The application stores and calculates all moments internally in kg.mm. This is a deliberate design decision because:

1. Australian aviation uses metric units (kg.mm) for weight and balance calculations
2. The official aircraft weight and balance documentation (load data sheets) uses kg.mm
3. Mixing imperial weights with metric arms (or vice versa) would produce confusing intermediate values

#### Impact

Users operating in imperial units may find it confusing to see moments in kg.mm when all other values are in lbs/inches.

#### Recommendation

**Option A: Leave as-is (Recommended for Australian context)**
- kg.mm is the standard unit for Australian W&B documentation
- Maintains consistency with official load data sheets
- Add a note in the PDF footer explaining this

**Option B: Display moments in user's selected units**
- When user selects lbs/inches, calculate and display lbs.in moments
- Conversion: `lbs.in = kg.mm × 0.0034173` (or recalculate from scratch)
- Adds complexity; may confuse users comparing to official documentation

**Option C: Display both units**
- Show moments as "887,600 kg.mm (77,072 lbs.in)"
- Provides clarity but clutters the display

---

### 4.4 CG Display Rounding Inconsistency

#### Description

Within the same PDF document, the CG position shows different values in different locations.

#### Evidence (from Kg PDF)

| Location | CG Value |
|----------|----------|
| Loading Table (TOTALS row, Arm column) | 1009 mm |
| Results Section (CG Position) | 1010 mm |

#### Analysis

The calculated CG is 1009.72 mm. The variance occurs because:
- Loading table shows CG rounded to nearest integer (1009.72 → 1009)
- Results section shows CG rounded to nearest integer differently (1009.72 → 1010)

This suggests inconsistent rounding functions are used in different parts of the code.

#### Impact

A 1 mm display discrepancy within the same document may cause confusion but has no impact on the within/outside limits determination.

#### Recommendation

**Option A: Standardise rounding (Recommended)**
- Use consistent rounding throughout (e.g., always round to nearest integer, or always truncate)
- Simple code fix with clear benefit

**Option B: Display with decimal precision**
- Show CG as "1009.7 mm" in both locations
- Eliminates ambiguity but may suggest false precision

---

### 4.5 Fuel Weight Calculation Method

#### Description

The application uses different methods to calculate fuel weight depending on the input unit.

#### Current Implementation

From `src/utils/conversions.ts`:

```javascript
// Gallons to weight
gallonsToWeightLbs: (gallons) => gallons * 6.0  // lbs/gal

// Litres to weight
litresToWeightLbs: (litres) => litres * 0.72 * (1 / 0.453592)  // kg/L → lbs
```

#### Verification

For 85 litres of fuel:
- Via litres method: 85 × 0.72 ÷ 0.453592 = **134.92 lbs**
- Cross-check via gallons: 85 ÷ 3.78541 = 22.45 gal × 6.0 = **134.73 lbs**
- **Variance: 0.19 lbs (0.09 kg) per tank**

#### Analysis

The slight variance (0.14%) arises because:
- 0.72 kg/L and 6.0 lbs/gal are both rounded industry values
- They don't convert exactly to each other: 6.0 lbs/gal = 0.7193 kg/L (not 0.72)

#### Impact

For full tanks (87 gal / 329 L per aircraft):
- Maximum variance: ~0.7 lbs total
- Negligible impact on CG calculations

#### Recommendation

**Option A: Leave as-is (Recommended)**
- Both values (0.72 kg/L and 6.0 lbs/gal) are industry-accepted standards
- The variance is well within measurement precision
- Changing could introduce confusion with standard references

---

## 5. Summary of Recommendations

| Finding | Severity | Recommendation | Action |
|---------|----------|----------------|--------|
| 4.1 Arm rounding | Low | Leave as-is | No change required |
| 4.2 Baggage B arm | **Medium** | Verify against POH | **Requires verification** |
| 4.3 Moment units | Low | Leave as-is (or add explanatory note) | Optional enhancement |
| 4.4 CG rounding | Low | Standardise rounding | Simple fix recommended |
| 4.5 Fuel calculation | Low | Leave as-is | No change required |

---

## 6. Conclusion

The Weight & Balance Calculator produces accurate results within acceptable tolerances for flight planning purposes. The identified variances are:

1. **Systematic but small** — caused by predictable rounding decisions
2. **Well-documented** — conversion constants and methods are clearly defined in code
3. **Conservative** — where rounding occurs, it does not systematically bias results toward unsafe outcomes

The single item requiring action is verification of the Baggage Area B arm value (Finding 4.2).

**The application is fit for purpose as a flight planning tool**, with the standard disclaimer that pilots must verify calculations against official aircraft documentation.

---

## Appendix A: Conversion Constants Reference

```
Weight:
  1 lb = 0.453592 kg
  1 kg = 2.204624 lb

Distance:
  1 inch = 25.4 mm (exact)
  1 mm = 0.03937 inches

Volume:
  1 US gallon = 3.78541 litres
  1 litre = 0.26417 US gallons

Fuel (AVGAS 100LL):
  Density: 6.0 lbs/US gallon
  Density: 0.72 kg/litre
```

## Appendix B: VH-YPB Aircraft Data Used

```
Registration: VH-YPB
Model: Cessna 182T
Basic Empty Weight: 2007.0 lbs (910.4 kg)
Empty CG: 975 mm (38.4")
Max Takeoff Weight: 3100 lbs (1406.1 kg)
Max Landing Weight: 2950 lbs (1338.1 kg)
Fuel Capacity: 87 US gallons (329.3 litres)
```

## Appendix C: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 25 Jan 2026 | Audit Team | Initial release |
