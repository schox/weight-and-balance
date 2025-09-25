import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Aircraft, CalculationResult, Settings, LoadingState } from '@/types/aircraft';

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
  }>;
}

const VisualizationTabs: React.FC<VisualizationTabsProps> = ({
  aircraft,
  calculations,
  settings,
  loadingState,
  className
}) => {
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
    <Card className={cn("w-full border border-border shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle>Weight & Balance Visualizations</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="envelope" className="w-full">
          <div className="px-4 sm:px-6 pb-3">
            <TabsList className="w-full">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex-1">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => {
            const TabComponent = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="p-4 sm:p-6 mt-0">
                <div className="text-sm text-muted-foreground mb-4">
                  {tab.description}
                </div>
                <TabComponent
                  aircraft={aircraft}
                  calculations={calculations}
                  settings={settings}
                  loadingState={loadingState}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VisualizationTabs;