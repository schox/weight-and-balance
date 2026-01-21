import type { Aircraft, LoadingStation, CGEnvelopePoint } from '@/types/aircraft';

// VH-YPB Cessna 182T Loading Stations
const vhYpbLoadingStations: LoadingStation[] = [
  {
    id: 'pilot',
    name: 'Pilot',
    armMm: 940,                 // 37" converted to mm (37 * 25.4)
    maxWeightLbs: 400,          // Reasonable pilot weight limit
    isRequired: true,
    category: 'pilot'
  },
  {
    id: 'frontPassenger',
    name: 'Front Passenger',
    armMm: 940,                 // Same as pilot (front seats)
    maxWeightLbs: 400,
    isRequired: false,
    category: 'passenger'
  },
  {
    id: 'rearPassenger1',
    name: 'Rear Passenger 1',
    armMm: 1880,                // 74" converted to mm (74 * 25.4)
    maxWeightLbs: 400,
    isRequired: false,
    category: 'passenger'
  },
  {
    id: 'rearPassenger2',
    name: 'Rear Passenger 2',
    armMm: 1880,                // Same as rear passenger 1
    maxWeightLbs: 400,
    isRequired: false,
    category: 'passenger'
  },
  {
    id: 'baggageA',
    name: 'Baggage Area A',
    armMm: 2464,                // 97" converted to mm (97 * 25.4)
    maxWeightLbs: 120,          // From sample loading problem
    isRequired: false,
    category: 'baggage'
  },
  {
    id: 'baggageB',
    name: 'Baggage Area B',
    armMm: 2946,                // 116" converted to mm (116 * 25.4)
    maxWeightLbs: 80,           // From sample loading problem
    isRequired: false,
    category: 'baggage'
  },
  {
    id: 'baggageC',
    name: 'Baggage Area C',
    armMm: 3277,                // 129" converted to mm (129 * 25.4)
    maxWeightLbs: 80,           // From sample loading problem
    isRequired: false,
    category: 'baggage'
  },
  {
    id: 'fuelLeft',
    name: 'Fuel - Left Wing',
    armMm: 1181,                // 46.5" converted to mm (46.5 * 25.4)
    maxWeightLbs: 261,          // ~43.5 gallons per tank * 6 lbs/gal (87 gal total / 2 tanks)
    isRequired: false,
    category: 'fuel'
  },
  {
    id: 'fuelRight',
    name: 'Fuel - Right Wing',
    armMm: 1181,                // Same as left wing
    maxWeightLbs: 261,          // ~43.5 gallons per tank * 6 lbs/gal (87 gal total / 2 tanks)
    isRequired: false,
    category: 'fuel'
  }
];

// CG Envelope points for VH-YPB (Normal Category)
// Based on Cessna 182T POH Figure 6-8 Center-of-Gravity Limits
// POH specs:
//   - Forward limit: 33.0" constant for weights ≤ 2,250 lbs
//   - Forward limit: Linear taper from 33.0" at 2,250 lbs to 40.9" at 3,100 lbs
//   - Aft limit: 46.0" constant at all weights
//   - Minimum weight: 2,007 lbs (Basic Empty Weight)
// Tracing the envelope clockwise starting from bottom-left
const vhYpbCGEnvelope: CGEnvelopePoint[] = [
  // Bottom-left corner (empty weight, forward limit)
  { weight: 2007, cgPosition: 838.2 },   // 33.0" at BEW
  // Forward limit stays flat until 2,250 lbs (vertical line up)
  { weight: 2250, cgPosition: 838.2 },   // 33.0" at 2,250 lbs
  // Forward limit tapers linearly to MTOW (diagonal line up-right)
  { weight: 3100, cgPosition: 1038.86 }, // 40.9" at MTOW
  // Top-right (aft limit at MTOW)
  { weight: 3100, cgPosition: 1168.4 },  // 46.0"
  // Bottom-right (aft limit at BEW - vertical line down)
  { weight: 2007, cgPosition: 1168.4 },  // 46.0"
  // Close polygon back to start
  { weight: 2007, cgPosition: 838.2 },   // 33.0"
];

// VH-YPB Aircraft Definition
export const vhYpbAircraft: Aircraft = {
  registration: 'VH-YPB',
  model: 'Cessna 182T NAV III',
  emptyWeightLbs: 2007.0,           // From load data sheet
  emptyCGMm: 975,                   // 38.4" converted to mm (38.4 * 25.4)
  maxTakeoffWeightLbs: 3100,        // From POH Figure 6-8
  maxLandingWeightLbs: 2950,        // From POH Figure 6-8
  maxRampWeightLbs: 3110,           // From sample loading problem
  fuelCapacityGallons: 87,          // Maximum usable fuel
  fuelCapacityLitres: 329.3,        // 87 gallons converted to litres
  loadingStations: vhYpbLoadingStations,
  cgEnvelope: vhYpbCGEnvelope,
  defaultFuelBurnRateGPH: 14,       // Typical cruise fuel burn rate
  combinedBaggageLimitLbs: 200,     // Combined baggage limit for Areas A, B, and C
  dateApproved: '01-Nov-11',        // From load data sheet
  workOrder: 'WB-5014'              // From load data sheet
};

// VH-KXW Cessna 172P Loading Stations
const vhKxwLoadingStations: LoadingStation[] = [
  {
    id: 'pilot',
    name: 'Pilot',
    armMm: 940,                 // 37.0" converted to mm
    maxWeightLbs: 400,
    isRequired: true,
    category: 'pilot'
  },
  {
    id: 'frontPassenger',
    name: 'Front Passenger',
    armMm: 940,                 // Same as pilot (front seats)
    maxWeightLbs: 400,
    isRequired: false,
    category: 'passenger'
  },
  {
    id: 'rearPassenger1',
    name: 'Rear Passenger 1',
    armMm: 1854,                // 73.0" converted to mm
    maxWeightLbs: 400,
    isRequired: false,
    category: 'passenger'
  },
  {
    id: 'rearPassenger2',
    name: 'Rear Passenger 2',
    armMm: 1854,                // Same as rear passenger 1
    maxWeightLbs: 400,
    isRequired: false,
    category: 'passenger'
  },
  {
    id: 'baggageA',
    name: 'Baggage Area 1',
    armMm: 2413,                // 95.0" converted to mm
    maxWeightLbs: 120,
    isRequired: false,
    category: 'baggage'
  },
  {
    id: 'baggageB',
    name: 'Baggage Area 2',
    armMm: 3124,                // 123.0" converted to mm
    maxWeightLbs: 50,
    isRequired: false,
    category: 'baggage'
  },
  // Note: No baggageC for KXW (only 2 baggage areas)
  {
    id: 'fuelLeft',
    name: 'Fuel - Left Tank',
    armMm: 1219,                // 48.0" converted to mm
    maxWeightLbs: 159,          // ~26.5 gallons * 6 lbs/gal
    isRequired: false,
    category: 'fuel'
  },
  {
    id: 'fuelRight',
    name: 'Fuel - Right Tank',
    armMm: 1219,                // Same as left tank
    maxWeightLbs: 159,          // ~26.5 gallons * 6 lbs/gal
    isRequired: false,
    category: 'fuel'
  }
];

// CG Envelope points for VH-KXW (Normal Category)
// Based on Cessna 172P POH
// POH specs:
//   - Forward limit: 35.0" constant for weights ≤ 1,950 lbs
//   - Forward limit: Linear taper from 35.0" at 1,950 lbs to 39.5" at 2,400 lbs
//   - Aft limit: 47.3" constant at all weights
//   - Minimum weight: 1,746 lbs (Basic Empty Weight)
// Tracing the envelope clockwise starting from bottom-left
const vhKxwCGEnvelope: CGEnvelopePoint[] = [
  // Bottom-left corner (empty weight, forward limit)
  { weight: 1746, cgPosition: 889 },     // 35.0" at BEW
  // Forward limit stays flat until 1,950 lbs (vertical line up)
  { weight: 1950, cgPosition: 889 },     // 35.0" at 1,950 lbs
  // Forward limit tapers linearly to MTOW (diagonal line up-right)
  { weight: 2400, cgPosition: 1003.3 },  // 39.5" at MTOW
  // Top-right (aft limit at MTOW)
  { weight: 2400, cgPosition: 1201.4 },  // 47.3"
  // Bottom-right (aft limit at BEW - vertical line down)
  { weight: 1746, cgPosition: 1201.4 },  // 47.3"
  // Close polygon back to start
  { weight: 1746, cgPosition: 889 },     // 35.0"
];

// VH-KXW Aircraft Definition
export const vhKxwAircraft: Aircraft = {
  registration: 'VH-KXW',
  model: 'Cessna 172P',
  emptyWeightLbs: 1745.8,
  emptyCGMm: 1057,                   // 41.6" converted to mm
  maxTakeoffWeightLbs: 2400,
  maxLandingWeightLbs: 2400,
  maxRampWeightLbs: 2410,            // Typical +10 lbs for taxi
  fuelCapacityGallons: 53,           // ~53 gallons usable (26.5 per tank)
  fuelCapacityLitres: 200.6,         // 53 gallons converted to litres
  loadingStations: vhKxwLoadingStations,
  cgEnvelope: vhKxwCGEnvelope,
  defaultFuelBurnRateGPH: 9,
  combinedBaggageLimitLbs: 120,      // Different from YPB's 200 lbs
  dateApproved: 'TBD',
  workOrder: 'TBD'
};

// Aircraft database
export const aircraftDatabase: Record<string, Aircraft> = {
  'VH-YPB': vhYpbAircraft,
  'VH-KXW': vhKxwAircraft
};

// Get aircraft by registration
export const getAircraft = (registration: string): Aircraft | undefined => {
  return aircraftDatabase[registration];
};

// Get all aircraft registrations
export const getAircraftList = (): string[] => {
  return Object.keys(aircraftDatabase);
};