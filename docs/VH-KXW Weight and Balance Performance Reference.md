Based on the **Cessna 172S Pilot Operating Handbook (POH)** and the **specific Load Data Sheet information** you provided for VH-KXW, here is the updated Calculations Reference.
This document incorporates the actual weight and balance data for VH-KXW and applies the C172S POH limitations found in Section 6\.

# VH-KXW Calculations Reference

This document defines the calculation logic, validation rules, and baseline data for **VH-KXW** (Cessna 172S). It is formatted for direct implementation into flight planning applications.

### 1\. Aircraft Baseline Data

The following specifications are derived from the **VH-KXW Load Data Sheet** (User Provided) and the **Cessna 172S POH** Section 6 1, 2\.
Parameter,Value (Imperial),Value (Metric),Source
Registration,VH-KXW,,User Prompt
Model,Cessna 172S,,POH Sec 6 1  
Basic Empty Weight (BEW),"1,745.8 lbs",791.9 kg,VH-KXW Actual  
Empty Arm,41.6 inches,"1,057 mm",VH-KXW Actual  
Empty Moment,"72,640.0 lb-in","836,846 kg.mm",VH-KXW Actual\*  
Max Takeoff Weight (MTOW),"2,550 lbs","1,156.7 kg",POH Sec 1
Max Landing Weight (MLW),"2,550 lbs","1,156.7 kg",POH Sec 1
Max Ramp Weight,"2,558 lbs","1,160.3 kg",POH Sec 1  
Utility Category MTOW,"2,100 lbs",952.5 kg,POH Fig 6-7 2  
Fuel Capacity (Usable),40 gallons,151.4 litres,POH Fig 6-5 1  
*\\\*Note: The user-provided index was 72.64 (x1000). The full moment 72,640 is used for calculation precision.*

### 2\. Loading Stations & Arms

Arms are measured in inches aft of the datum (firewall).  
Station,Arm (Imperial),Arm (Metric),Max Weight,Notes  
Pilot & Front Pax,"37.0""",940 mm,400 lbs\*,Stn 34-46 1  
Rear Passengers,"73.0""","1,854 mm",400 lbs\*,1  
Baggage Area 1,"95.0""","2,413 mm",120 lbs,Stn 82-108 1  
Baggage Area 2,"123.0""","3,124 mm",50 lbs,Stn 108-142 1  
Fuel (Standard),"48.0""","1,219 mm",-,1  
**Notes:**

* **Baggage:** Maximum combined weight for Area 1 \+ Area 2 is **120 lbs** 1\.  
* **Rear Pax Arm:** The POH sample problem uses a moment index that implies an arm of \~72.9". Standard practice for the C172S uses **73.0"**.  
* **Fuel Arm:** The POH sample uses an arm of \~47.9". Standard practice uses **48.0"**.

### 3\. CG Envelope Validation

The Center of Gravity limits are defined in POH Figure 6-7 2\.

#### Normal Category (Max 2,550 lbs)

* **Aft Limit:** **47.3 inches** (1,201.4 mm) at all weights.
* **Forward Limit:**
* **Weight ≤ 1,950 lbs:** **35.0 inches** (889 mm).
* **Weight \> 1,950 lbs:** Linearly increases to **41.0 inches** at 2,550 lbs.

**Forward Limit Formula (Normal Category):**For $Weight \> 1,950$:$$MinCG \= 35.0 \+ \\frac{(Weight \- 1950\) \\times (41.0 \- 35.0)}{(2550 \- 1950)}$$$$MinCG (in) \= 35.0 \+ 0.01 \\times (Weight \- 1950)$$

#### Utility Category (Max 2,100 lbs)

* **Aft Limit:** **40.5 inches** (1,028.7 mm).  
* **Forward Limit:** Same formula as Normal Category (35.0" to 36.5" at 2,100 lbs).  
* *Note: Utility category usually prohibits Rear Passengers and Baggage.*

### 4\. Core Calculations

#### Total Weight & Moment

$$Total Weight \= BEW \+ \\sum(Station Weights)$$$$Total Moment \= Empty Moment \+ \\sum(Weight\_{station} \\times Arm\_{station})$$

#### Center of Gravity

$$CG \= \\frac{Total Moment}{Total Weight}$$

#### %MAC (Mean Aerodynamic Chord) \- *Optional*

For Cessna 172:

* **LEMAC:** 35.0 inches (datum for wing leading edge usually aligns with the fwd CG limit box).  
* **Chord:** 58.0 inches (approximate).$$ \\%MAC \= \\frac{CG \- 35.0}{58.0} \\times 100$$

### 5\. Validation Rules

Check,Threshold,Severity,Reason  
MTOW,"\> 2,550 lbs",ERROR,Exceeds Structural Limit (POH Sec 1)
Landing Weight,"\> 2,550 lbs",ERROR,Exceeds Structural Limit (POH Sec 1)  
Baggage 1,\> 120 lbs,WARNING,Floor Loading Limit  
Baggage 2,\> 50 lbs,WARNING,Floor Loading Limit  
Total Baggage,\> 120 lbs,ERROR,Combined Limit (Area 1+2) 1  
CG Position,\< Fwd or \> Aft,ERROR,Unstable Flight Characteristics

### 6\. Sample Calculation (VH-KXW Specific)

This calculation uses the **Actual VH-KXW Data** provided, applied to the POH "Sample Loading Problem" profile 1\.  
**Scenario:**

* **Aircraft:** VH-KXW (BEW 1745.8 lbs)  
* **Pilot & Front Pax:** 340 lbs  
* **Rear Passengers:** 340 lbs  
* **Baggage Area 1:** 20 lbs  
* **Fuel:** 40 Gallons (Standard Full) \= 240 lbs  
* **Taxi Fuel:** \-7 lbs

**Step 1: Ramp Weight & Moment**  
Item,Weight (lbs),Arm (in),Moment (lb-in)  
VH-KXW Empty,"1,745.8",41.6,"72,640"  
Pilot & Front,340,37.0,"12,580"  
Rear Pax,340,73.0,"24,820"  
Baggage 1,20,95.0,"1,900"  
Fuel (40 gal),240,48.0,"11,520"  
RAMP TOTAL,"2,685.8",,"123,460"  
**Step 2: Takeoff Calculation**$$Takeoff Weight \= 2,685.8 \- 7 \= 2,678.8 \\text{ lbs}$$$$Takeoff Moment \= 123,460 \- (7 \\times 48\) \= 123,124 \\text{ lb-in}$$  
**Step 3: CG Calculation**$$CG \= \\frac{123,124}{2,678.8} \= 45.96 \\text{ inches}$$  
**Step 4: Validation Results**

* **Weight Check:** The Calculated Takeoff Weight (**2,678.8 lbs**) is **HIGHER** than the MTOW (**2,550 lbs**).
* **RESULT: OVERWEIGHT (ERROR)**
* *Analysis:* VH-KXW is significantly heavier (+128.8 lbs over MTOW) than the POH sample airplane (1467 lbs). It cannot carry full fuel and 4 adults legally.
* **CG Check:** At 2,678 lbs (hypothetically), the Aft Limit is 47.3".
* Calculated CG (45.96") is \< Aft Limit (47.3").
* **RESULT: CG WITHIN ENVELOPE (but Weight Invalid)**

**Corrected Load for Legal Flight (Example):**To fly this aircraft within limits, payload must be reduced.

* *Useful Load:* $2550 \- 1745.8 \= 804.2 \\text{ lbs}$.
* With Full Fuel (240 lbs), remaining payload for people/bags is **564.2 lbs**.
* *Practical Load:* Pilot (180) \+ Front Pax (180) \+ Rear Pax (150) \+ Bags (44) \+ Full Fuel \= 2540 lbs.

