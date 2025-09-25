import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { theme } from '@/lib/theme';
import { Fuel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertFuelForDisplay, convertFuelToWeight, roundDownForDisplay } from '@/utils/conversions';
import type { Settings } from '@/types/aircraft';

interface FuelTilesCombinedProps {
  fuelLeft: number;
  fuelRight: number;
  onFuelLeftChange: (value: number) => void;
  onFuelRightChange: (value: number) => void;
  settings: Settings;
  className?: string;
}

const FuelTilesCombined: React.FC<FuelTilesCombinedProps> = ({
  fuelLeft,
  fuelRight,
  onFuelLeftChange,
  onFuelRightChange,
  settings,
  className
}) => {

  // Convert values for display
  const fuelLeftDisplay = convertFuelForDisplay(fuelLeft, settings.fuelUnits);
  const fuelRightDisplay = convertFuelForDisplay(fuelRight, settings.fuelUnits);
  const totalFuelDisplay = fuelLeftDisplay + fuelRightDisplay;

  // Convert to weight
  const fuelLeftWeight = convertFuelToWeight(fuelLeft, settings);
  const fuelRightWeight = convertFuelToWeight(fuelRight, settings);
  const totalFuelWeight = fuelLeftWeight + fuelRightWeight;

  const handleInputChange = (value: string, isLeft: boolean) => {
    const numValue = Math.floor(parseFloat(value) || 0); // Use integers only
    const maxFuel = settings.fuelUnits === 'litres' ? 87 : 23; // 87L or 23 gallons max per tank
    const clampedValue = Math.max(0, Math.min(numValue, maxFuel));

    if (isLeft) {
      onFuelLeftChange(settings.fuelUnits === 'litres' ? clampedValue : clampedValue * 3.78541);
    } else {
      onFuelRightChange(settings.fuelUnits === 'litres' ? clampedValue : clampedValue * 3.78541);
    }
  };

  const adjustFuel = (amount: number, isLeft: boolean) => {
    const currentValue = Math.floor(isLeft ? fuelLeftDisplay : fuelRightDisplay); // Use integers
    const newValue = Math.max(0, Math.min(currentValue + amount,
      settings.fuelUnits === 'litres' ? 87 : 23));
    handleInputChange(newValue.toString(), isLeft);
  };

  const renderFuelTab = (isLeft: boolean) => {
    const currentValue = Math.floor(isLeft ? fuelLeftDisplay : fuelRightDisplay);
    const maxFuel = settings.fuelUnits === 'litres' ? 87 : 23;
    const weight = roundDownForDisplay(isLeft ? fuelLeftWeight : fuelRightWeight);
    const isOutOfRange = currentValue < 0 || currentValue > maxFuel;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleInputChange(e.target.value, isLeft)}
            className={`w-16 h-8 text-center text-sm ${isOutOfRange ? 'text-red-500 border-red-500' : ''}`}
            min="0"
            max={maxFuel}
            step="1"
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
    <Card className={cn("relative bg-surface-container border border-border shadow-sm", className)}>
      <CardContent className="p-4 h-full flex flex-col">
        {/* Top two-thirds with tabs */}
        <div className="flex-[2] mb-3">
          <div className="flex items-center mb-3">
            <Fuel className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-semibold">Fuel Tanks</span>
          </div>

          <Tabs defaultValue="left" className="w-full">
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

            <TabsContent value="left" variant="colored" className="space-y-3 p-3">
              {renderFuelTab(true)}
            </TabsContent>

            <TabsContent value="right" variant="colored" className="space-y-3 p-3">
              {renderFuelTab(false)}
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom third - single line total display */}
        <div className="flex-[1] border-t pt-3 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Fuel: </span>
            <span className="font-bold">{Math.floor(totalFuelDisplay)} {settings.fuelUnits}</span>
            <span className="text-muted-foreground ml-2">{roundDownForDisplay(totalFuelWeight)} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FuelTilesCombined;