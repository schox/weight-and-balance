import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  // Convert values for display
  const rearPassenger1Display = convertWeightForDisplay(rearPassenger1, settings.weightUnits);
  const rearPassenger2Display = convertWeightForDisplay(rearPassenger2, settings.weightUnits);
  const totalRearRowDisplay = rearPassenger1Display + rearPassenger2Display;

  // Max weight for each seat (400 lbs in display units)
  const getMaxWeight = () => {
    return roundDownForDisplay(convertWeightForDisplay(400, settings.weightUnits));
  };

  const handleInputChange = (value: string, seat: 'rearPassenger1' | 'rearPassenger2') => {
    const numValue = Math.floor(parseFloat(value) || 0); // Use integers only
    const maxWeight = getMaxWeight();
    const clampedValue = Math.max(0, Math.min(numValue, maxWeight));
    const weightInLbs = convertWeightToLbs(clampedValue, settings.weightUnits);

    if (seat === 'rearPassenger1') {
      onRearPassenger1Change(weightInLbs);
    } else {
      onRearPassenger2Change(weightInLbs);
    }
  };

  const adjustWeight = (amount: number, seat: 'rearPassenger1' | 'rearPassenger2') => {
    const currentValue = Math.floor(seat === 'rearPassenger1' ? rearPassenger1Display : rearPassenger2Display);
    const maxWeight = getMaxWeight();
    const newValue = Math.max(0, Math.min(currentValue + amount, maxWeight));
    handleInputChange(newValue.toString(), seat);
  };

  const getCurrentValue = (seat: 'rearPassenger1' | 'rearPassenger2') => {
    return Math.floor(seat === 'rearPassenger1' ? rearPassenger1Display : rearPassenger2Display);
  };

  const renderSeatControls = (
    seat: 'rearPassenger1' | 'rearPassenger2'
  ) => {
    const currentValue = getCurrentValue(seat);
    const maxWeight = getMaxWeight();
    const isOutOfRange = currentValue < 0 || currentValue > maxWeight;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleInputChange(e.target.value, seat)}
            className={`w-16 h-8 text-center text-sm ${isOutOfRange ? 'text-red-500 border-red-500' : ''}`}
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
    <Card className={cn("relative bg-surface-container border border-border shadow-sm", className)}>
      <CardContent className="p-4 h-full flex flex-col">
        {/* Top two-thirds with tabs */}
        <div className="flex-[2] mb-3">
          <div className="flex items-center mb-3">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-semibold">Rear Row Seats</span>
          </div>

          <Tabs defaultValue="rearPassenger1" className="w-full">
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

            <TabsContent value="rearPassenger1" variant="colored" className="space-y-3 p-3">
              {renderSeatControls('rearPassenger1')}
            </TabsContent>

            <TabsContent value="rearPassenger2" variant="colored" className="space-y-3 p-3">
              {renderSeatControls('rearPassenger2')}
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom third - single line total display */}
        <div className="flex-[1] border-t pt-3 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Rear Row: </span>
            <span className="font-bold">{Math.floor(totalRearRowDisplay)} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RearRowSeatsCombined;