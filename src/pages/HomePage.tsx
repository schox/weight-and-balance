import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plane, Info } from "lucide-react";
import { vhYpbAircraft } from '@/data/aircraft';
import type { Settings as SettingsType } from '@/types/aircraft';
import AircraftTab from '@/components/aircraft/AircraftTab';

interface HomePageProps {
  settings: SettingsType;
}

const HomePage: React.FC<HomePageProps> = ({ settings }) => {
  const aircraft = vhYpbAircraft;

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
                <Info className="h-4 w-4 ml-2" />
              </TabsTrigger>
              <TabsTrigger
                value="KXW"
                variant="default"
                className="text-base font-semibold px-6 flex-1"
              >
                <Plane className="h-4 w-4 mr-2" />
                KXW C172SP
                <Info className="h-4 w-4 ml-2" />
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Right spacer with bottom border - flex: 1 */}
          <div className="flex-1 border-b border-black pb-2"></div>
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
  );
};

export default HomePage;
