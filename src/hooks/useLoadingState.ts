import { useReducer, useMemo } from 'react';
import type { LoadingState, LoadingAction, Aircraft, Settings, CalculationResult } from '@/types/aircraft';
import { calculateWeightAndBalance } from '@/utils/calculations';
import { convertFuelQuantity } from '@/utils/conversions';

// Initial loading state
const createInitialState = (): LoadingState => ({
  pilot: 0,
  frontPassenger: 0,
  rearPassenger1: 0,
  rearPassenger2: 0,
  baggageA: 0,
  baggageB: 0,
  baggageC: 0,
  fuelLeft: 0,
  fuelRight: 0,

  // Computed values (will be calculated)
  totalWeightLbs: 0,
  cgPositionMm: 0,
  momentInKgMm: 0,
  isWithinWeightLimits: true,
  isWithinCGLimits: true,
  marginToMTOW: 0
});

// Reducer function to handle loading state updates
const loadingReducer = (state: LoadingState, action: LoadingAction): LoadingState => {
  switch (action.type) {
    case 'UPDATE_PILOT':
      return { ...state, pilot: action.payload };

    case 'UPDATE_FRONT_PASSENGER':
      return { ...state, frontPassenger: action.payload };

    case 'UPDATE_REAR_PASSENGER_1':
      return { ...state, rearPassenger1: action.payload };

    case 'UPDATE_REAR_PASSENGER_2':
      return { ...state, rearPassenger2: action.payload };

    case 'UPDATE_BAGGAGE_A':
      return { ...state, baggageA: action.payload };

    case 'UPDATE_BAGGAGE_B':
      return { ...state, baggageB: action.payload };

    case 'UPDATE_BAGGAGE_C':
      return { ...state, baggageC: action.payload };

    case 'UPDATE_FUEL_LEFT':
      return { ...state, fuelLeft: action.payload };

    case 'UPDATE_FUEL_RIGHT':
      return { ...state, fuelRight: action.payload };

    case 'SYNC_FUEL_TANKS':
      // Sync right tank to match left tank
      return { ...state, fuelRight: state.fuelLeft };

    case 'CONVERT_FUEL_UNITS':
      // Convert fuel quantities when units change
      const newFuelUnit = action.payload;
      const currentUnit = newFuelUnit === 'litres' ? 'gallons' : 'litres';

      return {
        ...state,
        fuelLeft: convertFuelQuantity(state.fuelLeft, currentUnit, newFuelUnit),
        fuelRight: convertFuelQuantity(state.fuelRight, currentUnit, newFuelUnit)
      };

    case 'RESET_ALL':
      return createInitialState();

    default:
      return state;
  }
};

// Custom hook to manage loading state
export const useLoadingState = (aircraft: Aircraft, settings: Settings) => {
  const [loadingState, dispatch] = useReducer(loadingReducer, createInitialState());

  // Calculate weight and balance whenever loading state changes
  const calculations: CalculationResult = useMemo(() => {
    return calculateWeightAndBalance(loadingState, aircraft, settings);
  }, [loadingState, aircraft, settings]);

  // Update the loading state with calculated values
  const enhancedLoadingState: LoadingState = useMemo(() => ({
    ...loadingState,
    totalWeightLbs: calculations.totalWeight,
    cgPositionInches: calculations.cgPosition,
    momentInLbsInches: calculations.totalWeight * calculations.cgPosition,
    isWithinWeightLimits: calculations.totalWeight <= aircraft.maxTakeoffWeightLbs,
    isWithinCGLimits: calculations.withinEnvelope,
    marginToMTOW: calculations.weightMargin
  }), [loadingState, calculations, aircraft]);

  // Action creators for easier use
  const actions = {
    updatePilot: (weight: number) => dispatch({ type: 'UPDATE_PILOT', payload: weight }),
    updateFrontPassenger: (weight: number) => dispatch({ type: 'UPDATE_FRONT_PASSENGER', payload: weight }),
    updateRearPassenger1: (weight: number) => dispatch({ type: 'UPDATE_REAR_PASSENGER_1', payload: weight }),
    updateRearPassenger2: (weight: number) => dispatch({ type: 'UPDATE_REAR_PASSENGER_2', payload: weight }),
    updateBaggageA: (weight: number) => dispatch({ type: 'UPDATE_BAGGAGE_A', payload: weight }),
    updateBaggageB: (weight: number) => dispatch({ type: 'UPDATE_BAGGAGE_B', payload: weight }),
    updateBaggageC: (weight: number) => dispatch({ type: 'UPDATE_BAGGAGE_C', payload: weight }),
    updateFuelLeft: (quantity: number) => dispatch({ type: 'UPDATE_FUEL_LEFT', payload: quantity }),
    updateFuelRight: (quantity: number) => dispatch({ type: 'UPDATE_FUEL_RIGHT', payload: quantity }),
    syncFuelTanks: () => dispatch({ type: 'SYNC_FUEL_TANKS' }),
    convertFuelUnits: (newUnit: 'litres' | 'gallons') => dispatch({ type: 'CONVERT_FUEL_UNITS', payload: newUnit }),
    resetAll: () => dispatch({ type: 'RESET_ALL' })
  };

  return {
    loadingState: enhancedLoadingState,
    calculations,
    actions,
    dispatch
  };
};