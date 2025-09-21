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
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      {/* Weight Data Tile */}
      <Card className="bg-surface-container">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-on-surface-container">Weight Data</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* BEW */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">BEW</div>
              <div className="text-xl font-bold text-on-surface-container">
                {roundDownForDisplay(convertWeightForDisplay(aircraft.emptyWeightLbs, settings.weightUnits))}
              </div>
              <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
            </div>

            {/* MTOW */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">MTOW</div>
              <div className="text-xl font-bold text-on-surface-container">
                {roundDownForDisplay(convertWeightForDisplay(aircraft.maxTakeoffWeightLbs, settings.weightUnits))}
              </div>
              <div className="text-xs text-muted-foreground">{settings.weightUnits}</div>
            </div>

            {/* Current Weight */}
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

            {/* Margin */}
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
          <div className="mt-4 space-y-2">
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
        </CardContent>
      </Card>

      {/* CG Data Tile */}
      <Card className="bg-surface-container">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-on-surface-container">Center of Gravity</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* CG Position */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">CG Position</div>
              <div className={cn(
                "text-xl font-bold",
                !withinEnvelope ? "text-danger" : "text-on-surface-container"
              )}>
                {cgPosition.toFixed(1)}"
              </div>
              <div className="text-xs text-muted-foreground">
                {percentMAC.toFixed(1)}% MAC
              </div>
            </div>

            {/* Status */}
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

            {/* Envelope Status */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Envelope</div>
              <div className={cn(
                "text-lg font-bold",
                withinEnvelope ? "text-success" : "text-danger"
              )}>
                {withinEnvelope ? "✓ SAFE" : "✗ UNSAFE"}
              </div>
            </div>

            {/* Balance Status */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className={cn(
                "text-lg font-bold",
                !withinEnvelope ? "text-danger" : "text-success"
              )}>
                {withinEnvelope ? "BALANCED" : "UNBALANCED"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors and Warnings - Span across both tiles if present */}
      {(errors.length > 0 || warnings.length > 0) && (
        <Card className="col-span-1 md:col-span-2 bg-surface-container">
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