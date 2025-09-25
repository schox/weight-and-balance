import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';
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