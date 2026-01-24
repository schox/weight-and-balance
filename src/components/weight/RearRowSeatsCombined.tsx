import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { theme } from '@/lib/theme';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertWeightForDisplay, convertWeightToLbs, roundDownForDisplay } from '@/utils/conversions';
import type { Settings } from '@/types/aircraft';

interface RearRowSeatsCombinedProps {
  rearPassenger1: number;
  rearPassenger2: number;
  onRearPassenger1Change: (value: number) => void;
  onRearPassenger2Change: (value: number) => void;
  settings: Settings;
  className?: string;
}

const RearRowSeatsCombined: React.FC<RearRowSeatsCombinedProps> = ({
  rearPassenger1,
  rearPassenger2,
  onRearPassenger1Change,
  onRearPassenger2Change,
  settings,
  className
}) => {
  // Max weight for each seat (400 lbs in display units)
  const maxWeight = roundDownForDisplay(convertWeightForDisplay(400, settings.weightUnits));

  // Compute display values from props
  const rp1DisplayValue = Math.round(convertWeightForDisplay(rearPassenger1, settings.weightUnits));
  const rp2DisplayValue = Math.round(convertWeightForDisplay(rearPassenger2, settings.weightUnits));
  const totalRearRowDisplay = rp1DisplayValue + rp2DisplayValue;

  // Local input state (string) to avoid controlled input fighting with browser arrows
  const [rp1Input, setRp1Input] = useState(String(rp1DisplayValue));
  const [rp2Input, setRp2Input] = useState(String(rp2DisplayValue));
  const rp1Focused = useRef(false);
  const rp2Focused = useRef(false);

  // Sync local state from props when not focused
  useEffect(() => {
    if (!rp1Focused.current) setRp1Input(String(rp1DisplayValue));
  }, [rp1DisplayValue]);

  useEffect(() => {
    if (!rp2Focused.current) setRp2Input(String(rp2DisplayValue));
  }, [rp2DisplayValue]);

  // Commit value to global state
  const commitValue = useCallback((rawValue: string, seat: 'rearPassenger1' | 'rearPassenger2') => {
    const parsed = parseInt(rawValue, 10);
    const numValue = isNaN(parsed) ? 0 : parsed;
    const clamped = Math.max(0, Math.min(numValue, maxWeight));
    const weightInLbs = convertWeightToLbs(clamped, settings.weightUnits);

    if (seat === 'rearPassenger1') {
      onRearPassenger1Change(weightInLbs);
      setRp1Input(String(clamped));
    } else {
      onRearPassenger2Change(weightInLbs);
      setRp2Input(String(clamped));
    }
  }, [maxWeight, settings.weightUnits, onRearPassenger1Change, onRearPassenger2Change]);

  const renderSeatControls = (seat: 'rearPassenger1' | 'rearPassenger2') => {
    const inputValue = seat === 'rearPassenger1' ? rp1Input : rp2Input;
    const setInput = seat === 'rearPassenger1' ? setRp1Input : setRp2Input;
    const focusRef = seat === 'rearPassenger1' ? rp1Focused : rp2Focused;
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
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                const clamped = Math.max(0, Math.min(val, maxWeight));
                const lbs = convertWeightToLbs(clamped, settings.weightUnits);
                if (seat === 'rearPassenger1') onRearPassenger1Change(lbs);
                else onRearPassenger2Change(lbs);
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
          <Users className="h-5 w-5 text-purple-600 mr-2" />
          <span className="font-semibold">Rear Row Seats</span>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rearPassenger1" className="w-full flex-1">
          <TabsList variant="default" className="grid w-full grid-cols-2">
            <TabsTrigger
              value="rearPassenger1"
              variant="colored"
              activeColor={theme.sections.passengers.DEFAULT}
            >
              Rear Passenger 1
            </TabsTrigger>
            <TabsTrigger
              value="rearPassenger2"
              variant="colored"
              activeColor={theme.sections.passengers.DEFAULT}
            >
              Rear Passenger 2
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rearPassenger1" variant="colored" className="p-2">
            {renderSeatControls('rearPassenger1')}
          </TabsContent>

          <TabsContent value="rearPassenger2" variant="colored" className="p-2">
            {renderSeatControls('rearPassenger2')}
          </TabsContent>
        </Tabs>

        {/* Total display */}
        <div className="mt-2 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Rear Row: </span>
            <span className="font-bold">{totalRearRowDisplay} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RearRowSeatsCombined;
