# Product Requirements Document (PRD)
# Aircraft Weight & Balance Calculator

## 1. Executive Summary

### Product Overview
A single-page responsive React application for calculating weight and balance for aircraft operations. The app will support multiple aircraft (initially two) and provide real-time visual feedback on center of gravity (CG) position and weight limits.

### Purpose
Pilots must ensure their aircraft is loaded within safe weight and balance limits before every flight. This tool streamlines the calculation process and provides clear visual confirmation of safe loading conditions.

### Target Users
- Private pilots
- Flight instructors
- Flight schools (Camden Flying Club)
- Aircraft operators

## 2. Core Features

### 2.1 Aircraft Selection
- **Tab-based Interface**: Two tabs, one for each aircraft
- **Aircraft Information**:
  - Display aircraft registration and model
  - Info icon revealing detailed specifications:
    - Empty weight and CG
    - Maximum weights (ramp, takeoff, landing)
    - Fuel capacity
    - Baggage limits
    - Equipment list summary

### 2.2 Weight Input Section
**Card/Tile-based Interface:**
Each weight station displayed as an interactive card/tile with:
- Icon representing the position (pilot, passenger, baggage, fuel)
- Input field with +/- buttons for fine adjustment
- Visual weight indicator bar
- Running total contribution to overall weight

**Weight Station Tiles:**
- **Pilot** (Front Left Seat)
  - Weight input with common presets
  - Required field indicator
- **Front Passenger** (Front Right Seat)
  - Weight input
  - Optional field
- **Rear Passenger 1** (Rear Left)
  - Weight input
  - Optional field
- **Rear Passenger 2** (Rear Right)
  - Weight input
  - Optional field
- **Baggage Area A** (Forward compartment)
  - Weight input
  - Max 120 lbs indicator
- **Baggage Area B** (Middle compartment)
  - Weight input
  - Max 80 lbs indicator
- **Baggage Area C** (Aft compartment)
  - Weight input
  - Max 80 lbs indicator
- **Fuel - Left Wing**
  - Gallons/Liters input
  - Visual tank gauge
  - Auto-calculation to weight
- **Fuel - Right Wing**
  - Gallons/Liters input (based on settings)
  - Visual tank gauge
  - Auto-calculation to weight
  - Sync with left wing option

### 2.3 Settings Dialog
**Triggered by:** Settings icon (⚙️) in header
**Modal Dialog containing:**
- **Fuel Units Selection**:
  - Radio buttons: "Litres" (default) / "US Gallons"
  - Immediate conversion of existing fuel values
  - Update all fuel-related labels and inputs
- **Future Settings** (placeholder for expansion):
  - Weight units (lbs/kg)
  - Distance units (inches/mm)
  - Default fuel burn rates
- **Dialog Actions**:
  - Close button (×)
  - Apply/Save button
  - Cancel to revert changes

### 2.4 Calculation Engine
- Real-time weight and moment calculations
- CG position calculation
- Automatic validation against limits
- Clear pass/fail indicators

### 2.5 Visual Representation

**Dynamic Weight Display Panel**
- **Three Key Metrics** (always visible):
  - **BEW (Basic Empty Weight)**: Static display of aircraft empty weight
  - **Current Loaded Weight**: Dynamic real-time update as weights are added
  - **MTOW (Maximum Takeoff Weight)**: Limit indicator with margin remaining
- **Visual Progress Bar**:
  - Gradient bar showing weight progression
  - Green zone (safe), Yellow zone (approaching limits), Red zone (exceeded)
  - Animated fill effect as weight changes
  - Percentage indicator

**CG Envelope Graph (Primary Visualization)**
- **Interactive Chart Features**:
  - CG envelope boundaries (forward and aft limits)
  - Current loading point with real-time movement
  - Weight vs. CG position plot
  - Multiple zones: Normal, Utility, and Aerobatic (if applicable)
  - Hover tooltips showing exact values
  - Animated point movement when values change
- **Visual Design**:
  - Grid background with proper scales
  - Safe zone in subtle green tint
  - Current position as pulsing dot
  - Trajectory line showing CG movement during flight

**Aircraft Side-View Diagram**
- **Interactive Schematic**:
  - Side profile of aircraft showing load stations
  - Visual representation of weight at each position
  - CG position indicator line
  - Datum reference point
  - Animated weight "blocks" that grow/shrink with input
- **Heat Map Option**:
  - Color intensity showing weight concentration
  - Real-time updates as loading changes

**Tabular Data View (Calculation Breakdown)**
- **Detailed Calculation Table**:
  - Item-by-item breakdown of all loading stations
  - Columns: Item, Weight, Arm (inches/mm from datum), Moment
  - Rows for: Pilot, Front Passenger, Rear Passengers, Baggage Areas, Fuel Tanks
  - Total summations row with calculated CG position
  - Weight unit conversions displayed where applicable
- **Professional Format**:
  - Clean table styling with alternating row colors
  - Bold totals row for emphasis
  - Export-ready formatting for official documentation
  - Real-time updates as inputs change
- **Educational Value**:
  - Shows the mathematical foundation behind the calculations
  - Helps users understand moment calculations
  - Useful for training and verification purposes

### 2.6 Flight Animation

**Animation Concepts:**

**Option 1: Time-Lapse Visualization**
- **Flight Profile Timeline**:
  - Horizontal timeline showing flight phases (Taxi, Takeoff, Cruise, Landing)
  - Scrubber to move through flight time
  - Weight indicator decreasing along timeline
  - CG position tracker (secondary line)
- **Controls**:
  - Play/Pause button with smooth transitions
  - Speed control (1x, 2x, 5x, 10x)
  - Reset to beginning
  - Step forward/backward by 10-minute increments

**Option 2: Split-Screen Animation**
- **Left Panel**: CG Envelope graph with animated point
  - Point travels showing weight reduction
  - Trail effect showing path taken
  - Time indicator in corner
- **Right Panel**: Fuel gauge animation
  - Visual fuel tanks depleting
  - Digital readout of remaining fuel
  - Burn rate indicator

**Option 3: Dashboard View**
- **Flight Instrument Style**:
  - Circular gauge showing weight (like altimeter)
  - CG position indicator (like attitude indicator)
  - Fuel quantity gauges for each tank
  - Digital time elapsed display
- **Real-time Updates**:
  - Smooth needle movements
  - Color changes as limits approach
  - Warning lights for critical values

**Fuel Burn Inputs**:
- Fuel burn rate (adjustable during flight)
- Flight duration or waypoints
- Option for different burn rates in different phases
- Reserve fuel setting (triggers warning)

### 2.7 Results Display
**Summary Panel showing:**
- Gross weight
- CG position (inches/mm from datum)
- % of MAC (Mean Aerodynamic Chord)
- Weight below MTOW
- Status indicators (green checkmarks or red warnings)

## 3. Technical Specifications

### 3.1 Technology Stack
- **Frontend**: React 18+ with TypeScript
- **UI Components**: shadcn/ui (built on Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Recharts for visualizations
- **State Management**: React useState + useReducer (simple state, no external library needed)
- **Build Tool**: Create React App or Vite (whichever is preferred)
- **Deployment**: Vercel

### 3.2 Responsive Design
- Mobile-first approach
- Breakpoints:
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px+
- Touch-optimized inputs for mobile

### 3.3 Data Storage
- **No Persistent Storage**: All data resets on page refresh
- **Session-only State**: User preferences and calculations maintained during browser session
- **Future Enhancement**: Local storage for user preferences and saved calculations
- **No Backend Required**: Pure client-side application

## 4. User Interface Design

### 4.1 Design Principles
- **Clarity**: Clear visual hierarchy
- **Safety**: Prominent warnings for out-of-limits conditions
- **Efficiency**: Minimal clicks to complete calculation
- **Feedback**: Immediate visual response to inputs

### 4.2 Color Scheme
- **Primary**: Aviation blue (#003366)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Danger**: Red (#EF4444)
- **Background**: Light gray/white gradient

### 4.3 Typography
- Headers: Inter or Roboto (sans-serif)
- Body: System fonts for performance
- Monospace for numerical displays

### 4.4 Component Layout

**Desktop Layout (1024px+)**
```
┌────────────────────────────────────────────────────────┐
│  Aircraft Weight & Balance Calculator    [?] Help ⚙ │
├────────────────────────────────────────────────────────┤
│  [✈ VH-YPB C182T] [✈ Aircraft 2]                     │
├────────────────────────────────────────────────────────┤
│  BEW: 2007 lbs | Current: 2547 lbs | MTOW: 3100 lbs  │
│  [████████████████░░░░░░░] 82% of MTOW                │
├────────────────────────────────────────────────────────┤
│ ┌─── Loading Stations ───┐ ┌─── Visualizations ────┐  │
│ │ ┌─────────┐ ┌─────────┐│ │                       │  │
│ │ │👨‍✈️ Pilot │ │👤 Front  ││ │    CG Envelope       │  │
│ │ │ 180 lbs │ │ 150 lbs ││ │    Graph with        │  │
│ │ └─────────┘ └─────────┘│ │    Live Point        │  │
│ │ ┌─────────┐ ┌─────────┐│ │                       │  │
│ │ │👤 Rear 1 │ │👤 Rear 2 ││ ├───────────────────────┤  │
│ │ │  0 lbs  │ │  0 lbs  ││ │                       │  │
│ │ └─────────┘ └─────────┘│ │   Aircraft Diagram   │  │
│ │ ┌───────────────────┐  │ │   with Load Visual   │  │
│ │ │🎒 Baggage A: 20   │  │ │                       │  │
│ │ │🎒 Baggage B: 0    │  │ ├───────────────────────┤  │
│ │ │🎒 Baggage C: 0    │  │ │   Flight Animation   │  │
│ │ └───────────────────┘  │ │   [▶] Play  ⏱ 2.5hr │  │
│ │ ┌───────────────────┐  │ │   Fuel Burn: 12 gph │  │
│ │ │⛽ Fuel: 60 gal    │  │ └───────────────────────┘  │
│ │ │ [L: 30] [R: 30]   │  │                            │
│ │ └───────────────────┘  │                            │
│ └─────────────────────────┘                            │
└────────────────────────────────────────────────────────┘
```

**Mobile Layout (320px - 768px)**
```
┌─────────────────┐
│ W&B Calculator  │
├─────────────────┤
│ [VH-YPB] [AC 2] │
├─────────────────┤
│ Weight: 2547/   │
│ 3100 lbs [82%]  │
├─────────────────┤
│ ┌─────────────┐ │
│ │ CG Status:  │ │
│ │ ✅ SAFE     │ │
│ └─────────────┘ │
├─────────────────┤
│ Loading Tiles:  │
│ [Expandable     │
│  Accordion]     │
├─────────────────┤
│ [View Graph]    │
│ [Animation]     │
└─────────────────┘
```

## 5. User Stories

### 5.1 Pre-flight Planning
"As a pilot, I want to quickly check if my passenger and baggage loading is within limits so I can ensure a safe flight."

### 5.2 Fuel Planning
"As a pilot, I want to see how my CG changes during flight as fuel burns so I can ensure I remain within limits throughout."

### 5.3 Training
"As a flight instructor, I want to demonstrate weight and balance concepts visually so students understand the importance."

### 5.4 What-if Scenarios
"As a pilot, I want to test different loading configurations so I can optimize passenger and baggage placement."

## 6. Additional Features (Future Enhancements)

### 6.1 Phase 2
- **Multiple Aircraft Profiles**: Add/edit custom aircraft
- **Save Calculations**: Named scenarios for common loadings
- **Print/PDF Export**: Generate official W&B documentation
- **Weather Integration**: Density altitude considerations

### 6.2 Phase 3
- **Multi-leg Flights**: Calculate W&B for each segment
- **Performance Integration**: Takeoff/landing distance calculations
- **Cloud Sync**: Share profiles across devices
- **Instructor Mode**: Review student calculations

## 7. Success Metrics

### 7.1 Usability
- Time to complete calculation: < 30 seconds
- Error rate: < 1%
- Mobile responsiveness: 100% features available

### 7.2 Accuracy
- Calculation accuracy: Within 0.1% of manual calculation
- Visual representation accuracy: Pixel-perfect CG placement

### 7.3 Performance
- Initial load time: < 2 seconds
- Calculation update: < 100ms
- Animation frame rate: 60 fps

## 8. Constraints & Assumptions

### 8.1 Constraints
- No internet connection required for core functionality
- Must work on devices 5+ years old
- Must comply with aviation calculation standards

### 8.2 Assumptions
- Users understand basic weight and balance concepts
- Aircraft data is accurate and up-to-date
- Standard atmospheric conditions unless specified

## 9. Risk Mitigation

### 9.1 Data Accuracy
- Display clear disclaimer about pilot responsibility
- Show source/date of aircraft data
- Provide manual verification instructions

### 9.2 User Errors
- Input validation and range checking
- Clear unit labels
- Confirmation for unusual values

## 10. Launch Strategy

### 10.1 MVP (Version 1.0)
- Two aircraft (VH-YPB Cessna 182T)
- Basic weight and balance calculation
- CG envelope graph
- Responsive design

### 10.2 Version 1.1
- Animation feature
- Local storage
- Print functionality

### 10.3 Version 2.0
- Additional aircraft
- Custom profiles
- Advanced features

## 11. Appendix

### 11.1 Aircraft Specifications

#### VH-YPB Cessna 182T
- Empty Weight: 910.38 kg (2007.0 lbs)
- Empty CG: 975 mm (38.4 inches)
- MTOW: 1406 kg (3100 lbs)
- Max Landing: 1338 kg (2950 lbs)
- Fuel Capacity: 87 gallons usable
- Baggage Areas: A (120 lbs), B (80 lbs), C (80 lbs)

### 11.2 Regulatory Compliance
- Calculations conform to CASA regulations
- Display appropriate disclaimers
- Not for primary navigation or flight planning

### 11.3 Glossary
- **CG**: Center of Gravity
- **MAC**: Mean Aerodynamic Chord
- **MTOW**: Maximum Takeoff Weight
- **Datum**: Reference point for measurements
- **Moment**: Weight × Arm
- **Envelope**: Safe operating limits graph

---

*Document Version: 1.0*
*Date: 2025-01-21*
*Status: Draft for Review*