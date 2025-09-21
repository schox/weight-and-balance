import React from 'react';
import { convertWeightForDisplay, roundDownForDisplay } from '@/utils/conversions';
import type { Aircraft, CalculationResult, Settings } from '@/types/aircraft';
import { cn } from '@/lib/utils';

interface AircraftSideViewProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
}

const AircraftSideView: React.FC<AircraftSideViewProps> = ({
  aircraft,
  calculations,
  settings
}) => {
  const { totalWeight, cgPosition, withinEnvelope } = calculations;

  // Calculate loading station positions as percentages along aircraft length
  const getStationPosition = (armInches: number) => {
    // Assuming aircraft datum is at nose, and total length is ~28 feet (336 inches) for C182
    const aircraftLength = 336;
    return Math.max(0, Math.min(100, (armInches / aircraftLength) * 100));
  };

  // Get current loading for each station (this would come from actual loading state)
  const getStationWeight = (stationId: string) => {
    // This would be passed from parent component with actual loading data
    // For now, using sample data
    const sampleLoading: Record<string, number> = {
      pilot: 85,
      frontPassenger: 75,
      rearPassenger1: 70,
      rearPassenger2: 0,
      baggageA: 15,
      baggageB: 8,
      baggageC: 0
    };
    return sampleLoading[stationId] || 0;
  };

  const cgPositionPercent = getStationPosition(cgPosition);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Aircraft Side View - {aircraft.registration}</h3>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          withinEnvelope
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        )}>
          {withinEnvelope ? "✓ BALANCED" : "⚠ OUT OF BALANCE"}
        </div>
      </div>

      {/* Aircraft Visualization */}
      <div className="relative bg-gradient-to-b from-sky-100 to-sky-50 rounded-lg p-8 min-h-[400px]">
        {/* Ground Line */}
        <div className="absolute bottom-8 left-8 right-8 h-0.5 bg-green-600"></div>
        <div className="absolute bottom-6 left-8 right-8 h-2 bg-green-200 rounded"></div>

        {/* Aircraft Silhouette */}
        <svg
          viewBox="0 0 400 120"
          className="w-full h-32 absolute bottom-16 left-8 right-8"
          style={{ maxWidth: 'calc(100% - 4rem)' }}
        >
          {/* Fuselage */}
          <ellipse cx="200" cy="60" rx="180" ry="15" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>

          {/* Wings */}
          <ellipse cx="200" cy="60" rx="80" ry="40" fill="#d1d5db" stroke="#6b7280" strokeWidth="2"/>

          {/* Tail */}
          <polygon points="20,60 60,45 60,75" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>
          <polygon points="30,30 50,30 45,60" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>

          {/* Propeller */}
          <circle cx="380" cy="60" r="25" fill="#9ca3af" stroke="#6b7280" strokeWidth="2"/>
          <line x1="360" y1="60" x2="400" y2="60" stroke="#374151" strokeWidth="3"/>

          {/* Landing Gear */}
          <circle cx="160" cy="85" r="8" fill="#374151"/>
          <circle cx="240" cy="85" r="8" fill="#374151"/>
          <circle cx="50" cy="75" r="6" fill="#374151"/>
        </svg>

        {/* Loading Station Indicators */}
        {aircraft.loadingStations.map((station) => {
          const weight = getStationWeight(station.id);
          const positionPercent = getStationPosition(station.armInches);
          const weightDisplay = roundDownForDisplay(convertWeightForDisplay(weight, settings.weightUnits));

          if (weight === 0) return null;

          return (
            <div
              key={station.id}
              className="absolute bottom-52"
              style={{ left: `${Math.max(8, Math.min(92, positionPercent))}%` }}
            >
              {/* Weight Indicator */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-4 rounded-full",
                  station.category === 'pilot' ? 'bg-blue-500' :
                  station.category === 'passenger' ? 'bg-purple-500' :
                  station.category === 'baggage' ? 'bg-orange-500' :
                  'bg-green-500'
                )}
                style={{ height: `${Math.max(16, Math.min(80, weight * 0.8))}px` }}
                ></div>

                {/* Weight Label */}
                <div className="text-xs font-medium mt-1 text-center">
                  {weightDisplay} {settings.weightUnits}
                </div>

                {/* Station Label */}
                <div className="text-xs text-muted-foreground text-center max-w-16">
                  {station.name.replace(' ', '\n')}
                </div>
              </div>

              {/* Connection Line to Aircraft */}
              <div
                className="absolute top-full w-0.5 bg-gray-400"
                style={{
                  height: '80px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              ></div>
            </div>
          );
        })}

        {/* Center of Gravity Indicator */}
        <div
          className="absolute bottom-44"
          style={{ left: `${Math.max(8, Math.min(92, cgPositionPercent))}%` }}
        >
          <div className="flex flex-col items-center">
            {/* CG Marker */}
            <div className={cn(
              "w-6 h-6 rounded-full border-4 flex items-center justify-center",
              withinEnvelope ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'
            )}>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

            {/* CG Label */}
            <div className="text-xs font-bold mt-1 text-center">
              CG
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {cgPosition.toFixed(1)}"
            </div>
          </div>

          {/* CG Line */}
          <div
            className={cn(
              "absolute top-full w-0.5",
              withinEnvelope ? 'bg-green-500' : 'bg-red-500'
            )}
            style={{
              height: '100px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          ></div>
        </div>

        {/* Weight Distribution Legend */}
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 text-xs space-y-1">
          <div className="font-semibold mb-2">Weight Distribution</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Pilot</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Passengers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Baggage</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Fuel</span>
          </div>
        </div>

        {/* Total Weight Display */}
        <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3">
          <div className="text-sm font-semibold">
            Total Weight
          </div>
          <div className="text-lg font-bold">
            {roundDownForDisplay(convertWeightForDisplay(totalWeight, settings.weightUnits))} {settings.weightUnits}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium">Balance Status</div>
          <div className={cn(
            "mt-1",
            withinEnvelope ? "text-green-600" : "text-red-600"
          )}>
            {withinEnvelope ? "Within safe CG envelope" : "Outside safe CG envelope"}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium">CG Position</div>
          <div className="mt-1">
            {cgPosition.toFixed(1)}" from datum
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium">Weight Loading</div>
          <div className="mt-1">
            {((totalWeight / aircraft.maxTakeoffWeightLbs) * 100).toFixed(1)}% of MTOW
          </div>
        </div>
      </div>
    </div>
  );
};

export default AircraftSideView;