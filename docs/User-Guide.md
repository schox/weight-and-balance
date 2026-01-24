# Weight & Balance Calculator - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Important Safety Notice](#important-safety-notice)
3. [Getting Started](#getting-started)
4. [Selecting an Aircraft](#selecting-an-aircraft)
5. [Viewing Aircraft Data](#viewing-aircraft-data)
6. [Entering Loading Information](#entering-loading-information)
7. [Understanding the Results](#understanding-the-results)
8. [Using the CG Envelope Graph](#using-the-cg-envelope-graph)
9. [Flight Planning Feature](#flight-planning-feature)
10. [Generating a PDF Loading Sheet](#generating-a-pdf-loading-sheet)
11. [Changing Settings](#changing-settings)
12. [Sample Calculations](#sample-calculations)
13. [Troubleshooting](#troubleshooting)
14. [Contact Information](#contact-information)

---

## Introduction

The Weight & Balance Calculator is a web-based application designed for pilots at Curtin Flying Club. It helps you:

- Calculate total aircraft weight for a planned flight
- Determine the Centre of Gravity (CG) position
- Verify that the aircraft is loaded within safe operating limits
- Plan fuel burn and predict landing weight and CG

The calculator supports two aircraft:
- **VH-YPB** - Cessna 182T
- **VH-KXW** - Cessna 172P

---

## Important Safety Notice

**This calculator is for planning purposes only.**

- Always verify calculations against the official Aircraft Flight Manual (AFM)
- Cross-check results with the current Weight & Balance documentation for the specific aircraft
- The pilot-in-command is solely responsible for ensuring the aircraft is loaded within limits
- Aircraft data may change due to modifications or equipment changes - always use current documentation

---

## Getting Started

### Accessing the Calculator

Open the calculator in any modern web browser. The application works on desktop computers, tablets, and mobile phones.

### Default Settings

When you first open the calculator, it uses these default settings:
- **Fuel Units:** Litres (L)
- **Weight Units:** Kilograms (kg)
- **Distance Units:** Inches (in)

You can change these at any time via the Settings menu.

### No Data is Stored

All data you enter stays in your browser session only. When you close the browser tab or refresh the page, all entered values are reset. The calculator does not store any personal information or flight data.

---

## Selecting an Aircraft

At the top of the calculator, you'll see two tabs:
- **YPB C182T** - VH-YPB Cessna 182T
- **KXW C172P** - VH-KXW Cessna 172P

Click on the appropriate tab to select the aircraft you'll be flying. Each aircraft has different:
- Basic Empty Weight
- Loading station arm positions
- CG envelope limits
- Fuel capacity
- Baggage limits

**Note:** When you switch between aircraft tabs, your entered data is independent for each aircraft.

---

## Viewing Aircraft Data

### Accessing Aircraft Information

Each aircraft tab has an **Info icon** (ℹ️) next to the aircraft name. Click this icon to view detailed information about the aircraft data used for all calculations.

### What's Shown on the Aircraft Info Page

The aircraft information page displays:

#### Basic Empty Weight Data
- Basic Empty Weight (BEW) in both lbs and kg
- Empty CG position in both inches and mm
- Approval date and work order reference

#### Weight Limits
- Maximum Takeoff Weight (MTOW)
- Maximum Landing Weight (MLW)
- Maximum Ramp Weight

#### Fuel Data
- Total usable fuel capacity
- Per-tank capacity
- Default fuel burn rate

#### Loading Stations
Tables showing each loading station with:
- Station name
- Arm position (distance from datum) in both inches and mm
- Maximum weight limit in both lbs and kg

Stations are grouped by type:
- Occupants (Pilot, Front Passenger, Rear Passengers)
- Baggage (Areas A, B, and C for YPB; Areas 1 and 2 for KXW)
- Fuel (Left and Right tanks)

#### CG Envelope Limits
The forward and aft CG limits at different weights, explaining how the forward limit varies with weight.

#### Moment Calculation Formulas
The mathematical formulas used for all moment and CG calculations.

### Why This Matters

Understanding the source data is crucial because:
- You can verify the calculator is using correct values
- You can cross-reference with the official aircraft documentation
- You understand exactly how results are computed

---

## Entering Loading Information

### Front Row Seats

Enter the weight of the pilot and front passenger (if any):
- **Pilot:** Required - enter the pilot's weight including any carried items
- **Front Passenger:** Optional - enter 0 or leave empty if the seat is unoccupied

### Rear Row Seats

Enter the weight of rear passengers:
- **Rear Passenger 1:** Left rear seat
- **Rear Passenger 2:** Right rear seat

For unoccupied seats, enter 0 or leave empty.

### Baggage

The baggage section has tabs for each baggage area:

**VH-YPB (C182T):**
- Area A: Up to 120 lbs / 54 kg
- Area B: Up to 80 lbs / 36 kg
- Area C: Up to 80 lbs / 36 kg
- **Combined maximum: 200 lbs / 91 kg**

**VH-KXW (C172P):**
- Area 1: Up to 120 lbs / 54 kg
- Area 2: Up to 50 lbs / 23 kg
- **Combined maximum: 120 lbs / 54 kg**

Click the tab for each area and enter the baggage weight. The total baggage weight is shown at the bottom of the baggage card.

### Fuel

Enter fuel quantities for each wing tank:
- **Left Wing:** Fuel quantity in left tank
- **Right Wing:** Fuel quantity in right tank

The fuel is displayed in your selected fuel units (litres or gallons). The calculator also shows the fuel weight.

**Maximum fuel per tank:**
- VH-YPB: ~43.5 gallons / ~165 litres per tank (87 gal / 329 L total)
- VH-KXW: ~26.5 gallons / ~100 litres per tank (53 gal / 201 L total)

---

## Understanding the Results

### Weight Data Card

The Weight Data card shows:

| Field | Description |
|-------|-------------|
| **BEW** | Basic Empty Weight of the aircraft |
| **MTOW** | Maximum Takeoff Weight |
| **Current Weight** | Your calculated total weight (turns red if over MTOW) |
| **Margin** | How much weight capacity remains (+) or excess (-) |
| **Weight Loading** | Visual progress bar showing percentage of MTOW used |

### Centre of Gravity Card

The CG card shows:

| Field | Description |
|-------|-------------|
| **CG Position** | Current CG location from datum (with % MAC) |
| **Status** | WITHIN LIMITS, CAUTION, or OUT OF LIMITS |
| **Envelope** | Whether CG is within the safe envelope |
| **Balance** | BALANCED or UNBALANCED |

### Status Indicators

- **Green checkmark (✓ SAFE):** All limits satisfied
- **Yellow warning triangle (CAUTION):** Warnings present but within limits
- **Red X (OUT OF LIMITS):** Critical limit exceeded - DO NOT FLY

### Warnings and Errors

If any limits are exceeded, warnings or errors appear below the status cards:
- **Errors (red):** Critical issues that must be resolved
- **Warnings (yellow):** Issues to review but may not prevent flight

Common warnings include:
- Total weight exceeds MTOW
- CG position outside envelope
- Individual station limits exceeded
- Combined baggage limit exceeded
- Unusually low pilot weight (possible data entry error)

---

## Using the CG Envelope Graph

### Weight vs C of G View

This traditional graph shows:
- **Green shaded area:** Safe CG envelope
- **Red boundary lines:** Forward and aft CG limits
- **Blue line:** Load path showing how CG moves as items are added
- **Orange dot (ZFW):** Zero Fuel Weight position
- **Green dot (Current):** Current takeoff position
- **Dashed red line (MLW):** Maximum Landing Weight line (if applicable)

### Understanding the Load Path

The blue line traces how the CG moves as each loading station is added sequentially:
1. Starts at BEW (Basic Empty Weight)
2. Adds pilot
3. Adds front passenger
4. Adds rear passengers
5. Adds baggage
6. The green line from ZFW to Current shows the effect of fuel

### Weight Distribution View

This alternate view shows a side profile of the aircraft with visual weight indicators at each loading station, helping you visualise how weight is distributed.

---

## Flight Planning Feature

### Purpose

The Flight Planning section lets you project your landing weight and CG after fuel burn during the flight.

### How to Use It

1. Expand the **Flight Planning** panel (click to expand if collapsed)
2. Enter the **Fuel Burn Rate** in your selected units (L/hr or GPH)
3. Enter the **Flight Duration** in hours (e.g., 1.5 for 1 hour 30 minutes)

### What It Shows

- **Total fuel burn** calculated amount of fuel that will be consumed
- **Landing trajectory** shown as a green arrow on the CG graph
- **Landing position** shown as a green dot on the graph
- **Landing weight** displayed below the graph

### Default Burn Rates

Each aircraft has a default fuel burn rate pre-filled:
- VH-YPB (C182T): 14 GPH / 53 L/hr
- VH-KXW (C172P): 9 GPH / 34 L/hr

You can adjust these based on your planned power settings.

### MLW Warning

If your projected landing weight exceeds the Maximum Landing Weight (MLW), the landing position will be shown in red and a warning will be displayed.

---

## Generating a PDF Loading Sheet

### Purpose

The PDF Loading Sheet feature lets you generate a single-page A4 document summarising your weight and balance calculation. This is useful for:

- Keeping a record of your pre-flight planning
- Printing a loading sheet to carry in the aircraft
- Sharing your calculation with an instructor or flight examiner

### How to Generate a PDF

1. Complete your loading data (weights, fuel, etc.)
2. Scroll to the bottom of the aircraft tab
3. Click the **"Generate PDF Loading Sheet"** button
4. In the dialog that appears:
   - **Flight Date:** Select the date of your planned flight (defaults to today)
   - **Pilot Name:** Enter the pilot-in-command's name (optional)
5. Review the loading summary shown in the dialog (aircraft, total weight, CG, status)
6. Click **"Generate PDF"** to download the file

The PDF is saved with a filename like `W&B_VH-YPB_24-Jan-2026.pdf`.

### What the PDF Contains

The loading sheet fits on a single A4 page and includes:

| Section | Content |
|---------|---------|
| **Header** | Title, club name |
| **Flight Info** | Aircraft registration/model, date, pilot, units |
| **CG Envelope Chart** | Graphical plot of the CG envelope with your takeoff position marked. If flight planning is active, the landing position and fuel burn trajectory are also shown. |
| **Loading Summary** | Table of all non-zero loading stations with weight and arm |
| **Status** | Total weight vs MTOW, CG vs limits, overall WITHIN/OUTSIDE status |
| **Flight Planning** | Burn rate, duration, fuel burn, landing weight/CG, MLW status (only shown if flight planning data is entered) |
| **Aircraft Reference** | One-line summary of key aircraft limits |
| **Disclaimer** | Reminder that the sheet is for planning purposes only |

### CG Envelope Chart on the PDF

The chart shows:
- **Green shaded polygon:** The safe CG envelope
- **Red lines:** Forward and aft CG limits
- **MTOW / MLW lines:** Horizontal reference lines at maximum weights
- **Green dot (T/O):** Your takeoff weight and CG position
- **Green dot (LDG):** Landing position after fuel burn (if flight planning active)
- **Dashed blue arrow:** Fuel burn trajectory from takeoff to landing
- Dots are coloured **red** instead of green if outside limits

---

## Changing Settings

### Accessing Settings

Click the **Settings icon** (gear/cog) in the top-right corner of the header.

### Available Settings

#### Fuel Units
- **Litres (L):** Metric fuel measurement
- **Gallons (gal):** US gallons

#### Weight Units
- **Kilograms (kg):** Metric weight measurement
- **Pounds (lbs):** Imperial weight measurement

#### Distance Units
- **Inches (in):** Traditional aviation CG measurement
- **Millimeters (mm):** Metric distance measurement

### When to Use Each Setting

- Use **litres and kg** for consistency with Australian aviation practices
- Use **gallons and lbs** when referencing US-origin POH data
- Distance units affect CG position display only

### Settings Are Session-Only

Settings are not saved between sessions. Each time you open the calculator, it returns to the defaults (litres, kg, inches).

---

## Sample Calculations

The following examples demonstrate how the calculator performs weight and balance calculations for VH-YPB.

### Example 1: Two Pilots, Full Fuel

**Scenario:** Training flight with instructor and student, full fuel, minimal baggage.

#### Input Data
| Station | Weight (lbs) | Arm (in) | Arm (mm) |
|---------|--------------|----------|----------|
| Basic Empty Weight | 2,007.0 | 38.4" | 975 |
| Pilot | 180 | 37.0" | 940 |
| Front Passenger | 170 | 37.0" | 940 |
| Rear Passengers | 0 | 74.0" | 1,880 |
| Baggage | 20 | 97.0" | 2,464 |
| Fuel (87 gal = 522 lbs) | 522 | 46.5" | 1,181 |

#### Calculation Steps

**Step 1: Calculate moments for each station**

Moment = Weight (kg) × Arm (mm)

| Station | Weight (lbs) | Weight (kg) | Arm (mm) | Moment (kg.mm) |
|---------|--------------|-------------|----------|----------------|
| Basic Empty Weight | 2,007.0 | 910.4 | 975 | 887,640 |
| Pilot | 180 | 81.6 | 940 | 76,704 |
| Front Passenger | 170 | 77.1 | 940 | 72,474 |
| Baggage Area A | 20 | 9.1 | 2,464 | 22,422 |
| Fuel (both tanks) | 522 | 236.8 | 1,181 | 279,661 |

**Step 2: Sum totals**

- Total Weight = 2,007 + 180 + 170 + 20 + 522 = **2,899 lbs** (1,315 kg)
- Total Moment = 887,640 + 76,704 + 72,474 + 22,422 + 279,661 = **1,338,901 kg.mm**

**Step 3: Calculate CG position**

CG = Total Moment ÷ Total Weight (kg)
CG = 1,338,901 ÷ 1,315 = **1,018 mm** (40.1")

**Step 4: Check limits**

- MTOW = 3,100 lbs → 2,899 lbs is **WITHIN LIMITS** ✓
- Forward CG limit at 2,899 lbs: interpolating between 838mm (at 2,250 lbs) and 1,039mm (at 3,100 lbs)
  - Ratio = (2,899 - 2,250) ÷ (3,100 - 2,250) = 0.76
  - Forward limit = 838 + (0.76 × 201) = 991mm (39.0")
- Aft CG limit: 1,168mm (46.0")
- CG at 1,018mm is between 991mm and 1,168mm → **WITHIN ENVELOPE** ✓

---

### Example 2: Four Passengers, Heavy Baggage

**Scenario:** Cross-country flight with full passengers and significant baggage.

#### Input Data
| Station | Weight (lbs) |
|---------|--------------|
| Basic Empty Weight | 2,007.0 |
| Pilot | 185 |
| Front Passenger | 165 |
| Rear Passenger 1 | 180 |
| Rear Passenger 2 | 160 |
| Baggage Area A | 80 |
| Baggage Area B | 40 |
| Fuel (60 gal = 360 lbs) | 360 |

#### Calculation

| Station | Weight (kg) | Arm (mm) | Moment (kg.mm) |
|---------|-------------|----------|----------------|
| Basic Empty Weight | 910.4 | 975 | 887,640 |
| Pilot | 83.9 | 940 | 78,866 |
| Front Passenger | 74.8 | 940 | 70,312 |
| Rear Passenger 1 | 81.6 | 1,880 | 153,408 |
| Rear Passenger 2 | 72.6 | 1,880 | 136,488 |
| Baggage Area A | 36.3 | 2,464 | 89,443 |
| Baggage Area B | 18.1 | 2,946 | 53,323 |
| Fuel | 163.3 | 1,181 | 192,857 |
| **Totals** | **1,441 kg** | | **1,662,337** |

**Results:**
- Total Weight = 3,177 lbs (1,441 kg)
- CG = 1,662,337 ÷ 1,441 = **1,154 mm** (45.4")

**Limit Check:**
- Weight: 3,177 lbs exceeds MTOW of 3,100 lbs → **OVER WEIGHT** ✗
- CG: 1,154mm is within aft limit of 1,168mm but aircraft is overweight

**Solution:** Reduce fuel to 45 gallons (270 lbs):
- New total = 3,087 lbs → Within MTOW ✓
- Recalculated CG ≈ 1,148mm (45.2") → Within envelope ✓

---

### Understanding Moment Calculations

The calculator uses this fundamental formula:

```
Moment (kg.mm) = Weight (kg) × Arm (mm)
```

Where:
- **Weight** is converted from lbs to kg using factor 0.453592
- **Arm** is the distance from the aircraft datum (reference point) to the station's centre of gravity

The CG position is then:

```
CG Position (mm) = Total Moment (kg.mm) ÷ Total Weight (kg)
```

This CG position is then checked against the aircraft's CG envelope, which defines the forward and aft limits at various weights.

---

## Troubleshooting

### Calculator Shows "OUT OF LIMITS"

1. Check the error message to identify which limit is exceeded
2. If weight is over MTOW: reduce fuel, baggage, or passengers
3. If CG is too far forward: move weight aft (more rear passengers, less front baggage)
4. If CG is too far aft: move weight forward (reduce rear baggage, check fuel loading)

### Numbers Look Wrong

1. Check your settings - wrong unit selection will show incorrect values
2. Verify you're on the correct aircraft tab
3. Click the Info icon to verify the base aircraft data

### Changes Don't Save

The calculator intentionally does not save data between sessions for privacy. If you need to record calculations, use the **Generate PDF Loading Sheet** button to download a PDF of your current calculation.

### Graph Doesn't Show Landing Position

The landing position only appears when:
1. The Flight Planning panel is expanded
2. Both burn rate and duration are greater than 0

---

## Contact Information

**Developer:** Andrew Schox

**Email:** andrew@andrewschox.com

**Phone:** 0413 759 721

For bug reports, feature requests, or questions about the calculator, please contact the developer directly.

---

*Last updated: January 2026*
