import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plane, Info } from "lucide-react";
import { vhYpbAircraft, vhKxwAircraft } from '@/data/aircraft';
import type { Settings as SettingsType } from '@/types/aircraft';
import AircraftTab from '@/components/aircraft/AircraftTab';

interface HomePageProps {
  settings: SettingsType;
}

const HomePage: React.FC<HomePageProps> = ({ settings }) => {
  return (
    <Tabs defaultValue="YPB" className="w-full">
      <div className="relative">
        {/* Container for tabs with lines using flex distribution */}
        <div className="flex items-end">
          {/* Left spacer with bottom border - flex: 1 */}
          <div className="flex-1 border-b border-black pb-2"></div>

          {/* Tabs container - flex: 18 (9+9) */}
          <div className="flex-[18]">
            <TabsList variant="default" className="inline-flex gap-0 w-full">
              <TabsTrigger
                value="YPB"
                variant="default"
                className="text-base font-semibold px-6 flex-1"
              >
                <Plane className="h-4 w-4 mr-2" />
                YPB C182T
                <Link
                  to="/aircraft/VH-YPB"
                  className="ml-2 p-1 rounded hover:bg-black/10 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  title="View aircraft data"
                >
                  <Info className="h-4 w-4" />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value="KXW"
                variant="default"
                className="text-base font-semibold px-6 flex-1"
              >
                <Plane className="h-4 w-4 mr-2" />
                KXW C172S
                <Link
                  to="/aircraft/VH-KXW"
                  className="ml-2 p-1 rounded hover:bg-black/10 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  title="View aircraft data"
                >
                  <Info className="h-4 w-4" />
                </Link>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Right spacer with bottom border - flex: 1 */}
          <div className="flex-1 border-b border-black pb-2"></div>
        </div>
      </div>

      <TabsContent value="YPB" variant="borderless" className="mt-4 data-[state=inactive]:hidden" forceMount>
        <AircraftTab aircraft={vhYpbAircraft} settings={settings} />
      </TabsContent>

      <TabsContent value="KXW" variant="borderless" className="mt-4 data-[state=inactive]:hidden" forceMount>
        <AircraftTab aircraft={vhKxwAircraft} settings={settings} />
      </TabsContent>
    </Tabs>
  );
};

export default HomePage;
