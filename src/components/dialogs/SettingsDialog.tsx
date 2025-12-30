import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings } from 'lucide-react';
import type { Settings as SettingsType } from '@/types/aircraft';

interface SettingsDialogProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
  children?: React.ReactNode;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  settings,
  onSettingsChange,
  children
}) => {
  const handleFuelUnitsChange = (value: 'litres' | 'gallons') => {
    onSettingsChange({
      ...settings,
      fuelUnits: value
    });
  };

  const handleWeightUnitsChange = (value: 'lbs' | 'kg') => {
    onSettingsChange({
      ...settings,
      weightUnits: value
    });
  };

  const handleDistanceUnitsChange = (value: 'inches' | 'mm') => {
    onSettingsChange({
      ...settings,
      distanceUnits: value
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[360px] bg-white">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>
            Configure your preferred units for weights, volumes, and distances.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Fuel Units */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fuel-units" className="text-right font-medium">
              Fuel Units
            </Label>
            <div className="col-span-3">
              <Select value={settings.fuelUnits} onValueChange={handleFuelUnitsChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="litres">Litres (L)</SelectItem>
                  <SelectItem value="gallons">Gallons (gal)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Volume units for fuel quantity display and input
              </p>
            </div>
          </div>

          {/* Weight Units */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight-units" className="text-right font-medium">
              Weight Units
            </Label>
            <div className="col-span-3">
              <Select value={settings.weightUnits} onValueChange={handleWeightUnitsChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weight units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Weight units for all weight displays and inputs
              </p>
            </div>
          </div>

          {/* Distance Units */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distance-units" className="text-right font-medium">
              Distance Units
            </Label>
            <div className="col-span-3">
              <Select value={settings.distanceUnits} onValueChange={handleDistanceUnitsChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select distance units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inches">Inches (in)</SelectItem>
                  <SelectItem value="mm">Millimeters (mm)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Distance units for CG position and arm measurements
              </p>
            </div>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-2">Current Settings:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Fuel: {settings.fuelUnits === 'litres' ? 'Litres (L)' : 'Gallons (gal)'}</div>
            <div>• Weight: {settings.weightUnits === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}</div>
            <div>• Distance: {settings.distanceUnits === 'inches' ? 'Inches (in)' : 'Millimeters (mm)'}</div>
          </div>
        </div>

        </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;