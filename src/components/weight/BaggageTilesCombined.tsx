import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { theme } from '@/lib/theme';
import { Plus, Minus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertWeightForDisplay, convertWeightToLbs, roundDownForDisplay } from '@/utils/conversions';
import type { Settings } from '@/types/aircraft';

interface BaggageTilesCombinedProps {
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
  baggageA,
  baggageB,
  baggageC,
  onBaggageAChange,
  onBaggageBChange,
  onBaggageCChange,
  settings,
  className
}) => {

  // Convert values for display
  const baggageADisplay = convertWeightForDisplay(baggageA, settings.weightUnits);
  const baggageBDisplay = convertWeightForDisplay(baggageB, settings.weightUnits);
  const baggageCDisplay = convertWeightForDisplay(baggageC, settings.weightUnits);
  const totalBaggageDisplay = baggageADisplay + baggageBDisplay + baggageCDisplay;

  // Max weights for each baggage area (in display units)
  const getMaxWeight = (area: 'A' | 'B' | 'C') => {
    const maxLbs = area === 'A' ? 120 : 80; // Area A: 120 lbs, Areas B&C: 80 lbs each
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

  const adjustWeight = (amount: number, area: 'A' | 'B' | 'C') => {
    const currentValue = Math.floor(area === 'A' ? baggageADisplay : area === 'B' ? baggageBDisplay : baggageCDisplay);
    const maxWeight = getMaxWeight(area);
    const newValue = Math.max(0, Math.min(currentValue + amount, maxWeight));
    handleInputChange(newValue.toString(), area);
  };


  const getCurrentValue = (area: 'A' | 'B' | 'C') => {
    return Math.floor(area === 'A' ? baggageADisplay : area === 'B' ? baggageBDisplay : baggageCDisplay);
  };

  const renderBaggageTab = (area: 'A' | 'B' | 'C') => (
    <TabsContent value={area.toLowerCase()} variant="colored" className="space-y-3 p-3">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustWeight(-5, area)}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex-1 mx-2">
          <Input
            type="number"
            value={getCurrentValue(area)}
            onChange={(e) => handleInputChange(e.target.value, area)}
            className="text-center"
            min="0"
            max={getMaxWeight(area)}
            step="1"
          />
          <div className="text-xs text-center text-muted-foreground mt-1">
            {settings.weightUnits}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustWeight(5, area)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Max: {getMaxWeight(area)} {settings.weightUnits}
      </div>
    </TabsContent>
  );

  return (
    <Card className={cn("relative bg-surface-container border border-border shadow-sm", className)}>
      <CardContent className="p-4 h-full flex flex-col">
        {/* Top two-thirds with tabs */}
        <div className="flex-[2] mb-3">
          <div className="flex items-center mb-3">
            <Package className="h-5 w-5 text-orange-600 mr-2" />
            <span className="font-semibold">Baggage</span>
          </div>

          <Tabs defaultValue="a" className="w-full">
            <TabsList variant="default" className="grid w-full grid-cols-3">
              <TabsTrigger
                value="a"
                variant="colored"
                activeColor={theme.sections.baggage.DEFAULT}
              >
                Area A
              </TabsTrigger>
              <TabsTrigger
                value="b"
                variant="colored"
                activeColor={theme.sections.baggage.DEFAULT}
              >
                Area B
              </TabsTrigger>
              <TabsTrigger
                value="c"
                variant="colored"
                activeColor={theme.sections.baggage.DEFAULT}
              >
                Area C
              </TabsTrigger>
            </TabsList>

            {renderBaggageTab('A')}
            {renderBaggageTab('B')}
            {renderBaggageTab('C')}
          </Tabs>
        </div>

        {/* Bottom third - single line total display */}
        <div className="flex-[1] border-t pt-3 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Baggage: </span>
            <span className="font-bold">{Math.floor(totalBaggageDisplay)} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BaggageTilesCombined;