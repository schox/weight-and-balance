import React from 'react';
import { convertWeightForDisplay, roundDownForDisplay } from '@/utils/conversions';
import type { Aircraft, CalculationResult, Settings, LoadingState } from '@/types/aircraft';
import { cn } from '@/lib/utils';

interface CGEnvelopeChartProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  loadingState?: LoadingState;
  className?: string;
}

const CGEnvelopeChart: React.FC<CGEnvelopeChartProps> = ({
  aircraft,
  calculations,
  settings,
  loadingState: _loadingState,
  className
}) => {
  const { totalWeight, cgPosition, withinEnvelope } = calculations;

  // Convert envelope points to display units
  // Convert CG based on weight unit preference: kg->mm, lbs->inches
  const convertCGForDisplay = (cgMm: number) => {
    return settings.weightUnits === 'kg' ? cgMm : cgMm / 25.4; // mm for kg, inches for lbs
  };

  const getCGUnit = () => settings.weightUnits === 'kg' ? 'mm' : 'inches';

  const forwardLimitPoints = aircraft.cgEnvelope
    .slice(0, 5) // First 5 points are forward limit (includes vertical line and two angular changes)
    .map(point => ({
      weight: convertWeightForDisplay(point.weight, settings.weightUnits),
      cgPosition: convertCGForDisplay(point.cgPosition)
    }));

  const aftLimitPoints = aircraft.cgEnvelope
    .slice(5, 8) // Last 3 points are aft limit
    .map(point => ({
      weight: convertWeightForDisplay(point.weight, settings.weightUnits),
      cgPosition: convertCGForDisplay(point.cgPosition)
    }));

  // Current aircraft position
  const currentPosition = {
    weight: convertWeightForDisplay(totalWeight, settings.weightUnits),
    cgPosition: convertCGForDisplay(cgPosition)
  };

  // Calculate chart bounds with fixed weight scale range
  const allCGs = [...forwardLimitPoints, ...aftLimitPoints].map(p => p.cgPosition);

  // Fixed weight range: 850-1450 kg or equivalent in lbs
  const minWeightKg = 850;
  const maxWeightKg = 1450;
  const minWeight = settings.weightUnits === 'kg' ? minWeightKg : minWeightKg * 2.20462;
  const maxWeight = settings.weightUnits === 'kg' ? maxWeightKg : maxWeightKg * 2.20462;

  // Add significant horizontal padding to match handbook layout
  const cgRange = Math.max(...allCGs) - Math.min(...allCGs);
  const horizontalPadding = cgRange * 0.4; // 40% padding on each side
  const minCG = Math.min(...allCGs) - horizontalPadding;
  const maxCG = Math.max(...allCGs) + horizontalPadding;

  // SVG dimensions - responsive (match handbook proportions - taller than wide)
  const margin = { top: 40, right: 40, bottom: 70, left: 80 };
  const chartWidth = 450;
  const chartHeight = 550;
  const svgWidth = chartWidth + margin.left + margin.right;
  const svgHeight = chartHeight + margin.top + margin.bottom;

  // Scale functions - SWAPPED: CG on X-axis, Weight on Y-axis (to match handbook)
  const xScale = (cg: number) => ((cg - minCG) / (maxCG - minCG)) * chartWidth;
  const yScale = (weight: number) => chartHeight - ((weight - minWeight) / (maxWeight - minWeight)) * chartHeight;

  // Create polygon points for the envelope
  // Construct proper closed polygon: forward limit (bottom to top) + aft limit (top to bottom)
  const sortedForward = [...forwardLimitPoints].sort((a, b) => a.weight - b.weight);
  const sortedAft = [...aftLimitPoints].sort((a, b) => b.weight - a.weight);

  // Build polygon by tracing the envelope boundary
  const polygonPoints = [
    // Forward limit: bottom to top
    ...sortedForward.map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`),
    // Aft limit: top to bottom (to close the shape)
    ...sortedAft.map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`)
  ].join(' ');

  // Current position coordinates - SWAPPED
  const currentX = xScale(currentPosition.cgPosition);
  const currentY = yScale(currentPosition.weight);

  // Grid lines
  const weightTicks = [];
  const weightStep = Math.ceil((maxWeight - minWeight) / 8 / 50) * 50;
  for (let w = Math.ceil(minWeight / weightStep) * weightStep; w <= maxWeight; w += weightStep) {
    weightTicks.push(w);
  }

  const cgTicks = [];
  const cgStep = Math.ceil((maxCG - minCG) / 6);
  for (let cg = Math.ceil(minCG / cgStep) * cgStep; cg <= maxCG; cg += cgStep) {
    cgTicks.push(cg);
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header content above graph */}
      <div className="flex items-center justify-between text-sm sm:text-base mb-4">
        <span className="font-semibold">Centre of Gravity Envelope</span>
        <div className={cn(
          "text-sm font-medium px-2 py-1 rounded",
          withinEnvelope ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        )}>
          {withinEnvelope ? "WITHIN LIMITS" : "OUT OF LIMITS"}
        </div>
      </div>

      {/* Graph content */}
      <div className="mb-4">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="border border-gray-200 rounded w-full h-auto"
            preserveAspectRatio="xMidYMid meet">
            {/* Background */}
            <rect width={svgWidth} height={svgHeight} fill="#fafafa" />

            {/* Grid Lines */}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Vertical grid lines - now for CG */}
              {cgTicks.map(cg => (
                <line
                  key={`v-${cg}`}
                  x1={xScale(cg)}
                  y1={0}
                  x2={xScale(cg)}
                  y2={chartHeight}
                  stroke="#e5e5e5"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Horizontal grid lines - now for Weight */}
              {weightTicks.map(weight => (
                <line
                  key={`h-${weight}`}
                  x1={0}
                  y1={yScale(weight)}
                  x2={chartWidth}
                  y2={yScale(weight)}
                  stroke="#e5e5e5"
                  strokeDasharray="2,2"
                />
              ))}

              {/* CG Envelope Polygon */}
              <polygon
                points={polygonPoints}
                fill="rgba(34, 197, 94, 0.15)"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Forward Limit Line */}
              <polyline
                points={sortedForward.map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`).join(' ')}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
              />

              {/* Aft Limit Line */}
              <polyline
                points={sortedAft.sort((a, b) => a.weight - b.weight).map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`).join(' ')}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
              />

              {/* Top Limit Line (connecting highest weight points) */}
              {(() => {
                const maxWeight = Math.max(...[...forwardLimitPoints, ...aftLimitPoints].map(p => p.weight));
                const topPoints = [...forwardLimitPoints, ...aftLimitPoints]
                  .filter(p => Math.abs(p.weight - maxWeight) < 1) // Points at max weight
                  .sort((a, b) => a.cgPosition - b.cgPosition);

                if (topPoints.length >= 2) {
                  return (
                    <line
                      x1={xScale(topPoints[0].cgPosition)}
                      y1={yScale(topPoints[0].weight)}
                      x2={xScale(topPoints[topPoints.length - 1].cgPosition)}
                      y2={yScale(topPoints[topPoints.length - 1].weight)}
                      stroke="#dc2626"
                      strokeWidth="2"
                    />
                  );
                }
                return null;
              })()}

              {/* Bottom Limit Line (connecting lowest weight points) */}
              {(() => {
                const minWeight = Math.min(...[...forwardLimitPoints, ...aftLimitPoints].map(p => p.weight));
                const bottomPoints = [...forwardLimitPoints, ...aftLimitPoints]
                  .filter(p => Math.abs(p.weight - minWeight) < 1) // Points at min weight
                  .sort((a, b) => a.cgPosition - b.cgPosition);

                if (bottomPoints.length >= 2) {
                  return (
                    <line
                      x1={xScale(bottomPoints[0].cgPosition)}
                      y1={yScale(bottomPoints[0].weight)}
                      x2={xScale(bottomPoints[bottomPoints.length - 1].cgPosition)}
                      y2={yScale(bottomPoints[bottomPoints.length - 1].weight)}
                      stroke="#dc2626"
                      strokeWidth="2"
                    />
                  );
                }
                return null;
              })()}

              {/* Darker shaded area for MTOW/MLW at top */}
              {(() => {
                const mlwWeight = convertWeightForDisplay(2950, settings.weightUnits);  // MLW

                // Create darker polygon for the top area between MLW and MTOW
                const topAreaPoints = [
                  // Forward limit from MLW to MTOW
                  ...sortedForward
                    .filter(p => p.weight >= mlwWeight)
                    .map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`),
                  // Aft limit from MTOW to MLW
                  ...sortedAft
                    .filter(p => p.weight >= mlwWeight)
                    .sort((a, b) => b.weight - a.weight)
                    .map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`)
                ].join(' ');

                return (
                  <polygon
                    points={topAreaPoints}
                    fill="rgba(34, 197, 94, 0.4)"
                    stroke="none"
                  />
                );
              })()}


              {/* Current Position Dot */}
              <circle
                cx={currentX}
                cy={currentY}
                r="8"
                fill={withinEnvelope ? "#22c55e" : "#ef4444"}
                stroke={withinEnvelope ? "#16a34a" : "#dc2626"}
                strokeWidth="2"
              />

              {/* Current Position Label */}
              <text
                x={currentX}
                y={currentY - 15}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill={withinEnvelope ? "#16a34a" : "#dc2626"}
              >
                Current
              </text>
            </g>

            {/* X-axis - now for CG */}
            <g transform={`translate(${margin.left}, ${margin.top + chartHeight})`}>
              <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#374151" strokeWidth="1" />
              {cgTicks.map(cg => (
                <g key={`x-tick-${cg}`} transform={`translate(${xScale(cg)}, 0)`}>
                  <line y1={0} y2={5} stroke="#374151" strokeWidth="1" />
                  <text y={20} textAnchor="middle" fontSize="12" fill="#374151">
                    {cg.toFixed(1)}
                  </text>
                </g>
              ))}
              <text
                x={chartWidth / 2}
                y={50}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#374151"
              >
                CG Position ({getCGUnit()} from datum)
              </text>
            </g>

            {/* Y-axis - now for Weight */}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#374151" strokeWidth="1" />
              {weightTicks.map(weight => (
                <g key={`y-tick-${weight}`} transform={`translate(0, ${yScale(weight)})`}>
                  <line x1={-5} x2={0} stroke="#374151" strokeWidth="1" />
                  <text x={-10} y={4} textAnchor="end" fontSize="12" fill="#374151">
                    {Math.round(weight)}
                  </text>
                </g>
              ))}
              <text
                x={-50}
                y={chartHeight / 2}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#374151"
                transform={`rotate(-90, -50, ${chartHeight / 2})`}
              >
                Weight ({settings.weightUnits})
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Content below graph */}
      <div className="space-y-2">
        <div className="flex items-center justify-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-red-500 bg-red-500/10 mr-2"></div>
              <span>CG Envelope</span>
            </div>
            <div className="flex items-center">
              <div className={cn(
                "w-3 h-3 rounded-full mr-2",
                withinEnvelope ? "bg-green-500" : "bg-red-500"
              )}></div>
              <span>Current Position</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg text-sm">
          <div>
            <span className="font-medium">Current Weight:</span>
            <span className="ml-2">{roundDownForDisplay(currentPosition.weight)} {settings.weightUnits}</span>
          </div>
          <div>
            <span className="font-medium">Current CG:</span>
            <span className="ml-2">{currentPosition.cgPosition.toFixed(1)} {getCGUnit()} from datum</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGEnvelopeChart;