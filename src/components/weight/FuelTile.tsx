import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Fuel, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFuelWeightLbs } from '@/utils/conversions';
import type { FuelUnit } from '@/types/aircraft';

interface FuelTileProps {
  id: string;
  title: string;
  value: number;
  maxQuantity: number;
  fuelUnit: FuelUnit;
  side: 'left' | 'right';
  onChange: (value: number) => void;
  onSync?: () => void;
  isSynced?: boolean;
  className?: string;
}

const FuelTile: React.FC<FuelTileProps> = ({
  title,
  value,
  maxQuantity,
  fuelUnit,
  onChange,
  onSync,
  isSynced = false,
  className
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Update input value when prop changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(Math.min(numericValue, maxQuantity));
    } else if (newValue === '' || newValue === '0') {
      onChange(0);
    }
  };

  const handleIncrement = () => {
    const increment = fuelUnit === 'litres' ? 5 : 1; // Larger increments for litres
    const newValue = Math.min(value + increment, maxQuantity);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const decrement = fuelUnit === 'litres' ? 5 : 1;
    const newValue = Math.max(value - decrement, 0);
    onChange(newValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setInputValue(value.toString());
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Calculate fuel weight for display
  const fuelWeightLbs = getFuelWeightLbs(value, fuelUnit);

  // Calculate percentage for visual indicator
  const fuelPercentage = (value / maxQuantity) * 100;

  // Quick preset buttons
  const presets = fuelUnit === 'litres'
    ? [0, Math.round(maxQuantity * 0.25), Math.round(maxQuantity * 0.5), Math.round(maxQuantity * 0.75), maxQuantity]
    : [0, Math.round(maxQuantity * 0.25), Math.round(maxQuantity * 0.5), Math.round(maxQuantity * 0.75), maxQuantity];

  const isNearEmpty = value < maxQuantity * 0.1;
  const isFull = value >= maxQuantity * 0.95;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isSynced && "ring-2 ring-blue-500/50",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-sm">{title}</h3>
            {onSync && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onSync}
                title="Sync fuel tanks"
              >
                <Link className={cn(
                  "h-3 w-3 transition-colors",
                  isSynced ? "text-blue-600" : "text-muted-foreground"
                )} />
              </Button>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Max: {maxQuantity} {fuelUnit}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Fuel Quantity Input */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleDecrement}
            disabled={value <= 0}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <div className="flex-1 relative">
            <Input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="text-center font-mono"
              placeholder="0"
              min="0"
              max={maxQuantity}
              step={fuelUnit === 'litres' ? '5' : '1'}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {fuelUnit}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleIncrement}
            disabled={value >= maxQuantity}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Weight Display */}
        <div className="text-center py-2 bg-muted/50 rounded-md">
          <div className="text-sm font-medium">
            {fuelWeightLbs.toFixed(1)} lbs
          </div>
          <div className="text-xs text-muted-foreground">
            Fuel Weight
          </div>
        </div>

        {/* Visual Fuel Gauge */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Empty</span>
            <span>{fuelPercentage.toFixed(0)}%</span>
            <span>Full</span>
          </div>

          {/* Tank visualization */}
          <div className="relative h-8 bg-muted rounded-lg overflow-hidden border">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-lg",
                isNearEmpty ? "bg-red-500" :
                fuelPercentage < 50 ? "bg-yellow-500" :
                "bg-green-500"
              )}
              style={{ width: `${Math.min(fuelPercentage, 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground mix-blend-difference">
              {value} {fuelUnit}
            </div>
          </div>
        </div>

        {/* Quick Preset Buttons */}
        <div className="grid grid-cols-5 gap-1">
          {presets.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={() => onChange(preset)}
              disabled={preset === value}
            >
              {index === 0 ? 'E' :
               index === presets.length - 1 ? 'F' :
               `${Math.round((preset / maxQuantity) * 100)}%`}
            </Button>
          ))}
        </div>

        {/* Status Messages */}
        {isFull && (
          <div className="text-xs text-green-600 font-medium text-center">
            ✓ Tank Full
          </div>
        )}
        {isNearEmpty && value > 0 && (
          <div className="text-xs text-yellow-600 font-medium text-center">
            ⚠ Low Fuel
          </div>
        )}
        {value === 0 && (
          <div className="text-xs text-muted-foreground text-center">
            Tank Empty
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FuelTile;