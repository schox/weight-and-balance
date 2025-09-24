import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, User } from 'lucide-react';
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

  // Convert values for display
  const pilotDisplay = convertWeightForDisplay(pilot, settings.weightUnits);
  const frontPassengerDisplay = convertWeightForDisplay(frontPassenger, settings.weightUnits);
  const totalFrontRowDisplay = pilotDisplay + frontPassengerDisplay;

  // Max weight for each seat (400 lbs in display units)
  const getMaxWeight = () => {
    return roundDownForDisplay(convertWeightForDisplay(400, settings.weightUnits));
  };

  const handleInputChange = (value: string, seat: 'pilot' | 'frontPassenger') => {
    const numValue = Math.floor(parseFloat(value) || 0); // Use integers only
    const maxWeight = getMaxWeight();
    const clampedValue = Math.max(0, Math.min(numValue, maxWeight));
    const weightInLbs = convertWeightToLbs(clampedValue, settings.weightUnits);

    if (seat === 'pilot') {
      onPilotChange(weightInLbs);
    } else {
      onFrontPassengerChange(weightInLbs);
    }
  };

  const adjustWeight = (amount: number, seat: 'pilot' | 'frontPassenger') => {
    const currentValue = Math.floor(seat === 'pilot' ? pilotDisplay : frontPassengerDisplay);
    const maxWeight = getMaxWeight();
    const newValue = Math.max(0, Math.min(currentValue + amount, maxWeight));
    handleInputChange(newValue.toString(), seat);
  };

  const getCurrentValue = (seat: 'pilot' | 'frontPassenger') => {
    return Math.floor(seat === 'pilot' ? pilotDisplay : frontPassengerDisplay);
  };

  const renderSeatControls = (
    seat: 'pilot' | 'frontPassenger',
    isRequired: boolean = false
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustWeight(-5, seat)}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex-1 mx-2">
          <Input
            type="number"
            value={getCurrentValue(seat)}
            onChange={(e) => handleInputChange(e.target.value, seat)}
            className="text-center"
            min="0"
            max={getMaxWeight()}
            step="1"
          />
          <div className="text-xs text-center text-muted-foreground mt-1">
            {settings.weightUnits}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustWeight(5, seat)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Max: {getMaxWeight()} {settings.weightUnits}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </div>
    </div>
  );

  return (
    <Card className={cn("relative bg-surface-container border border-border shadow-sm", className)}>
      <CardContent className="p-4 h-full flex flex-col">
        {/* Top two-thirds with tabs */}
        <div className="flex-[2] mb-3">
          <div className="flex items-center mb-3">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-semibold">Front Row Seats</span>
          </div>

          <Tabs defaultValue="pilot" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pilot" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Pilot
              </TabsTrigger>
              <TabsTrigger value="frontPassenger" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Front Passenger
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pilot" className="mt-3">
              {renderSeatControls('pilot', true)}
            </TabsContent>

            <TabsContent value="frontPassenger" className="mt-3">
              {renderSeatControls('frontPassenger')}
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom third - single line total display */}
        <div className="flex-[1] border-t pt-3 bg-muted/30 rounded-md p-2">
          <div className="text-center text-sm">
            <span className="font-semibold">Total Front Row: </span>
            <span className="font-bold">{Math.floor(totalFrontRowDisplay)} {settings.weightUnits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FrontRowSeatsCombined;