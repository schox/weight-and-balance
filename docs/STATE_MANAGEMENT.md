# State Management Plan
## Aircraft Weight & Balance Calculator

## Approach: React Built-in State (useState + useReducer)

Given the simplicity of this application, we'll use React's built-in state management without external libraries. This keeps the bundle size small and reduces complexity.

## State Structure

### 1. App-Level State (useState)
```typescript
// App.tsx - Top level state
const [currentAircraft, setCurrentAircraft] = useState<string>('VH-YPB');
const [settings, setSettings] = useState<Settings>({
  fuelUnits: 'litres', // 'litres' | 'gallons'
  showHelp: false
});
```

### 2. Aircraft Loading State (useReducer)
```typescript
// For each aircraft tab - managed by useReducer for complex state updates
interface LoadingState {
  pilot: number;
  frontPassenger: number;
  rearPassenger1: number;
  rearPassenger2: number;
  baggageA: number;
  baggageB: number;
  baggageC: number;
  fuelLeft: number;
  fuelRight: number;
  // Computed values
  totalWeight: number;
  cgPosition: number;
  isWithinLimits: boolean;
}

type LoadingAction =
  | { type: 'UPDATE_PILOT'; payload: number }
  | { type: 'UPDATE_FRONT_PASSENGER'; payload: number }
  | { type: 'UPDATE_REAR_PASSENGER_1'; payload: number }
  | { type: 'UPDATE_REAR_PASSENGER_2'; payload: number }
  | { type: 'UPDATE_BAGGAGE_A'; payload: number }
  | { type: 'UPDATE_BAGGAGE_B'; payload: number }
  | { type: 'UPDATE_BAGGAGE_C'; payload: number }
  | { type: 'UPDATE_FUEL_LEFT'; payload: number }
  | { type: 'UPDATE_FUEL_RIGHT'; payload: number }
  | { type: 'SYNC_FUEL_TANKS' }
  | { type: 'RESET_ALL' }
  | { type: 'CONVERT_FUEL_UNITS'; payload: 'litres' | 'gallons' };
```

### 3. Animation State (useState)
```typescript
// Animation controls
const [animationState, setAnimationState] = useState<{
  isPlaying: boolean;
  currentTime: number; // minutes into flight
  totalDuration: number;
  fuelBurnRate: number;
  speed: number; // 1x, 2x, 5x, 10x
}>({
  isPlaying: false,
  currentTime: 0,
  totalDuration: 150, // 2.5 hours default
  fuelBurnRate: 12, // gph
  speed: 1
});
```

## Component State Distribution

### App.tsx (Root Component)
- Current aircraft selection
- Global settings (fuel units)
- Settings dialog state

### AircraftTab.tsx
- Loading state (via useReducer)
- Calculated values (weight, CG, limits)

### WeightTile.tsx (Individual input tiles)
- Local input state for smooth UX
- Debounced updates to parent state

### AnimationPanel.tsx
- Animation playback state
- Timeline scrubber position

### SettingsDialog.tsx
- Local form state
- Temporary settings before save/cancel

## Benefits of This Approach

### 1. **Simplicity**
- No external dependencies
- Familiar React patterns
- Easy to debug and understand

### 2. **Performance**
- Minimal re-renders with proper component structure
- React.memo for optimization where needed
- No unnecessary state normalization

### 3. **Type Safety**
- Full TypeScript support
- Compile-time error checking
- IntelliSense support

### 4. **Maintainability**
- Clear state boundaries
- Easy to add new features
- Simple testing with React Testing Library

## Data Flow Example

```
User Input (Pilot Weight: 180 lbs)
    ↓
WeightTile dispatches action
    ↓
useReducer updates loading state
    ↓
Calculations run automatically
    ↓
UI updates with new weight/CG values
    ↓
Charts re-render with new position
```

## Conversion Utilities

```typescript
// utils/conversions.ts
export const convertFuel = {
  gallonsToLitres: (gallons: number) => gallons * 3.78541,
  litresToGallons: (litres: number) => litres / 3.78541,
  gallonsToWeight: (gallons: number) => gallons * 6, // lbs
  litresToWeight: (litres: number) => litres * 0.72 * 2.20462 // kg to lbs
};

export const convertUnits = {
  lbsToKg: (lbs: number) => lbs / 2.20462,
  kgToLbs: (kg: number) => kg * 2.20462,
  inchesToMm: (inches: number) => inches * 25.4,
  mmToInches: (mm: number) => mm / 25.4
};
```

## Error Handling

### Input Validation
```typescript
const validateInput = (value: number, max: number, fieldName: string) => {
  if (value < 0) return { error: `${fieldName} cannot be negative` };
  if (value > max) return { error: `${fieldName} exceeds maximum of ${max}` };
  return { error: null };
};
```

### State Recovery
```typescript
// Reset to safe defaults if invalid state detected
const safeDefaults: LoadingState = {
  pilot: 0,
  frontPassenger: 0,
  rearPassenger1: 0,
  rearPassenger2: 0,
  baggageA: 0,
  baggageB: 0,
  baggageC: 0,
  fuelLeft: 0,
  fuelRight: 0,
  totalWeight: AIRCRAFT_DATA.emptyWeight,
  cgPosition: AIRCRAFT_DATA.emptyCG,
  isWithinLimits: true
};
```

## Future Migration Path

If the app grows in complexity, we can easily migrate to:

1. **Context API**: For deeply nested components
2. **Zustand**: Lightweight state management
3. **Redux Toolkit**: For complex state relationships
4. **Local Storage**: For persistent state

The current structure makes this migration straightforward without major refactoring.

## Performance Considerations

### Debouncing Input Updates
```typescript
// Custom hook for debounced state updates
const useDebouncedValue = (value: number, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

### Memoization
```typescript
// Expensive calculations memoized
const calculatedValues = useMemo(() => ({
  totalWeight: calculateTotalWeight(loadingState),
  cgPosition: calculateCG(loadingState),
  isWithinLimits: checkLimits(loadingState)
}), [loadingState]);
```

This approach provides a solid foundation that's easy to understand, maintain, and extend as the application grows.