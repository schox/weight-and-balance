import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { convertWeightForDisplay, roundDownForDisplay, convertCGForDisplay, getDistanceUnitLabel } from '@/utils/conversions';
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
    <Card className={cn("bg-surface-container", className)}>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* First Row - BEW and MTOW */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">BEW</div>
            <div className="text-xl font-bold text-on-surface-container">{roundDownForDisplay(convertWeightForDisplay(aircraft.emptyWeightLbs, settings.weightUnits))}</div>
            <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">MTOW</div>
            <div className="text-xl font-bold text-on-surface-container">{roundDownForDisplay(convertWeightForDisplay(aircraft.maxTakeoffWeightLbs, settings.weightUnits))}</div>
            <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
          </div>
        </div>

        {/* Second Row - Current Weight and Margin */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Current Weight</div>
            <div className={cn(
              "text-xl font-bold",
              totalWeight > aircraft.maxTakeoffWeightLbs ? "text-danger" : "text-on-surface-container"
            )}>
              {roundDownForDisplay(convertWeightForDisplay(totalWeight, settings.weightUnits))}
            </div>
            <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Margin</div>
            <div className={cn(
              "text-xl font-bold",
              weightMargin < 0 ? "text-danger" :
              weightMargin < 100 ? "text-warning" : "text-success"
            )}>
              {convertWeightForDisplay(weightMargin, settings.weightUnits) > 0 ? '+' : ''}{roundDownForDisplay(convertWeightForDisplay(weightMargin, settings.weightUnits))}
            </div>
            <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Weight Loading</span>
            <span className={cn(
              "font-medium",
              mtowPercentage > 100 ? "text-danger" :
              mtowPercentage > 90 ? "text-warning" : "text-on-surface-container"
            )}>
              {mtowPercentage.toFixed(1)}% of MTOW
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-300",
                mtowPercentage > 100 ? "bg-danger" :
                mtowPercentage > 90 ? "bg-warning" :
                mtowPercentage > 75 ? "bg-info" : "bg-success"
              )}
              style={{ width: `${Math.min(mtowPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Third Row - CG, Status, and Envelope */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">CG Position</div>
            <div className={cn(
              "text-lg font-bold",
              !withinEnvelope ? "text-danger" : "text-on-surface-container"
            )}>
              {convertCGForDisplay(cgPosition, settings.distanceUnits).toFixed(1)}{getDistanceUnitLabel(settings.distanceUnits)}
            </div>
            <div className="text-xs text-muted-foreground">
              {percentMAC.toFixed(1)}% MAC
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="flex items-center justify-center space-x-2">
              {getStatusIcon()}
              <span className={cn(
                "font-bold text-sm",
                errors.length > 0 ? "text-danger" :
                warnings.length > 0 ? "text-warning" : "text-success"
              )}>{getStatusText()}</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">Envelope</div>
            <div className={cn(
              "text-lg font-bold",
              withinEnvelope ? "text-success" : "text-danger"
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