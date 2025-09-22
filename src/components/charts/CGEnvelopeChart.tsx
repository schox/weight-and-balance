import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const forwardLimitPoints = aircraft.cgEnvelope
    .slice(0, 3) // First 3 points are forward limit
    .map(point => ({
      weight: convertWeightForDisplay(point.weight, settings.weightUnits),
      cgPosition: point.cgPosition
    }));

  const aftLimitPoints = aircraft.cgEnvelope
    .slice(3, 6) // Last 3 points are aft limit
    .map(point => ({
      weight: convertWeightForDisplay(point.weight, settings.weightUnits),
      cgPosition: point.cgPosition
    }));

  // Current aircraft position
  const currentPosition = {
    weight: convertWeightForDisplay(totalWeight, settings.weightUnits),
    cgPosition: cgPosition
  };

  // Calculate chart bounds with padding
  const allWeights = [...forwardLimitPoints, ...aftLimitPoints].map(p => p.weight);
  const allCGs = [...forwardLimitPoints, ...aftLimitPoints].map(p => p.cgPosition);

  const minWeight = Math.min(...allWeights) - 100;
  const maxWeight = Math.max(...allWeights) + 100;
  const minCG = Math.min(...allCGs) - 1;
  const maxCG = Math.max(...allCGs) + 1;

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 500;
  const margin = { top: 40, right: 60, bottom: 80, left: 80 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  // Scale functions
  const xScale = (weight: number) => ((weight - minWeight) / (maxWeight - minWeight)) * chartWidth;
  const yScale = (cg: number) => chartHeight - ((cg - minCG) / (maxCG - minCG)) * chartHeight;

  // Create polygon points for the envelope
  // Start with forward limit points (bottom to top), then aft limit points (top to bottom)
  const sortedForward = [...forwardLimitPoints].sort((a, b) => a.weight - b.weight);
  const sortedAft = [...aftLimitPoints].sort((a, b) => b.weight - a.weight);

  const polygonPoints = [
    ...sortedForward.map(p => `${xScale(p.weight)},${yScale(p.cgPosition)}`),
    ...sortedAft.map(p => `${xScale(p.weight)},${yScale(p.cgPosition)}`)
  ].join(' ');

  // Current position coordinates
  const currentX = xScale(currentPosition.weight);
  const currentY = yScale(currentPosition.cgPosition);

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
    <Card className={cn("w-full border border-border shadow-sm", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
          <span>Centre of Gravity Envelope</span>
          <div className={cn(
            "text-sm font-medium px-2 py-1 rounded",
            withinEnvelope ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}>
            {withinEnvelope ? "WITHIN LIMITS" : "OUT OF LIMITS"}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="w-full overflow-x-auto">
          <svg width={svgWidth} height={svgHeight} className="border border-gray-200 rounded w-full min-w-[600px]">
            {/* Background */}
            <rect width={svgWidth} height={svgHeight} fill="#fafafa" />

            {/* Grid Lines */}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Vertical grid lines */}
              {weightTicks.map(weight => (
                <line
                  key={`v-${weight}`}
                  x1={xScale(weight)}
                  y1={0}
                  x2={xScale(weight)}
                  y2={chartHeight}
                  stroke="#e5e5e5"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Horizontal grid lines */}
              {cgTicks.map(cg => (
                <line
                  key={`h-${cg}`}
                  x1={0}
                  y1={yScale(cg)}
                  x2={chartWidth}
                  y2={yScale(cg)}
                  stroke="#e5e5e5"
                  strokeDasharray="2,2"
                />
              ))}

              {/* CG Envelope Polygon */}
              <polygon
                points={polygonPoints}
                fill="rgba(239, 68, 68, 0.1)"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinejoin="round"
              />

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
                fontSize="12"
                fontWeight="bold"
                fill={withinEnvelope ? "#16a34a" : "#dc2626"}
              >
                Current
              </text>
            </g>

            {/* X-axis */}
            <g transform={`translate(${margin.left}, ${margin.top + chartHeight})`}>
              <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#374151" strokeWidth="1" />
              {weightTicks.map(weight => (
                <g key={`x-tick-${weight}`} transform={`translate(${xScale(weight)}, 0)`}>
                  <line y1={0} y2={5} stroke="#374151" strokeWidth="1" />
                  <text y={20} textAnchor="middle" fontSize="12" fill="#374151">
                    {Math.round(weight)}
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
                Weight ({settings.weightUnits})
              </text>
            </g>

            {/* Y-axis */}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#374151" strokeWidth="1" />
              {cgTicks.map(cg => (
                <g key={`y-tick-${cg}`} transform={`translate(0, ${yScale(cg)})`}>
                  <line x1={-5} x2={0} stroke="#374151" strokeWidth="1" />
                  <text x={-10} y={4} textAnchor="end" fontSize="12" fill="#374151">
                    {cg.toFixed(1)}
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
                CG Position (inches from datum)
              </text>
            </g>
          </svg>
        </div>

        {/* Legend and Current Position Info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
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
              <span className="ml-2">{currentPosition.cgPosition.toFixed(1)}" from datum</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CGEnvelopeChart;