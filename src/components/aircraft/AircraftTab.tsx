import React, { useState, useEffect } from 'react';
import type { Aircraft, Settings, FuelBurnState } from '@/types/aircraft';
import { useLoadingState } from '@/hooks/useLoadingState';
import LoadingStationGrid from '@/components/weight/LoadingStationGrid';
import WeightCGTiles from '@/components/weight/WeightCGTiles';
import VisualizationTabs from '@/components/visualizations/VisualizationTabs';
import GeneratePDFDialog from '@/components/dialogs/GeneratePDFDialog';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AircraftTabProps {
  aircraft: Aircraft;
  settings: Settings;
}

const AircraftTab: React.FC<AircraftTabProps> = ({ aircraft, settings }) => {
  const { loadingState, calculations, actions } = useLoadingState(aircraft, settings);

  // Fuel burn state lifted from VisualizationTabs so it can be shared with PDF
  const [fuelBurnState, setFuelBurnState] = useState<FuelBurnState>({
    burnRateGPH: aircraft.defaultFuelBurnRateGPH,
    flightDurationHours: 1.0
  });

  // Update fuel burn rate when aircraft changes
  useEffect(() => {
    setFuelBurnState(prev => ({
      ...prev,
      burnRateGPH: aircraft.defaultFuelBurnRateGPH
    }));
  }, [aircraft.registration, aircraft.defaultFuelBurnRateGPH]);

  return (
    <div className="space-y-4">
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
        fuelBurnState={fuelBurnState}
        onFuelBurnStateChange={setFuelBurnState}
      />

      {/* Generate PDF Button */}
      <div className="flex justify-center">
        <GeneratePDFDialog
          aircraft={aircraft}
          loadingState={loadingState}
          calculations={calculations}
          settings={settings}
          fuelBurnState={fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0 ? fuelBurnState : undefined}
        >
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Generate PDF Loading Sheet
          </Button>
        </GeneratePDFDialog>
      </div>
    </div>
  );
};

export default AircraftTab;
