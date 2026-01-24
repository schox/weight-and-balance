import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { theme } from '@/lib/theme';
import { Fuel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertFuelForDisplay, convertFuelToWeight, roundDownForDisplay } from '@/utils/conversions';
import type { Settings, Aircraft } from '@/types/aircraft';

interface FuelTilesCombinedProps {
  aircraft: Aircraft;
  fuelLeft: number;
  fuelRight: number;
  onFuelLeftChange: (value: number) => void;
  onFuelRightChange: (value: number) => void;
  settings: Settings;
  className?: string;
}

const FuelTilesCombined: React.FC<FuelTilesCombinedProps> = ({
  aircraft,
  fuelLeft,
  fuelRight,
  onFuelLeftChange,
  onFuelRightChange,
  settings,
  className
}) => {
  // Get max fuel per tank from aircraft (half of total capacity)
  const maxFuelPerTankGallons = aircraft.fuelCapacityGallons / 2;
  const maxFuelPerTankLitres = aircraft.fuelCapacityLitres / 2;

  // Convert values for display
  const fuelLeftDisplay = convertFuelForDisplay(fuelLeft, settings.fuelUnits);
  const fuelRightDisplay = convertFuelForDisplay(fuelRight, settings.fuelUnits);
  const totalFuelDisplay = fuelLeftDisplay + fuelRightDisplay;

  // Convert to weight
  const fuelLeftWeight = convertFuelToWeight(fuelLeft, settings);
  const fuelRightWeight = convertFuelToWeight(fuelRight, settings);
  const totalFuelWeight = fuelLeftWeight + fuelRightWeight;

  // Max fuel per tank in current display units (keep decimal precision for accurate max)
  const maxFuelPerTank = settings.fuelUnits === 'litres'
    ? Math.round(maxFuelPerTankLitres * 10) / 10
    : Math.round(maxFuelPerTankGallons * 10) / 10;

  const handleInputChange = (value: string, isLeft: boolean) => {
    const numValue = Math.round((parseFloat(value) || 0) * 10) / 10; // Round to 1 decimal
    const clampedValue = Math.max(0, Math.min(numValue, maxFuelPerTank));

    if (isLeft) {
      onFuelLeftChange(settings.fuelUnits === 'litres' ? clampedValue : clampedValue * 3.78541);
    } else {
      onFuelRightChange(settings.fuelUnits === 'litres' ? clampedValue : clampedValue * 3.78541);
    }
  };


  const renderFuelTab = (isLeft: boolean) => {
    const rawValue = isLeft ? fuelLeftDisplay : fuelRightDisplay;
    const currentValue = Math.round(rawValue * 10) / 10;
    const maxFuel = maxFuelPerTank;
    const weight = roundDownForDisplay(isLeft ? fuelLeftWeight : fuelRightWeight);
    const isOutOfRange = currentValue < 0 || currentValue > maxFuel + 0.05;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleInputChange(e.target.value, isLeft)}
            className={`w-20 h-8 text-center text-sm ${isOutOfRange ? 'text-red-500 border-red-500' : ''}`}
            min="0"
            max={maxFuel}
            step="0.5"
          />
          <span className="text-muted-foreground">{settings.fuelUnits}</span>
          <span className={`text-sm ${isOutOfRange ? 'text-red-500' : 'text-muted-foreground'}`}>
            Max: {maxFuel} {settings.fuelUnits}
          </span>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Weight: {weight} {settings.weightUnits}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("relative bg-surface-container border border-border ", className)}>
      <CardContent className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-2">
          <Fuel className="h-5 w-5 text-green-600 mr-2" />
          <span className="font-semibold">Fuel Tanks</span>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="left" className="w-full flex-1">
          <TabsList variant="default" className="grid w-full grid-cols-2">
            <TabsTrigger
              value="left"
              variant="colored"
              activeColor={theme.sections.fuel.DEFAULT}
            >
              Left Wing
            </TabsTrigger>
            <TabsTrigger
              value="right"
              variant="colored"
              activeColor={theme.sections.fuel.DEFAULT}
            >
              Right Wing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="left" variant="colored" className="p-2">
            {renderFuelTab(true)}
          </TabsContent>

          <TabsContent value="right" variant="colored" className="p-2">
            {renderFuelTab(false)}
          </TabsContent>
        </Tabs>

        {/* Total display without divider */}
        <div className="mt-2 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Fuel: </span>
            <span className="font-bold">{Math.round(totalFuelDisplay * 10) / 10} {settings.fuelUnits}</span>
            <span className="text-muted-foreground ml-2">{roundDownForDisplay(totalFuelWeight)} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FuelTilesCombined;