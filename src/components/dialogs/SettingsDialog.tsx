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
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>
            Configure your preferred units for weights, volumes, and distances.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Fuel Units */}
          <div className="grid grid-cols-3 items-start gap-3">
            <Label htmlFor="fuel-units" className="text-right font-medium text-sm pt-2">
              Fuel Units
            </Label>
            <div className="col-span-2">
              <Select value={settings.fuelUnits} onValueChange={handleFuelUnitsChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select fuel units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="litres">Litres (L)</SelectItem>
                  <SelectItem value="gallons">Gallons (gal)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                For fuel quantity display
              </p>
            </div>
          </div>

          {/* Weight Units */}
          <div className="grid grid-cols-3 items-start gap-3">
            <Label htmlFor="weight-units" className="text-right font-medium text-sm pt-2">
              Weight Units
            </Label>
            <div className="col-span-2">
              <Select value={settings.weightUnits} onValueChange={handleWeightUnitsChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select weight units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                For all weight displays
              </p>
            </div>
          </div>

          {/* Distance Units */}
          <div className="grid grid-cols-3 items-start gap-3">
            <Label htmlFor="distance-units" className="text-right font-medium text-sm pt-2">
              Distance Units
            </Label>
            <div className="col-span-2">
              <Select value={settings.distanceUnits} onValueChange={handleDistanceUnitsChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select distance units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inches">Inches (in)</SelectItem>
                  <SelectItem value="mm">Millimeters (mm)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                For CG and arm positions
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