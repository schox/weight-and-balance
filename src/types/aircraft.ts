// Units for measurements
export type WeightUnit = 'lbs' | 'kg';
export type FuelUnit = 'litres' | 'gallons';
export type DistanceUnit = 'inches' | 'mm';

// Settings interface
export interface Settings {
  fuelUnits: FuelUnit;
  weightUnits: WeightUnit;
  distanceUnits: DistanceUnit;
}

// Loading station definitions
export interface LoadingStation {
  id: string;
  name: string;
  armMm: number;              // CG arm in mm from datum
  maxWeightLbs: number;       // Maximum weight for this station
  isRequired: boolean;        // Whether this station must have weight (e.g., pilot)
  category: 'pilot' | 'passenger' | 'baggage' | 'fuel';
}

// CG envelope point for plotting limits
export interface CGEnvelopePoint {
  weight: number;             // Weight in lbs
  cgPosition: number;         // CG position in mm aft of datum
}

// Aircraft specifications
export interface Aircraft {
  registration: string;
  model: string;
  emptyWeightLbs: number;
  emptyCGMm: number;          // Empty CG in mm aft of datum
  maxTakeoffWeightLbs: number;
  maxLandingWeightLbs: number;
  maxRampWeightLbs: number;
  fuelCapacityGallons: number;
  fuelCapacityLitres: number;
  loadingStations: LoadingStation[];
  cgEnvelope: CGEnvelopePoint[];
  // Additional specs from POH
  dateApproved: string;
  workOrder: string;
}

// Loading state for weight and balance calculations
export interface LoadingState {
  pilot: number;
  frontPassenger: number;
  rearPassenger1: number;
  rearPassenger2: number;
  baggageA: number;
  baggageB: number;
  baggageC: number;
  fuelLeft: number;          // In current fuel units (litres or gallons)
  fuelRight: number;         // In current fuel units (litres or gallons)

  // Computed values (automatically calculated)
  totalWeightLbs: number;
  cgPositionMm: number;
  momentInKgMm: number;
  isWithinWeightLimits: boolean;
  isWithinCGLimits: boolean;
  marginToMTOW: number;      // Pounds remaining to MTOW
}

// Actions for useReducer to manage loading state
export type LoadingAction =
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
  | { type: 'CONVERT_FUEL_UNITS'; payload: FuelUnit };

// Animation state for flight simulation
export interface AnimationState {
  isPlaying: boolean;
  currentTimeMinutes: number;
  totalDurationMinutes: number;
  fuelBurnRatePerHour: number;  // In current fuel units
  playbackSpeed: number;        // 1x, 2x, 5x, 10x
}

// Calculation result for display
export interface CalculationResult {
  isValid: boolean;
  totalWeight: number;
  cgPosition: number;
  percentMAC: number;           // Percentage of Mean Aerodynamic Chord
  withinEnvelope: boolean;
  weightMargin: number;         // Pounds to MTOW
  cgMargin: {
    forward: number;            // mm to forward limit
    aft: number;                // mm to aft limit
  };
  warnings: string[];
  errors: string[];
}

// Fuel conversion utilities interface
export interface FuelConversion {
  gallonsToLitres: (gallons: number) => number;
  litresToGallons: (litres: number) => number;
  gallonsToWeightLbs: (gallons: number) => number;
  litresToWeightLbs: (litres: number) => number;
}