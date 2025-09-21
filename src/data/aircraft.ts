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
    maxWeightLbs: 522,          // 87 gallons * 6 lbs/gal
    isRequired: false,
    category: 'fuel'
  },
  {
    id: 'fuelRight',
    name: 'Fuel - Right Wing',
    armMm: 1181,                // Same as left wing
    maxWeightLbs: 522,          // 87 gallons * 6 lbs/gal
    isRequired: false,
    category: 'fuel'
  }
];

// CG Envelope points for VH-YPB (Normal Category)
// These would need to be extracted from the actual envelope graph in the POH
// For now, using representative values based on typical C182T envelope
const vhYpbCGEnvelope: CGEnvelopePoint[] = [
  // Forward limit line
  { weight: 2100, cgPosition: 889 },   // 35.0" converted to mm (35.0 * 25.4)
  { weight: 2950, cgPosition: 970 },   // 38.2" converted to mm (38.2 * 25.4)
  { weight: 3100, cgPosition: 1029 },  // 40.5" converted to mm (40.5 * 25.4)

  // Aft limit line
  { weight: 2100, cgPosition: 1201 },  // 47.3" converted to mm (47.3 * 25.4)
  { weight: 2950, cgPosition: 1201 },  // 47.3" converted to mm (47.3 * 25.4)
  { weight: 3100, cgPosition: 1201 }   // 47.3" converted to mm (47.3 * 25.4)
];

// VH-YPB Aircraft Definition
export const vhYpbAircraft: Aircraft = {
  registration: 'VH-YPB',
  model: 'Cessna 182T NAV III',
  emptyWeightLbs: 2007.0,           // From load data sheet
  emptyCGMm: 975,                   // 38.4" converted to mm (38.4 * 25.4)
  maxTakeoffWeightLbs: 3100,        // From envelope graph
  maxLandingWeightLbs: 2950,        // From envelope graph
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