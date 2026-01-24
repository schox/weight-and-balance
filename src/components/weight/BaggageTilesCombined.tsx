import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { theme } from '@/lib/theme';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertWeightForDisplay, convertWeightToLbs, roundDownForDisplay } from '@/utils/conversions';
import type { Settings, Aircraft } from '@/types/aircraft';

interface BaggageTilesCombinedProps {
  aircraft: Aircraft;
  baggageA: number;
  baggageB: number;
  baggageC: number;
  onBaggageAChange: (value: number) => void;
  onBaggageBChange: (value: number) => void;
  onBaggageCChange: (value: number) => void;
  settings: Settings;
  className?: string;
}

const BaggageTilesCombined: React.FC<BaggageTilesCombinedProps> = ({
  aircraft,
  baggageA,
  baggageB,
  baggageC,
  onBaggageAChange,
  onBaggageBChange,
  onBaggageCChange,
  settings,
  className
}) => {
  // Check if aircraft has baggageC station
  const hasBaggageC = aircraft.loadingStations.some(s => s.id === 'baggageC');

  // Get max weight for each baggage area from aircraft loading stations
  const getBaggageStation = (id: string) => aircraft.loadingStations.find(s => s.id === id);
  const baggageAStation = getBaggageStation('baggageA');
  const baggageBStation = getBaggageStation('baggageB');
  const baggageCStation = getBaggageStation('baggageC');

  // Convert values for display
  const baggageADisplay = convertWeightForDisplay(baggageA, settings.weightUnits);
  const baggageBDisplay = convertWeightForDisplay(baggageB, settings.weightUnits);
  const baggageCDisplay = hasBaggageC ? convertWeightForDisplay(baggageC, settings.weightUnits) : 0;
  const totalBaggageDisplay = baggageADisplay + baggageBDisplay + baggageCDisplay;

  // Max weights for each baggage area (in display units)
  const getMaxWeight = (area: 'A' | 'B' | 'C') => {
    let maxLbs = 0;
    if (area === 'A' && baggageAStation) maxLbs = baggageAStation.maxWeightLbs;
    else if (area === 'B' && baggageBStation) maxLbs = baggageBStation.maxWeightLbs;
    else if (area === 'C' && baggageCStation) maxLbs = baggageCStation.maxWeightLbs;
    return roundDownForDisplay(convertWeightForDisplay(maxLbs, settings.weightUnits));
  };

  const handleInputChange = (value: string, area: 'A' | 'B' | 'C') => {
    const numValue = Math.floor(parseFloat(value) || 0); // Use integers only
    const maxWeight = getMaxWeight(area);
    const clampedValue = Math.max(0, Math.min(numValue, maxWeight));
    const weightInLbs = convertWeightToLbs(clampedValue, settings.weightUnits);

    switch (area) {
      case 'A':
        onBaggageAChange(weightInLbs);
        break;
      case 'B':
        onBaggageBChange(weightInLbs);
        break;
      case 'C':
        onBaggageCChange(weightInLbs);
        break;
    }
  };



  const getCurrentValue = (area: 'A' | 'B' | 'C') => {
    return Math.round(area === 'A' ? baggageADisplay : area === 'B' ? baggageBDisplay : baggageCDisplay);
  };

  const renderBaggageTab = (area: 'A' | 'B' | 'C') => {
    const currentValue = getCurrentValue(area);
    const maxWeight = getMaxWeight(area);
    const isOutOfRange = currentValue < 0 || currentValue > maxWeight;

    return (
      <TabsContent value={area.toLowerCase()} variant="colored" className="p-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleInputChange(e.target.value, area)}
            className={`w-20 h-8 text-center text-sm ${isOutOfRange ? 'text-red-500 border-red-500' : ''}`}
            min="0"
            max={maxWeight}
            step="1"
          />
          <span className="text-muted-foreground">{settings.weightUnits}</span>
          <span className={`text-sm ${isOutOfRange ? 'text-red-500' : 'text-muted-foreground'}`}>
            Max: {maxWeight} {settings.weightUnits}
          </span>
        </div>
      </TabsContent>
    );
  };

  return (
    <Card className={cn("relative bg-surface-container border border-border ", className)}>
      <CardContent className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-2">
          <Package className="h-5 w-5 text-orange-600 mr-2" />
          <span className="font-semibold">Baggage</span>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="a" className="w-full flex-1">
          <TabsList variant="default" className={`grid w-full ${hasBaggageC ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger
              value="a"
              variant="colored"
              activeColor={theme.sections.baggage.DEFAULT}
            >
              {baggageAStation?.name.replace('Baggage ', '') || 'Area 1'}
            </TabsTrigger>
            <TabsTrigger
              value="b"
              variant="colored"
              activeColor={theme.sections.baggage.DEFAULT}
            >
              {baggageBStation?.name.replace('Baggage ', '') || 'Area 2'}
            </TabsTrigger>
            {hasBaggageC && (
              <TabsTrigger
                value="c"
                variant="colored"
                activeColor={theme.sections.baggage.DEFAULT}
              >
                {baggageCStation?.name.replace('Baggage ', '') || 'Area C'}
              </TabsTrigger>
            )}
          </TabsList>

          {renderBaggageTab('A')}
          {renderBaggageTab('B')}
          {hasBaggageC && renderBaggageTab('C')}
        </Tabs>

        {/* Total display without divider */}
        <div className="mt-2 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Baggage: </span>
            <span className="font-bold">{Math.round(totalBaggageDisplay)} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BaggageTilesCombined;