import React from 'react';
import type { Aircraft, Settings } from '@/types/aircraft';
import { useLoadingState } from '@/hooks/useLoadingState';
import LoadingStationGrid from '@/components/weight/LoadingStationGrid';
import WeightSummary from '@/components/weight/WeightSummary';
import VisualizationTabs from '@/components/visualizations/VisualizationTabs';

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
        settings={settings}
      />

      {/* Loading Stations Grid */}
      <LoadingStationGrid
        aircraft={aircraft}
        loadingState={loadingState}
        settings={settings}
        actions={actions}
      />

      {/* Visualization Tabs */}
      <VisualizationTabs
        aircraft={aircraft}
        calculations={calculations}
        settings={settings}
      />
    </div>
  );
};

export default AircraftTab;