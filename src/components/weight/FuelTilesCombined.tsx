import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Fuel } from 'lucide-react';
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="left" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                Left Wing
              </TabsTrigger>
              <TabsTrigger value="right" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                Right Wing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="left" className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFuel(-5, true)}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="flex-1 mx-2">
                  <Input
                    type="number"
                    value={Math.floor(fuelLeftDisplay)}
                    onChange={(e) => handleInputChange(e.target.value, true)}
                    className="text-center"
                    min="0"
                    max={settings.fuelUnits === 'litres' ? "87" : "23"}
                    step="1"
                  />
                  <div className="text-xs text-center text-muted-foreground mt-1">
                    {settings.fuelUnits}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFuel(5, true)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                Weight: {roundDownForDisplay(fuelLeftWeight)} {settings.weightUnits}
              </div>
            </TabsContent>

            <TabsContent value="right" className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFuel(-5, false)}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="flex-1 mx-2">
                  <Input
                    type="number"
                    value={Math.floor(fuelRightDisplay)}
                    onChange={(e) => handleInputChange(e.target.value, false)}
                    className="text-center"
                    min="0"
                    max={settings.fuelUnits === 'litres' ? "87" : "23"}
                    step="1"
                  />
                  <div className="text-xs text-center text-muted-foreground mt-1">
                    {settings.fuelUnits}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFuel(5, false)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                Weight: {roundDownForDisplay(fuelRightWeight)} {settings.weightUnits}
              </div>
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