import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { convertWeightForDisplay, roundDownForDisplay } from '@/utils/conversions';
import type { Aircraft, CalculationResult, Settings } from '@/types/aircraft';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface WeightSummaryProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  className?: string;
}

const WeightSummary: React.FC<WeightSummaryProps> = ({
  aircraft,
  calculations,
  settings,
  className
}) => {
  const {
    totalWeight,
    cgPosition,
    percentMAC,
    withinEnvelope,
    weightMargin,
    errors,
    warnings
  } = calculations;

  // Calculate percentage of MTOW
  const mtowPercentage = (totalWeight / aircraft.maxTakeoffWeightLbs) * 100;

  // Determine overall status
  const getStatusIcon = () => {
    if (errors.length > 0) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    } else if (warnings.length > 0) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusText = () => {
    if (errors.length > 0) return "OUT OF LIMITS";
    if (warnings.length > 0) return "CAUTION";
    return "WITHIN LIMITS";
  };


  return (
    <Card className={cn("border-2 gradient-aviation-card text-white shadow-lg", className)}>
      <CardContent className="p-6">
        {/* Top Row - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Basic Empty Weight */}
          <div className="text-center">
            <div className="text-sm text-white/70">BEW</div>
            <div className="text-lg font-bold text-white">{roundDownForDisplay(convertWeightForDisplay(aircraft.emptyWeightLbs, settings.weightUnits))}</div>
            <div className="text-xs text-white/70">{settings.weightUnits}</div>
          </div>

          {/* Current Weight */}
          <div className="text-center">
            <div className="text-sm text-white/70">Current Weight</div>
            <div className={cn(
              "text-lg font-bold",
              totalWeight > aircraft.maxTakeoffWeightLbs ? "text-aviation-red" : "text-white"
            )}>
              {roundDownForDisplay(convertWeightForDisplay(totalWeight, settings.weightUnits))}
            </div>
            <div className="text-xs text-white/70">{settings.weightUnits}</div>
          </div>

          {/* MTOW */}
          <div className="text-center">
            <div className="text-sm text-white/70">MTOW</div>
            <div className="text-lg font-bold text-white">{roundDownForDisplay(convertWeightForDisplay(aircraft.maxTakeoffWeightLbs, settings.weightUnits))}</div>
            <div className="text-xs text-white/70">{settings.weightUnits}</div>
          </div>

          {/* Margin */}
          <div className="text-center">
            <div className="text-sm text-white/70">Margin</div>
            <div className={cn(
              "text-lg font-bold",
              weightMargin < 0 ? "text-aviation-red" :
              weightMargin < 100 ? "text-aviation-gold" : "text-aviation-green"
            )}>
              {convertWeightForDisplay(weightMargin, settings.weightUnits) > 0 ? '+' : ''}{roundDownForDisplay(convertWeightForDisplay(weightMargin, settings.weightUnits))}
            </div>
            <div className="text-xs text-white/70">{settings.weightUnits}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-white/90">Weight Loading</span>
            <span className={cn(
              "font-medium",
              mtowPercentage > 100 ? "text-aviation-red" :
              mtowPercentage > 90 ? "text-aviation-gold" : "text-white"
            )}>
              {mtowPercentage.toFixed(1)}% of MTOW
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-300",
                mtowPercentage > 100 ? "bg-aviation-red" :
                mtowPercentage > 90 ? "bg-aviation-gold" :
                mtowPercentage > 75 ? "bg-white" : "bg-aviation-green"
              )}
              style={{ width: `${Math.min(mtowPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Bottom Row - CG and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CG Position */}
          <div className="text-center">
            <div className="text-sm text-white/70">CG Position</div>
            <div className={cn(
              "text-lg font-bold",
              !withinEnvelope ? "text-aviation-red" : "text-white"
            )}>
              {cgPosition.toFixed(1)}"
            </div>
            <div className="text-xs text-white/70">
              {percentMAC.toFixed(1)}% MAC
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <div className="text-sm text-white/70">Status</div>
            <div className={cn("flex items-center justify-center space-x-2")}>
              {getStatusIcon()}
              <span className={cn(
                "font-bold",
                errors.length > 0 ? "text-aviation-red" :
                warnings.length > 0 ? "text-aviation-gold" : "text-aviation-green"
              )}>{getStatusText()}</span>
            </div>
          </div>

          {/* Empty space for future use */}
          <div className="text-center">
            <div className="text-sm text-white/70">Envelope</div>
            <div className={cn(
              "text-lg font-bold",
              withinEnvelope ? "text-aviation-green" : "text-aviation-red"
            )}>
              {withinEnvelope ? "✓ SAFE" : "✗ UNSAFE"}
            </div>
          </div>
        </div>

        {/* Errors and Warnings */}
        {(errors.length > 0 || warnings.length > 0) && (
          <div className="mt-4 space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ))}
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightSummary;