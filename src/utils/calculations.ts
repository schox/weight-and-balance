import type { Aircraft, LoadingState, CalculationResult, CGEnvelopePoint, Settings, LoadPathPoint, FuelBurnState } from '@/types/aircraft';
import { getFuelWeightLbs, roundToPrecision, convertWeightForDisplay } from './conversions';

// Fuel weight constant
const AVGAS_LBS_PER_GALLON = 6.0;

// Calculate total weight in pounds
export const calculateTotalWeight = (
  loadingState: LoadingState,
  aircraft: Aircraft,
  settings: Settings
): number => {
  const peopleWeight =
    loadingState.pilot +
    loadingState.frontPassenger +
    loadingState.rearPassenger1 +
    loadingState.rearPassenger2;

  const baggageWeight =
    loadingState.baggageA +
    loadingState.baggageB +
    loadingState.baggageC;

  const fuelWeight =
    getFuelWeightLbs(loadingState.fuelLeft, settings.fuelUnits) +
    getFuelWeightLbs(loadingState.fuelRight, settings.fuelUnits);

  return aircraft.emptyWeightLbs + peopleWeight + baggageWeight + fuelWeight;
};

// Calculate total moment in kg.mm
export const calculateTotalMoment = (
  loadingState: LoadingState,
  aircraft: Aircraft,
  settings: Settings
): number => {
  // Empty weight moment - convert lbs to kg for moment calculation
  const emptyWeightKg = aircraft.emptyWeightLbs * 0.453592; // Convert lbs to kg
  const emptyMoment = emptyWeightKg * aircraft.emptyCGMm;

  // Find loading stations by ID for arm values
  const getStationArm = (id: string): number => {
    const station = aircraft.loadingStations.find(s => s.id === id);
    return station?.armMm || 0;
  };

  // Convert weights to kg for moment calculations
  const pilotKg = loadingState.pilot * 0.453592;
  const frontPassengerKg = loadingState.frontPassenger * 0.453592;
  const rearPassenger1Kg = loadingState.rearPassenger1 * 0.453592;
  const rearPassenger2Kg = loadingState.rearPassenger2 * 0.453592;
  const baggageAKg = loadingState.baggageA * 0.453592;
  const baggageBKg = loadingState.baggageB * 0.453592;
  const baggageCKg = loadingState.baggageC * 0.453592;

  // People moments in kg.mm
  const pilotMoment = pilotKg * getStationArm('pilot');
  const frontPassengerMoment = frontPassengerKg * getStationArm('frontPassenger');
  const rearPassenger1Moment = rearPassenger1Kg * getStationArm('rearPassenger1');
  const rearPassenger2Moment = rearPassenger2Kg * getStationArm('rearPassenger2');

  // Baggage moments in kg.mm
  const baggageAMoment = baggageAKg * getStationArm('baggageA');
  const baggageBMoment = baggageBKg * getStationArm('baggageB');
  const baggageCMoment = baggageCKg * getStationArm('baggageC');

  // Fuel moments in kg.mm
  const fuelLeftWeightLbs = getFuelWeightLbs(loadingState.fuelLeft, settings.fuelUnits);
  const fuelRightWeightLbs = getFuelWeightLbs(loadingState.fuelRight, settings.fuelUnits);
  const fuelLeftWeightKg = fuelLeftWeightLbs * 0.453592;
  const fuelRightWeightKg = fuelRightWeightLbs * 0.453592;
  const fuelLeftMoment = fuelLeftWeightKg * getStationArm('fuelLeft');
  const fuelRightMoment = fuelRightWeightKg * getStationArm('fuelRight');

  return emptyMoment +
         pilotMoment + frontPassengerMoment + rearPassenger1Moment + rearPassenger2Moment +
         baggageAMoment + baggageBMoment + baggageCMoment +
         fuelLeftMoment + fuelRightMoment;
};

// Calculate center of gravity position in mm
export const calculateCGPosition = (
  totalWeight: number,
  totalMoment: number
): number => {
  if (totalWeight === 0) return 0;
  // totalMoment is in kg.mm, totalWeight is in lbs
  // Convert totalWeight to kg to get CG position in mm
  const totalWeightKg = totalWeight * 0.453592;
  return totalMoment / totalWeightKg;
};

// Extract CG envelope limits from aircraft data
// The envelope is defined as a polygon with forward limit points first, then aft limit points
// Standard format: [BEW fwd, breakpoint fwd, MTOW fwd, MTOW aft, BEW aft, close polygon]
interface CGEnvelopeLimits {
  minWeight: number;           // Basic Empty Weight
  maxWeight: number;           // MTOW
  forwardFlatLimit: number;    // Forward limit at/below breakpoint weight (mm)
  forwardFlatMaxWeight: number; // Weight at which forward limit starts to taper
  forwardTaperLimit: number;   // Forward limit at MTOW (mm)
  aftLimit: number;            // Aft limit (constant, mm)
}

// Extract envelope limits from aircraft CG envelope points
export const extractEnvelopeLimits = (aircraft: Aircraft): CGEnvelopeLimits => {
  const envelope = aircraft.cgEnvelope;
  if (envelope.length < 5) {
    // Fallback for incomplete envelopes
    return {
      minWeight: aircraft.emptyWeightLbs,
      maxWeight: aircraft.maxTakeoffWeightLbs,
      forwardFlatLimit: envelope[0]?.cgPosition || 889,
      forwardFlatMaxWeight: envelope[1]?.weight || aircraft.emptyWeightLbs,
      forwardTaperLimit: envelope[2]?.cgPosition || 1003.3,
      aftLimit: envelope[3]?.cgPosition || 1201.4,
    };
  }

  // Standard envelope format:
  // Point 0: BEW at forward limit
  // Point 1: Breakpoint weight at forward limit (flat section ends here)
  // Point 2: MTOW at forward limit (tapered)
  // Point 3: MTOW at aft limit
  // Point 4: BEW at aft limit
  // Point 5: Close polygon (same as point 0)
  return {
    minWeight: envelope[0].weight,
    maxWeight: envelope[2].weight,
    forwardFlatLimit: envelope[0].cgPosition,
    forwardFlatMaxWeight: envelope[1].weight,
    forwardTaperLimit: envelope[2].cgPosition,
    aftLimit: envelope[3].cgPosition,
  };
};

// Calculate the forward CG limit at a given weight for a specific aircraft
export const getForwardCGLimit = (weight: number, aircraft: Aircraft): number => {
  const limits = extractEnvelopeLimits(aircraft);

  // Below or at breakpoint weight: forward limit is flat
  if (weight <= limits.forwardFlatMaxWeight) {
    return limits.forwardFlatLimit;
  }

  // Above breakpoint: linear interpolation to MTOW
  const ratio = (weight - limits.forwardFlatMaxWeight) /
                (limits.maxWeight - limits.forwardFlatMaxWeight);
  return limits.forwardFlatLimit +
         ratio * (limits.forwardTaperLimit - limits.forwardFlatLimit);
};

// Check if point is within CG envelope using proper interpolated limits
export const isWithinCGEnvelope = (
  weight: number,
  cgPosition: number,
  _envelope: CGEnvelopePoint[],
  aircraft: Aircraft
): boolean => {
  const limits = extractEnvelopeLimits(aircraft);

  // Weight must be within valid range
  if (weight < limits.minWeight || weight > limits.maxWeight) {
    return false;
  }

  // Calculate the forward limit at this weight
  const forwardLimit = getForwardCGLimit(weight, aircraft);

  // CG must be between forward limit and aft limit
  return cgPosition >= forwardLimit && cgPosition <= limits.aftLimit;
};

// Calculate percent Mean Aerodynamic Chord (simplified)
export const calculatePercentMAC = (cgPosition: number): number => {
  // For C182T, this is a simplified calculation
  // In production, this would use actual MAC data from POH
  const macStart = 889; // Forward edge of MAC in mm (35.0" * 25.4)
  const macLength = 305; // Length of MAC in mm (12.0" * 25.4)

  return ((cgPosition - macStart) / macLength) * 100;
};

// Get CG limits for current weight using aircraft-specific envelope data
export const getCGLimits = (
  weight: number,
  _envelope: CGEnvelopePoint[],
  aircraft: Aircraft
): { forward: number; aft: number } => {
  const limits = extractEnvelopeLimits(aircraft);
  return {
    forward: getForwardCGLimit(weight, aircraft),
    aft: limits.aftLimit
  };
};

// Validate loading limits
export const validateLoading = (
  loadingState: LoadingState,
  aircraft: Aircraft,
  settings: Settings
): string[] => {
  const warnings: string[] = [];
  const weightUnit = settings.weightUnits;

  // Check individual station limits
  aircraft.loadingStations.forEach(station => {
    const weight = getStationWeight(loadingState, station.id);
    if (weight > station.maxWeightLbs) {
      const displayMax = Math.round(convertWeightForDisplay(station.maxWeightLbs, weightUnit));
      warnings.push(`${station.name} exceeds maximum weight of ${displayMax} ${weightUnit}`);
    }
  });

  // Check combined baggage limit (aircraft-specific)
  // Only count baggageC if the aircraft has that station
  const hasBaggageC = aircraft.loadingStations.some(s => s.id === 'baggageC');
  const totalBaggage = loadingState.baggageA + loadingState.baggageB + (hasBaggageC ? loadingState.baggageC : 0);
  const maxCombinedBaggage = aircraft.combinedBaggageLimitLbs || 200; // Default to 200 if not specified
  if (totalBaggage > maxCombinedBaggage) {
    const displayTotal = Math.round(convertWeightForDisplay(totalBaggage, weightUnit));
    const displayMax = Math.round(convertWeightForDisplay(maxCombinedBaggage, weightUnit));
    warnings.push(`Combined baggage (${displayTotal} ${weightUnit}) exceeds ${displayMax} ${weightUnit} limit`);
  }

  // Check for unrealistic data

  // Check for unusually light pilot weight (might indicate data entry error)
  if (loadingState.pilot > 0 && loadingState.pilot < 40) {
    warnings.push('Pilot weight seems unusually low - please verify');
  }

  return warnings;
};

// Get weight for a specific loading station
const getStationWeight = (loadingState: LoadingState, stationId: string): number => {
  switch (stationId) {
    case 'pilot': return loadingState.pilot;
    case 'frontPassenger': return loadingState.frontPassenger;
    case 'rearPassenger1': return loadingState.rearPassenger1;
    case 'rearPassenger2': return loadingState.rearPassenger2;
    case 'baggageA': return loadingState.baggageA;
    case 'baggageB': return loadingState.baggageB;
    case 'baggageC': return loadingState.baggageC;
    default: return 0;
  }
};

// Calculate cumulative load path - shows how CG moves as each station is added
export const calculateCumulativeLoadPath = (
  loadingState: LoadingState,
  aircraft: Aircraft,
  _settings: Settings
): LoadPathPoint[] => {
  const points: LoadPathPoint[] = [];

  // Helper to get station arm
  const getStationArm = (id: string): number => {
    const station = aircraft.loadingStations.find(s => s.id === id);
    return station?.armMm || 0;
  };

  // Start with empty aircraft
  let totalWeightLbs = aircraft.emptyWeightLbs;
  let totalWeightKg = totalWeightLbs * 0.453592;
  let totalMomentKgMm = totalWeightKg * aircraft.emptyCGMm;

  points.push({
    weight: totalWeightLbs,
    cgPosition: aircraft.emptyCGMm,
    label: 'Empty'
  });

  // Define the order of stations to add (matching Excel's sequential approach)
  // Only include stations that exist for this aircraft
  const allStations: { id: string; label: string; getValue: () => number }[] = [
    { id: 'pilot', label: 'Pilot', getValue: () => loadingState.pilot },
    { id: 'frontPassenger', label: 'Front Pax', getValue: () => loadingState.frontPassenger },
    { id: 'rearPassenger1', label: 'Rear Pax 1', getValue: () => loadingState.rearPassenger1 },
    { id: 'rearPassenger2', label: 'Rear Pax 2', getValue: () => loadingState.rearPassenger2 },
    { id: 'baggageA', label: 'Bag A', getValue: () => loadingState.baggageA },
    { id: 'baggageB', label: 'Bag B', getValue: () => loadingState.baggageB },
    { id: 'baggageC', label: 'Bag C', getValue: () => loadingState.baggageC },
  ];

  // Filter to only include stations that exist for this aircraft
  const stationOrder = allStations.filter(station =>
    aircraft.loadingStations.some(s => s.id === station.id)
  );

  // Add each station sequentially
  for (const station of stationOrder) {
    const weightLbs = station.getValue();
    if (weightLbs > 0) {
      const weightKg = weightLbs * 0.453592;
      const arm = getStationArm(station.id);
      const moment = weightKg * arm;

      totalWeightLbs += weightLbs;
      totalWeightKg += weightKg;
      totalMomentKgMm += moment;

      const cg = totalMomentKgMm / totalWeightKg;

      points.push({
        weight: totalWeightLbs,
        cgPosition: cg,
        label: station.label
      });
    }
  }

  return points;
};

// Calculate zero-fuel weight and CG
export const calculateZeroFuelWeightAndCG = (
  loadingState: LoadingState,
  aircraft: Aircraft
): { weight: number; cgPosition: number } => {
  const getStationArm = (id: string): number => {
    const station = aircraft.loadingStations.find(s => s.id === id);
    return station?.armMm || 0;
  };

  // Calculate weight without fuel
  const weightLbs = aircraft.emptyWeightLbs +
    loadingState.pilot +
    loadingState.frontPassenger +
    loadingState.rearPassenger1 +
    loadingState.rearPassenger2 +
    loadingState.baggageA +
    loadingState.baggageB +
    loadingState.baggageC;

  // Calculate moment without fuel
  const emptyWeightKg = aircraft.emptyWeightLbs * 0.453592;
  const emptyMoment = emptyWeightKg * aircraft.emptyCGMm;

  const pilotKg = loadingState.pilot * 0.453592;
  const frontPassengerKg = loadingState.frontPassenger * 0.453592;
  const rearPassenger1Kg = loadingState.rearPassenger1 * 0.453592;
  const rearPassenger2Kg = loadingState.rearPassenger2 * 0.453592;
  const baggageAKg = loadingState.baggageA * 0.453592;
  const baggageBKg = loadingState.baggageB * 0.453592;
  const baggageCKg = loadingState.baggageC * 0.453592;

  const totalMoment = emptyMoment +
    pilotKg * getStationArm('pilot') +
    frontPassengerKg * getStationArm('frontPassenger') +
    rearPassenger1Kg * getStationArm('rearPassenger1') +
    rearPassenger2Kg * getStationArm('rearPassenger2') +
    baggageAKg * getStationArm('baggageA') +
    baggageBKg * getStationArm('baggageB') +
    baggageCKg * getStationArm('baggageC');

  const totalWeightKg = weightLbs * 0.453592;
  const cgPosition = totalWeightKg > 0 ? totalMoment / totalWeightKg : 0;

  return { weight: weightLbs, cgPosition };
};

// Calculate landing weight and CG after fuel burn
export const calculateLandingWeightAndCG = (
  loadingState: LoadingState,
  aircraft: Aircraft,
  settings: Settings,
  fuelBurnState: FuelBurnState
): { weight: number; cgPosition: number; fuelRemaining: number } => {
  const getStationArm = (id: string): number => {
    const station = aircraft.loadingStations.find(s => s.id === id);
    return station?.armMm || 0;
  };

  // Calculate fuel burned in gallons
  const fuelBurnedGallons = fuelBurnState.burnRateGPH * fuelBurnState.flightDurationHours;
  const fuelBurnedLbs = fuelBurnedGallons * AVGAS_LBS_PER_GALLON;

  // Get current fuel weight
  const currentFuelLbs =
    getFuelWeightLbs(loadingState.fuelLeft, settings.fuelUnits) +
    getFuelWeightLbs(loadingState.fuelRight, settings.fuelUnits);

  // Calculate remaining fuel (can't burn more than we have)
  const remainingFuelLbs = Math.max(0, currentFuelLbs - fuelBurnedLbs);
  const remainingFuelGallons = remainingFuelLbs / AVGAS_LBS_PER_GALLON;

  // Calculate zero-fuel weight first
  const zeroFuel = calculateZeroFuelWeightAndCG(loadingState, aircraft);

  // Add remaining fuel
  const landingWeightLbs = zeroFuel.weight + remainingFuelLbs;

  // Calculate landing moment (fuel at fuel arm)
  const fuelArm = getStationArm('fuelLeft'); // Both tanks same arm
  const zeroFuelWeightKg = zeroFuel.weight * 0.453592;
  const zeroFuelMoment = zeroFuelWeightKg * zeroFuel.cgPosition;

  const remainingFuelKg = remainingFuelLbs * 0.453592;
  const fuelMoment = remainingFuelKg * fuelArm;

  const totalMoment = zeroFuelMoment + fuelMoment;
  const totalWeightKg = landingWeightLbs * 0.453592;
  const landingCG = totalWeightKg > 0 ? totalMoment / totalWeightKg : 0;

  return {
    weight: landingWeightLbs,
    cgPosition: landingCG,
    fuelRemaining: remainingFuelGallons
  };
};

// Calculate combined baggage weight, moment, and CG
export const calculateCombinedBaggage = (
  loadingState: LoadingState,
  aircraft: Aircraft
): { weight: number; cgPosition: number; moment: number } => {
  // Get arm positions for each baggage compartment
  const getStationArm = (id: string): number => {
    const station = aircraft.loadingStations.find(s => s.id === id);
    return station?.armMm || 0;
  };

  // Check if aircraft has baggageC station
  const hasBaggageC = aircraft.loadingStations.some(s => s.id === 'baggageC');

  // Individual baggage weights in lbs (only count baggageC if aircraft has it)
  const baggageAWeight = loadingState.baggageA;
  const baggageBWeight = loadingState.baggageB;
  const baggageCWeight = hasBaggageC ? loadingState.baggageC : 0;

  // Total baggage weight
  const totalBaggageWeight = baggageAWeight + baggageBWeight + baggageCWeight;

  // If no baggage, return zeros
  if (totalBaggageWeight === 0) {
    return { weight: 0, cgPosition: 0, moment: 0 };
  }

  // Convert to kg for moment calculations
  const baggageAKg = baggageAWeight * 0.453592;
  const baggageBKg = baggageBWeight * 0.453592;
  const baggageCKg = baggageCWeight * 0.453592;

  // Calculate individual moments in kg.mm
  const baggageAMoment = baggageAKg * getStationArm('baggageA');
  const baggageBMoment = baggageBKg * getStationArm('baggageB');
  const baggageCMoment = baggageCKg * getStationArm('baggageC');

  // Total baggage moment
  const totalBaggageMoment = baggageAMoment + baggageBMoment + baggageCMoment;

  // Combined baggage CG position
  const totalBaggageKg = totalBaggageWeight * 0.453592;
  const combinedBaggageCG = totalBaggageMoment / totalBaggageKg;

  return {
    weight: totalBaggageWeight,
    cgPosition: combinedBaggageCG,
    moment: totalBaggageMoment
  };
};

// Main calculation function
export const calculateWeightAndBalance = (
  loadingState: LoadingState,
  aircraft: Aircraft,
  settings: Settings
): CalculationResult => {
  const totalWeight = calculateTotalWeight(loadingState, aircraft, settings);
  const totalMoment = calculateTotalMoment(loadingState, aircraft, settings);
  const cgPosition = calculateCGPosition(totalWeight, totalMoment);
  const percentMAC = calculatePercentMAC(cgPosition);
  const withinEnvelope = isWithinCGEnvelope(totalWeight, cgPosition, aircraft.cgEnvelope, aircraft);
  const cgLimits = getCGLimits(totalWeight, aircraft.cgEnvelope, aircraft);
  const warnings = validateLoading(loadingState, aircraft, settings);
  const errors: string[] = [];

  // Check weight limits
  const withinWeightLimits = totalWeight <= aircraft.maxTakeoffWeightLbs;
  if (!withinWeightLimits) {
    const displayWeight = Math.round(convertWeightForDisplay(totalWeight, settings.weightUnits));
    const displayMTOW = Math.round(convertWeightForDisplay(aircraft.maxTakeoffWeightLbs, settings.weightUnits));
    errors.push(`Total weight (${displayWeight} ${settings.weightUnits}) exceeds MTOW (${displayMTOW} ${settings.weightUnits})`);
  }

  // Calculate cumulative load path for visualization
  const loadPath = calculateCumulativeLoadPath(loadingState, aircraft, settings);

  // Calculate zero-fuel weight and CG
  const zeroFuel = calculateZeroFuelWeightAndCG(loadingState, aircraft);

  return {
    isValid: errors.length === 0,
    totalWeight: roundToPrecision(totalWeight, 1),
    cgPosition: roundToPrecision(cgPosition, 1),
    percentMAC: roundToPrecision(percentMAC, 1),
    withinEnvelope,
    weightMargin: roundToPrecision(aircraft.maxTakeoffWeightLbs - totalWeight, 1),
    cgMargin: {
      forward: roundToPrecision(cgPosition - cgLimits.forward, 1),
      aft: roundToPrecision(cgLimits.aft - cgPosition, 1)
    },
    warnings,
    errors,
    // New fields for enhanced visualization
    zeroFuelWeight: roundToPrecision(zeroFuel.weight, 1),
    zeroFuelCG: roundToPrecision(zeroFuel.cgPosition, 1),
    loadPath
  };
};