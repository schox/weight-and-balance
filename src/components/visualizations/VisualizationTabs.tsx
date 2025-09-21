import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Plane, Scale, Eye, Zap, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Aircraft, CalculationResult, Settings, LoadingState } from '@/types/aircraft';

// Import visualization components (we'll create these)
import CGEnvelopeChart from '@/components/charts/CGEnvelopeChart';
import AircraftSideView from './AircraftSideView';
import AnimatedLoading from './AnimatedLoading';
import BalanceBeamView from './BalanceBeamView';
import FeedbackCollector from './FeedbackCollector';

interface VisualizationTabsProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  loadingState: LoadingState;
  className?: string;
}

type VisualizationType = 'envelope' | 'sideview' | 'animated' | 'balance' | 'feedback';

interface VisualizationTab {
  id: VisualizationType;
  label: string;
  icon: React.ReactNode;
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
  const [activeTab, setActiveTab] = useState<VisualizationType>('envelope');

  const tabs: VisualizationTab[] = [
    {
      id: 'envelope',
      label: 'CG Envelope',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Traditional weight vs CG position graph',
      component: CGEnvelopeChart
    },
    {
      id: 'sideview',
      label: 'Aircraft View',
      icon: <Plane className="h-4 w-4" />,
      description: 'Side-view with visual weight distribution',
      component: AircraftSideView
    },
    {
      id: 'animated',
      label: 'Loading Animation',
      icon: <Zap className="h-4 w-4" />,
      description: 'Animated sequence showing loading process',
      component: AnimatedLoading
    },
    {
      id: 'balance',
      label: 'Balance Beam',
      icon: <Scale className="h-4 w-4" />,
      description: '3D balance beam representation',
      component: BalanceBeamView
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'Rate visualizations and provide feedback',
      component: FeedbackCollector
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || CGEnvelopeChart;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weight & Balance Visualizations</span>
          <div className="flex items-center text-sm text-muted-foreground">
            <Eye className="h-4 w-4 mr-1" />
            <span>Choose your preferred view</span>
          </div>
        </CardTitle>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 border-b">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center space-x-2 rounded-b-none",
                activeTab === tab.id && "bg-primary text-primary-foreground"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Active tab description */}
        {activeTabData && (
          <div className="text-sm text-muted-foreground">
            {activeTabData.description}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Render active visualization component */}
        <div className="p-6">
          <ActiveComponent
            aircraft={aircraft}
            calculations={calculations}
            settings={settings}
            loadingState={loadingState}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualizationTabs;