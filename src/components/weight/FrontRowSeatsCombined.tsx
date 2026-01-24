import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { theme } from '@/lib/theme';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertWeightForDisplay, convertWeightToLbs, roundDownForDisplay } from '@/utils/conversions';
import type { Settings } from '@/types/aircraft';

interface FrontRowSeatsCombinedProps {
  pilot: number;
  frontPassenger: number;
  onPilotChange: (value: number) => void;
  onFrontPassengerChange: (value: number) => void;
  settings: Settings;
  className?: string;
}

const FrontRowSeatsCombined: React.FC<FrontRowSeatsCombinedProps> = ({
  pilot,
  frontPassenger,
  onPilotChange,
  onFrontPassengerChange,
  settings,
  className
}) => {
  // Max weight for each seat (400 lbs in display units)
  const maxWeight = roundDownForDisplay(convertWeightForDisplay(400, settings.weightUnits));

  // Compute display values from props
  const pilotDisplayValue = Math.round(convertWeightForDisplay(pilot, settings.weightUnits));
  const fpDisplayValue = Math.round(convertWeightForDisplay(frontPassenger, settings.weightUnits));
  const totalFrontRowDisplay = pilotDisplayValue + fpDisplayValue;

  // Local input state (string) to avoid controlled input fighting with browser arrows
  const [pilotInput, setPilotInput] = useState(String(pilotDisplayValue));
  const [fpInput, setFpInput] = useState(String(fpDisplayValue));
  const pilotFocused = useRef(false);
  const fpFocused = useRef(false);

  // Sync local state from props when not focused
  useEffect(() => {
    if (!pilotFocused.current) setPilotInput(String(pilotDisplayValue));
  }, [pilotDisplayValue]);

  useEffect(() => {
    if (!fpFocused.current) setFpInput(String(fpDisplayValue));
  }, [fpDisplayValue]);

  // Commit value to global state
  const commitValue = useCallback((rawValue: string, seat: 'pilot' | 'frontPassenger') => {
    const parsed = parseInt(rawValue, 10);
    const numValue = isNaN(parsed) ? 0 : parsed;
    const clamped = Math.max(0, Math.min(numValue, maxWeight));
    const weightInLbs = convertWeightToLbs(clamped, settings.weightUnits);

    if (seat === 'pilot') {
      onPilotChange(weightInLbs);
      setPilotInput(String(clamped));
    } else {
      onFrontPassengerChange(weightInLbs);
      setFpInput(String(clamped));
    }
  }, [maxWeight, settings.weightUnits, onPilotChange, onFrontPassengerChange]);

  const renderSeatControls = (seat: 'pilot' | 'frontPassenger') => {
    const inputValue = seat === 'pilot' ? pilotInput : fpInput;
    const setInput = seat === 'pilot' ? setPilotInput : setFpInput;
    const focusRef = seat === 'pilot' ? pilotFocused : fpFocused;
    const displayNum = parseInt(inputValue, 10) || 0;
    const isOutOfRange = displayNum < 0 || displayNum > maxWeight;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => {
              setInput(e.target.value);
              // Immediately commit arrow-key changes (integer step)
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                const clamped = Math.max(0, Math.min(val, maxWeight));
                const lbs = convertWeightToLbs(clamped, settings.weightUnits);
                if (seat === 'pilot') onPilotChange(lbs);
                else onFrontPassengerChange(lbs);
              }
            }}
            onFocus={() => {
              focusRef.current = true;
            }}
            onBlur={(e) => {
              focusRef.current = false;
              commitValue(e.target.value, seat);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitValue((e.target as HTMLInputElement).value, seat);
                (e.target as HTMLInputElement).blur();
              }
            }}
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
      </div>
    );
  };

  return (
    <Card className={cn("relative bg-surface-container border border-border", className)}>
      <CardContent className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-2">
          <User className="h-5 w-5 text-blue-600 mr-2" />
          <span className="font-semibold">Front Row Seats</span>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pilot" className="w-full flex-1">
          <TabsList variant="default" className="grid w-full grid-cols-2">
            <TabsTrigger
              value="pilot"
              variant="colored"
              activeColor={theme.sections.pilot.DEFAULT}
            >
              Pilot
            </TabsTrigger>
            <TabsTrigger
              value="frontPassenger"
              variant="colored"
              activeColor={theme.sections.pilot.DEFAULT}
            >
              Front Passenger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pilot" variant="colored" className="p-2">
            {renderSeatControls('pilot')}
          </TabsContent>

          <TabsContent value="frontPassenger" variant="colored" className="p-2">
            {renderSeatControls('frontPassenger')}
          </TabsContent>
        </Tabs>

        {/* Total display */}
        <div className="mt-2 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Front Row: </span>
            <span className="font-bold">{totalFrontRowDisplay} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FrontRowSeatsCombined;
