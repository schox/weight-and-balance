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
  dateApproved: '01-Nov-11',        // From load data sheet
  workOrder: 'WB-5014'              // From load data sheet
};

// Second aircraft placeholder (for future expansion)
export const secondAircraft: Aircraft = {
  registration: 'VH-XXX',
  model: 'Aircraft 2',
  emptyWeightLbs: 1800,
  emptyCGMm: 914,                   // 36.0" converted to mm (36.0 * 25.4)
  maxTakeoffWeightLbs: 2800,
  maxLandingWeightLbs: 2700,
  maxRampWeightLbs: 2810,
  fuelCapacityGallons: 65,
  fuelCapacityLitres: 246.1,
  loadingStations: [], // To be defined later
  cgEnvelope: [],      // To be defined later
  dateApproved: 'TBD',
  workOrder: 'TBD'
};

// Aircraft database
export const aircraftDatabase: Record<string, Aircraft> = {
  'VH-YPB': vhYpbAircraft,
  'VH-XXX': secondAircraft
};

// Get aircraft by registration
export const getAircraft = (registration: string): Aircraft | undefined => {
  return aircraftDatabase[registration];
};

// Get all aircraft registrations
export const getAircraftList = (): string[] => {
  return Object.keys(aircraftDatabase);
};