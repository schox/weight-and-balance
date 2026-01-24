import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { theme } from '@/lib/theme';
import { Fuel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertFuelForDisplay, convertFuelToWeight, roundDownForDisplay } from '@/utils/conversions';
import type { Settings, Aircraft } from '@/types/aircraft';

const GALLONS_TO_LITRES = 3.78541;

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
  // Max fuel per tank in display units
  const maxFuelPerTankGallons = aircraft.fuelCapacityGallons / 2;
  const maxFuelPerTankLitres = aircraft.fuelCapacityLitres / 2;
  const maxFuelPerTank = settings.fuelUnits === 'litres'
    ? Math.round(maxFuelPerTankLitres)
    : Math.round(maxFuelPerTankGallons * 10) / 10;

  // Convert stored litres to display values
  const fuelLeftDisplay = Math.round(convertFuelForDisplay(fuelLeft, settings.fuelUnits));
  const fuelRightDisplay = Math.round(convertFuelForDisplay(fuelRight, settings.fuelUnits));
  const totalFuelDisplay = fuelLeftDisplay + fuelRightDisplay;

  // Convert to weight for display
  const fuelLeftWeight = convertFuelToWeight(fuelLeft, settings);
  const fuelRightWeight = convertFuelToWeight(fuelRight, settings);
  const totalFuelWeight = fuelLeftWeight + fuelRightWeight;

  // Local input state (string)
  const [leftInput, setLeftInput] = useState(String(fuelLeftDisplay));
  const [rightInput, setRightInput] = useState(String(fuelRightDisplay));
  const leftFocused = useRef(false);
  const rightFocused = useRef(false);

  // Sync local state from props when not focused
  useEffect(() => {
    if (!leftFocused.current) setLeftInput(String(fuelLeftDisplay));
  }, [fuelLeftDisplay]);

  useEffect(() => {
    if (!rightFocused.current) setRightInput(String(fuelRightDisplay));
  }, [fuelRightDisplay]);

  // Convert display value to litres for storage
  const displayToLitres = (displayValue: number): number => {
    return settings.fuelUnits === 'litres' ? displayValue : displayValue * GALLONS_TO_LITRES;
  };

  // Commit value to global state
  const commitValue = useCallback((rawValue: string, isLeft: boolean) => {
    const parsed = parseInt(rawValue, 10);
    const numValue = isNaN(parsed) ? 0 : parsed;
    const clamped = Math.max(0, Math.min(numValue, maxFuelPerTank));
    const litres = settings.fuelUnits === 'litres' ? clamped : clamped * GALLONS_TO_LITRES;

    if (isLeft) {
      onFuelLeftChange(litres);
      setLeftInput(String(clamped));
    } else {
      onFuelRightChange(litres);
      setRightInput(String(clamped));
    }
  }, [maxFuelPerTank, settings.fuelUnits, onFuelLeftChange, onFuelRightChange]);

  const renderFuelTab = (isLeft: boolean) => {
    const inputValue = isLeft ? leftInput : rightInput;
    const setInput = isLeft ? setLeftInput : setRightInput;
    const focusRef = isLeft ? leftFocused : rightFocused;
    const weight = roundDownForDisplay(isLeft ? fuelLeftWeight : fuelRightWeight);
    const displayNum = parseInt(inputValue, 10) || 0;
    const isOutOfRange = displayNum < 0 || displayNum > maxFuelPerTank;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => {
              setInput(e.target.value);
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                const clamped = Math.max(0, Math.min(val, maxFuelPerTank));
                const litres = displayToLitres(clamped);
                if (isLeft) onFuelLeftChange(litres);
                else onFuelRightChange(litres);
              }
            }}
            onFocus={() => {
              focusRef.current = true;
            }}
            onBlur={(e) => {
              focusRef.current = false;
              commitValue(e.target.value, isLeft);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitValue((e.target as HTMLInputElement).value, isLeft);
                (e.target as HTMLInputElement).blur();
              }
            }}
            className={`w-20 h-8 text-center text-sm ${isOutOfRange ? 'text-red-500 border-red-500' : ''}`}
            min="0"
            max={maxFuelPerTank}
            step="1"
          />
          <span className="text-muted-foreground">{settings.fuelUnits}</span>
          <span className={`text-sm ${isOutOfRange ? 'text-red-500' : 'text-muted-foreground'}`}>
            Max: {maxFuelPerTank} {settings.fuelUnits}
          </span>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Weight: {weight} {settings.weightUnits}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("relative bg-surface-container border border-border", className)}>
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

        {/* Total display */}
        <div className="mt-2 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Fuel: </span>
            <span className="font-bold">{totalFuelDisplay} {settings.fuelUnits}</span>
            <span className="text-muted-foreground ml-2">{roundDownForDisplay(totalFuelWeight)} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FuelTilesCombined;
