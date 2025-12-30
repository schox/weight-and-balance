import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, Fuel, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';
import type { Aircraft, CalculationResult, Settings, LoadingState, FuelBurnState } from '@/types/aircraft';

// Import visualization components
import CGEnvelopeChart from '@/components/charts/CGEnvelopeChart';
import AircraftSideView from './AircraftSideView';

interface VisualizationTabsProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  loadingState: LoadingState;
  className?: string;
}

type VisualizationType = 'envelope' | 'sideview';

interface VisualizationTab {
  id: VisualizationType;
  label: string;
  description: string;
  component: React.ComponentType<{
    aircraft: Aircraft;
    calculations: CalculationResult;
    settings: Settings;
    loadingState?: LoadingState;
    fuelBurnState?: FuelBurnState;
  }>;
}

// Fuel Burn Input Panel Component
const FuelBurnPanel: React.FC<{
  fuelBurnState: FuelBurnState;
  onUpdate: (state: FuelBurnState) => void;
}> = ({ fuelBurnState, onUpdate }) => {
  const handleBurnRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdate({ ...fuelBurnState, burnRateGPH: Math.max(0, value) });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdate({ ...fuelBurnState, flightDurationHours: Math.max(0, value) });
  };

  return (
    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
      <div className="flex items-center mb-2">
        <Fuel className="h-4 w-4 text-emerald-600 mr-2" />
        <span className="text-sm font-medium text-emerald-800">Flight Planning</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-emerald-700 mb-1">
            Fuel Burn Rate (GPH)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={fuelBurnState.burnRateGPH || ''}
            onChange={handleBurnRateChange}
            placeholder="e.g., 14"
            className="w-full px-2 py-1.5 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs text-emerald-700 mb-1 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Flight Duration (hrs)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={fuelBurnState.flightDurationHours || ''}
            onChange={handleDurationChange}
            placeholder="e.g., 2.5"
            className="w-full px-2 py-1.5 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      {fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0 && (
        <div className="mt-2 text-xs text-emerald-700">
          Fuel burn: {(fuelBurnState.burnRateGPH * fuelBurnState.flightDurationHours).toFixed(1)} gallons
        </div>
      )}
    </div>
  );
};

const VisualizationTabs: React.FC<VisualizationTabsProps> = ({
  aircraft,
  calculations,
  settings,
  loadingState,
  className
}) => {
  // Fuel burn state for flight planning
  const [fuelBurnState, setFuelBurnState] = useState<FuelBurnState>({
    burnRateGPH: 0,
    flightDurationHours: 0
  });

  const tabs: VisualizationTab[] = [
    {
      id: 'envelope',
      label: 'Weight vs C of G',
      description: 'Traditional weight vs CG position graph',
      component: CGEnvelopeChart
    },
    {
      id: 'sideview',
      label: 'Weight distribution',
      description: 'Side-view with visual weight distribution',
      component: AircraftSideView
    }
  ];

  return (
    <Card className={cn("relative bg-surface-container border border-border ", className)}>
      <CardContent className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-2">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          <span className="font-semibold">Graphical Views</span>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="envelope" className="w-full flex-1">
          <TabsList variant="default" className="grid w-full grid-cols-2">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                variant="colored"
                activeColor={theme.sections.pilot.DEFAULT}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => {
            const TabComponent = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} variant="colored" className="p-2 mt-0">
                <div className="text-sm text-muted-foreground mb-3 text-center">
                  {tab.description}
                </div>
                <TabComponent
                  aircraft={aircraft}
                  calculations={calculations}
                  settings={settings}
                  loadingState={loadingState}
                  fuelBurnState={fuelBurnState}
                />
                {/* Show fuel burn panel only on envelope tab */}
                {tab.id === 'envelope' && (
                  <FuelBurnPanel
                    fuelBurnState={fuelBurnState}
                    onUpdate={setFuelBurnState}
                  />
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VisualizationTabs;