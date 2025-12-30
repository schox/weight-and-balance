import type { Aircraft, LoadingState, CalculationResult, CGEnvelopePoint, Settings, LoadPathPoint, FuelBurnState } from '@/types/aircraft';
import { getFuelWeightLbs, roundToPrecision } from './conversions';

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

// Check if point is within CG envelope
export const isWithinCGEnvelope = (
  weight: number,
  cgPosition: number,
  envelope: CGEnvelopePoint[]
): boolean => {
  if (envelope.length < 6) return true; // Safety check

  // For now, implement a simple rectangular check
  // In production, this would be a proper polygon point-in-polygon test
  const minWeight = Math.min(...envelope.map(p => p.weight));
  const maxWeight = Math.max(...envelope.map(p => p.weight));
  const minCG = Math.min(...envelope.map(p => p.cgPosition));
  const maxCG = Math.max(...envelope.map(p => p.cgPosition));

  return weight >= minWeight &&
         weight <= maxWeight &&
         cgPosition >= minCG &&
         cgPosition <= maxCG;
};

// Calculate percent Mean Aerodynamic Chord (simplified)
export const calculatePercentMAC = (cgPosition: number): number => {
  // For C182T, this is a simplified calculation
  // In production, this would use actual MAC data from POH
  const macStart = 889; // Forward edge of MAC in mm (35.0" * 25.4)
  const macLength = 305; // Length of MAC in mm (12.0" * 25.4)

  return ((cgPosition - macStart) / macLength) * 100;
};

// Get CG limits for current weight
export const getCGLimits = (
  weight: number,
  envelope: CGEnvelopePoint[]
): { forward: number; aft: number } => {
  // Simplified linear interpolation between envelope points
  // In production, this would be more sophisticated

  if (envelope.length < 6) {
    return { forward: 889, aft: 1201 }; // Default C182T limits in mm
  }

  // Find forward and aft limits for the given weight
  const forwardPoints = envelope.slice(0, 3); // First half of envelope
  const aftPoints = envelope.slice(3, 6);     // Second half of envelope

  const interpolate = (points: CGEnvelopePoint[], targetWeight: number): number => {
    if (points.length < 2) return points[0]?.cgPosition || 0;

    // Find the two points to interpolate between
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      if (targetWeight >= p1.weight && targetWeight <= p2.weight) {
        const ratio = (targetWeight - p1.weight) / (p2.weight - p1.weight);
        return p1.cgPosition + ratio * (p2.cgPosition - p1.cgPosition);
      }
    }

    // If outside range, return nearest point
    return targetWeight < points[0].weight ? points[0].cgPosition : points[points.length - 1].cgPosition;
  };

  return {
    forward: interpolate(forwardPoints, weight),
    aft: interpolate(aftPoints, weight)
  };
};

// Validate loading limits
export const validateLoading = (
  loadingState: LoadingState,
  aircraft: Aircraft
): string[] => {
  const warnings: string[] = [];

  // Check individual station limits
  aircraft.loadingStations.forEach(station => {
    const weight = getStationWeight(loadingState, station.id);
    if (weight > station.maxWeightLbs) {
      warnings.push(`${station.name} exceeds maximum weight of ${station.maxWeightLbs} lbs`);
    }
  });

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
  const warnings = validateLoading(loadingState, aircraft);
  const errors: string[] = [];

  // Check weight limits
  const withinWeightLimits = totalWeight <= aircraft.maxTakeoffWeightLbs;
  if (!withinWeightLimits) {
    errors.push(`Total weight (${totalWeight.toFixed(1)} lbs) exceeds MTOW (${aircraft.maxTakeoffWeightLbs} lbs)`);
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