import type { FuelConversion } from '@/types/aircraft';

// Fuel conversion constants
const GALLONS_TO_LITRES = 3.78541;
const AVGAS_WEIGHT_LBS_PER_GALLON = 6.0;
const AVGAS_WEIGHT_KG_PER_LITRE = 0.72;
const LBS_TO_KG = 0.453592;
const INCHES_TO_MM = 25.4;

// Fuel conversion utilities
export const fuelConversions: FuelConversion = {
  gallonsToLitres: (gallons: number): number => {
    return gallons * GALLONS_TO_LITRES;
  },

  litresToGallons: (litres: number): number => {
    return litres / GALLONS_TO_LITRES;
  },

  gallonsToWeightLbs: (gallons: number): number => {
    return gallons * AVGAS_WEIGHT_LBS_PER_GALLON;
  },

  litresToWeightLbs: (litres: number): number => {
    return litres * AVGAS_WEIGHT_KG_PER_LITRE * (1 / LBS_TO_KG);
  }
};

// Weight conversions
export const weightConversions = {
  lbsToKg: (lbs: number): number => lbs * LBS_TO_KG,
  kgToLbs: (kg: number): number => kg / LBS_TO_KG
};

// Distance conversions
export const distanceConversions = {
  inchesToMm: (inches: number): number => inches * INCHES_TO_MM,
  mmToInches: (mm: number): number => mm / INCHES_TO_MM
};

// Fuel quantity converter based on units
export const convertFuelQuantity = (
  quantity: number,
  fromUnit: 'litres' | 'gallons',
  toUnit: 'litres' | 'gallons'
): number => {
  if (fromUnit === toUnit) return quantity;

  if (fromUnit === 'gallons' && toUnit === 'litres') {
    return fuelConversions.gallonsToLitres(quantity);
  } else if (fromUnit === 'litres' && toUnit === 'gallons') {
    return fuelConversions.litresToGallons(quantity);
  }

  return quantity;
};

// Get fuel weight in pounds regardless of input units
export const getFuelWeightLbs = (
  quantity: number,
  unit: 'litres' | 'gallons'
): number => {
  if (unit === 'gallons') {
    return fuelConversions.gallonsToWeightLbs(quantity);
  } else {
    return fuelConversions.litresToWeightLbs(quantity);
  }
};

// Format numbers for display
export const formatNumber = (
  value: number,
  decimals: number = 1
): string => {
  return value.toFixed(decimals);
};

// Round to reasonable precision for weight/balance calculations
export const roundToPrecision = (value: number, precision: number = 1): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

// Convert weight for display based on user's preferred units
export const convertWeightForDisplay = (
  weightLbs: number,
  targetUnit: 'lbs' | 'kg'
): number => {
  if (targetUnit === 'kg') {
    return weightConversions.lbsToKg(weightLbs);
  }
  return weightLbs;
};

// Convert weight from display units back to pounds (for calculations)
export const convertWeightToLbs = (
  weight: number,
  fromUnit: 'lbs' | 'kg'
): number => {
  if (fromUnit === 'kg') {
    return weightConversions.kgToLbs(weight);
  }
  return weight;
};