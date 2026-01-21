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

// VH-YPB CG Envelope constants (from POH)
// Forward limit: 33.0" constant for weights ≤ 2,250 lbs
// Forward limit: Linear from 33.0" at 2,250 lbs to 40.9" at 3,100 lbs
// Aft limit: 46.0" constant at all weights
const CG_ENVELOPE = {
  minWeight: 2007,           // Basic Empty Weight
  maxWeight: 3100,           // MTOW
  forwardFlatLimit: 838.2,   // 33.0" in mm
  forwardFlatMaxWeight: 2250, // Weight at which forward limit starts to taper
  forwardTaperLimit: 1038.86, // 40.9" in mm at MTOW
  aftLimit: 1168.4,          // 46.0" in mm (constant)
};

// Calculate the forward CG limit at a given weight
export const getForwardCGLimit = (weight: number): number => {
  // Below or at 2,250 lbs: forward limit is flat at 33.0" (838.2mm)
  if (weight <= CG_ENVELOPE.forwardFlatMaxWeight) {
    return CG_ENVELOPE.forwardFlatLimit;
  }

  // Above 2,250 lbs: linear interpolation from 33.0" at 2,250 lbs to 40.9" at 3,100 lbs
  const ratio = (weight - CG_ENVELOPE.forwardFlatMaxWeight) /
                (CG_ENVELOPE.maxWeight - CG_ENVELOPE.forwardFlatMaxWeight);
  return CG_ENVELOPE.forwardFlatLimit +
         ratio * (CG_ENVELOPE.forwardTaperLimit - CG_ENVELOPE.forwardFlatLimit);
};

// Check if point is within CG envelope using proper interpolated limits
export const isWithinCGEnvelope = (
  weight: number,
  cgPosition: number,
  envelope: CGEnvelopePoint[]
): boolean => {
  if (envelope.length < 5) return true; // Safety check

  // Weight must be within valid range
  if (weight < CG_ENVELOPE.minWeight || weight > CG_ENVELOPE.maxWeight) {
    return false;
  }

  // Calculate the forward limit at this weight
  const forwardLimit = getForwardCGLimit(weight);

  // CG must be between forward limit and aft limit (46.0")
  return cgPosition >= forwardLimit && cgPosition <= CG_ENVELOPE.aftLimit;
};

// Calculate percent Mean Aerodynamic Chord (simplified)
export const calculatePercentMAC = (cgPosition: number): number => {
  // For C182T, this is a simplified calculation
  // In production, this would use actual MAC data from POH
  const macStart = 889; // Forward edge of MAC in mm (35.0" * 25.4)
  const macLength = 305; // Length of MAC in mm (12.0" * 25.4)

  return ((cgPosition - macStart) / macLength) * 100;
};

// Get CG limits for current weight using proper POH envelope data
export const getCGLimits = (
  weight: number,
  _envelope: CGEnvelopePoint[]
): { forward: number; aft: number } => {
  // Use the proper forward limit calculation based on POH data
  // Forward limit: 33.0" constant for ≤2,250 lbs, linear taper to 40.9" at 3,100 lbs
  // Aft limit: 46.0" constant at all weights
  return {
    forward: getForwardCGLimit(weight),
    aft: CG_ENVELOPE.aftLimit
  };
};

// Combined baggage limit (from POH)
const MAX_COMBINED_BAGGAGE_LBS = 200;

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

  // Check combined baggage limit (POH states max combined is 200 lbs)
  const totalBaggage = loadingState.baggageA + loadingState.baggageB + loadingState.baggageC;
  if (totalBaggage > MAX_COMBINED_BAGGAGE_LBS) {
    const displayTotal = Math.round(convertWeightForDisplay(totalBaggage, weightUnit));
    const displayMax = Math.round(convertWeightForDisplay(MAX_COMBINED_BAGGAGE_LBS, weightUnit));
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
  const stationOrder: { id: string; label: string; getValue: () => number }[] = [
    { id: 'pilot', label: 'Pilot', getValue: () => loadingState.pilot },
    { id: 'frontPassenger', label: 'Front Pax', getValue: () => loadingState.frontPassenger },
    { id: 'rearPassenger1', label: 'Rear Pax 1', getValue: () => loadingState.rearPassenger1 },
    { id: 'rearPassenger2', label: 'Rear Pax 2', getValue: () => loadingState.rearPassenger2 },
    { id: 'baggageA', label: 'Bag A', getValue: () => loadingState.baggageA },
    { id: 'baggageB', label: 'Bag B', getValue: () => loadingState.baggageB },
    { id: 'baggageC', label: 'Bag C', getValue: () => loadingState.baggageC },
  ];

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

  // Individual baggage weights in lbs
  const baggageAWeight = loadingState.baggageA;
  const baggageBWeight = loadingState.baggageB;
  const baggageCWeight = loadingState.baggageC;

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
  const withinEnvelope = isWithinCGEnvelope(totalWeight, cgPosition, aircraft.cgEnvelope);
  const cgLimits = getCGLimits(totalWeight, aircraft.cgEnvelope);
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