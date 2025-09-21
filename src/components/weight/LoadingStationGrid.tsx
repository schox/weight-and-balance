import React from 'react';
import WeightTile from './WeightTile';
import FuelTile from './FuelTile';
import { convertWeightForDisplay, convertWeightToLbs, roundDownForDisplay } from '@/utils/conversions';
import type { Aircraft, LoadingState, Settings } from '@/types/aircraft';

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
  const maxFuelInCurrentUnits = roundDownForDisplay(
    settings.fuelUnits === 'litres'
      ? aircraft.fuelCapacityLitres / 2  // Half capacity per tank
      : aircraft.fuelCapacityGallons / 2
  );

  // Check if fuel tanks are synchronized
  const isFuelSynced = Math.abs(loadingState.fuelLeft - loadingState.fuelRight) < 0.1;

  // Weight conversion helpers
  const convertWeightForTile = (weightLbs: number) =>
    roundDownForDisplay(convertWeightForDisplay(weightLbs, settings.weightUnits));

  const convertMaxWeightForTile = (maxWeightLbs: number) =>
    roundDownForDisplay(convertWeightForDisplay(maxWeightLbs, settings.weightUnits));

  const handleWeightChange = (updater: (weight: number) => void) =>
    (displayWeight: number) => {
      const weightInLbs = convertWeightToLbs(displayWeight, settings.weightUnits);
      updater(weightInLbs);
    };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Pilot - Required */}
      <WeightTile
        id="pilot"
        title="Pilot"
        value={convertWeightForTile(loadingState.pilot)}
        maxWeight={convertMaxWeightForTile(400)}
        unit={settings.weightUnits}
        category="pilot"
        isRequired={true}
        onChange={handleWeightChange(actions.updatePilot)}
      />

      {/* Front Passenger */}
      <WeightTile
        id="frontPassenger"
        title="Front Passenger"
        value={convertWeightForTile(loadingState.frontPassenger)}
        maxWeight={convertMaxWeightForTile(400)}
        unit={settings.weightUnits}
        category="passenger"
        onChange={handleWeightChange(actions.updateFrontPassenger)}
      />

      {/* Rear Passengers */}
      <WeightTile
        id="rearPassenger1"
        title="Rear Passenger 1"
        value={convertWeightForTile(loadingState.rearPassenger1)}
        maxWeight={convertMaxWeightForTile(400)}
        unit={settings.weightUnits}
        category="passenger"
        onChange={handleWeightChange(actions.updateRearPassenger1)}
      />

      <WeightTile
        id="rearPassenger2"
        title="Rear Passenger 2"
        value={convertWeightForTile(loadingState.rearPassenger2)}
        maxWeight={convertMaxWeightForTile(400)}
        unit={settings.weightUnits}
        category="passenger"
        onChange={handleWeightChange(actions.updateRearPassenger2)}
      />

      {/* Baggage Areas */}
      <WeightTile
        id="baggageA"
        title="Baggage Area A"
        value={convertWeightForTile(loadingState.baggageA)}
        maxWeight={convertMaxWeightForTile(120)}
        unit={settings.weightUnits}
        category="baggage"
        onChange={handleWeightChange(actions.updateBaggageA)}
      />

      <WeightTile
        id="baggageB"
        title="Baggage Area B"
        value={convertWeightForTile(loadingState.baggageB)}
        maxWeight={convertMaxWeightForTile(80)}
        unit={settings.weightUnits}
        category="baggage"
        onChange={handleWeightChange(actions.updateBaggageB)}
      />

      <WeightTile
        id="baggageC"
        title="Baggage Area C"
        value={convertWeightForTile(loadingState.baggageC)}
        maxWeight={convertMaxWeightForTile(80)}
        unit={settings.weightUnits}
        category="baggage"
        onChange={handleWeightChange(actions.updateBaggageC)}
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