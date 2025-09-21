import React, { useState } from 'react';
import { Aircraft, Settings } from '@/types/aircraft';
import { useLoadingState } from '@/hooks/useLoadingState';
import LoadingStationGrid from '@/components/weight/LoadingStationGrid';
import WeightSummary from '@/components/weight/WeightSummary';

interface AircraftTabProps {
  aircraft: Aircraft;
  settings: Settings;
}

const AircraftTab: React.FC<AircraftTabProps> = ({ aircraft, settings }) => {
  const { loadingState, calculations, actions } = useLoadingState(aircraft, settings);

  return (
    <div className="space-y-6">
      {/* Aircraft Info Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{aircraft.registration}</h2>
        <p className="text-muted-foreground">{aircraft.model}</p>
      </div>

      {/* Weight Summary */}
      <WeightSummary
        aircraft={aircraft}
        calculations={calculations}
      />

      {/* Loading Stations Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading Stations</h3>
        <LoadingStationGrid
          aircraft={aircraft}
          loadingState={loadingState}
          settings={settings}
          actions={actions}
        />
      </div>

      {/* TODO: Add CG Envelope Chart here */}
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">CG Envelope Chart</h3>
        <p className="text-muted-foreground">Coming next - Interactive weight and balance envelope</p>
      </div>
    </div>
  );
};

export default AircraftTab;