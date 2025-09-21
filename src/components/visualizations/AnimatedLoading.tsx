import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { convertWeightForDisplay, roundDownForDisplay } from '@/utils/conversions';
import type { Aircraft, CalculationResult, Settings } from '@/types/aircraft';
import { cn } from '@/lib/utils';

interface AnimatedLoadingProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
}

interface LoadingStep {
  id: string;
  name: string;
  weight: number;
  armInches: number;
  category: string;
  delay: number;
}

const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  aircraft,
  settings
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadedSteps, setLoadedSteps] = useState<Set<number>>(new Set());

  // Define loading sequence (simulate realistic loading order)
  const loadingSequence: LoadingStep[] = [
    { id: 'empty', name: 'Empty Aircraft', weight: aircraft.emptyWeightLbs, armInches: aircraft.emptyCGInches, category: 'empty', delay: 0 },
    { id: 'pilot', name: 'Pilot Boarding', weight: 185, armInches: 37, category: 'pilot', delay: 1000 },
    { id: 'frontPassenger', name: 'Front Passenger', weight: 165, armInches: 37, category: 'passenger', delay: 1500 },
    { id: 'rearPassenger1', name: 'Rear Passenger 1', weight: 155, armInches: 74, category: 'passenger', delay: 2000 },
    { id: 'baggageA', name: 'Loading Baggage A', weight: 35, armInches: 95, category: 'baggage', delay: 2500 },
    { id: 'baggageB', name: 'Loading Baggage B', weight: 20, armInches: 123, category: 'baggage', delay: 3000 },
    { id: 'fuel', name: 'Fuel Loading', weight: 300, armInches: 48, category: 'fuel', delay: 3500 }
  ];

  // Calculate cumulative weight and CG for animation
  const calculateProgressiveCG = (stepIndex: number) => {
    let totalWeight = 0;
    let totalMoment = 0;

    for (let i = 0; i <= stepIndex; i++) {
      const step = loadingSequence[i];
      if (i === 0) {
        // Empty aircraft
        totalWeight = step.weight;
        totalMoment = step.weight * step.armInches;
      } else {
        // Add loading
        totalWeight += step.weight;
        totalMoment += step.weight * step.armInches;
      }
    }

    return {
      weight: totalWeight,
      cgPosition: totalWeight > 0 ? totalMoment / totalWeight : aircraft.emptyCGInches
    };
  };

  const currentData = calculateProgressiveCG(currentStep);

  // Animation controls
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < loadingSequence.length - 1) {
        setCurrentStep(prev => prev + 1);
        setLoadedSteps(prev => new Set([...prev, currentStep + 1]));
      } else {
        setIsPlaying(false);
      }
    }, loadingSequence[currentStep]?.delay || 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (currentStep >= loadingSequence.length - 1) {
      handleReset();
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setLoadedSteps(new Set([0]));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'empty': return 'text-gray-600';
      case 'pilot': return 'text-blue-600';
      case 'passenger': return 'text-purple-600';
      case 'baggage': return 'text-orange-600';
      case 'fuel': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'empty': return 'bg-gray-100';
      case 'pilot': return 'bg-blue-100';
      case 'passenger': return 'bg-purple-100';
      case 'baggage': return 'bg-orange-100';
      case 'fuel': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Loading Sequence Animation</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={currentStep >= loadingSequence.length - 1 && !isPlaying}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                {currentStep >= loadingSequence.length - 1 ? 'Replay' : 'Play'}
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Animation Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 min-h-[400px]">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Loading Progress</span>
            <span>{currentStep + 1} / {loadingSequence.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / loadingSequence.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step Display */}
        <div className="text-center mb-8">
          <div className={cn(
            "text-2xl font-bold mb-2",
            getCategoryColor(loadingSequence[currentStep]?.category || 'empty')
          )}>
            {loadingSequence[currentStep]?.name || 'Empty Aircraft'}
          </div>
          <div className="text-lg text-muted-foreground">
            Step {currentStep + 1} of {loadingSequence.length}
          </div>
        </div>

        {/* Visual Aircraft with Loading */}
        <div className="relative h-48 mb-8">
          {/* Aircraft Outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Fuselage */}
              <div className="w-80 h-8 bg-gray-300 rounded-full relative">
                {/* Wings */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-20 bg-gray-400 rounded-full opacity-50"></div>

                {/* Loading Stations */}
                {loadingSequence.map((step, index) => {
                  if (index === 0) return null; // Skip empty aircraft

                  const isLoaded = loadedSteps.has(index);
                  const isCurrentlyLoading = index === currentStep;
                  const position = ((step.armInches - 20) / 80) * 100; // Relative position

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-500",
                        isLoaded ? getCategoryBg(step.category) : 'bg-gray-200',
                        isCurrentlyLoading && 'animate-pulse scale-125',
                        isLoaded && 'border-2 border-white shadow-lg'
                      )}
                      style={{ left: `${Math.max(0, Math.min(95, position))}%` }}
                    >
                      {isLoaded && (
                        <div className={cn(
                          "w-full h-full rounded-full",
                          step.category === 'pilot' ? 'bg-blue-500' :
                          step.category === 'passenger' ? 'bg-purple-500' :
                          step.category === 'baggage' ? 'bg-orange-500' :
                          step.category === 'fuel' ? 'bg-green-500' :
                          'bg-gray-500'
                        )}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/70 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Current Weight</div>
            <div className="text-xl font-bold">
              {roundDownForDisplay(convertWeightForDisplay(currentData.weight, settings.weightUnits))} {settings.weightUnits}
            </div>
          </div>

          <div className="bg-white/70 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Current CG</div>
            <div className="text-xl font-bold">
              {currentData.cgPosition.toFixed(1)}"
            </div>
          </div>

          <div className="bg-white/70 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="text-xl font-bold">
              {Math.round(((currentStep + 1) / loadingSequence.length) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Loading Steps List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Loading Sequence</h4>
        </div>
        <div className="p-4 space-y-2">
          {loadingSequence.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all",
                index === currentStep ? 'bg-blue-50 border border-blue-200' :
                loadedSteps.has(index) ? 'bg-green-50' :
                'bg-gray-50'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                  index === currentStep ? 'bg-blue-500' :
                  loadedSteps.has(index) ? 'bg-green-500' :
                  'bg-gray-400'
                )}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{step.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {step.id === 'empty' ? 'Initial condition' :
                     `+${roundDownForDisplay(convertWeightForDisplay(step.weight, settings.weightUnits))} ${settings.weightUnits} at ${step.armInches}"`}
                  </div>
                </div>
              </div>
              {index === currentStep && isPlaying && (
                <div className="text-blue-600 animate-pulse">
                  Loading...
                </div>
              )}
              {loadedSteps.has(index) && index !== currentStep && (
                <div className="text-green-600">
                  ✓ Complete
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedLoading;