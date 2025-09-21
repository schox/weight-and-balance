import React from 'react';
import { convertWeightForDisplay, roundDownForDisplay } from '@/utils/conversions';
import type { Aircraft, CalculationResult, Settings } from '@/types/aircraft';
import { cn } from '@/lib/utils';

interface BalanceBeamViewProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
}

const BalanceBeamView: React.FC<BalanceBeamViewProps> = ({
  aircraft,
  calculations,
  settings
}) => {
  const { totalWeight, cgPosition, withinEnvelope } = calculations;

  // Calculate beam tilt based on CG position relative to ideal CG
  const forwardLimit = Math.min(...aircraft.cgEnvelope.slice(0, 3).map(p => p.cgPosition));
  const aftLimit = Math.max(...aircraft.cgEnvelope.slice(3, 6).map(p => p.cgPosition));
  const idealCG = (forwardLimit + aftLimit) / 2;
  const cgOffset = cgPosition - idealCG;
  const maxOffset = Math.max(
    Math.abs(forwardLimit - idealCG),
    Math.abs(aftLimit - idealCG)
  );
  const tiltAngle = (cgOffset / maxOffset) * 15; // Max 15 degree tilt

  // Sample loading data (would come from parent component)
  const sampleLoading = [
    { name: 'Pilot', weight: 85, position: 37, color: 'bg-blue-500' },
    { name: 'Front Passenger', weight: 75, position: 37, color: 'bg-purple-500' },
    { name: 'Rear Passenger', weight: 70, position: 74, color: 'bg-purple-400' },
    { name: 'Baggage A', weight: 15, position: 95, color: 'bg-orange-500' },
    { name: 'Baggage B', weight: 8, position: 123, color: 'bg-orange-400' },
    { name: 'Fuel', weight: 125, position: 48, color: 'bg-green-500' }
  ].filter(item => item.weight > 0);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">3D Balance Beam Visualization</h3>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          withinEnvelope
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        )}>
          {withinEnvelope ? "✓ BALANCED" : "⚠ TILTED"}
        </div>
      </div>

      {/* 3D Balance Beam Visualization */}
      <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg p-8 min-h-[500px] overflow-hidden">
        {/* Perspective container */}
        <div className="relative h-full flex items-center justify-center" style={{ perspective: '1000px' }}>

          {/* Fulcrum Base */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-24 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg shadow-lg"></div>
            <div className="w-20 h-6 bg-gray-700 rounded-lg -mt-1 -ml-2"></div>
          </div>

          {/* Balance Beam */}
          <div
            className="relative w-96 h-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-lg shadow-lg"
            style={{
              transform: `rotateZ(${tiltAngle}deg) rotateX(-5deg)`,
              transformStyle: 'preserve-3d',
              marginBottom: '80px'
            }}
          >
            {/* Beam highlights */}
            <div className="absolute top-0 left-2 right-2 h-1 bg-amber-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-0 left-2 right-2 h-1 bg-amber-800 rounded-full opacity-40"></div>

            {/* CG Limits Markers */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-1 h-8 bg-red-500 -mt-2"
              style={{ left: `${((forwardLimit - 30) / 80) * 100}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-600 whitespace-nowrap">
                Fwd Limit
              </div>
            </div>
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-1 h-8 bg-red-500 -mt-2"
              style={{ left: `${((aftLimit - 30) / 80) * 100}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-600 whitespace-nowrap">
                Aft Limit
              </div>
            </div>

            {/* Current CG Position */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -mt-3"
              style={{ left: `${((cgPosition - 30) / 80) * 100}%` }}
            >
              <div className={cn(
                "w-6 h-6 rounded-full border-4 shadow-lg",
                withinEnvelope ? 'bg-green-400 border-green-600' : 'bg-red-400 border-red-600'
              )}>
                <div className="w-full h-full rounded-full bg-white opacity-40"></div>
              </div>
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs font-bold text-center whitespace-nowrap">
                CG: {cgPosition.toFixed(1)}"
              </div>
            </div>
          </div>

          {/* Weight Blocks on Beam */}
          {sampleLoading.map((item, index) => {
            const beamPosition = ((item.position - 30) / 80) * 100;
            const blockHeight = Math.max(20, Math.min(60, item.weight * 0.4));

            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `calc(50% + ${(beamPosition - 50) * 3.84}px)`,
                  bottom: `calc(50% + ${20 + (beamPosition - 50) * Math.tan(tiltAngle * Math.PI / 180) + blockHeight / 2}px)`,
                  transform: `rotateX(-5deg) rotateZ(${tiltAngle}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Weight Block */}
                <div
                  className={cn("rounded shadow-lg", item.color)}
                  style={{
                    width: `${Math.max(16, Math.min(32, item.weight * 0.3))}px`,
                    height: `${blockHeight}px`,
                    marginLeft: `-${Math.max(8, Math.min(16, item.weight * 0.15))}px`
                  }}
                >
                  {/* 3D effect */}
                  <div className="w-full h-2 bg-white/20 rounded-t"></div>
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-black/20 rounded-r"></div>
                </div>

                {/* Weight Label */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
                  {roundDownForDisplay(convertWeightForDisplay(item.weight, settings.weightUnits))} {settings.weightUnits}
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground text-center whitespace-nowrap">
                  {item.name}
                </div>
              </div>
            );
          })}

          {/* Balance Status Indicator */}
          <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3">
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

          {/* Weight Summary */}
          <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Total Weight</div>
            <div className="text-lg font-bold">
              {roundDownForDisplay(convertWeightForDisplay(totalWeight, settings.weightUnits))} {settings.weightUnits}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {((totalWeight / aircraft.maxTakeoffWeightLbs) * 100).toFixed(1)}% of MTOW
            </div>
          </div>
        </div>

        {/* Ground Reference */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-600 to-green-400 rounded-b-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-transparent to-green-700 opacity-30 rounded-b-lg"></div>
        </div>
      </div>

      {/* Physics Explanation */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="font-semibold mb-2">How Balance Beam Physics Work</div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• The fulcrum represents the aircraft's center of gravity position</p>
          <p>• Weight blocks represent loading at different stations along the aircraft</p>
          <p>• Beam tilt shows whether the aircraft is nose-heavy (left) or tail-heavy (right)</p>
          <p>• A level beam indicates optimal weight distribution within CG limits</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceBeamView;