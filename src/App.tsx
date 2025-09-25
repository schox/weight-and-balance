import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Info, Plane } from "lucide-react";
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

      {/* Main Content with Aircraft Tabs */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Tabs defaultValue="YPB" className="w-full">
          <div className="relative">
            {/* Container for tabs with lines */}
            <div className="flex items-end">
              {/* Left line - extends from left edge to tabs */}
              <div className="flex-1 h-[2px] bg-black self-end mb-0"></div>

              <TabsList variant="default" className="inline-flex relative z-10 gap-0">
                <TabsTrigger
                  value="YPB"
                  variant="default"
                  className="text-base font-semibold px-6"
                >
                  <Plane className="h-4 w-4 mr-2" />
                  YPB C182T
                  <Info className="h-4 w-4 ml-2" />
                </TabsTrigger>
                <TabsTrigger
                  value="KXW"
                  variant="default"
                  className="text-base font-semibold px-6"
                >
                  <Plane className="h-4 w-4 mr-2" />
                  KXW C172SP
                  <Info className="h-4 w-4 ml-2" />
                </TabsTrigger>
              </TabsList>

              {/* Right line - extends from tabs to right edge */}
              <div className="flex-1 h-[2px] bg-black self-end mb-0"></div>
            </div>
          </div>

          <TabsContent value="YPB" variant="borderless" className="mt-4">
            <AircraftTab aircraft={aircraft} settings={settings} />
          </TabsContent>

          <TabsContent value="KXW" variant="borderless" className="mt-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-muted-foreground mb-4">KXW C172SP</h2>
              <p className="text-muted-foreground">Aircraft data coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
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