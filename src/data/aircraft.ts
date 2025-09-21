import type { Aircraft, LoadingStation, CGEnvelopePoint } from '@/types/aircraft';

// VH-YPB Cessna 182T Loading Stations
const vhYpbLoadingStations: LoadingStation[] = [
  {
    id: 'pilot',
    name: 'Pilot',
    armInches: 37,              // From loading arrangements diagram
    maxWeightLbs: 400,          // Reasonable pilot weight limit
    isRequired: true,
    category: 'pilot'
  },
  {
    id: 'frontPassenger',
    name: 'Front Passenger',
    armInches: 37,              // Same as pilot (front seats)
    maxWeightLbs: 400,
    isRequired: false,
    category: 'passenger'
  },
  {
    id: 'rearPassenger1',
    name: 'Rear Passenger 1',
    armInches: 74,              // From loading arrangements diagram
    maxWeightLbs: 400,
    isRequired: false,
    category: 'passenger'
  },
  {
    id: 'rearPassenger2',
    name: 'Rear Passenger 2',
    armInches: 74,              // Same as rear passenger 1
    maxWeightLbs: 400,
    isRequired: false,
    category: 'passenger'
  },
  {
    id: 'baggageA',
    name: 'Baggage Area A',
    armInches: 97,              // From loading arrangements diagram (FS 82-109)
    maxWeightLbs: 120,          // From sample loading problem
    isRequired: false,
    category: 'baggage'
  },
  {
    id: 'baggageB',
    name: 'Baggage Area B',
    armInches: 116,             // From loading arrangements diagram (FS 109-124)
    maxWeightLbs: 80,           // From sample loading problem
    isRequired: false,
    category: 'baggage'
  },
  {
    id: 'baggageC',
    name: 'Baggage Area C',
    armInches: 129,             // From loading arrangements diagram (FS 124-134)
    maxWeightLbs: 80,           // From sample loading problem
    isRequired: false,
    category: 'baggage'
  },
  {
    id: 'fuelLeft',
    name: 'Fuel - Left Wing',
    armInches: 46.5,            // Usable fuel CG arm from notes
    maxWeightLbs: 522,          // 87 gallons * 6 lbs/gal
    isRequired: false,
    category: 'fuel'
  },
  {
    id: 'fuelRight',
    name: 'Fuel - Right Wing',
    armInches: 46.5,            // Same as left wing
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
  { weight: 2100, cgPosition: 35.0 },
  { weight: 2950, cgPosition: 38.2 },
  { weight: 3100, cgPosition: 40.5 },

  // Aft limit line
  { weight: 2100, cgPosition: 47.3 },
  { weight: 2950, cgPosition: 47.3 },
  { weight: 3100, cgPosition: 47.3 }
];

// VH-YPB Aircraft Definition
export const vhYpbAircraft: Aircraft = {
  registration: 'VH-YPB',
  model: 'Cessna 182T NAV III',
  emptyWeightLbs: 2007.0,           // From load data sheet
  emptyCGInches: 38.4,              // From load data sheet (imperial)
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
  emptyCGInches: 36.0,
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