import React, { useState, useRef, useEffect, useCallback } from 'react';
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

  // Get loading stations
  const baggageAStation = aircraft.loadingStations.find(s => s.id === 'baggageA');
  const baggageBStation = aircraft.loadingStations.find(s => s.id === 'baggageB');
  const baggageCStation = aircraft.loadingStations.find(s => s.id === 'baggageC');

  // Max weights in display units
  const getMaxWeight = (area: 'A' | 'B' | 'C') => {
    let maxLbs = 0;
    if (area === 'A' && baggageAStation) maxLbs = baggageAStation.maxWeightLbs;
    else if (area === 'B' && baggageBStation) maxLbs = baggageBStation.maxWeightLbs;
    else if (area === 'C' && baggageCStation) maxLbs = baggageCStation.maxWeightLbs;
    return roundDownForDisplay(convertWeightForDisplay(maxLbs, settings.weightUnits));
  };

  // Compute display values from props
  const bagADisplay = Math.round(convertWeightForDisplay(baggageA, settings.weightUnits));
  const bagBDisplay = Math.round(convertWeightForDisplay(baggageB, settings.weightUnits));
  const bagCDisplay = hasBaggageC ? Math.round(convertWeightForDisplay(baggageC, settings.weightUnits)) : 0;
  const totalBaggageDisplay = bagADisplay + bagBDisplay + bagCDisplay;

  // Local input state (string) to avoid controlled input issues
  const [bagAInput, setBagAInput] = useState(String(bagADisplay));
  const [bagBInput, setBagBInput] = useState(String(bagBDisplay));
  const [bagCInput, setBagCInput] = useState(String(bagCDisplay));
  const bagAFocused = useRef(false);
  const bagBFocused = useRef(false);
  const bagCFocused = useRef(false);

  // Sync local state from props when not focused
  useEffect(() => {
    if (!bagAFocused.current) setBagAInput(String(bagADisplay));
  }, [bagADisplay]);

  useEffect(() => {
    if (!bagBFocused.current) setBagBInput(String(bagBDisplay));
  }, [bagBDisplay]);

  useEffect(() => {
    if (!bagCFocused.current) setBagCInput(String(bagCDisplay));
  }, [bagCDisplay]);

  const getOnChange = useCallback((area: 'A' | 'B' | 'C') => {
    if (area === 'A') return onBaggageAChange;
    if (area === 'B') return onBaggageBChange;
    return onBaggageCChange;
  }, [onBaggageAChange, onBaggageBChange, onBaggageCChange]);

  // Commit value to global state
  const commitValue = useCallback((rawValue: string, area: 'A' | 'B' | 'C') => {
    const parsed = parseInt(rawValue, 10);
    const numValue = isNaN(parsed) ? 0 : parsed;
    // Inline max weight calculation to satisfy exhaustive-deps
    let maxLbs = 0;
    if (area === 'A' && baggageAStation) maxLbs = baggageAStation.maxWeightLbs;
    else if (area === 'B' && baggageBStation) maxLbs = baggageBStation.maxWeightLbs;
    else if (area === 'C' && baggageCStation) maxLbs = baggageCStation.maxWeightLbs;
    const maxWeight = roundDownForDisplay(convertWeightForDisplay(maxLbs, settings.weightUnits));
    const clamped = Math.max(0, Math.min(numValue, maxWeight));
    const weightInLbs = convertWeightToLbs(clamped, settings.weightUnits);

    getOnChange(area)(weightInLbs);
    if (area === 'A') setBagAInput(String(clamped));
    else if (area === 'B') setBagBInput(String(clamped));
    else setBagCInput(String(clamped));
  }, [settings.weightUnits, getOnChange, baggageAStation, baggageBStation, baggageCStation]);

  const renderBaggageTab = (area: 'A' | 'B' | 'C') => {
    const inputValue = area === 'A' ? bagAInput : area === 'B' ? bagBInput : bagCInput;
    const setInput = area === 'A' ? setBagAInput : area === 'B' ? setBagBInput : setBagCInput;
    const focusRef = area === 'A' ? bagAFocused : area === 'B' ? bagBFocused : bagCFocused;
    const maxWeight = getMaxWeight(area);
    const displayNum = parseInt(inputValue, 10) || 0;
    const isOutOfRange = displayNum < 0 || displayNum > maxWeight;
    const onChange = getOnChange(area);

    return (
      <TabsContent value={area.toLowerCase()} variant="colored" className="p-2">
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
                onChange(lbs);
              }
            }}
            onFocus={() => {
              focusRef.current = true;
            }}
            onBlur={(e) => {
              focusRef.current = false;
              commitValue(e.target.value, area);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitValue((e.target as HTMLInputElement).value, area);
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
      </TabsContent>
    );
  };

  return (
    <Card className={cn("relative bg-surface-container border border-border", className)}>
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

        {/* Total display */}
        <div className="mt-2 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Baggage: </span>
            <span className="font-bold">{totalBaggageDisplay} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BaggageTilesCombined;
