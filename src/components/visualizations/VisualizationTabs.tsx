import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, Fuel, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';
import type { Aircraft, CalculationResult, Settings, LoadingState, FuelBurnState, FuelUnit } from '@/types/aircraft';
import { fuelConversions } from '@/utils/conversions';

// Format a decimal value: show integer if close to whole number, otherwise 1 decimal place
const formatDecimal = (val: number): string => {
  if (Math.abs(val - Math.round(val)) < 0.1) return Math.round(val).toString();
  return (Math.round(val * 10) / 10).toFixed(1);
};

// Import visualization components
import CGEnvelopeChart from '@/components/charts/CGEnvelopeChart';
import AircraftSideView from './AircraftSideView';

interface VisualizationTabsProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  loadingState: LoadingState;
  fuelBurnState: FuelBurnState;
  onFuelBurnStateChange: (state: FuelBurnState) => void;
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
  fuelUnits: FuelUnit;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ fuelBurnState, onUpdate, fuelUnits, isExpanded, onToggleExpand }) => {
  // Convert burn rate for display based on user's fuel unit preference
  const burnRateDisplay = fuelUnits === 'litres'
    ? fuelConversions.gallonsToLitres(fuelBurnState.burnRateGPH)
    : fuelBurnState.burnRateGPH;

  const handleBurnRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    // Convert from display units back to GPH for storage
    const valueInGPH = fuelUnits === 'litres'
      ? fuelConversions.litresToGallons(value)
      : value;
    onUpdate({ ...fuelBurnState, burnRateGPH: Math.max(0, valueInGPH) });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdate({ ...fuelBurnState, flightDurationHours: Math.max(0, value) });
  };

  // Calculate fuel burn and convert to user's preferred units
  const fuelBurnGallons = fuelBurnState.burnRateGPH * fuelBurnState.flightDurationHours;
  const fuelBurnDisplay = fuelUnits === 'litres'
    ? fuelConversions.gallonsToLitres(fuelBurnGallons)
    : fuelBurnGallons;

  const burnRateUnit = fuelUnits === 'litres' ? 'L/hr' : 'GPH';

  return (
    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
      {/* Collapsible header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center">
          <Fuel className="h-4 w-4 text-emerald-600 mr-2" />
          <span className="text-sm font-medium text-emerald-800">Flight Planning</span>
          {!isExpanded && fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0 && (
            <span className="ml-2 text-xs text-emerald-600">
              ({formatDecimal(fuelBurnDisplay)} {fuelUnits} burn)
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-emerald-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-emerald-600" />
        )}
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs text-emerald-700 mb-1">
                Fuel Burn Rate ({burnRateUnit})
              </label>
              <input
                type="number"
                min="0"
                max={fuelUnits === 'litres' ? 190 : 50}
                step="1"
                value={burnRateDisplay ? formatDecimal(burnRateDisplay) : ''}
                onChange={handleBurnRateChange}
                placeholder={fuelUnits === 'litres' ? 'e.g., 53' : 'e.g., 14'}
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
                placeholder="e.g., 1.0"
                className="w-full px-2 py-1.5 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          {fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0 && (
            <div className="mt-2 text-xs text-emerald-700">
              Total fuel burn: {formatDecimal(fuelBurnDisplay)} {fuelUnits}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const VisualizationTabs: React.FC<VisualizationTabsProps> = ({
  aircraft,
  calculations,
  settings,
  loadingState,
  fuelBurnState,
  onFuelBurnStateChange,
  className
}) => {
  // Track if flight planning panel is expanded (controls visibility on chart)
  const [isFlightPlanningExpanded, setIsFlightPlanningExpanded] = useState(true);

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
                  fuelBurnState={isFlightPlanningExpanded ? fuelBurnState : undefined}
                />
                {/* Show fuel burn panel only on envelope tab */}
                {tab.id === 'envelope' && (
                  <FuelBurnPanel
                    fuelBurnState={fuelBurnState}
                    onUpdate={onFuelBurnStateChange}
                    fuelUnits={settings.fuelUnits}
                    isExpanded={isFlightPlanningExpanded}
                    onToggleExpand={() => setIsFlightPlanningExpanded(!isFlightPlanningExpanded)}
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