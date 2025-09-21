import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus, User, UserCheck, Package, Fuel } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeightTileProps {
  id: string;
  title: string;
  value: number;
  maxWeight?: number;
  unit: string;
  category: 'pilot' | 'passenger' | 'baggage' | 'fuel';
  isRequired?: boolean;
  onChange: (value: number) => void;
  className?: string;
}

const getIconForCategory = (category: string, isRequired?: boolean) => {
  switch (category) {
    case 'pilot':
      return <UserCheck className="h-5 w-5 text-blue-600" />;
    case 'passenger':
      return <User className="h-5 w-5 text-purple-600" />;
    case 'baggage':
      return <Package className="h-5 w-5 text-orange-600" />;
    case 'fuel':
      return <Fuel className="h-5 w-5 text-green-600" />;
    default:
      return <User className="h-5 w-5 text-gray-600" />;
  }
};

const WeightTile: React.FC<WeightTileProps> = ({
  id,
  title,
  value,
  maxWeight,
  unit,
  category,
  isRequired = false,
  onChange,
  className
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Update input value when prop changes (for external updates)
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Parse and validate the input
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(numericValue);
    } else if (newValue === '' || newValue === '0') {
      onChange(0);
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min((value || 0) + 1, maxWeight || 999);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max((value || 0) - 1, 0);
    onChange(newValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Ensure the input displays the current value on blur
    setInputValue(value.toString());
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Determine if weight is approaching or exceeding limits
  const isApproachingLimit = maxWeight && value > maxWeight * 0.9;
  const isOverLimit = maxWeight && value > maxWeight;

  // Calculate weight percentage for visual indicator
  const weightPercentage = maxWeight ? Math.min((value / maxWeight) * 100, 100) : 0;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isOverLimit && "border-destructive bg-destructive/10",
      isApproachingLimit && !isOverLimit && "border-yellow-500 bg-yellow-50",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIconForCategory(category, isRequired)}
            <h3 className="font-semibold text-sm">
              {title}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </h3>
          </div>
          {maxWeight && (
            <div className="text-xs text-muted-foreground">
              Max: {maxWeight} {unit}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Weight Input */}
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
              className={cn(
                "text-center font-mono",
                isOverLimit && "border-destructive text-destructive"
              )}
              placeholder="0"
              min="0"
              max={maxWeight}
              step="1"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {unit}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleIncrement}
            disabled={maxWeight ? value >= maxWeight : false}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Visual Weight Indicator */}
        {maxWeight && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{maxWeight} {unit}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isOverLimit ? "bg-destructive" :
                  isApproachingLimit ? "bg-yellow-500" :
                  "bg-primary"
                )}
                style={{ width: `${Math.min(weightPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Messages */}
        {isOverLimit && (
          <div className="text-xs text-destructive font-medium">
            ⚠ Exceeds maximum weight
          </div>
        )}
        {isApproachingLimit && !isOverLimit && (
          <div className="text-xs text-yellow-600 font-medium">
            ⚠ Approaching weight limit
          </div>
        )}
        {isRequired && value === 0 && (
          <div className="text-xs text-muted-foreground">
            Required field
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightTile;