import React from 'react';
import type { Aircraft, CalculationResult, Settings, LoadingState } from '@/types/aircraft';
import { calculateCombinedBaggage } from '@/utils/calculations';
import { convertWeightForDisplay, roundDownForDisplay } from '@/utils/conversions';
import { cn } from '@/lib/utils';
import airplaneImage from '/assets/airplane-1295210_1280-pixabay.png';

interface AircraftSideViewProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  loadingState?: LoadingState;
}

const AircraftSideView: React.FC<AircraftSideViewProps> = ({
  aircraft,
  calculations,
  settings,
  loadingState
}) => {

  // Calculate combined baggage if we have loading state
  const combinedBaggage = loadingState ? calculateCombinedBaggage(loadingState, aircraft) : null;

  // Calculate weights for each category
  const categoryWeights = loadingState ? {
    fuel: (loadingState.fuelLeft || 0) + (loadingState.fuelRight || 0),
    frontRow: (loadingState.pilot || 0) + (loadingState.frontPassenger || 0),
    backRow: (loadingState.rearPassenger1 || 0) + (loadingState.rearPassenger2 || 0),
    baggage: combinedBaggage?.weight || 0
  } : { fuel: 0, frontRow: 0, backRow: 0, baggage: 0 };

  // Calculate positions for the 4 main categories based on aircraft features
  const categoryPositions = {
    fuel: { x: 29, color: '#22c55e', name: 'Fuel' },        // Green light at front of wing
    frontRow: { x: 32, color: '#3b82f6', name: 'Front Row' }, // Center of front door window
    backRow: { x: 41, color: '#8b5cf6', name: 'Back Row' },   // Center of rear window
    baggage: { x: 46.8, color: '#f97316', name: 'Baggage' }    // Middle of back door
  };

  // Calculate balance status data for tiles
  const { totalWeight, cgPosition, withinEnvelope } = calculations;
  const forwardLimit = Math.min(...aircraft.cgEnvelope.slice(0, 3).map(p => p.cgPosition));
  const aftLimit = Math.max(...aircraft.cgEnvelope.slice(3, 6).map(p => p.cgPosition));
  const idealCG = (forwardLimit + aftLimit) / 2;
  const cgOffset = cgPosition - idealCG;
  const maxOffset = Math.max(
    Math.abs(forwardLimit - idealCG),
    Math.abs(aftLimit - idealCG)
  );
  const tiltAngle = (cgOffset / maxOffset) * 15; // Max 15 degree tilt

  // These functions will be used when implementing actual loading visualization
  // const getStationPosition = (armInches: number) => {
  //   // Assuming aircraft datum is at nose, and total length is ~28 feet (336 inches) for C182
  //   const aircraftLength = 336;
  //   return Math.max(0, Math.min(100, (armInches / aircraftLength) * 100));
  // };

  // const getStationWeight = (stationId: string) => {
  //   if (!loadingState) return 0;

  //   switch (stationId) {
  //     case 'pilot': return loadingState.pilot || 0;
  //     case 'frontPassenger': return loadingState.frontPassenger || 0;
  //     case 'rearPassenger1': return loadingState.rearPassenger1 || 0;
  //     case 'rearPassenger2': return loadingState.rearPassenger2 || 0;
  //     case 'baggageA': return loadingState.baggageA || 0;
  //     case 'baggageB': return loadingState.baggageB || 0;
  //     case 'baggageC': return loadingState.baggageC || 0;
  //     default: return 0;
  //   }
  // };

  // const cgPositionPercent = getStationPosition(cgPosition);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Aircraft Visualization - Everything in SVG with inset margins */}
      <div className="relative bg-gradient-to-b from-sky-100 to-sky-50 rounded-lg p-4 sm:p-8">
        <svg viewBox="0 0 1480 840" className="w-full h-auto">
          {/* Airplane Image - inset by 100px on all sides */}
          <image href={airplaneImage} x="100" y="100" width="1280" height="640" />


          {/* Main Category Dots - 4 categories only */}
          {/* Fuel Dot */}
          <circle cx={categoryPositions.fuel.x * 12.8 + 100} cy="316" r="16" fill={categoryPositions.fuel.color}/>

          {/* Front Row Dot */}
          <circle cx={categoryPositions.frontRow.x * 12.8 + 100} cy="391" r="16" fill={categoryPositions.frontRow.color}/>

          {/* Back Row Dot */}
          <circle cx={categoryPositions.backRow.x * 12.8 + 100} cy="394" r="16" fill={categoryPositions.backRow.color}/>

          {/* Combined Baggage Dot */}
          <circle cx={categoryPositions.baggage.x * 12.8 + 100} cy="477" r="16" fill={categoryPositions.baggage.color}/>

          {/* Labels - all at same vertical location with equal spacing */}
          {/* Fuel Label */}
          <rect x="330" y="200" width="140" height="50" fill="#22c55e" rx="8"/>
          <text x="400" y="220" textAnchor="middle" fill="white" fontSize="16" fontFamily="sans-serif" fontWeight="bold">Fuel</text>
          <text x="400" y="238" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">{roundDownForDisplay(convertWeightForDisplay(categoryWeights.fuel, settings.weightUnits))} {settings.weightUnits} (29%)</text>

          {/* Front Row Label */}
          <rect x="500" y="200" width="160" height="50" fill="#3b82f6" rx="8"/>
          <text x="580" y="220" textAnchor="middle" fill="white" fontSize="16" fontFamily="sans-serif" fontWeight="bold">Front Row</text>
          <text x="580" y="238" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">{roundDownForDisplay(convertWeightForDisplay(categoryWeights.frontRow, settings.weightUnits))} {settings.weightUnits} (32%)</text>

          {/* Back Row Label */}
          <rect x="690" y="200" width="160" height="50" fill="#8b5cf6" rx="8"/>
          <text x="770" y="220" textAnchor="middle" fill="white" fontSize="16" fontFamily="sans-serif" fontWeight="bold">Back Row</text>
          <text x="770" y="238" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">{roundDownForDisplay(convertWeightForDisplay(categoryWeights.backRow, settings.weightUnits))} {settings.weightUnits} (41%)</text>

          {/* Combined Baggage Label */}
          <rect x="880" y="200" width="160" height="50" fill="#f97316" rx="8"/>
          <text x="960" y="220" textAnchor="middle" fill="white" fontSize="16" fontFamily="sans-serif" fontWeight="bold">Baggage</text>
          <text x="960" y="238" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">{roundDownForDisplay(convertWeightForDisplay(categoryWeights.baggage, settings.weightUnits))} {settings.weightUnits} (47%)</text>

          {/* Connector Lines from Labels to Dots */}
          {/* Fuel Label to Fuel Dot */}
          <line x1="400" y1="240" x2={categoryPositions.fuel.x * 12.8 + 100} y2="316" stroke="#22c55e" strokeWidth="3"/>

          {/* Front Row Label to Front Row Dot */}
          <line x1="580" y1="240" x2={categoryPositions.frontRow.x * 12.8 + 100} y2="391" stroke="#3b82f6" strokeWidth="3"/>

          {/* Back Row Label to Back Row Dot */}
          <line x1="770" y1="240" x2={categoryPositions.backRow.x * 12.8 + 100} y2="394" stroke="#8b5cf6" strokeWidth="3"/>

          {/* Baggage Label to Baggage Dot */}
          <line x1="960" y1="240" x2={categoryPositions.baggage.x * 12.8 + 100} y2="477" stroke="#f97316" strokeWidth="3"/>
        </svg>

        {/* Weight Summary - Top Left */}
        <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3">
          <div className="text-sm font-semibold mb-2">Total Weight</div>
          <div className="text-lg font-bold">
            {roundDownForDisplay(convertWeightForDisplay(totalWeight, settings.weightUnits))} {settings.weightUnits}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {((totalWeight / aircraft.maxTakeoffWeightLbs) * 100).toFixed(1)}% of MTOW
          </div>
        </div>

        {/* Balance Status - Top Right */}
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3">
          <div className="text-sm font-semibold mb-2">Balance Status</div>
          <div className={cn(
            "text-lg font-bold",
            withinEnvelope ? "text-green-600" : "text-red-600"
          )}>
            {Math.abs(tiltAngle) < 1 ? "LEVEL" :
             tiltAngle > 0 ? "AFT HEAVY" : "NOSE HEAVY"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Tilt: {Math.abs(tiltAngle).toFixed(1)}°
          </div>
        </div>
      </div>
    </div>
  );
};

export default AircraftSideView;