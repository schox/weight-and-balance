import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Plane, Info } from "lucide-react";
import { vhYpbAircraft } from '@/data/aircraft';
import type { Settings as SettingsType } from '@/types/aircraft';
import AircraftTab from '@/components/aircraft/AircraftTab';
import SettingsDialog from '@/components/dialogs/SettingsDialog';

function App() {
  const [settings, setSettings] = useState<SettingsType>({
    fuelUnits: 'litres',
    weightUnits: 'kg',
    distanceUnits: 'inches'
  });

  const aircraft = vhYpbAircraft; // In the future, this would be selected based on currentAircraft

  const handleSettingsChange = (newSettings: SettingsType) => {
    setSettings(newSettings);
  };

  const handleInfoClick = () => {
    // TODO: Show aircraft info
    console.log('Info clicked');
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-on-primary shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Plane className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Aircraft Weight & Balance Calculator</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handleInfoClick} className="text-on-primary hover:bg-white/20">
                <Info className="h-4 w-4" />
              </Button>
              <SettingsDialog
                settings={settings}
                onSettingsChange={handleSettingsChange}
              >
                <Button variant="ghost" size="icon" className="text-on-primary hover:bg-white/20">
                  <Settings className="h-4 w-4" />
                </Button>
              </SettingsDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Aircraft Tabs (placeholder for now) */}
      <div className="bg-surface-container border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <Button variant="default" className="rounded-none rounded-t-lg">
              ✈️ VH-YPB C182T
            </Button>
            <Button variant="ghost" className="rounded-none rounded-t-lg" disabled>
              ✈️ Aircraft 2
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        <AircraftTab aircraft={aircraft} settings={settings} />
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-warning">Disclaimer:</strong> This calculator is for planning purposes only.
              Pilots are responsible for verifying all weight and balance calculations.
            </p>
            <p>
              Always refer to the current Aircraft Flight Manual and Weight & Balance documentation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;