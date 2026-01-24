import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';
import type { Aircraft, LoadingState, CalculationResult, Settings, FuelBurnState } from '@/types/aircraft';
import { generateWeightBalancePDF } from '@/utils/generatePDF';

interface GeneratePDFDialogProps {
  aircraft: Aircraft;
  loadingState: LoadingState;
  calculations: CalculationResult;
  settings: Settings;
  fuelBurnState?: FuelBurnState;
  children?: React.ReactNode;
}

const GeneratePDFDialog: React.FC<GeneratePDFDialogProps> = ({
  aircraft,
  loadingState,
  calculations,
  settings,
  fuelBurnState,
  children
}) => {
  const [flightDate, setFlightDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format for the input
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [pilotName, setPilotName] = useState('');
  const [open, setOpen] = useState(false);

  const handleGenerate = () => {
    // Format the date for display
    const dateObj = new Date(flightDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    generateWeightBalancePDF({
      aircraft,
      loadingState,
      calculations,
      settings,
      fuelBurnState,
      flightDate: formattedDate,
      pilotName: pilotName || 'Not specified',
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            Generate PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Generate Loading Sheet</DialogTitle>
          <DialogDescription>
            Create a PDF weight & balance loading sheet for {aircraft.registration}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Date of Flight */}
          <div className="grid grid-cols-3 items-start gap-3">
            <Label htmlFor="flight-date" className="text-right font-medium text-sm pt-2">
              Flight Date
            </Label>
            <div className="col-span-2">
              <Input
                id="flight-date"
                type="date"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Pilot Name */}
          <div className="grid grid-cols-3 items-start gap-3">
            <Label htmlFor="pilot-name" className="text-right font-medium text-sm pt-2">
              Pilot Name
            </Label>
            <div className="col-span-2">
              <Input
                id="pilot-name"
                type="text"
                value={pilotName}
                onChange={(e) => setPilotName(e.target.value)}
                placeholder="Enter pilot name"
                className="h-9"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Current Loading Summary:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Aircraft: {aircraft.registration} ({aircraft.model})</div>
            <div>Total Weight: {calculations.totalWeight.toFixed(1)} lbs ({(calculations.totalWeight * 0.453592).toFixed(1)} kg)</div>
            <div>CG Position: {(calculations.cgPosition / 25.4).toFixed(1)}" ({calculations.cgPosition.toFixed(0)} mm)</div>
            <div className={calculations.withinEnvelope ? 'text-green-600' : 'text-red-600'}>
              Status: {calculations.withinEnvelope && calculations.totalWeight <= aircraft.maxTakeoffWeightLbs ? 'WITHIN LIMITS' : 'OUT OF LIMITS'}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleGenerate} className="gap-2">
            <FileDown className="h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratePDFDialog;
