import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  HelpCircle,
  Plane,
  Scale,
  Fuel,
  Users,
  Package,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Calculator,
  Clock,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HelpPage: React.FC = () => {
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
          <HelpCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">User Guide</h1>
            <p className="text-muted-foreground">Weight & Balance Calculator</p>
          </div>
        </div>

        {/* Important Safety Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Important Safety Notice</h3>
              <p className="text-sm text-amber-700">
                This calculator is for planning purposes only. Always verify calculations against
                the official Aircraft Flight Manual and current Weight & Balance documentation.
                The pilot-in-command is solely responsible for ensuring the aircraft is loaded within limits.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-blue-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                The Weight & Balance Calculator helps pilots at Curtin Flying Club:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Calculate total aircraft weight for a planned flight</li>
                <li>Determine the Centre of Gravity (CG) position</li>
                <li>Verify that the aircraft is loaded within safe operating limits</li>
                <li>Plan fuel burn and predict landing weight and CG</li>
              </ul>
              <p className="font-medium">Supported aircraft:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>VH-YPB</strong> - Cessna 182T</li>
                <li><strong>VH-KXW</strong> - Cessna 172P</li>
              </ul>
            </CardContent>
          </Card>

          {/* Selecting an Aircraft */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plane className="h-5 w-5 text-indigo-600" />
                Selecting an Aircraft
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                At the top of the calculator, you'll see two tabs for each aircraft.
                Click the appropriate tab to select your aircraft.
              </p>
              <p>
                Each aircraft has different basic empty weight, loading station arm positions,
                CG envelope limits, fuel capacity, and baggage limits.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <p className="text-blue-800">
                  <strong>Tip:</strong> Your entered data is independent for each aircraft tab.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Viewing Aircraft Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-cyan-600" />
                Viewing Aircraft Data
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Each aircraft tab has an <strong>Info icon</strong> (ℹ️) next to the aircraft name.
                Click this icon to view detailed information about the aircraft data used for all calculations.
              </p>
              <p>The aircraft information page displays:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Basic Empty Weight and Empty CG position</li>
                <li>Weight limits (MTOW, MLW, Max Ramp Weight)</li>
                <li>Fuel capacity and default burn rate</li>
                <li>All loading stations with arm positions and max weights</li>
                <li>CG envelope limits</li>
                <li>Moment calculation formulas</li>
              </ul>
              <p className="text-muted-foreground">
                All values are shown in both imperial (lbs, inches) and metric (kg, mm) units.
              </p>
            </CardContent>
          </Card>

          {/* Entering Loading Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-purple-600" />
                Entering Loading Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Front Row Seats</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Pilot:</strong> Enter pilot weight including any carried items (required)</li>
                  <li><strong>Front Passenger:</strong> Enter 0 or leave empty if unoccupied</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Rear Row Seats</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Rear Passenger 1:</strong> Left rear seat</li>
                  <li><strong>Rear Passenger 2:</strong> Right rear seat</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  Baggage
                </h4>
                <p className="mb-2">Click the tab for each baggage area to enter weight.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium">VH-YPB (C182T)</div>
                    <ul className="text-xs mt-1 space-y-0.5">
                      <li>Area A: max 120 lbs / 54 kg</li>
                      <li>Area B: max 80 lbs / 36 kg</li>
                      <li>Area C: max 80 lbs / 36 kg</li>
                      <li className="font-medium">Combined max: 200 lbs / 91 kg</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium">VH-KXW (C172P)</div>
                    <ul className="text-xs mt-1 space-y-0.5">
                      <li>Area 1: max 120 lbs / 54 kg</li>
                      <li>Area 2: max 50 lbs / 23 kg</li>
                      <li className="font-medium">Combined max: 120 lbs / 54 kg</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Fuel className="h-4 w-4 text-green-600" />
                  Fuel
                </h4>
                <p>Enter fuel quantities for each wing tank in your selected units.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium">VH-YPB</div>
                    <div className="text-xs">~43.5 gal / ~165 L per tank</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium">VH-KXW</div>
                    <div className="text-xs">~26.5 gal / ~100 L per tank</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Understanding the Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scale className="h-5 w-5 text-red-600" />
                Understanding the Results
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Weight Data Card</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>BEW:</strong> Basic Empty Weight of the aircraft</li>
                  <li><strong>MTOW:</strong> Maximum Takeoff Weight</li>
                  <li><strong>Current Weight:</strong> Your calculated total (red if over MTOW)</li>
                  <li><strong>Margin:</strong> Weight capacity remaining (+) or excess (-)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Centre of Gravity Card</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>CG Position:</strong> Current CG from datum (with % MAC)</li>
                  <li><strong>Status:</strong> Overall limit status</li>
                  <li><strong>Envelope:</strong> Whether CG is within safe limits</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Status Indicators</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Green (WITHIN LIMITS):</strong> All limits satisfied - safe to fly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span><strong>Yellow (CAUTION):</strong> Warnings present - review before flight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span><strong>Red (OUT OF LIMITS):</strong> Critical limit exceeded - DO NOT FLY</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Using the CG Envelope Graph */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Using the CG Envelope Graph
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>The "Weight vs C of G" graph shows:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Green shaded area:</strong> Safe CG envelope</li>
                <li><strong>Red boundary lines:</strong> Forward and aft CG limits</li>
                <li><strong>Blue line:</strong> Load path showing how CG moves as items are added</li>
                <li><strong>Orange dot (ZFW):</strong> Zero Fuel Weight position</li>
                <li><strong>Green dot (Current):</strong> Current takeoff position</li>
                <li><strong>Dashed red line (MLW):</strong> Maximum Landing Weight (if different from MTOW)</li>
              </ul>
              <p className="text-muted-foreground">
                The "Weight distribution" tab shows a side profile of the aircraft with visual
                weight indicators at each loading station.
              </p>
            </CardContent>
          </Card>

          {/* Flight Planning Feature */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-emerald-600" />
                Flight Planning Feature
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                The Flight Planning panel lets you project your landing weight and CG after
                fuel burn during the flight.
              </p>
              <div>
                <h4 className="font-semibold mb-2">How to Use</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Expand the Flight Planning panel (click to expand if collapsed)</li>
                  <li>Enter the Fuel Burn Rate in your selected units (L/hr or GPH)</li>
                  <li>Enter the Flight Duration in hours (e.g., 1.5 for 1 hour 30 minutes)</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What It Shows</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Total fuel burn calculated</li>
                  <li>Landing trajectory shown as a green arrow on the graph</li>
                  <li>Landing position shown as a green dot</li>
                  <li>Landing weight displayed below the graph</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold mb-1">Default Burn Rates</h4>
                <ul className="text-xs space-y-0.5">
                  <li>VH-YPB (C182T): 14 GPH / 53 L/hr</li>
                  <li>VH-KXW (C172P): 9 GPH / 34 L/hr</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-xs">
                  <strong>MLW Warning:</strong> If projected landing weight exceeds Maximum Landing
                  Weight, the landing position will be shown in red with a warning.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PDF Loading Sheet */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileDown className="h-5 w-5 text-rose-600" />
                Generating a PDF Loading Sheet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Generate a single-page A4 PDF summarising your weight and balance calculation —
                useful for printing, record-keeping, or sharing with an instructor.
              </p>
              <div>
                <h4 className="font-semibold mb-2">How to Generate</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Complete your loading data (weights, fuel, etc.)</li>
                  <li>Scroll to the bottom of the aircraft tab</li>
                  <li>Click <strong>"Generate PDF Loading Sheet"</strong></li>
                  <li>Enter a flight date and pilot name (optional)</li>
                  <li>Review the loading summary, then click <strong>"Generate PDF"</strong></li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What the PDF Contains</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>CG Envelope Chart:</strong> Graphical plot with takeoff and landing positions</li>
                  <li><strong>Loading Summary:</strong> Table of all non-zero stations with weight and arm</li>
                  <li><strong>Status:</strong> Weight vs MTOW, CG vs limits, overall result</li>
                  <li><strong>Flight Planning:</strong> Burn rate, landing weight/CG, MLW status (if active)</li>
                  <li><strong>Aircraft Reference:</strong> Key limits and disclaimer</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-xs">
                  <strong>Tip:</strong> If flight planning data is entered, the PDF chart will show
                  both takeoff and landing positions with a fuel burn trajectory arrow.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changing Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-gray-600" />
                Changing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Click the <strong>Settings icon</strong> (gear) in the top-right corner to configure your preferences.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Available Settings</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Fuel Units:</strong> Litres (L) or Gallons (gal)</li>
                  <li><strong>Weight Units:</strong> Kilograms (kg) or Pounds (lbs)</li>
                  <li><strong>Distance Units:</strong> Inches (in) or Millimeters (mm)</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-xs">
                  <strong>Note:</strong> Settings are not saved between sessions. The calculator
                  returns to defaults (litres, kg, inches) each time you open it.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sample Calculations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-violet-600" />
                Sample Calculation - VH-YPB
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p className="text-muted-foreground">
                This example demonstrates how the calculator performs weight and balance calculations.
              </p>

              <div>
                <h4 className="font-semibold mb-2">Scenario: Two Pilots, Full Fuel</h4>
                <p className="text-xs text-muted-foreground mb-2">Training flight with instructor and student, full fuel, minimal baggage.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Station</th>
                        <th className="border p-2 text-right">Weight</th>
                        <th className="border p-2 text-right">Arm</th>
                        <th className="border p-2 text-right">Moment</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">Basic Empty Weight</td>
                        <td className="border p-2 text-right font-mono">910.4 kg</td>
                        <td className="border p-2 text-right font-mono">975 mm</td>
                        <td className="border p-2 text-right font-mono">887,640</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Pilot</td>
                        <td className="border p-2 text-right font-mono">81.6 kg</td>
                        <td className="border p-2 text-right font-mono">940 mm</td>
                        <td className="border p-2 text-right font-mono">76,704</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Front Passenger</td>
                        <td className="border p-2 text-right font-mono">77.1 kg</td>
                        <td className="border p-2 text-right font-mono">940 mm</td>
                        <td className="border p-2 text-right font-mono">72,474</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Baggage Area A</td>
                        <td className="border p-2 text-right font-mono">9.1 kg</td>
                        <td className="border p-2 text-right font-mono">2,464 mm</td>
                        <td className="border p-2 text-right font-mono">22,422</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Fuel (87 gal)</td>
                        <td className="border p-2 text-right font-mono">236.8 kg</td>
                        <td className="border p-2 text-right font-mono">1,181 mm</td>
                        <td className="border p-2 text-right font-mono">279,661</td>
                      </tr>
                      <tr className="bg-gray-50 font-semibold">
                        <td className="border p-2">Totals</td>
                        <td className="border p-2 text-right font-mono">1,315 kg</td>
                        <td className="border p-2 text-right"></td>
                        <td className="border p-2 text-right font-mono">1,338,901</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold mb-2">Calculation</h4>
                <div className="space-y-2 font-mono text-xs">
                  <p>CG = Total Moment ÷ Total Weight</p>
                  <p>CG = 1,338,901 ÷ 1,315 = <strong>1,018 mm (40.1")</strong></p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-800 mb-1">Result: WITHIN LIMITS</h4>
                <ul className="text-xs text-green-700 space-y-0.5">
                  <li>✓ Weight 2,899 lbs is below MTOW of 3,100 lbs</li>
                  <li>✓ CG at 1,018 mm is within envelope (forward: 991 mm, aft: 1,168 mm)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Moment Formula</h4>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-center">
                  <p>Moment (kg.mm) = Weight (kg) × Arm (mm)</p>
                  <p className="mt-2">CG (mm) = Total Moment ÷ Total Weight</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <h4 className="font-semibold mb-1">Calculator shows "OUT OF LIMITS"</h4>
                <ul className="list-disc pl-5 text-xs space-y-0.5">
                  <li>Check the error message to identify which limit is exceeded</li>
                  <li>If weight is over MTOW: reduce fuel, baggage, or passengers</li>
                  <li>If CG is too far forward: move weight aft</li>
                  <li>If CG is too far aft: move weight forward</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Numbers look wrong</h4>
                <ul className="list-disc pl-5 text-xs space-y-0.5">
                  <li>Check your unit settings</li>
                  <li>Verify you're on the correct aircraft tab</li>
                  <li>Click the Info icon to verify base aircraft data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Graph doesn't show landing position</h4>
                <ul className="list-disc pl-5 text-xs space-y-0.5">
                  <li>Ensure Flight Planning panel is expanded</li>
                  <li>Both burn rate and duration must be greater than 0</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Privacy */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Data Privacy</h3>
            <p className="text-sm text-green-700">
              All data you enter stays in your browser session only. When you close the browser
              tab or refresh the page, all entered values are reset. The calculator does not
              store any personal information or flight data. Use the <strong>Generate PDF Loading
              Sheet</strong> button to save a copy of your calculation before closing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
