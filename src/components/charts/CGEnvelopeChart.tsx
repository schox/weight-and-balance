import React from 'react';
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceDot,
  ComposedChart,
  Tooltip,
  Legend
} from 'recharts';
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
  loadingState,
  className
}) => {
  const { totalWeight, cgPosition, withinEnvelope } = calculations;

  // Convert envelope points to display units
  const forwardLimitPoints = aircraft.cgEnvelope
    .slice(0, 3) // First 3 points are forward limit
    .map(point => ({
      weight: roundDownForDisplay(convertWeightForDisplay(point.weight, settings.weightUnits)),
      cgPosition: point.cgPosition,
      limit: 'Forward Limit'
    }));

  const aftLimitPoints = aircraft.cgEnvelope
    .slice(3, 6) // Last 3 points are aft limit
    .map(point => ({
      weight: roundDownForDisplay(convertWeightForDisplay(point.weight, settings.weightUnits)),
      cgPosition: point.cgPosition,
      limit: 'Aft Limit'
    }));

  // Current aircraft position
  const currentPosition = {
    weight: roundDownForDisplay(convertWeightForDisplay(totalWeight, settings.weightUnits)),
    cgPosition: parseFloat(cgPosition.toFixed(1)),
    limit: 'Current Position'
  };

  // Create chart data with all points properly organized
  const minWeight = Math.min(...forwardLimitPoints.map(p => p.weight)) - 100;
  const maxWeight = Math.max(...aftLimitPoints.map(p => p.weight)) + 100;
  const minCG = Math.min(...aircraft.cgEnvelope.map(p => p.cgPosition)) - 1;
  const maxCG = Math.max(...aircraft.cgEnvelope.map(p => p.cgPosition)) + 1;

  // Create a complete dataset for the envelope
  const chartData = [];
  for (let i = 0; i < forwardLimitPoints.length; i++) {
    chartData.push({
      weight: forwardLimitPoints[i].weight,
      forwardLimit: forwardLimitPoints[i].cgPosition,
      aftLimit: aftLimitPoints[i].cgPosition
    });
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
          <p className="font-semibold">{data.limit}</p>
          <p>Weight: {data.weight} {settings.weightUnits}</p>
          <p>CG: {data.cgPosition}" from datum</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Center of Gravity Envelope</span>
          <div className={cn(
            "text-sm font-medium px-2 py-1 rounded",
            withinEnvelope ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}>
            {withinEnvelope ? "WITHIN LIMITS" : "OUT OF LIMITS"}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

              {/* X-axis: Weight */}
              <XAxis
                dataKey="weight"
                type="number"
                domain={[minWeight, maxWeight]}
                label={{
                  value: `Weight (${settings.weightUnits})`,
                  position: 'insideBottom',
                  offset: -10
                }}
                tick={{ fontSize: 12 }}
              />

              {/* Y-axis: CG Position */}
              <YAxis
                type="number"
                domain={[minCG, maxCG]}
                label={{
                  value: 'CG Position (inches from datum)',
                  angle: -90,
                  position: 'insideLeft'
                }}
                tick={{ fontSize: 12 }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Forward Limit Line */}
              <Line
                dataKey="forwardLimit"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Forward Limit"
                connectNulls={false}
              />

              {/* Aft Limit Line */}
              <Line
                dataKey="aftLimit"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Aft Limit"
                connectNulls={false}
              />

              {/* Current Position Dot */}
              <ReferenceDot
                x={currentPosition.weight}
                y={currentPosition.cgPosition}
                r={6}
                fill={withinEnvelope ? "#22c55e" : "#ef4444"}
                stroke={withinEnvelope ? "#16a34a" : "#dc2626"}
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Current Position Info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-red-500 mr-2"></div>
                <span>CG Limits</span>
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
              <span className="ml-2">{currentPosition.weight} {settings.weightUnits}</span>
            </div>
            <div>
              <span className="font-medium">Current CG:</span>
              <span className="ml-2">{currentPosition.cgPosition}" from datum</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CGEnvelopeChart;