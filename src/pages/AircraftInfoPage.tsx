import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Plane, Fuel, Users, Package, Scale, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAircraft } from '@/data/aircraft';
import type { Aircraft, LoadingStation } from '@/types/aircraft';

// Conversion constants
const LBS_TO_KG = 0.453592;
const INCHES_TO_MM = 25.4;
const GALLONS_TO_LITRES = 3.78541;

// Helper functions for unit conversions
const formatWeight = (lbs: number): { lbs: string; kg: string } => ({
  lbs: lbs.toFixed(1),
  kg: (lbs * LBS_TO_KG).toFixed(1)
});

const formatArm = (mm: number): { inches: string; mm: string } => ({
  inches: (mm / INCHES_TO_MM).toFixed(1),
  mm: mm.toFixed(0)
});

const formatFuel = (gallons: number): { gallons: string; litres: string } => ({
  gallons: gallons.toFixed(1),
  litres: (gallons * GALLONS_TO_LITRES).toFixed(1)
});

// Component to display a loading station
const LoadingStationRow: React.FC<{ station: LoadingStation }> = ({ station }) => {
  const weight = formatWeight(station.maxWeightLbs);
  const arm = formatArm(station.armMm);

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 px-3 font-medium">{station.name}</td>
      <td className="py-2 px-3 text-right font-mono text-sm">
        {arm.inches}" / {arm.mm} mm
      </td>
      <td className="py-2 px-3 text-right font-mono text-sm">
        {weight.lbs} lbs / {weight.kg} kg
      </td>
    </tr>
  );
};

// Component to display CG envelope data
const CGEnvelopeTable: React.FC<{ aircraft: Aircraft }> = ({ aircraft }) => {
  // Extract key envelope points
  const envelope = aircraft.cgEnvelope;
  if (envelope.length < 5) return null;

  // Standard format: BEW fwd, breakpoint fwd, MTOW fwd, MTOW aft, BEW aft
  const points = [
    { label: 'Forward Limit (at BEW)', weight: envelope[0].weight, cg: envelope[0].cgPosition },
    { label: 'Forward Limit (breakpoint)', weight: envelope[1].weight, cg: envelope[1].cgPosition },
    { label: 'Forward Limit (at MTOW)', weight: envelope[2].weight, cg: envelope[2].cgPosition },
    { label: 'Aft Limit (constant)', weight: envelope[3].weight, cg: envelope[3].cgPosition },
  ];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="py-2 px-3 text-left font-semibold">Limit</th>
          <th className="py-2 px-3 text-right font-semibold">Weight</th>
          <th className="py-2 px-3 text-right font-semibold">CG Position</th>
        </tr>
      </thead>
      <tbody>
        {points.map((point, idx) => {
          const weight = formatWeight(point.weight);
          const arm = formatArm(point.cg);
          return (
            <tr key={idx} className="border-b border-gray-100 last:border-0">
              <td className="py-2 px-3">{point.label}</td>
              <td className="py-2 px-3 text-right font-mono text-sm">
                {weight.lbs} lbs / {weight.kg} kg
              </td>
              <td className="py-2 px-3 text-right font-mono text-sm">
                {arm.inches}" / {arm.mm} mm
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// Main page component
const AircraftInfoPage: React.FC = () => {
  const { registration } = useParams<{ registration: string }>();

  // Normalize registration to uppercase
  const normalizedReg = registration?.toUpperCase().replace('-', '-') || '';
  const aircraft = getAircraft(normalizedReg);

  // Redirect to home if aircraft not found
  if (!aircraft) {
    return <Navigate to="/" replace />;
  }

  const emptyWeight = formatWeight(aircraft.emptyWeightLbs);
  const emptyCG = formatArm(aircraft.emptyCGMm);
  const mtow = formatWeight(aircraft.maxTakeoffWeightLbs);
  const mlw = formatWeight(aircraft.maxLandingWeightLbs);
  const maxRamp = formatWeight(aircraft.maxRampWeightLbs);
  const fuelCapacity = formatFuel(aircraft.fuelCapacityGallons);
  const fuelPerTank = formatFuel(aircraft.fuelCapacityGallons / 2);
  const combinedBaggage = aircraft.combinedBaggageLimitLbs
    ? formatWeight(aircraft.combinedBaggageLimitLbs)
    : null;

  // Separate loading stations by category
  const pilotStations = aircraft.loadingStations.filter(s => s.category === 'pilot');
  const passengerStations = aircraft.loadingStations.filter(s => s.category === 'passenger');
  const baggageStations = aircraft.loadingStations.filter(s => s.category === 'baggage');
  const fuelStations = aircraft.loadingStations.filter(s => s.category === 'fuel');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Plane className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{aircraft.registration}</h1>
            <p className="text-muted-foreground">{aircraft.model}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          This page shows the exact data used for all weight, balance, and fuel burn calculations.
          All values are shown in both imperial and metric units.
        </p>

        <div className="space-y-6">
          {/* Basic Empty Weight Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scale className="h-5 w-5 text-blue-600" />
                Basic Empty Weight Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Basic Empty Weight (BEW)</div>
                  <div className="font-mono font-semibold">
                    {emptyWeight.lbs} lbs / {emptyWeight.kg} kg
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Empty CG Position</div>
                  <div className="font-mono font-semibold">
                    {emptyCG.inches}" / {emptyCG.mm} mm
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {aircraft.dateApproved !== 'TBD' && (
                  <span>Approved: {aircraft.dateApproved}</span>
                )}
                {aircraft.workOrder !== 'TBD' && (
                  <span className="ml-4">Work Order: {aircraft.workOrder}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weight Limits Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scale className="h-5 w-5 text-red-600" />
                Weight Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Max Takeoff Weight (MTOW)</div>
                  <div className="font-mono font-semibold">
                    {mtow.lbs} lbs / {mtow.kg} kg
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Max Landing Weight (MLW)</div>
                  <div className="font-mono font-semibold">
                    {mlw.lbs} lbs / {mlw.kg} kg
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Max Ramp Weight</div>
                  <div className="font-mono font-semibold">
                    {maxRamp.lbs} lbs / {maxRamp.kg} kg
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fuel Data Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Fuel className="h-5 w-5 text-green-600" />
                Fuel Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total Usable Capacity</div>
                  <div className="font-mono font-semibold">
                    {fuelCapacity.gallons} gal / {fuelCapacity.litres} L
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Per Tank Capacity</div>
                  <div className="font-mono font-semibold">
                    {fuelPerTank.gallons} gal / {fuelPerTank.litres} L
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Default Fuel Burn Rate</div>
                  <div className="font-mono font-semibold">
                    {aircraft.defaultFuelBurnRateGPH} GPH / {(aircraft.defaultFuelBurnRateGPH * GALLONS_TO_LITRES).toFixed(1)} L/hr
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Fuel weight calculated at 6.0 lbs/gal (0.72 kg/L) for 100LL AVGAS
              </div>
            </CardContent>
          </Card>

          {/* Loading Stations Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-purple-600" />
                Loading Stations - Occupants
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-2 px-3 text-left font-semibold">Station</th>
                      <th className="py-2 px-3 text-right font-semibold">Arm (from datum)</th>
                      <th className="py-2 px-3 text-right font-semibold">Max Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...pilotStations, ...passengerStations].map(station => (
                      <LoadingStationRow key={station.id} station={station} />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Baggage Stations Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-orange-600" />
                Loading Stations - Baggage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-2 px-3 text-left font-semibold">Station</th>
                      <th className="py-2 px-3 text-right font-semibold">Arm (from datum)</th>
                      <th className="py-2 px-3 text-right font-semibold">Max Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baggageStations.map(station => (
                      <LoadingStationRow key={station.id} station={station} />
                    ))}
                  </tbody>
                </table>
              </div>
              {combinedBaggage && (
                <div className="p-3 bg-orange-50 border-t border-orange-100">
                  <div className="text-sm">
                    <span className="font-medium">Combined Baggage Limit: </span>
                    <span className="font-mono">{combinedBaggage.lbs} lbs / {combinedBaggage.kg} kg</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fuel Stations Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Fuel className="h-5 w-5 text-green-600" />
                Loading Stations - Fuel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-2 px-3 text-left font-semibold">Station</th>
                      <th className="py-2 px-3 text-right font-semibold">Arm (from datum)</th>
                      <th className="py-2 px-3 text-right font-semibold">Max Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelStations.map(station => (
                      <LoadingStationRow key={station.id} station={station} />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* CG Envelope Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-indigo-600" />
                CG Envelope Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <CGEnvelopeTable aircraft={aircraft} />
              </div>
              <div className="p-3 bg-indigo-50 border-t border-indigo-100 text-sm">
                <div className="font-medium mb-2">How CG limits work:</div>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Forward limit is constant up to the breakpoint weight</li>
                  <li>Forward limit tapers linearly from breakpoint to MTOW</li>
                  <li>Aft limit is constant at all weights</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Moment Calculation Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Moment Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-3">
                <p>
                  All moment calculations in this application use the following formula:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-center">
                  Moment (kg.mm) = Weight (kg) × Arm (mm)
                </div>
                <p>
                  The Centre of Gravity (CG) position is calculated as:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-center">
                  CG (mm) = Total Moment (kg.mm) ÷ Total Weight (kg)
                </div>
                <p className="text-muted-foreground">
                  Values entered in imperial units (lbs, inches) are converted internally for calculations,
                  then converted back for display in your preferred units.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Important Notice</h3>
            <p className="text-sm text-amber-700">
              This data is provided for planning purposes only. Always verify weight and balance
              calculations against the official Aircraft Flight Manual and the current Weight & Balance
              documentation for this specific aircraft. The pilot-in-command is responsible for ensuring
              the aircraft is loaded within limits for each flight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AircraftInfoPage;
