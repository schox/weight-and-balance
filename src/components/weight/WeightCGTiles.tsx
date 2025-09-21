import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { convertWeightForDisplay, roundDownForDisplay } from '@/utils/conversions';
import type { Aircraft, CalculationResult, Settings } from '@/types/aircraft';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface WeightCGTilesProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  className?: string;
}

const WeightCGTiles: React.FC<WeightCGTilesProps> = ({
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
      return <XCircle className="h-5 w-5 text-danger" />;
    } else if (warnings.length > 0) {
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    } else {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }
  };

  const getStatusText = () => {
    if (errors.length > 0) return "OUT OF LIMITS";
    if (warnings.length > 0) return "CAUTION";
    return "WITHIN LIMITS";
  };

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4", className)}>
      {/* Basic Empty Weight */}
      <Card className="bg-surface-container">
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground">BEW</div>
          <div className="text-xl font-bold text-on-surface-container">
            {roundDownForDisplay(convertWeightForDisplay(aircraft.emptyWeightLbs, settings.weightUnits))}
          </div>
          <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
        </CardContent>
      </Card>

      {/* Maximum Takeoff Weight */}
      <Card className="bg-surface-container">
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground">MTOW</div>
          <div className="text-xl font-bold text-on-surface-container">
            {roundDownForDisplay(convertWeightForDisplay(aircraft.maxTakeoffWeightLbs, settings.weightUnits))}
          </div>
          <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
        </CardContent>
      </Card>

      {/* Current Weight */}
      <Card className="bg-surface-container">
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Current Weight</div>
          <div className={cn(
            "text-xl font-bold",
            totalWeight > aircraft.maxTakeoffWeightLbs ? "text-danger" : "text-on-surface-container"
          )}>
            {roundDownForDisplay(convertWeightForDisplay(totalWeight, settings.weightUnits))}
          </div>
          <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-muted rounded-full h-1">
            <div
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                mtowPercentage > 100 ? "bg-danger" :
                mtowPercentage > 90 ? "bg-warning" :
                mtowPercentage > 75 ? "bg-info" : "bg-success"
              )}
              style={{ width: `${Math.min(mtowPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {mtowPercentage.toFixed(0)}% MTOW
          </div>
        </CardContent>
      </Card>

      {/* Weight Margin */}
      <Card className="bg-surface-container">
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Margin</div>
          <div className={cn(
            "text-xl font-bold",
            weightMargin < 0 ? "text-danger" :
            weightMargin < 100 ? "text-warning" : "text-success"
          )}>
            {convertWeightForDisplay(weightMargin, settings.weightUnits) > 0 ? '+' : ''}{roundDownForDisplay(convertWeightForDisplay(weightMargin, settings.weightUnits))}
          </div>
          <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
        </CardContent>
      </Card>

      {/* CG Position */}
      <Card className="bg-surface-container">
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground">CG Position</div>
          <div className={cn(
            "text-lg font-bold",
            !withinEnvelope ? "text-danger" : "text-on-surface-container"
          )}>
            {cgPosition.toFixed(1)}"
          </div>
          <div className="text-xs text-muted-foreground">
            {percentMAC.toFixed(1)}% MAC
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="bg-surface-container">
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="flex items-center justify-center space-x-2">
            {getStatusIcon()}
            <span className={cn(
              "font-bold text-sm",
              errors.length > 0 ? "text-danger" :
              warnings.length > 0 ? "text-warning" : "text-success"
            )}>{getStatusText()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Envelope Status */}
      <Card className="bg-surface-container">
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Envelope</div>
          <div className={cn(
            "text-lg font-bold",
            withinEnvelope ? "text-success" : "text-danger"
          )}>
            {withinEnvelope ? "✓ SAFE" : "✗ UNSAFE"}
          </div>
        </CardContent>
      </Card>

      {/* Balance Status */}
      <Card className="bg-surface-container">
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Balance</div>
          <div className={cn(
            "text-lg font-bold",
            !withinEnvelope ? "text-danger" : "text-success"
          )}>
            {withinEnvelope ? "BALANCED" : "UNBALANCED"}
          </div>
        </CardContent>
      </Card>

      {/* Errors and Warnings - Span across all columns if present */}
      {(errors.length > 0 || warnings.length > 0) && (
        <Card className="col-span-2 sm:col-span-4 bg-surface-container">
          <CardContent className="p-4">
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-danger">
                  <XCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ))}
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeightCGTiles;