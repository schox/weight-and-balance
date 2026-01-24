import React from 'react';
import type { Aircraft, CalculationResult, Settings, LoadingState } from '@/types/aircraft';
import { calculateCombinedBaggage } from '@/utils/calculations';
import { convertWeightForDisplay, roundDownForDisplay, getFuelWeightLbs } from '@/utils/conversions';
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

  // Calculate weights for each category (all in lbs for display conversion)
  const categoryWeights = loadingState ? {
    fuel: getFuelWeightLbs(loadingState.fuelLeft || 0, 'litres') + getFuelWeightLbs(loadingState.fuelRight || 0, 'litres'),
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
    <div className="flex flex-col h-full">
      {/* Aircraft Visualization - Everything in SVG with labels at top, aircraft centered */}
      <div className="bg-gradient-to-b from-sky-100 to-sky-50 rounded-lg mx-2 sm:mx-4 flex-1 p-2 sm:p-4 pb-6 sm:pb-8 flex flex-col">
        <svg viewBox="0 0 1480 800" className="w-full flex-1" preserveAspectRatio="xMidYMid meet">
          {/* Labels at top - responsive sizing for small screens */}
          {/* Calculate label positions for even spacing */}
          {(() => {
            const totalWidth = 1480;
            const groupWidth = totalWidth * 0.95; // 95% of component width
            const groupStartX = (totalWidth - groupWidth) / 2; // Center the group
            const labelGap = 20; // Bigger gap between labels for better separation
            const labelWidth = (groupWidth - (labelGap * 3)) / 4; // Divide remaining space by 4
            const labelHeight = 140; // Much taller labels for bigger text
            const labelY = 135;

            return (
              <>
                {/* Fuel Label */}
                <rect x={groupStartX} y={labelY} width={labelWidth} height={labelHeight} fill="#22c55e" rx="8"/>
                <text x={groupStartX + labelWidth/2} y={labelY + 50} textAnchor="middle" fill="white" fontSize="48" fontFamily="sans-serif" fontWeight="bold">Fuel</text>
                <text x={groupStartX + labelWidth/2} y={labelY + 105} textAnchor="middle" fill="white" fontSize="42" fontFamily="sans-serif">
                  {roundDownForDisplay(convertWeightForDisplay(categoryWeights.fuel, settings.weightUnits))} {settings.weightUnits}
                </text>

                {/* Front Row Label */}
                <rect x={groupStartX + labelWidth + labelGap} y={labelY} width={labelWidth} height={labelHeight} fill="#3b82f6" rx="8"/>
                <text x={groupStartX + labelWidth + labelGap + labelWidth/2} y={labelY + 50} textAnchor="middle" fill="white" fontSize="48" fontFamily="sans-serif" fontWeight="bold">Front Row</text>
                <text x={groupStartX + labelWidth + labelGap + labelWidth/2} y={labelY + 105} textAnchor="middle" fill="white" fontSize="42" fontFamily="sans-serif">
                  {roundDownForDisplay(convertWeightForDisplay(categoryWeights.frontRow, settings.weightUnits))} {settings.weightUnits}
                </text>

                {/* Back Row Label */}
                <rect x={groupStartX + (labelWidth + labelGap) * 2} y={labelY} width={labelWidth} height={labelHeight} fill="#8b5cf6" rx="8"/>
                <text x={groupStartX + (labelWidth + labelGap) * 2 + labelWidth/2} y={labelY + 50} textAnchor="middle" fill="white" fontSize="48" fontFamily="sans-serif" fontWeight="bold">Back Row</text>
                <text x={groupStartX + (labelWidth + labelGap) * 2 + labelWidth/2} y={labelY + 105} textAnchor="middle" fill="white" fontSize="42" fontFamily="sans-serif">
                  {roundDownForDisplay(convertWeightForDisplay(categoryWeights.backRow, settings.weightUnits))} {settings.weightUnits}
                </text>

                {/* Baggage Label */}
                <rect x={groupStartX + (labelWidth + labelGap) * 3} y={labelY} width={labelWidth} height={labelHeight} fill="#f97316" rx="8"/>
                <text x={groupStartX + (labelWidth + labelGap) * 3 + labelWidth/2} y={labelY + 50} textAnchor="middle" fill="white" fontSize="48" fontFamily="sans-serif" fontWeight="bold">Baggage</text>
                <text x={groupStartX + (labelWidth + labelGap) * 3 + labelWidth/2} y={labelY + 105} textAnchor="middle" fill="white" fontSize="42" fontFamily="sans-serif">
                  {roundDownForDisplay(convertWeightForDisplay(categoryWeights.baggage, settings.weightUnits))} {settings.weightUnits}
                </text>

                {/* Airplane Image - centered with equal top/bottom margins */}
                <image href={airplaneImage} x="100" y="225" width="1280" height="640"/>

                {/* Main Category Dots - positioned with airplane */}
                {/* Fuel Dot */}
                <circle cx={categoryPositions.fuel.x * 12.8 + 100} cy="441" r="16" fill={categoryPositions.fuel.color}/>

                {/* Front Row Dot */}
                <circle cx={categoryPositions.frontRow.x * 12.8 + 100} cy="516" r="16" fill={categoryPositions.frontRow.color}/>

                {/* Back Row Dot */}
                <circle cx={categoryPositions.backRow.x * 12.8 + 100} cy="519" r="16" fill={categoryPositions.backRow.color}/>

                {/* Combined Baggage Dot */}
                <circle cx={categoryPositions.baggage.x * 12.8 + 100} cy="602" r="16" fill={categoryPositions.baggage.color}/>

                {/* Connector Lines from Labels to Dots - updated Y positions */}
                {/* Fuel Label to Fuel Dot */}
                <line
                  x1={groupStartX + labelWidth/2}
                  y1={labelY + labelHeight}
                  x2={categoryPositions.fuel.x * 12.8 + 100}
                  y2="441"
                  stroke="#22c55e"
                  strokeWidth="6"
                />

                {/* Front Row Label to Front Row Dot */}
                <line
                  x1={groupStartX + labelWidth + labelGap + labelWidth/2}
                  y1={labelY + labelHeight}
                  x2={categoryPositions.frontRow.x * 12.8 + 100}
                  y2="516"
                  stroke="#3b82f6"
                  strokeWidth="6"
                />

                {/* Back Row Label to Back Row Dot */}
                <line
                  x1={groupStartX + (labelWidth + labelGap) * 2 + labelWidth/2}
                  y1={labelY + labelHeight}
                  x2={categoryPositions.backRow.x * 12.8 + 100}
                  y2="519"
                  stroke="#8b5cf6"
                  strokeWidth="6"
                />

                {/* Baggage Label to Baggage Dot */}
                <line
                  x1={groupStartX + (labelWidth + labelGap) * 3 + labelWidth/2}
                  y1={labelY + labelHeight}
                  x2={categoryPositions.baggage.x * 12.8 + 100}
                  y2="602"
                  stroke="#f97316"
                  strokeWidth="6"
                />
              </>
            );
          })()}
        </svg>
      </div>

      {/* Bottom tiles with proper borders - removed divider */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 p-2 sm:p-4 pb-6 sm:pb-8">
        {/* Total Weight Tile */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-300 ">
          <div className="text-sm font-semibold text-gray-700 mb-1">Total Weight</div>
          <div className="text-xl sm:text-2xl font-bold">
            {roundDownForDisplay(convertWeightForDisplay(totalWeight, settings.weightUnits))} {settings.weightUnits}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {((totalWeight / aircraft.maxTakeoffWeightLbs) * 100).toFixed(1)}% of MTOW
          </div>
        </div>

        {/* Balance Status Tile */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-300 ">
          <div className="text-sm font-semibold text-gray-700 mb-1">Balance Status</div>
          <div className={cn(
            "text-xl sm:text-2xl font-bold",
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