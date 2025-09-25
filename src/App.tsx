import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Info } from "lucide-react";
import { vhYpbAircraft } from '@/data/aircraft';
import type { Settings as SettingsType } from '@/types/aircraft';
import AircraftTab from '@/components/aircraft/AircraftTab';
import SettingsDialog from '@/components/dialogs/SettingsDialog';
import InfoDialog from '@/components/dialogs/InfoDialog';

function App() {
  const [settings, setSettings] = useState<SettingsType>({
    fuelUnits: 'litres',
    weightUnits: 'kg',
    distanceUnits: 'inches'
  });

  const [selectedAircraft, setSelectedAircraft] = useState<'YPB' | 'KXW'>('YPB');

  const aircraft = vhYpbAircraft; // In the future, this would be selected based on selectedAircraft

  const handleSettingsChange = (newSettings: SettingsType) => {
    setSettings(newSettings);
  };


  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-on-primary shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                Weight & Balance Calculator
              </h1>
              <p className="text-sm opacity-90">
                Curtin Flying Club
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <InfoDialog>
                <Button variant="ghost" size="icon" className="text-on-primary hover:bg-white/20">
                  <Info className="h-5 w-5" />
                </Button>
              </InfoDialog>
              <SettingsDialog
                settings={settings}
                onSettingsChange={handleSettingsChange}
              >
                <Button variant="ghost" size="icon" className="text-on-primary hover:bg-white/20">
                  <Settings className="h-5 w-5" />
                </Button>
              </SettingsDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Aircraft Tabs */}
      <div className="bg-surface-container">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <div className="inline-flex">
              <Button
                variant="ghost"
                className={`text-lg font-bold flex items-center space-x-2 transition-all border-2 border-black px-6 py-3 rounded-t-lg bg-gray-100 text-black hover:bg-gray-200 ${
                  selectedAircraft === 'YPB'
                    ? 'bg-white border-b-0 relative z-10 border-r-2'
                    : 'border-r-0'
                }`}
                onClick={() => setSelectedAircraft('YPB')}
              >
                <span>✈️ YPB C182T</span>
                <Info className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className={`text-lg font-bold flex items-center space-x-2 transition-all border-2 border-black px-6 py-3 rounded-t-lg bg-gray-100 text-black hover:bg-gray-200 border-r-2 ${
                  selectedAircraft === 'KXW'
                    ? 'bg-white border-b-0 relative z-10'
                    : ''
                }`}
                onClick={() => setSelectedAircraft('KXW')}
              >
                <span>✈️ KXW C172SP</span>
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-2 border-black border-t-0 rounded-b-lg bg-white p-6 space-y-8">
          {selectedAircraft === 'YPB' ? (
            <AircraftTab aircraft={aircraft} settings={settings} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-muted-foreground mb-4">KXW C172SP</h2>
              <p className="text-muted-foreground">Aircraft data coming soon...</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
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