# CFC Weight & Balance Spreadsheet → Chart Math & Calculation Map (for React/Next.js port)

This document captures the **exact calculation structure** used by the unprotected Excel workbook:

- **`CFC-Weight-and-Balance-August-2025.xlsx`**
- (Protection removed by deleting `sheetProtection` tags in `xl/worksheets/sheet*.xml`.)

It focuses on the portion that renders the **Weight vs Arm** chart (your screenshot), and exposes **all intermediate calculations** that feed the plotted series, so you can replicate and verify them in a single-page React/Next.js app.

> **Safety note (aviation):** Weight & balance calculators are safety-critical. Treat this as an engineering artifact. Any changes (units, rounding, station arms, fuel density assumptions) must be validated against POH/AFM data and operational procedures.

---

## 1) Core concepts & units

### 1.1 Units used in the workbook

- **Weight**: kilograms (**kg**)
- **Arm**: millimetres (**mm**)
- **Moment**: **kg·mm**
- **CG Arm (computed)**: **mm**

### 1.2 Fundamental formulas

These are the *only* maths operations the workbook needs to produce the chart:

- **Moment** = `Weight * Arm`
- **TotalWeight** = sum of component weights
- **TotalMoment** = sum of component moments
- **CGArm** = `TotalMoment / TotalWeight`

The chart uses **(CGArm, TotalWeight)** pairs at multiple stages (empty → add stations → add fuel → burn fuel).

---

## 2) Where the chart data comes from

The workbook does **not** plot directly from the input sheet. Instead, it uses two hidden-ish “parameter” sheets:

- `KXW_Parms` (aircraft #1)
- `YPB_Parms` (aircraft #2)

These sheets compute:
- Envelope polygon points
- Load-path points (cumulative additions)
- Fuel points (takeoff, remaining fuel, burn path)
- Max landing weight line (YPB)

The chart series ranges point at those `*_Parms` sheets.

> **Porting tip:** replicate the underlying cumulative math, not the literal stored point arrays, otherwise you can introduce subtle drift (especially if you change rounding).

---

## 3) Aircraft 1 – KXW chart mapping

### 3.1 Series: **Envelope**

**Chart uses:**
- X (Arm mm): `KXW_Parms!B20:B25`
- Y (Weight kg): `KXW_Parms!A20:A25`

**Meaning:**
A fixed polygon in (Arm, Weight) space. The bottom of the envelope is tied to **empty weight**.

**Structure (conceptual):**
- Uses a couple of hard-coded arms (e.g., `887.5`, `1040`, `1200`)
- Uses `KXW!$B$9` (empty weight) as the low-weight boundary

So the envelope “floor” moves if empty weight changes.

---

### 3.2 Series: **Load data** (cumulative loading path)

**Chart uses:**
- X (Arm mm): `KXW_Parms!C7:C13`
- Y (Weight kg): `KXW_Parms!A7:A13`

**Meaning:**
A polyline showing how CG changes as you add station weights sequentially.

#### 3.2.1 Start point (empty aircraft)

- `KXW_Parms!A7 = KXW!$B$9`  → empty **weight**
- `KXW_Parms!B7 = KXW!$D$9`  → empty **moment**
- `KXW_Parms!C7 = B7/A7`     → empty **arm**

#### 3.2.2 Each step adds a station (rows 10..15)

For step i (mapping to station row r on the KXW sheet):

- `TotalWeight_next = TotalWeight_prev + KXW!$B{r}`
- `TotalMoment_next = TotalMoment_prev + KXW!$D{r}`
- `CGArm_next = TotalMoment_next / TotalWeight_next`

On the KXW sheet, station moment is computed as:

- `KXW!D10:D15 = IF(ISNUMBER($B10), $B10*$C10, 0)` *(shared formula)*

So:
- If weight input is blank / non-numeric → moment contributes **0**
- This is why you can see **repeated plotted points** when later rows are empty.

#### 3.2.3 Actual numbers currently in the workbook (as-saved)

From the first worksheet XML you pasted, KXW has (at least) these values:

- `B9 = 791.9` (empty weight)
- `C9 = 1057` (empty arm)
- `D9 = B9*C9 = 837,038.3`

Then row 10 includes `B10 = 100` and `C10 = 37*25.4 = 939.8` etc.

In `KXW_Parms`, the computed load path points (A7:C13) currently resolve to approximately:

| Step | Total Weight (kg) | Total Moment (kg·mm) | CG Arm (mm) |
|---:|---:|---:|---:|
| 1 | 791.9 | 837,038.3 | 1057.0 |
| 2 | 891.9 | 931,018.3 | 1043.8595 |
| 3 | 991.9 | 1,024,998.3 | 1033.3686 |
| 4 | 1031.9 | 1,099,166.3 | 1065.1868 |
| … | may repeat | may repeat | may repeat |

> **Porting tip:** if your UI allows arbitrary station ordering, note that Excel’s “load data” is **order-dependent** (it’s a cumulative path). If you want the *same* path, preserve the same station order in your app.

---

### 3.3 Series: **Fuel Burn** (green line)

**Chart uses:**
- X (Arm mm): `KXW_Parms!C16:C17`
- Y (Weight kg): `KXW_Parms!A16:A17`

**Meaning:**
A two-point line between:
1) “Loaded without fuel” (zero-fuel / pre-fuel total)
2) “Loaded with fuel” (takeoff total)

Computed from totals on the KXW sheet:

- Point 1:
  - `A16 = KXW!$B$18` (total weight without fuel)
  - `B16 = KXW!$D$18` (total moment without fuel)
  - `C16 = B16 / A16`

- Point 2:
  - `A17 = KXW!$B$20` (total weight with fuel)
  - `B17 = KXW!$D$20` (total moment with fuel)
  - `C17 = B17 / A17`

Where:
- `KXW!B18 = SUM(B9:B15)`
- `KXW!D18 = SUM(D9:D15)`
- `KXW!B20 = SUM(B18:B19)`
- `KXW!D20 = SUM(D18:D19)`

---

## 4) Aircraft 2 – YPB chart mapping (matches your screenshot style)

This aircraft’s chart includes:
- Envelope polygon
- Max landing weight horizontal line (red)
- Load data path
- Remaining fuel line
- Fuel burn line

### 4.1 Series: **Envelope**

**Chart uses:**
- X: `YPB_Parms!B26:B32`
- Y: `YPB_Parms!A26:A32`

**Meaning:**
Hard-coded envelope polygon points (the “limit box/shape”).

> The arms/weights are entered explicitly as constants on the parms sheet.

---

### 4.2 Series: **MAX Ldg Wt** (red horizontal line)

**Chart uses:**
- X: `YPB_Parms!B35:B36`
- Y: `YPB_Parms!A35:A36`

**Meaning:**
A straight horizontal line at maximum landing weight.

In the workbook it is represented by two points:

- `(Arm=986, Weight=1338)`
- `(Arm=1168, Weight=1338)`

So it’s literally a segment at **1338 kg** spanning those arms.

---

### 4.3 Series: **Load data** (cumulative loading path)

**Chart uses:**
- X: `YPB_Parms!C7:C14`
- Y: `YPB_Parms!A7:A14`

**Meaning:**
Same logic as KXW, but it sums different station ranges.

Start:
- `A7 = YPB!$B$9`
- `B7 = YPB!$D$9`
- `C7 = B7/A7`

Then sequentially:
- `A8 = A7 + YPB!$B10`
- `B8 = B7 + YPB!D10`
- `C8 = B8/A8`
- …
- `A14 = A13 + YPB!$B16`
- `B14 = B13 + YPB!D16`
- `C14 = B14/A14`

Station moments are again `Weight * Arm` (with blanks treated as 0 via `IF(ISNUMBER(...), ..., 0)` style logic).

---

### 4.4 Series: **Remaining Fuel**

**Chart uses:**
- X: `YPB_Parms!C17:C18`
- Y: `YPB_Parms!A17:A18`

**Meaning:**
CG shift from “loaded aircraft (no fuel)” → “loaded aircraft + remaining fuel”.

Points:
- Point 1:
  - `A17 = YPB!$B$19`
  - `B17 = YPB!$D$19`
  - `C17 = B17/A17`

- Point 2:
  - `A18 = YPB!$B$26`
  - `B18 = YPB!$D$26`
  - `C18 = B18/A18`

Where on the YPB sheet:
- `B19 = SUM(B9:B16)` *(zero-fuel / pre-fuel total)*
- `D19 = SUM(D9:D16)`
- `B26 = B25 + B19` *(adds remaining fuel weight)*
- `D26 = D19 + D25` *(adds remaining fuel moment)*
- `B25 = I22 - I24` *(fuel remaining in kg; derived from fuel inputs)*

So in code:
```text
zeroFuel = totals(loadStations)
landing  = zeroFuel + remainingFuel
```

---

### 4.5 Series: **Fuel Burn**

**Chart uses:**
- X: `YPB_Parms!C22:C23`
- Y: `YPB_Parms!A22:A23`

**Meaning:**
CG movement between takeoff condition and landing condition (after fuel burn).

This is effectively:
- Point A = **takeoff** totals (with fuel loaded)
- Point B = **landing** totals (with remaining fuel)

Implementation is the same pattern:
- `Arm = Moment / Weight`
- Takeoff/landing weight and moment are computed from the corresponding totals rows.

---

## 5) “Why does the chart look like that?” (interpretation)

### 5.1 The envelope is static; your load path is dynamic
- Envelope points are constants (with a floor tied to empty weight on KXW).
- Load path depends on the order and magnitude of station inputs.

### 5.2 The load path is order-dependent
If you reorder stations in your React app, your final CG will match, but the **path polyline** will not.

### 5.3 Repeated points happen when a station contributes zero
Excel uses `IF(ISNUMBER(weight), weight*arm, 0)` for moments, so blank station weights contribute **0 moment** and **0 weight**, yielding identical totals.

---

## 6) Porting guidance (React/Next.js)

### 6.1 Recommended data model

Represent each station as:
```ts
type Station = {
  id: string
  label: string
  armMm: number
  weightKg: number | null   // null means blank input
}
```

Then:
```ts
function stationMomentKgMm(st: Station): number {
  return typeof st.weightKg === "number" ? st.weightKg * st.armMm : 0
}
```

### 6.2 Cumulative load series (for the plot)
```ts
type Point = { armMm: number; weightKg: number }

function cumulativeSeries(emptyWeight: number, emptyArm: number, stations: Station[]): Point[] {
  let totalW = emptyWeight
  let totalM = emptyWeight * emptyArm
  const pts: Point[] = [{ armMm: totalM / totalW, weightKg: totalW }]

  for (const st of stations) {
    const w = typeof st.weightKg === "number" ? st.weightKg : 0
    const m = typeof st.weightKg === "number" ? st.weightKg * st.armMm : 0
    totalW += w
    totalM += m
    pts.push({ armMm: totalM / totalW, weightKg: totalW })
  }
  return pts
}
```

### 6.3 Fuel lines
Fuel is handled as additional “stations” (with their own arm) but represented as **two-point segments**:

- Without fuel → with fuel (takeoff)
- With fuel → with remaining fuel (landing), depending on aircraft sheet logic

Ensure your app matches:
- fuel density constant (e.g., `0.71`)
- unit conversions (litres ↔ US gallons, etc.)
- rounding (Excel uses `ROUND(..., 0)` in places)

---

## 7) Key validation checkpoints (when comparing to your app)

1) **Empty weight & arm** (the starting point)  
2) Each station arm conversion (in → mm, if applicable)  
3) Each station moment = weight * arm  
4) Totals (sum weights, sum moments)  
5) CG arm = totalMoment / totalWeight  
6) Fuel weight derivation + remaining fuel  
7) Any `ROUND()` usage (Excel rounds some fuel conversions)

> If you share your station list and any constant tables (fuel density, max weights, arms), I can generate a machine-readable JSON mapping of “Excel → App” for automated regression tests.

---

## 8) What was actually “protected” in the XML (why this was removable)

Your pasted XML ends with:
```xml
<sheetProtection sheet="1" objects="1" scenarios="1"/>
```

This is editing protection (not encryption). Deleting this tag (and the same tag in other `sheetX.xml` files) removes the sheet lock immediately.

No `password="..."` attribute was present, so there was no sheet password hash to crack.

---

## Appendix: What you should expect to replicate exactly

If you replicate:
- exact station list
- exact order
- exact units (kg, mm, kg·mm)
- exact rounding points

…then your React chart should match Excel **point-for-point**.

If you change:
- rounding strategy
- station ordering
- unit representation (e.g., kg·m)
- fuel calculations

…then your **final CG** might still match, but the **polyline path** or intermediate points may differ.

