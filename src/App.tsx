import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Settings, Info } from "lucide-react";
import type { Settings as SettingsType } from '@/types/aircraft';
import SettingsDialog from '@/components/dialogs/SettingsDialog';
import InfoDialog from '@/components/dialogs/InfoDialog';
import HomePage from '@/pages/HomePage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';

function AppLayout() {
  const [settings, setSettings] = useState<SettingsType>({
    fuelUnits: 'litres',
    weightUnits: 'kg',
    distanceUnits: 'inches'
  });

  const handleSettingsChange = (newSettings: SettingsType) => {
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-white text-black border-b">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex flex-col hover:opacity-80 transition-opacity">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                Weight & Balance Calculator
              </h1>
              <p className="text-sm opacity-90">
                Curtin Flying Club
              </p>
            </Link>
            <div className="flex items-center space-x-2">
              <InfoDialog>
                <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100">
                  <Info className="h-5 w-5" />
                </Button>
              </InfoDialog>
              <SettingsDialog
                settings={settings}
                onSettingsChange={handleSettingsChange}
              >
                <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100">
                  <Settings className="h-5 w-5" />
                </Button>
              </SettingsDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 flex-1">
        <Routes>
          <Route path="/" element={<HomePage settings={settings} />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t mt-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-muted-foreground space-y-3">
            <p>
              <strong className="text-warning">Disclaimer:</strong> This calculator is for planning purposes only.
              Pilots are responsible for verifying all weight and balance calculations.
            </p>
            <p>
              Always refer to the current Aircraft Flight Manual and Weight & Balance documentation.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <Link to="/terms" className="hover:text-foreground hover:underline transition-colors">
                Terms & Conditions
              </Link>
              <span className="text-muted-foreground/50">|</span>
              <Link to="/privacy" className="hover:text-foreground hover:underline transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
