import React from 'react';
import WeightTile from './WeightTile';
import FuelTile from './FuelTile';
import { Aircraft, LoadingState, Settings } from '@/types/aircraft';
import { convertFuelQuantity } from '@/utils/conversions';

interface LoadingStationGridProps {
  aircraft: Aircraft;
  loadingState: LoadingState;
  settings: Settings;
  actions: {
    updatePilot: (weight: number) => void;
    updateFrontPassenger: (weight: number) => void;
    updateRearPassenger1: (weight: number) => void;
    updateRearPassenger2: (weight: number) => void;
    updateBaggageA: (weight: number) => void;
    updateBaggageB: (weight: number) => void;
    updateBaggageC: (weight: number) => void;
    updateFuelLeft: (quantity: number) => void;
    updateFuelRight: (quantity: number) => void;
    syncFuelTanks: () => void;
  };
}

const LoadingStationGrid: React.FC<LoadingStationGridProps> = ({
  aircraft,
  loadingState,
  settings,
  actions
}) => {
  // Calculate maximum fuel quantities in current units
  const maxFuelInCurrentUnits = settings.fuelUnits === 'litres'
    ? aircraft.fuelCapacityLitres / 2  // Half capacity per tank
    : aircraft.fuelCapacityGallons / 2;

  // Check if fuel tanks are synchronized
  const isFuelSynced = Math.abs(loadingState.fuelLeft - loadingState.fuelRight) < 0.1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Pilot - Required */}
      <WeightTile
        id="pilot"
        title="Pilot"
        value={loadingState.pilot}
        maxWeight={400}
        unit="lbs"
        category="pilot"
        isRequired={true}
        onChange={actions.updatePilot}
      />

      {/* Front Passenger */}
      <WeightTile
        id="frontPassenger"
        title="Front Passenger"
        value={loadingState.frontPassenger}
        maxWeight={400}
        unit="lbs"
        category="passenger"
        onChange={actions.updateFrontPassenger}
      />

      {/* Rear Passengers */}
      <WeightTile
        id="rearPassenger1"
        title="Rear Passenger 1"
        value={loadingState.rearPassenger1}
        maxWeight={400}
        unit="lbs"
        category="passenger"
        onChange={actions.updateRearPassenger1}
      />

      <WeightTile
        id="rearPassenger2"
        title="Rear Passenger 2"
        value={loadingState.rearPassenger2}
        maxWeight={400}
        unit="lbs"
        category="passenger"
        onChange={actions.updateRearPassenger2}
      />

      {/* Baggage Areas */}
      <WeightTile
        id="baggageA"
        title="Baggage Area A"
        value={loadingState.baggageA}
        maxWeight={120}
        unit="lbs"
        category="baggage"
        onChange={actions.updateBaggageA}
      />

      <WeightTile
        id="baggageB"
        title="Baggage Area B"
        value={loadingState.baggageB}
        maxWeight={80}
        unit="lbs"
        category="baggage"
        onChange={actions.updateBaggageB}
      />

      <WeightTile
        id="baggageC"
        title="Baggage Area C"
        value={loadingState.baggageC}
        maxWeight={80}
        unit="lbs"
        category="baggage"
        onChange={actions.updateBaggageC}
      />

      {/* Fuel Tanks */}
      <FuelTile
        id="fuelLeft"
        title="Fuel - Left Wing"
        value={loadingState.fuelLeft}
        maxQuantity={maxFuelInCurrentUnits}
        fuelUnit={settings.fuelUnits}
        side="left"
        onChange={actions.updateFuelLeft}
        onSync={actions.syncFuelTanks}
        isSynced={isFuelSynced}
      />

      <FuelTile
        id="fuelRight"
        title="Fuel - Right Wing"
        value={loadingState.fuelRight}
        maxQuantity={maxFuelInCurrentUnits}
        fuelUnit={settings.fuelUnits}
        side="right"
        onChange={actions.updateFuelRight}
        onSync={actions.syncFuelTanks}
        isSynced={isFuelSynced}
      />
    </div>
  );
};

export default LoadingStationGrid;