import type { Aircraft, LoadingState, CalculationResult, CGEnvelopePoint, Settings } from '@/types/aircraft';
import { getFuelWeightLbs, roundToPrecision } from './conversions';

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

  // CG status is already clearly shown in the CG tile, no need for redundant message

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
    errors
  };
};