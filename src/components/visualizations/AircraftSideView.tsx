import React from 'react';
import type { Aircraft, CalculationResult, Settings, LoadingState } from '@/types/aircraft';
import airplaneImage from '/assets/airplane-1295210_1280-pixabay.png';

interface AircraftSideViewProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  loadingState: LoadingState;
}

const AircraftSideView: React.FC<AircraftSideViewProps> = ({
  aircraft: _aircraft,
  calculations,
  settings: _settings,
  loadingState: _loadingState
}) => {
  const { cgPosition: _cgPosition } = calculations;

  // Experimental offset positions (as percentages of image width)
  // These can be adjusted to find the correct positions
  const experimentalOffsets = {
    frontRow: 40,     // Front seats (pilot/front passenger) - moved from 25%
    backRow: 45,      // Rear seats - moved left from 48% to 45%
    baggageA: 50,     // First baggage area - moved left from 55%
    baggageB: 65,     // Second baggage area
    baggageC: 75      // Third baggage area
  };

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
    <div className="space-y-6">
      {/* Aircraft Visualization */}
      <div className="relative bg-gradient-to-b from-sky-100 to-sky-50 rounded-lg p-8 min-h-[500px] border-4 border-red-500">

        {/* Airplane Image */}
        <div className="relative w-full h-64 mb-8">
          <img
            src={airplaneImage}
            alt="Cessna 182T Side View"
            className="w-full h-full object-contain"
          />

          {/* Horizontal Reference Line */}
          <div className="absolute bottom-32 left-4 right-4 h-0.5 bg-gray-400"></div>

          {/* Reference Dots and Labels */}

          {/* Front Reference Dot - Black */}
          <div
            className="absolute w-3 h-3 bg-black rounded-full"
            style={{ left: '20.5%', bottom: 'calc(8rem - 0.375rem)' }}
          ></div>

          {/* Fuel Dot - Green */}
          <div
            className="absolute w-3 h-3 bg-green-500 rounded-full"
            style={{ left: '36%', bottom: 'calc(8rem - 0.375rem)' }}
          ></div>

          {/* Test Yellow Dot - higher up in same horizontal location */}
          <div
            className="absolute bottom-40 w-6 h-6 bg-yellow-500 rounded-full"
            style={{ left: '30%' }}
          ></div>

          {/* Light gray dot in middle of Fuel Label */}
          <div
            className="absolute bottom-40 w-6 h-6 bg-gray-400 rounded-full"
            style={{ left: '25%' }}
          ></div>


          {/* Front Row Dot - Blue */}
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full"
            style={{ left: `${experimentalOffsets.frontRow}%`, bottom: 'calc(8rem - 0.375rem)' }}
          ></div>

          {/* Back Row Dot - Purple */}
          <div
            className="absolute w-3 h-3 bg-purple-500 rounded-full"
            style={{ left: `${experimentalOffsets.backRow}%`, bottom: 'calc(8rem - 0.375rem)' }}
          ></div>

          {/* Baggage A Dot - Orange */}
          <div
            className="absolute w-3 h-3 bg-orange-500 rounded-full"
            style={{ left: `${experimentalOffsets.baggageA}%`, bottom: 'calc(8rem - 0.375rem)' }}
          ></div>

          {/* Baggage B Dot - Red */}
          <div
            className="absolute w-3 h-3 bg-red-500 rounded-full"
            style={{ left: `${experimentalOffsets.baggageB}%`, bottom: 'calc(8rem - 0.375rem)' }}
          ></div>

          {/* Baggage C Dot - Pink */}
          <div
            className="absolute w-3 h-3 bg-pink-500 rounded-full"
            style={{ left: `${experimentalOffsets.baggageC}%`, bottom: 'calc(8rem - 0.375rem)' }}
          ></div>

          {/* Back Reference Dot - Gray */}
          <div
            className="absolute w-3 h-3 bg-gray-600 rounded-full"
            style={{ left: '79%', bottom: 'calc(8rem - 0.375rem)' }}
          ></div>

          {/* Spread out labels above with oblique connector lines */}

          {/* Front Label */}
          <div className="absolute bottom-48 text-xs" style={{ left: '10%' }}>
            <div className="bg-black text-white px-1 py-0.5 rounded whitespace-nowrap">
              Front (20.5%)
            </div>
          </div>

          {/* Fuel Label */}
          <div className="absolute bottom-56 text-xs" style={{ left: '25%' }}>
            <div className="bg-green-500 text-white px-1 py-0.5 rounded whitespace-nowrap">
              Fuel (36%)
            </div>
          </div>

          {/* Front Row Label */}
          <div className="absolute bottom-48 text-xs" style={{ left: '35%' }}>
            <div className="bg-blue-500 text-white px-1 py-0.5 rounded whitespace-nowrap">
              Front Row ({experimentalOffsets.frontRow}%)
            </div>
          </div>

          {/* Back Row Label */}
          <div className="absolute bottom-48 text-xs" style={{ left: '42%' }}>
            <div className="bg-purple-500 text-white px-1 py-0.5 rounded whitespace-nowrap">
              Back Row ({experimentalOffsets.backRow}%)
            </div>
          </div>

          {/* Baggage A Label */}
          <div className="absolute bottom-48 text-xs" style={{ left: '48%' }}>
            <div className="bg-orange-500 text-white px-1 py-0.5 rounded whitespace-nowrap">
              Bag A ({experimentalOffsets.baggageA}%)
            </div>
          </div>

          {/* Baggage B Label */}
          <div className="absolute bottom-48 text-xs" style={{ left: '60%' }}>
            <div className="bg-red-500 text-white px-1 py-0.5 rounded whitespace-nowrap">
              Bag B ({experimentalOffsets.baggageB}%)
            </div>
          </div>

          {/* Baggage C Label */}
          <div className="absolute bottom-48 text-xs" style={{ left: '70%' }}>
            <div className="bg-pink-500 text-white px-1 py-0.5 rounded whitespace-nowrap">
              Bag C ({experimentalOffsets.baggageC}%)
            </div>
          </div>

          {/* Back Label */}
          <div className="absolute bottom-48 text-xs" style={{ left: '80%' }}>
            <div className="bg-gray-600 text-white px-1 py-0.5 rounded whitespace-nowrap">
              Back (79%)
            </div>
          </div>

          {/* Connector Lines from Labels to Dots */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full">
            {/* Green line from center of green dot */}
            <line x1="36%" y1="calc(100% - 8rem + 0.375rem)" x2="29%" y2="calc(100% - 14rem - 0.75rem)" stroke="green" strokeWidth="4" opacity="1"/>
          </svg>
        </div>

        {/* Component corner dots - positioned relative to the component (red border) */}
        {/* Top-left corner of component */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-red-500 rounded-full"></div>

        {/* Top-right corner of component */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full"></div>

        {/* Bottom-left corner of component */}
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-purple-500 rounded-full"></div>

        {/* Bottom-right corner of component */}
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-orange-500 rounded-full"></div>

      </div>
    </div>
  );
};

export default AircraftSideView;