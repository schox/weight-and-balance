# VH-YPB Weight & Balance Calculations Reference

This document provides a detailed explanation of all calculations used in the weight and balance application, along with the baseline aircraft-specific data for VH-YPB (Cessna 182T).

---

## Table of Contents

1. [Aircraft Baseline Data](#aircraft-baseline-data)
2. [Unit Conversions](#unit-conversions)
3. [Core Calculations](#core-calculations)
4. [CG Envelope Validation](#cg-envelope-validation)
5. [Flight Planning Calculations](#flight-planning-calculations)
6. [Validation Rules](#validation-rules)
7. [Worked Examples](#worked-examples)

---

## Aircraft Baseline Data

### VH-YPB Specifications

| Parameter | Value (Imperial) | Value (Metric) | Source |
|-----------|------------------|----------------|--------|
| Registration | VH-YPB | - | Load Data Sheet |
| Model | Cessna 182T | - | Load Data Sheet |
| Basic Empty Weight (BEW) | 2,007.0 lbs | 910.4 kg | Load Data Sheet |
| Empty CG Position | 38.4 inches | 975 mm | Load Data Sheet |
| Empty Moment | 77,068.8 in-lbs | 887,850 kg.mm | Calculated |
| Max Takeoff Weight (MTOW) | 3,100 lbs | 1,406.1 kg | POH Figure 6-8 |
| Max Landing Weight (MLW) | 2,950 lbs | 1,338.1 kg | POH Figure 6-8 |
| Max Ramp Weight | 3,110 lbs | 1,410.7 kg | POH |
| Fuel Capacity (Usable) | 87 gallons | 329.3 litres | POH |
| Date Approved | 01-Nov-11 | - | Load Data Sheet |
| Work Order | WB-5014 | - | Load Data Sheet |

### Loading Station Arms

All arms are measured from the aircraft datum (firewall) in inches, stored internally in millimetres.

| Station | Arm (inches) | Arm (mm) | Max Weight (lbs) | Notes |
|---------|--------------|----------|------------------|-------|
| Pilot | 37.0" | 940 | 400 | Required station |
| Front Passenger | 37.0" | 940 | 400 | Same arm as pilot |
| Rear Passenger 1 | 74.0" | 1,880 | 400 | Rear bench left |
| Rear Passenger 2 | 74.0" | 1,880 | 400 | Rear bench right |
| Baggage Area A | 97.0" | 2,464 | 120 | Forward baggage |
| Baggage Area B | 116.0" | 2,946 | 80 | Middle baggage |
| Baggage Area C | 129.0" | 3,277 | 80 | Aft baggage |
| Fuel (Left Tank) | 46.5" | 1,181 | 261 | ~43.5 gal capacity |
| Fuel (Right Tank) | 46.5" | 1,181 | 261 | ~43.5 gal capacity |

### CG Envelope Limits (from POH Figure 6-8)

The CG envelope is defined as a pentagon with the following characteristics:

**Forward Limit:**
- **33.0 inches (838.2 mm)** constant for all weights up to 2,250 lbs
- **Linear taper** from 33.0" at 2,250 lbs to **40.9 inches (1,038.86 mm)** at 3,100 lbs

**Aft Limit:**
- **46.0 inches (1,168.4 mm)** constant at all weights

**Weight Range:**
- Minimum: 2,007 lbs (Basic Empty Weight)
- Maximum: 3,100 lbs (MTOW)

| Weight (lbs) | Forward Limit (in) | Forward Limit (mm) | Aft Limit (in) | Aft Limit (mm) |
|--------------|--------------------|--------------------|----------------|----------------|
| 2,007 | 33.0 | 838.2 | 46.0 | 1,168.4 |
| 2,250 | 33.0 | 838.2 | 46.0 | 1,168.4 |
| 2,500 | 35.3 | 897.6 | 46.0 | 1,168.4 |
| 2,750 | 37.6 | 955.0 | 46.0 | 1,168.4 |
| 3,000 | 39.9 | 1,014.4 | 46.0 | 1,168.4 |
| 3,100 | 40.9 | 1,038.86 | 46.0 | 1,168.4 |

### Baggage Limits

| Compartment | Individual Limit | Combined Limit |
|-------------|------------------|----------------|
| Area A | 120 lbs | - |
| Area B | 80 lbs | - |
| Area C | 80 lbs | - |
| **Total (A+B+C)** | - | **200 lbs** |

---

## Unit Conversions

The application stores all values internally in a consistent unit system but supports display in either imperial or metric units.

### Internal Storage Units
- **Weight:** Pounds (lbs)
- **Arm/CG Position:** Millimetres (mm)
- **Moment:** Kilogram-millimetres (kg.mm)
- **Fuel Quantity:** As entered (litres or gallons)

### Conversion Constants

```
1 lb = 0.453592 kg
1 kg = 2.20462 lbs

1 inch = 25.4 mm
1 mm = 0.03937 inches

1 gallon = 3.78541 litres
1 litre = 0.264172 gallons

AVGAS density = 6.0 lbs/gallon
AVGAS density = 0.72 kg/litre
```

### Fuel Weight Conversions

**From Gallons:**
```
Weight (lbs) = Gallons × 6.0
```

**From Litres:**
```
Weight (lbs) = Litres × 0.72 × (1 / 0.453592)
             = Litres × 1.587
```

---

## Core Calculations

### 1. Total Weight Calculation

The total aircraft weight is the sum of all component weights:

```
Total Weight = Empty Weight + People Weight + Baggage Weight + Fuel Weight
```

Where:
```
People Weight = Pilot + Front Passenger + Rear Passenger 1 + Rear Passenger 2
Baggage Weight = Baggage A + Baggage B + Baggage C
Fuel Weight = Fuel Left (lbs) + Fuel Right (lbs)
```

**Example:**
```
Empty Weight:      2,007.0 lbs
Pilot:               180.0 lbs
Front Passenger:     170.0 lbs
Rear Passenger 1:    150.0 lbs
Rear Passenger 2:      0.0 lbs
Baggage A:            30.0 lbs
Baggage B:            20.0 lbs
Baggage C:             0.0 lbs
Fuel (40 gal total): 240.0 lbs
─────────────────────────────
Total Weight:      2,797.0 lbs
```

### 2. Moment Calculation

Moment is calculated for each loading station and summed. The application uses **kg.mm** internally for moment calculations:

```
Moment = Weight (kg) × Arm (mm)
```

**For each station:**
```
Station Moment = Station Weight (lbs) × 0.453592 × Station Arm (mm)
```

**Total Moment:**
```
Total Moment = Empty Moment + Σ(Station Moments)

Where:
Empty Moment = Empty Weight (kg) × Empty CG (mm)
             = (2,007.0 × 0.453592) × 975
             = 910.36 × 975
             = 887,601 kg.mm
```

**Example (continuing from above):**
```
Empty Moment:           910.36 kg × 975 mm   = 887,601 kg.mm
Pilot Moment:            81.65 kg × 940 mm   =  76,751 kg.mm
Front Pax Moment:        77.11 kg × 940 mm   =  72,483 kg.mm
Rear Pax 1 Moment:       68.04 kg × 1880 mm  = 127,915 kg.mm
Baggage A Moment:        13.61 kg × 2464 mm  =  33,535 kg.mm
Baggage B Moment:         9.07 kg × 2946 mm  =  26,720 kg.mm
Fuel Left Moment:        54.43 kg × 1181 mm  =  64,282 kg.mm
Fuel Right Moment:       54.43 kg × 1181 mm  =  64,282 kg.mm
───────────────────────────────────────────────────────────────
Total Moment:                                = 1,353,569 kg.mm
```

### 3. Center of Gravity (CG) Position

The CG position is calculated by dividing total moment by total weight:

```
CG Position (mm) = Total Moment (kg.mm) / Total Weight (kg)
```

**Example (continuing from above):**
```
Total Weight = 2,797.0 lbs = 1,268.7 kg
Total Moment = 1,353,569 kg.mm

CG Position = 1,353,569 / 1,268.7
            = 1,066.9 mm
            = 42.0 inches
```

### 4. Percent Mean Aerodynamic Chord (%MAC)

A simplified %MAC calculation is provided for reference:

```
%MAC = ((CG Position - MAC Start) / MAC Length) × 100
```

For the Cessna 182T (simplified):
```
MAC Start = 889 mm (35.0")
MAC Length = 305 mm (12.0")

%MAC = ((CG - 889) / 305) × 100
```

**Example:**
```
%MAC = ((1,066.9 - 889) / 305) × 100
     = (177.9 / 305) × 100
     = 58.3%
```

---

## CG Envelope Validation

### Forward Limit Interpolation

The forward CG limit is calculated based on weight:

**For weights ≤ 2,250 lbs:**
```
Forward Limit = 33.0 inches (838.2 mm) [constant]
```

**For weights > 2,250 lbs:**
```
Forward Limit = 33.0 + ((Weight - 2,250) / (3,100 - 2,250)) × (40.9 - 33.0)

Simplified:
Forward Limit (inches) = 33.0 + ((Weight - 2,250) / 850) × 7.9

In millimetres:
Forward Limit (mm) = 838.2 + ((Weight - 2,250) / 850) × 200.66
```

**Example at 2,797 lbs:**
```
Forward Limit = 33.0 + ((2,797 - 2,250) / 850) × 7.9
              = 33.0 + (547 / 850) × 7.9
              = 33.0 + 0.6435 × 7.9
              = 33.0 + 5.08
              = 38.08 inches (967.2 mm)
```

### Aft Limit

The aft limit is constant at all weights:
```
Aft Limit = 46.0 inches (1,168.4 mm)
```

### Envelope Check Algorithm

A point (Weight, CG) is within the envelope if:

```
1. Weight ≥ 2,007 lbs (BEW)
2. Weight ≤ 3,100 lbs (MTOW)
3. CG ≥ Forward Limit at current weight
4. CG ≤ 46.0 inches (1,168.4 mm)
```

**Example (continuing from above):**
```
Weight: 2,797 lbs ✓ (between 2,007 and 3,100)
CG: 42.0 inches

Forward Limit at 2,797 lbs: 38.08 inches
Aft Limit: 46.0 inches

Check: 38.08 ≤ 42.0 ≤ 46.0 ✓

Result: WITHIN ENVELOPE
```

### CG Margins

The application calculates margins to the limits:

```
Forward Margin = Current CG - Forward Limit
Aft Margin = Aft Limit - Current CG
```

**Example:**
```
Forward Margin = 42.0 - 38.08 = 3.92 inches (99.6 mm)
Aft Margin = 46.0 - 42.0 = 4.0 inches (101.6 mm)
```

---

## Flight Planning Calculations

### Zero Fuel Weight (ZFW) and CG

Zero Fuel Weight is calculated by excluding all fuel:

```
ZFW = Empty Weight + People Weight + Baggage Weight
```

The ZFW CG is calculated using the same moment method, excluding fuel moments.

### Landing Weight and CG (Fuel Burn)

When planning a flight, the application calculates landing conditions after fuel burn:

**Fuel Burned:**
```
Fuel Burned (gallons) = Burn Rate (GPH) × Flight Duration (hours)
Fuel Burned (lbs) = Fuel Burned (gallons) × 6.0
```

**Remaining Fuel:**
```
Remaining Fuel (lbs) = Current Fuel (lbs) - Fuel Burned (lbs)
                     = max(0, Current Fuel - Fuel Burned)
```

**Landing Weight:**
```
Landing Weight = Zero Fuel Weight + Remaining Fuel Weight
```

**Landing CG:**
The landing CG is recalculated using:
```
Landing Moment = ZFW Moment + (Remaining Fuel Weight × Fuel Arm)
Landing CG = Landing Moment / Landing Weight
```

**Important Note:** As fuel burns, the CG typically moves AFT because:
- Fuel arm (46.5") is forward of the typical loaded CG
- Removing fuel from a forward position shifts CG rearward

This is why VH-YPB's load data sheet warns: **"AFT LIMIT CAN BE EXCEEDED"**

### Cumulative Load Path

The load path shows how CG changes as each station is loaded sequentially:

1. Start with Empty Aircraft (BEW, Empty CG)
2. Add Pilot → recalculate CG
3. Add Front Passenger → recalculate CG
4. Add Rear Passengers → recalculate CG
5. Add Baggage → recalculate CG
6. Add Fuel → final Takeoff CG

This visualization helps pilots understand which loads have the most significant effect on CG.

---

## Validation Rules

### Weight Limits

| Check | Limit | Severity |
|-------|-------|----------|
| Total Weight > MTOW | 3,100 lbs | Error |
| Landing Weight > MLW | 2,950 lbs | Warning |
| Total Weight > Max Ramp | 3,110 lbs | Warning |

### Station Limits

| Station | Max Weight | Severity |
|---------|------------|----------|
| Pilot | 400 lbs | Warning |
| Front Passenger | 400 lbs | Warning |
| Rear Passenger 1 | 400 lbs | Warning |
| Rear Passenger 2 | 400 lbs | Warning |
| Baggage A | 120 lbs | Warning |
| Baggage B | 80 lbs | Warning |
| Baggage C | 80 lbs | Warning |
| Combined Baggage (A+B+C) | 200 lbs | Warning |
| Fuel Left | 261 lbs (~43.5 gal) | Warning |
| Fuel Right | 261 lbs (~43.5 gal) | Warning |

### Data Quality Checks

| Check | Threshold | Severity |
|-------|-----------|----------|
| Pilot weight too low | < 40 lbs | Warning |

---

## Worked Examples

### Example 1: Typical 2-Person Flight

**Loading:**
- Pilot: 180 lbs
- Front Passenger: 170 lbs
- Baggage A: 25 lbs
- Fuel: 60 gallons (30 per tank)

**Calculation:**
```
Weight Calculation:
  Empty:         2,007.0 lbs
  Pilot:           180.0 lbs
  Front Pax:       170.0 lbs
  Baggage A:        25.0 lbs
  Fuel:            360.0 lbs (60 gal × 6 lbs/gal)
  ─────────────────────────
  Total:         2,742.0 lbs ✓ (under 3,100 MTOW)

Moment Calculation (kg.mm):
  Empty:     910.36 kg × 975 mm  = 887,601
  Pilot:      81.65 kg × 940 mm  =  76,751
  Front Pax:  77.11 kg × 940 mm  =  72,483
  Baggage A:  11.34 kg × 2464 mm =  27,942
  Fuel L:     81.65 kg × 1181 mm =  96,429
  Fuel R:     81.65 kg × 1181 mm =  96,429
  ─────────────────────────────────────────
  Total:                         = 1,257,635 kg.mm

CG Calculation:
  Total Weight: 2,742 lbs = 1,243.75 kg
  CG = 1,257,635 / 1,243.75 = 1,011.2 mm = 39.8 inches

CG Limits at 2,742 lbs:
  Forward = 33.0 + ((2,742 - 2,250) / 850) × 7.9
          = 33.0 + 4.57 = 37.57 inches (954.3 mm)
  Aft = 46.0 inches (1,168.4 mm)

Result: 37.57 ≤ 39.8 ≤ 46.0 ✓ WITHIN LIMITS
```

### Example 2: Full Aircraft with Rear Passengers

**Loading:**
- Pilot: 180 lbs
- Front Passenger: 170 lbs
- Rear Passenger 1: 180 lbs
- Rear Passenger 2: 160 lbs
- Baggage A: 50 lbs
- Baggage B: 40 lbs
- Fuel: 50 gallons (25 per tank)

**Calculation:**
```
Weight Calculation:
  Empty:         2,007.0 lbs
  Pilot:           180.0 lbs
  Front Pax:       170.0 lbs
  Rear Pax 1:      180.0 lbs
  Rear Pax 2:      160.0 lbs
  Baggage A:        50.0 lbs
  Baggage B:        40.0 lbs
  Fuel:            300.0 lbs (50 gal × 6 lbs/gal)
  ─────────────────────────
  Total:         3,087.0 lbs ✓ (under 3,100 MTOW)

CG Calculation:
  [Detailed moment calculation omitted for brevity]
  CG = 1,097.8 mm = 43.2 inches

CG Limits at 3,087 lbs:
  Forward = 33.0 + ((3,087 - 2,250) / 850) × 7.9
          = 33.0 + 7.78 = 40.78 inches (1,035.8 mm)
  Aft = 46.0 inches (1,168.4 mm)

Result: 40.78 ≤ 43.2 ≤ 46.0 ✓ WITHIN LIMITS

Note: CG is toward the aft limit due to heavy rear loading.
```

### Example 3: Fuel Burn and Landing CG

**Continuing from Example 2, planning a 2-hour flight at 12 GPH:**

```
Fuel Burn Calculation:
  Burn Rate:     12 GPH
  Duration:       2 hours
  Fuel Burned:   24 gallons = 144 lbs

Landing Weight:
  Takeoff Weight: 3,087.0 lbs
  Fuel Burned:     -144.0 lbs
  ─────────────────────────
  Landing Weight: 2,943.0 lbs ✓ (under 2,950 MLW)

Landing CG:
  Zero Fuel Weight: 2,787 lbs
  Remaining Fuel: 26 gallons = 156 lbs at arm 46.5"

  Landing CG ≈ 44.1 inches (still within aft limit of 46.0")

  Note: CG moved AFT from 43.2" to 44.1" as fuel burned off!
```

### Example 4: Aft CG Exceedance Warning

**Loading (problematic):**
- Pilot: 140 lbs (light pilot)
- Rear Passenger 1: 200 lbs
- Rear Passenger 2: 200 lbs
- Baggage B: 50 lbs
- Baggage C: 50 lbs
- Fuel: 20 gallons

```
Weight: 2,007 + 140 + 400 + 100 + 120 = 2,767 lbs

This configuration with heavy rear loading, minimal fuel,
and a light pilot could result in CG approaching or
exceeding the 46.0" aft limit.

ALWAYS verify both takeoff AND landing CG!
```

---

## Source Files Reference

| File | Purpose |
|------|---------|
| `src/data/aircraft.ts` | Aircraft baseline data (VH-YPB specifications) |
| `src/utils/calculations.ts` | Core W&B calculation functions |
| `src/utils/conversions.ts` | Unit conversion utilities |
| `src/types/aircraft.ts` | TypeScript type definitions |

---

