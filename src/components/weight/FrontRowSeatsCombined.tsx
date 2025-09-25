import React from 'react';
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


  const getCurrentValue = (seat: 'pilot' | 'frontPassenger') => {
    return Math.floor(seat === 'pilot' ? pilotDisplay : frontPassengerDisplay);
  };

  const renderSeatControls = (
    seat: 'pilot' | 'frontPassenger',
    isRequired: boolean = false
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
            className={`w-20 h-8 text-center text-sm ${isOutOfRange ? 'text-red-500 border-red-500' : ''}`}
            min="0"
            max={maxWeight}
            step="1"
          />
          <span className="text-muted-foreground">{settings.weightUnits}</span>
          <span className={`text-sm ${isOutOfRange ? 'text-red-500' : 'text-muted-foreground'}`}>
            Max: {maxWeight} {settings.weightUnits}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("relative bg-surface-container border border-border shadow-sm", className)}>
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

        {/* Total display without divider */}
        <div className="mt-2 bg-muted/30 rounded-md p-2">
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