# Visualization & Animation Concepts
## Aircraft Weight & Balance Calculator

## 1. Recommended Primary Visualization

### CG Envelope Graph with Live Updates
This is the industry-standard visualization that pilots are familiar with:

```
     Weight (lbs)
     3200 ┤
          │     ╱────────╲    <- Maximum Takeoff Weight
     3000 ┤    ╱          ╲
          │   ╱   NORMAL   ╲
     2800 ┤  ╱   CATEGORY   ╲
          │ ╱                 ╲
     2600 ┤╱      ● Current    ╲
          │        Position     ╲
     2400 ┤                      ╲
          │  📍 Takeoff           ╲
     2200 ┤  📍 Landing (projected)╲
          │                         ╲
     2000 ┤─────────────────────────╲
          └─────────────────────────────
           32  34  36  38  40  42  44  46  48
                    CG Position (inches aft of datum)
```

**Key Features:**
- Real-time position update as weights are entered
- Color-coded zones (green = safe, yellow = caution, red = exceeded)
- Animated transition when values change
- Show both takeoff and projected landing positions
- Hover tooltip with exact values

## 2. Supporting Visualizations

### A. Weight Distribution Bar
A stacked horizontal bar showing weight breakdown:

```
┌──────────────────────────────────────────┐
│ Empty │ Pilot │ Pax │ Bags │    Fuel     │
│ 2007  │  180  │ 150 │  20  │     360     │ = 2717 lbs
└──────────────────────────────────────────┘
         ↑                            ↑
    People: 330 lbs            Margin: 383 lbs
```

### B. Aircraft Side Profile
Interactive diagram showing load positions:

```
         ┌─────┐
         │ A │ B│C    Baggage Areas
    ╱────┴──┴──┴──╲
   ╱ ●●        ●● ╲   <- Fuel Tanks
  ╱  ▓▓   CG   ▓▓  ╲
 ╱   Front  |  Rear ╲
└────────────┴───────┘
     ↑             ↑
   Pilot/Pax    Rear Pax
```

## 3. Animation Recommendations

### Option A: Timeline Scrubber (Recommended)
**Best for:** Understanding weight/CG changes during flight

```
Flight Progress Timeline
[Taxi]──[Takeoff]──────[Cruise]──────[Descent]──[Land]
  0min    5min         1hr          2hr        2.5hr

  ━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━
           45min

Weight: 2717 → 2465 lbs (252 lbs fuel burned)
CG: 38.4 → 38.6 inches (minimal change)
```

**Implementation:**
- Smooth scrubbing with touch/mouse drag
- Play button for automatic progression
- Speed controls (1x, 2x, 5x, 10x)
- Pause at any point to examine values

### Option B: Dual Gauge Display
**Best for:** Pilot familiarity (looks like cockpit instruments)

```
    ┌─────────┐     ┌─────────┐
    │   2717  │     │ CG 38.4 │
    │ ╱─────╲ │     │ ╱─────╲ │
    │╱   ●   ╲│     │╱   ●   ╲│
    │└───┴───┘│     │└───┴───┘│
    │ WEIGHT  │     │ BALANCE │
    └─────────┘     └─────────┘
```

## 4. Mobile-Specific Considerations

### Collapsible Tiles for Input
Each loading position as a card that expands:

```
┌────────────────┐
│ 👨‍✈️ Pilot   ▼ │  <- Collapsed
├────────────────┤
│ 180 lbs        │
└────────────────┘

┌────────────────┐
│ 👨‍✈️ Pilot   ▲ │  <- Expanded
├────────────────┤
│ Weight: 180    │
│ [−][───────][+]│
│ Common: [150]  │
│        [170]   │
│        [190]   │
└────────────────┘
```

### Swipeable Views
- Swipe left/right between Input and Visualization
- Swipe up for detailed results
- Pinch to zoom on graphs

## 5. Interactive Elements

### Smart Suggestions
- "Add 20 lbs to baggage area B to optimize CG"
- "Fuel imbalance detected - consider balancing tanks"
- "Within 5% of MTOW - review loading"

### Preset Scenarios
Quick-load buttons for common configurations:
- "Solo Flight" (pilot only + full fuel)
- "Training Flight" (2 pilots + half fuel)
- "Cross Country" (4 people + baggage + fuel)
- "Maximum Payload" (optimize for cargo)

## 6. Animation Technical Details

### Smooth Transitions
- Use CSS transitions for weight changes (300ms ease-out)
- RequestAnimationFrame for flight animations
- Spring physics for CG point movement
- Particle effects for fuel burn visualization

### Performance Optimization
- Throttle calculations to max 60fps
- Use React.memo for static components
- Virtual scrolling for long flight animations
- Canvas for complex visualizations (better than SVG for animations)

## 7. Color Palette for Visualizations

```css
/* Safety Colors */
--safe-green: #10B981;
--caution-yellow: #F59E0B;
--danger-red: #EF4444;

/* Data Visualization */
--pilot: #3B82F6;        /* Blue */
--passenger: #8B5CF6;    /* Purple */
--baggage: #F97316;      /* Orange */
--fuel: #22C55E;         /* Green */
--empty-weight: #6B7280; /* Gray */

/* Backgrounds */
--envelope-fill: rgba(59, 130, 246, 0.1);
--grid-lines: #E5E7EB;
```

## 8. Recommended Libraries

### For Visualizations:
- **Recharts**: Best for the CG envelope graph (good React integration)
- **Framer Motion**: For smooth animations and transitions
- **React Spring**: Alternative for physics-based animations

### For Mobile:
- **React Swipeable**: For swipe gestures
- **Hammer.js**: For pinch/zoom on graphs

## 9. Accessibility Considerations

- Provide text alternatives for all visual information
- Keyboard navigation for all controls
- High contrast mode support
- Screen reader announcements for value changes
- Option to disable animations

## 10. Export/Sharing Features

### Visual Reports
- Generate PDF with graph snapshot
- Share image of CG envelope with loading
- Export animation as GIF/video
- QR code for sharing configuration

This combination of visualizations provides both the professional tools pilots expect and modern UX enhancements for better usability.