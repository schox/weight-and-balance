import React from 'react';
import { convertWeightForDisplay, roundDownForDisplay } from '@/utils/conversions';
import type { Aircraft, CalculationResult, Settings, LoadingState, FuelBurnState } from '@/types/aircraft';
import { calculateLandingWeightAndCG } from '@/utils/calculations';
import { cn } from '@/lib/utils';

interface CGEnvelopeChartProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  loadingState?: LoadingState;
  fuelBurnState?: FuelBurnState;
  className?: string;
}

const CGEnvelopeChart: React.FC<CGEnvelopeChartProps> = ({
  aircraft,
  calculations,
  settings,
  loadingState,
  fuelBurnState,
  className
}) => {
  const { totalWeight, cgPosition, withinEnvelope, loadPath, zeroFuelWeight, zeroFuelCG } = calculations;

  // Convert envelope points to display units
  // Convert CG based on weight unit preference: kg->mm, lbs->inches
  const convertCGForDisplay = (cgMm: number) => {
    return settings.weightUnits === 'kg' ? cgMm : cgMm / 25.4; // mm for kg, inches for lbs
  };

  const getCGUnit = () => settings.weightUnits === 'kg' ? 'mm' : 'inches';

  // Convert all envelope points to display units for plotting
  const envelopePoints = aircraft.cgEnvelope.map(point => ({
    weight: convertWeightForDisplay(point.weight, settings.weightUnits),
    cgPosition: convertCGForDisplay(point.cgPosition)
  }));

  // For drawing individual limit lines
  // New envelope structure: points 0-2 are forward limit, points 3-4 are aft limit
  const forwardLimitPoints = envelopePoints.slice(0, 3); // Forward limit (BEW to MTOW)
  const aftLimitPoints = envelopePoints.slice(3, 5); // Aft limit (MTOW to BEW)

  // Current aircraft position
  const currentPosition = {
    weight: convertWeightForDisplay(totalWeight, settings.weightUnits),
    cgPosition: convertCGForDisplay(cgPosition)
  };

  // Calculate chart bounds with fixed weight scale range
  const allCGs = envelopePoints.map(p => p.cgPosition);

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

  // Create polygon points for the envelope using all points (already in correct order)
  const polygonPoints = envelopePoints
    .map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`)
    .join(' ');

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
            {/* Definitions for markers */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
            </defs>

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
                points={forwardLimitPoints.map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`).join(' ')}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
              />

              {/* Aft Limit Line */}
              <polyline
                points={aftLimitPoints.map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`).join(' ')}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
              />

              {/* Top Limit Line (connecting highest weight points) */}
              {(() => {
                const maxWeight = Math.max(...envelopePoints.map(p => p.weight));
                const topPoints = envelopePoints
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
                const minWeight = Math.min(...envelopePoints.map(p => p.weight));
                const bottomPoints = envelopePoints
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
                const topAreaPoints = envelopePoints
                  .filter(p => p.weight >= mlwWeight)
                  .map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`)
                  .join(' ');

                if (topAreaPoints) {
                  return (
                    <polygon
                      points={topAreaPoints}
                      fill="rgba(34, 197, 94, 0.4)"
                      stroke="none"
                    />
                  );
                }
                return null;
              })()}

              {/* Max Landing Weight Line */}
              {(() => {
                const mlwLbs = aircraft.maxLandingWeightLbs;
                const mlwDisplay = convertWeightForDisplay(mlwLbs, settings.weightUnits);

                // Find CG range at MLW by interpolating envelope
                const minCGAtMLW = Math.min(...envelopePoints.map(p => p.cgPosition));
                const maxCGAtMLW = Math.max(...envelopePoints.map(p => p.cgPosition));

                return (
                  <g>
                    <line
                      x1={xScale(minCGAtMLW)}
                      y1={yScale(mlwDisplay)}
                      x2={xScale(maxCGAtMLW)}
                      y2={yScale(mlwDisplay)}
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeDasharray="8,4"
                    />
                    <text
                      x={xScale(maxCGAtMLW) + 5}
                      y={yScale(mlwDisplay) + 4}
                      fontSize="11"
                      fill="#dc2626"
                      fontWeight="500"
                    >
                      MLW
                    </text>
                  </g>
                );
              })()}

              {/* Cumulative Load Path */}
              {loadPath && loadPath.length > 1 && (() => {
                const pathPoints = loadPath.map(p => ({
                  weight: convertWeightForDisplay(p.weight, settings.weightUnits),
                  cgPosition: convertCGForDisplay(p.cgPosition)
                }));

                const pathString = pathPoints
                  .map(p => `${xScale(p.cgPosition)},${yScale(p.weight)}`)
                  .join(' ');

                return (
                  <g>
                    {/* Load path line */}
                    <polyline
                      points={pathString}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    {/* Small dots at each station */}
                    {pathPoints.map((p, i) => (
                      <circle
                        key={i}
                        cx={xScale(p.cgPosition)}
                        cy={yScale(p.weight)}
                        r="4"
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth="1"
                      />
                    ))}
                    {/* Empty weight label */}
                    <text
                      x={xScale(pathPoints[0].cgPosition) - 5}
                      y={yScale(pathPoints[0].weight) + 4}
                      fontSize="10"
                      fill="#3b82f6"
                      textAnchor="end"
                    >
                      BEW
                    </text>
                  </g>
                );
              })()}

              {/* Zero Fuel Weight Marker */}
              {zeroFuelWeight && zeroFuelCG && (() => {
                const zfwDisplay = convertWeightForDisplay(zeroFuelWeight, settings.weightUnits);
                const zfwCGDisplay = convertCGForDisplay(zeroFuelCG);

                return (
                  <g>
                    <circle
                      cx={xScale(zfwCGDisplay)}
                      cy={yScale(zfwDisplay)}
                      r="6"
                      fill="#f59e0b"
                      stroke="#d97706"
                      strokeWidth="2"
                    />
                    <text
                      x={xScale(zfwCGDisplay)}
                      y={yScale(zfwDisplay) - 10}
                      fontSize="10"
                      fill="#d97706"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      ZFW
                    </text>
                  </g>
                );
              })()}

              {/* Fuel Line: Zero Fuel to Takeoff Weight */}
              {zeroFuelWeight && zeroFuelCG && (() => {
                const zfwDisplay = convertWeightForDisplay(zeroFuelWeight, settings.weightUnits);
                const zfwCGDisplay = convertCGForDisplay(zeroFuelCG);

                return (
                  <line
                    x1={xScale(zfwCGDisplay)}
                    y1={yScale(zfwDisplay)}
                    x2={currentX}
                    y2={currentY}
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                );
              })()}

              {/* Fuel Burn Trajectory: Takeoff to Landing */}
              {loadingState && fuelBurnState && fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0 && (() => {
                const landing = calculateLandingWeightAndCG(loadingState, aircraft, settings, fuelBurnState);
                const landingWeightDisplay = convertWeightForDisplay(landing.weight, settings.weightUnits);
                const landingCGDisplay = convertCGForDisplay(landing.cgPosition);

                // Check if landing weight exceeds MLW
                const exceedsMLW = landing.weight > aircraft.maxLandingWeightLbs;

                return (
                  <g>
                    {/* Fuel burn line */}
                    <line
                      x1={currentX}
                      y1={currentY}
                      x2={xScale(landingCGDisplay)}
                      y2={yScale(landingWeightDisplay)}
                      stroke={exceedsMLW ? "#ef4444" : "#10b981"}
                      strokeWidth="2.5"
                      markerEnd="url(#arrowhead)"
                    />
                    {/* Landing weight dot */}
                    <circle
                      cx={xScale(landingCGDisplay)}
                      cy={yScale(landingWeightDisplay)}
                      r="7"
                      fill={exceedsMLW ? "#ef4444" : "#10b981"}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={xScale(landingCGDisplay)}
                      y={yScale(landingWeightDisplay) + 20}
                      fontSize="11"
                      fill={exceedsMLW ? "#ef4444" : "#10b981"}
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      Landing
                    </text>
                  </g>
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
        <div className="flex items-center justify-center text-sm flex-wrap gap-x-4 gap-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-red-500 bg-red-500/10 mr-2"></div>
            <span>Envelope</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
            <span>Load Path</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <span>Zero Fuel</span>
          </div>
          <div className="flex items-center">
            <div className={cn(
              "w-3 h-3 rounded-full mr-2",
              withinEnvelope ? "bg-green-500" : "bg-red-500"
            )}></div>
            <span>Takeoff</span>
          </div>
          {fuelBurnState && fuelBurnState.burnRateGPH > 0 && (
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
              <span>Landing</span>
            </div>
          )}
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-red-500 mr-2" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: '#dc2626' }}></div>
            <span>MLW</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg text-sm">
          <div>
            <span className="font-medium">Takeoff Weight:</span>
            <span className="ml-2">{roundDownForDisplay(currentPosition.weight)} {settings.weightUnits}</span>
          </div>
          <div>
            <span className="font-medium">Takeoff CG:</span>
            <span className="ml-2">{currentPosition.cgPosition.toFixed(1)} {getCGUnit()}</span>
          </div>
          {zeroFuelWeight && (
            <div>
              <span className="font-medium">Zero Fuel Weight:</span>
              <span className="ml-2">{roundDownForDisplay(convertWeightForDisplay(zeroFuelWeight, settings.weightUnits))} {settings.weightUnits}</span>
            </div>
          )}
          {loadingState && fuelBurnState && fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0 && (() => {
            const landing = calculateLandingWeightAndCG(loadingState, aircraft, settings, fuelBurnState);
            const landingWeightDisplay = convertWeightForDisplay(landing.weight, settings.weightUnits);
            const exceedsMLW = landing.weight > aircraft.maxLandingWeightLbs;
            return (
              <div className={exceedsMLW ? "text-red-600" : ""}>
                <span className="font-medium">Landing Weight:</span>
                <span className="ml-2">{roundDownForDisplay(landingWeightDisplay)} {settings.weightUnits}</span>
                {exceedsMLW && <span className="ml-1 text-xs">(exceeds MLW)</span>}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CGEnvelopeChart;