import React from 'react';
import FuelTilesCombined from './FuelTilesCombined';
import BaggageTilesCombined from './BaggageTilesCombined';
import FrontRowSeatsCombined from './FrontRowSeatsCombined';
import RearRowSeatsCombined from './RearRowSeatsCombined';
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
  aircraft: _aircraft,
  loadingState,
  settings,
  actions
}) => {

  return (
    <div className="space-y-8">
      {/* Front Row Seats */}
      <div className="space-y-4">
        <FrontRowSeatsCombined
          pilot={loadingState.pilot}
          frontPassenger={loadingState.frontPassenger}
          onPilotChange={actions.updatePilot}
          onFrontPassengerChange={actions.updateFrontPassenger}
          settings={settings}
        />
      </div>

      {/* Rear Row Seats */}
      <div className="space-y-4">
        <RearRowSeatsCombined
          rearPassenger1={loadingState.rearPassenger1}
          rearPassenger2={loadingState.rearPassenger2}
          onRearPassenger1Change={actions.updateRearPassenger1}
          onRearPassenger2Change={actions.updateRearPassenger2}
          settings={settings}
        />
      </div>

      {/* Baggage - Combined */}
      <div className="space-y-4">
        <BaggageTilesCombined
          baggageA={loadingState.baggageA}
          baggageB={loadingState.baggageB}
          baggageC={loadingState.baggageC}
          onBaggageAChange={actions.updateBaggageA}
          onBaggageBChange={actions.updateBaggageB}
          onBaggageCChange={actions.updateBaggageC}
          settings={settings}
        />
      </div>

      {/* Fuel - Combined */}
      <div className="space-y-4">
        <FuelTilesCombined
          fuelLeft={loadingState.fuelLeft}
          fuelRight={loadingState.fuelRight}
          onFuelLeftChange={actions.updateFuelLeft}
          onFuelRightChange={actions.updateFuelRight}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default LoadingStationGrid;