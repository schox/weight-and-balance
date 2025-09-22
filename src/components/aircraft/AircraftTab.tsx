import React from 'react';
import type { Aircraft, Settings } from '@/types/aircraft';
import { useLoadingState } from '@/hooks/useLoadingState';
import LoadingStationGrid from '@/components/weight/LoadingStationGrid';
import WeightCGTiles from '@/components/weight/WeightCGTiles';
import VisualizationTabs from '@/components/visualizations/VisualizationTabs';

interface AircraftTabProps {
  aircraft: Aircraft;
  settings: Settings;
}

const AircraftTab: React.FC<AircraftTabProps> = ({ aircraft, settings }) => {
  const { loadingState, calculations, actions } = useLoadingState(aircraft, settings);

  return (
    <div className="space-y-6">
      {/* Weight & CG Tiles */}
      <WeightCGTiles
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
        loadingState={loadingState}
      />
    </div>
  );
};

export default AircraftTab;