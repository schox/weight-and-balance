import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Aircraft, LoadingState, CalculationResult, Settings, FuelBurnState } from '@/types/aircraft';
import { getFuelWeightLbs } from './conversions';
import { calculateLandingWeightAndCG, extractEnvelopeLimits, getForwardCGLimit } from './calculations';

// Constants
const LBS_TO_KG = 0.453592;
const MM_TO_INCHES = 1 / 25.4;
const GALLONS_TO_LITRES = 3.78541;

interface PDFOptions {
  aircraft: Aircraft;
  loadingState: LoadingState;
  calculations: CalculationResult;
  settings: Settings;
  fuelBurnState?: FuelBurnState;
  flightDate: string;
  pilotName: string;
}

// ─── CG Envelope Chart Drawing ─────────────────────────────────────────────────

function drawCGEnvelopeChart(
  doc: jsPDF,
  chartX: number,
  chartY: number,
  chartWidth: number,
  chartHeight: number,
  aircraft: Aircraft,
  calculations: CalculationResult,
  landingData?: { weight: number; cgPosition: number }
): void {
  const envelope = aircraft.cgEnvelope;
  if (envelope.length < 5) return;

  // Determine axis ranges from envelope (convert mm to inches for CG)
  const envelopeCGInches = envelope.map(p => p.cgPosition * MM_TO_INCHES);
  const envelopeWeights = envelope.map(p => p.weight);

  const minCG = Math.min(...envelopeCGInches) - 1;
  const maxCG = Math.max(...envelopeCGInches) + 1;
  const minWeight = Math.min(...envelopeWeights) - 100;
  const maxWeight = Math.max(...envelopeWeights) + 100;

  // Chart plotting area (leave room for axis labels)
  const plotLeft = chartX + 14;
  const plotRight = chartX + chartWidth - 4;
  const plotTop = chartY + 4;
  const plotBottom = chartY + chartHeight - 12;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  // Scale functions: data → PDF coordinates
  const scaleX = (cgInches: number): number =>
    plotLeft + ((cgInches - minCG) / (maxCG - minCG)) * plotWidth;
  const scaleY = (weight: number): number =>
    plotBottom - ((weight - minWeight) / (maxWeight - minWeight)) * plotHeight;

  // ── Grid lines (dashed gray) ──
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([1, 1], 0);

  // Vertical grid lines (CG ticks)
  const cgStep = determineCGStep(maxCG - minCG);
  const cgStart = Math.ceil(minCG / cgStep) * cgStep;
  for (let cg = cgStart; cg <= maxCG; cg += cgStep) {
    const x = scaleX(cg);
    if (x > plotLeft && x < plotRight) {
      doc.line(x, plotTop, x, plotBottom);
    }
  }

  // Horizontal grid lines (weight ticks)
  const weightStep = determineWeightStep(maxWeight - minWeight);
  const weightStart = Math.ceil(minWeight / weightStep) * weightStep;
  for (let w = weightStart; w <= maxWeight; w += weightStep) {
    const yPos = scaleY(w);
    if (yPos > plotTop && yPos < plotBottom) {
      doc.line(plotLeft, yPos, plotRight, yPos);
    }
  }

  // ── Envelope polygon (filled green) ──
  doc.setLineDashPattern([], 0);
  doc.setFillColor(200, 240, 200);
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.5);

  // Build polygon using jsPDF lines() with relative offsets
  const polyPoints = envelope.slice(0, -1);
  const xCoords = polyPoints.map(p => scaleX(p.cgPosition * MM_TO_INCHES));
  const yCoords = polyPoints.map(p => scaleY(p.weight));

  // Create relative line segments from starting point
  const lineSegments: [number, number][] = [];
  for (let i = 1; i < xCoords.length; i++) {
    lineSegments.push([xCoords[i] - xCoords[i - 1], yCoords[i] - yCoords[i - 1]]);
  }
  doc.lines(lineSegments, xCoords[0], yCoords[0], [1, 1], 'FD', true);

  // ── Forward limit line (red) - points 0→1→2 ──
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.7);
  doc.setLineDashPattern([], 0);
  for (let i = 0; i < 2; i++) {
    doc.line(
      scaleX(envelope[i].cgPosition * MM_TO_INCHES),
      scaleY(envelope[i].weight),
      scaleX(envelope[i + 1].cgPosition * MM_TO_INCHES),
      scaleY(envelope[i + 1].weight)
    );
  }

  // ── Aft limit line (red) - points 3→4 ──
  doc.line(
    scaleX(envelope[3].cgPosition * MM_TO_INCHES),
    scaleY(envelope[3].weight),
    scaleX(envelope[4].cgPosition * MM_TO_INCHES),
    scaleY(envelope[4].weight)
  );

  // ── MTOW line (horizontal at max weight) ──
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.4);
  const mtowY = scaleY(aircraft.maxTakeoffWeightLbs);
  if (mtowY > plotTop && mtowY < plotBottom) {
    doc.line(plotLeft, mtowY, plotRight, mtowY);
    doc.setFontSize(5);
    doc.setTextColor(100, 100, 100);
    doc.text('MTOW', plotRight - 1, mtowY - 1, { align: 'right' });
  }

  // ── MLW line (dashed, if MLW < MTOW) ──
  if (aircraft.maxLandingWeightLbs < aircraft.maxTakeoffWeightLbs) {
    doc.setDrawColor(180, 80, 80);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 1.5], 0);
    const mlwY = scaleY(aircraft.maxLandingWeightLbs);
    if (mlwY > plotTop && mlwY < plotBottom) {
      doc.line(plotLeft, mlwY, plotRight, mlwY);
      doc.setFontSize(5);
      doc.setTextColor(180, 80, 80);
      doc.text('MLW', plotRight - 1, mlwY - 1, { align: 'right' });
    }
    doc.setLineDashPattern([], 0);
  }

  // ── Fuel burn arrow (dashed line from takeoff to landing) ──
  if (landingData) {
    const takeoffX = scaleX(calculations.cgPosition * MM_TO_INCHES);
    const takeoffY = scaleY(calculations.totalWeight);
    const landX = scaleX(landingData.cgPosition * MM_TO_INCHES);
    const landY = scaleY(landingData.weight);

    doc.setDrawColor(70, 70, 200);
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([2, 1.5], 0);
    doc.line(takeoffX, takeoffY, landX, landY);
    doc.setLineDashPattern([], 0);

    // Landing position dot
    const landingWithin = isPointInEnvelope(landingData.weight, landingData.cgPosition, aircraft);
    if (landingWithin) {
      doc.setFillColor(34, 139, 34);
    } else {
      doc.setFillColor(220, 38, 38);
    }
    doc.circle(landX, landY, 1.2, 'F');

    // Label
    doc.setFontSize(5);
    doc.setTextColor(70, 70, 200);
    doc.text('LDG', landX + 2, landY + 1);
  }

  // ── Current position dot (takeoff) ──
  const currentX = scaleX(calculations.cgPosition * MM_TO_INCHES);
  const currentY = scaleY(calculations.totalWeight);
  if (calculations.withinEnvelope) {
    doc.setFillColor(34, 139, 34);
  } else {
    doc.setFillColor(220, 38, 38);
  }
  doc.circle(currentX, currentY, 1.8, 'F');
  doc.setFontSize(5);
  doc.setTextColor(0, 0, 0);
  doc.text('T/O', currentX + 2.5, currentY + 0.5);

  // ── Axes ──
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.setLineDashPattern([], 0);
  // X axis
  doc.line(plotLeft, plotBottom, plotRight, plotBottom);
  // Y axis
  doc.line(plotLeft, plotTop, plotLeft, plotBottom);

  // ── Axis tick labels ──
  doc.setFontSize(5.5);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  // X axis labels (CG in inches)
  for (let cg = cgStart; cg <= maxCG; cg += cgStep) {
    const x = scaleX(cg);
    if (x >= plotLeft && x <= plotRight) {
      doc.text(cg.toFixed(0), x, plotBottom + 3.5, { align: 'center' });
      // Tick mark
      doc.line(x, plotBottom, x, plotBottom + 1);
    }
  }

  // Y axis labels (weight in lbs)
  for (let w = weightStart; w <= maxWeight; w += weightStep) {
    const yPos = scaleY(w);
    if (yPos >= plotTop && yPos <= plotBottom) {
      doc.text(w.toFixed(0), plotLeft - 1.5, yPos + 1, { align: 'right' });
      // Tick mark
      doc.line(plotLeft - 1, yPos, plotLeft, yPos);
    }
  }

  // ── Axis titles ──
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  // X axis title
  doc.text('CG Position (inches)', (plotLeft + plotRight) / 2, plotBottom + 8, { align: 'center' });
  // Y axis title (rotated)
  doc.text('Weight (lbs)', chartX + 2, (plotTop + plotBottom) / 2, { angle: 90 });

  // Reset
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([], 0);

  // ── Chart border ──
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(chartX, chartY, chartWidth, chartHeight);
}

// Helper: determine CG axis step size based on range
function determineCGStep(range: number): number {
  if (range <= 10) return 2;
  if (range <= 20) return 5;
  return 10;
}

// Helper: determine weight axis step size based on range
function determineWeightStep(range: number): number {
  if (range <= 500) return 100;
  if (range <= 1000) return 200;
  if (range <= 2000) return 500;
  return 500;
}

// Helper: check if a point is within the CG envelope
function isPointInEnvelope(weight: number, cgPositionMm: number, aircraft: Aircraft): boolean {
  const limits = extractEnvelopeLimits(aircraft);
  if (weight < limits.minWeight || weight > limits.maxWeight) return false;
  const forwardLimit = getForwardCGLimit(weight, aircraft);
  return cgPositionMm >= forwardLimit && cgPositionMm <= limits.aftLimit;
}

// ─── Main PDF Generation ────────────────────────────────────────────────────────

export const generateWeightBalancePDF = (options: PDFOptions): void => {
  const { aircraft, loadingState, calculations, settings, fuelBurnState, flightDate, pilotName } = options;

  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12;
  const usableWidth = pageWidth - 2 * margin; // 186mm
  let y = margin;

  // Helper: get station arm
  const getStationArm = (id: string): number => {
    const station = aircraft.loadingStations.find(s => s.id === id);
    return station?.armMm || 0;
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION 1: Header (~8mm)
  // ──────────────────────────────────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Weight & Balance Loading Sheet', pageWidth / 2, y + 5, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Curtin Flying Club', pageWidth / 2, y + 10, { align: 'center' });
  y += 13;

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION 2: Flight Info (2×2 grid, ~18mm)
  // ──────────────────────────────────────────────────────────────────────────────
  const unitsDisplay = `${settings.weightUnits} / ${settings.fuelUnits} / ${settings.distanceUnits}`;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      [
        { content: `Aircraft: ${aircraft.registration} ${aircraft.model}`, styles: { fontStyle: 'bold' } },
        { content: `Date: ${flightDate}` },
      ],
      [
        { content: `Pilot: ${pilotName}` },
        { content: `Units: ${unitsDisplay}` },
      ],
    ],
    columnStyles: {
      0: { cellWidth: usableWidth / 2 },
      1: { cellWidth: usableWidth / 2 },
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION 3: Main Section - Chart + Loading Summary (~125mm)
  // ──────────────────────────────────────────────────────────────────────────────
  const mainSectionY = y;
  const mainSectionHeight = 125;
  const chartWidth = 95;
  const tableWidth = usableWidth - chartWidth - 4; // gap between chart and table

  // Calculate landing data if flight planning is active
  let landingData: { weight: number; cgPosition: number } | undefined;
  if (fuelBurnState && fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0) {
    const landing = calculateLandingWeightAndCG(loadingState, aircraft, settings, fuelBurnState);
    landingData = { weight: landing.weight, cgPosition: landing.cgPosition };
  }

  // Draw CG Envelope Chart (left side)
  drawCGEnvelopeChart(
    doc,
    margin,
    mainSectionY,
    chartWidth,
    mainSectionHeight,
    aircraft,
    calculations,
    landingData
  );

  // Loading Summary Table (right side)
  const tableX = margin + chartWidth + 4;

  // Section title
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Loading Summary', tableX, mainSectionY + 4);

  // Build loading rows
  const fuelLeftLbs = getFuelWeightLbs(loadingState.fuelLeft, settings.fuelUnits);
  const fuelRightLbs = getFuelWeightLbs(loadingState.fuelRight, settings.fuelUnits);

  interface LoadingRow {
    label: string;
    weightLbs: number;
    armMm: number;
  }

  const loadingRows: LoadingRow[] = [
    { label: 'BEW', weightLbs: aircraft.emptyWeightLbs, armMm: aircraft.emptyCGMm },
    { label: 'Pilot', weightLbs: loadingState.pilot, armMm: getStationArm('pilot') },
    { label: 'F.Pax', weightLbs: loadingState.frontPassenger, armMm: getStationArm('frontPassenger') },
    { label: 'R.Pax 1', weightLbs: loadingState.rearPassenger1, armMm: getStationArm('rearPassenger1') },
    { label: 'R.Pax 2', weightLbs: loadingState.rearPassenger2, armMm: getStationArm('rearPassenger2') },
    { label: 'Bag A', weightLbs: loadingState.baggageA, armMm: getStationArm('baggageA') },
    { label: 'Bag B', weightLbs: loadingState.baggageB, armMm: getStationArm('baggageB') },
  ];

  // Add Baggage C if aircraft has it
  if (aircraft.loadingStations.some(s => s.id === 'baggageC')) {
    loadingRows.push({ label: 'Bag C', weightLbs: loadingState.baggageC, armMm: getStationArm('baggageC') });
  }

  loadingRows.push(
    { label: 'Fuel L', weightLbs: fuelLeftLbs, armMm: getStationArm('fuelLeft') },
    { label: 'Fuel R', weightLbs: fuelRightLbs, armMm: getStationArm('fuelRight') },
  );

  // Filter out zero-weight rows (except BEW)
  const displayRows = loadingRows.filter(r => r.label === 'BEW' || r.weightLbs > 0);

  // Format for table: show in user's preferred unit but also inches
  const useKg = settings.weightUnits === 'kg';
  const weightHeader = useKg ? 'kg' : 'lbs';
  const tableBody = displayRows.map(row => {
    const displayWeight = useKg ? (row.weightLbs * LBS_TO_KG).toFixed(1) : row.weightLbs.toFixed(1);
    const armInches = (row.armMm * MM_TO_INCHES).toFixed(1) + '"';
    return [row.label, displayWeight, armInches];
  });

  // Add totals row
  const totalDisplayWeight = useKg
    ? (calculations.totalWeight * LBS_TO_KG).toFixed(1)
    : calculations.totalWeight.toFixed(1);
  const totalCGInches = (calculations.cgPosition * MM_TO_INCHES).toFixed(1) + '"';
  tableBody.push(['TOTAL', totalDisplayWeight, totalCGInches]);

  autoTable(doc, {
    startY: mainSectionY + 6,
    margin: { left: tableX, right: margin },
    tableWidth: tableWidth,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.2 },
    headStyles: { fillColor: [66, 66, 66], fontSize: 6.5 },
    head: [['Station', `Wt (${weightHeader})`, 'Arm']],
    body: tableBody,
    columnStyles: {
      0: { cellWidth: tableWidth * 0.38 },
      1: { halign: 'right', cellWidth: tableWidth * 0.32 },
      2: { halign: 'right', cellWidth: tableWidth * 0.30 },
    },
    didParseCell: (data) => {
      if (data.row.index === tableBody.length - 1 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [235, 235, 235];
      }
    },
  });

  const afterTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;

  // Results box below the table
  const limits = extractEnvelopeLimits(aircraft);
  const forwardLimit = getForwardCGLimit(calculations.totalWeight, aircraft);
  const withinWeight = calculations.totalWeight <= aircraft.maxTakeoffWeightLbs;
  const withinCG = calculations.withinEnvelope;
  const overallStatus = withinWeight && withinCG ? 'WITHIN LIMITS' : 'OUTSIDE LIMITS';

  // Draw results box
  const boxX = tableX;
  const boxY = afterTableY;

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  let resultY = boxY + 1;
  const weightMarginLbs = aircraft.maxTakeoffWeightLbs - calculations.totalWeight;
  doc.text(`Weight: ${calculations.totalWeight.toFixed(0)} / ${aircraft.maxTakeoffWeightLbs} lbs`, boxX, resultY);
  resultY += 3.5;
  doc.text(`  Margin: ${weightMarginLbs.toFixed(0)} lbs`, boxX, resultY);
  resultY += 3.5;
  doc.text(`CG: ${(calculations.cgPosition * MM_TO_INCHES).toFixed(1)}"`, boxX, resultY);
  resultY += 3.5;
  doc.text(`  Fwd: ${(forwardLimit * MM_TO_INCHES).toFixed(1)}" / Aft: ${(limits.aftLimit * MM_TO_INCHES).toFixed(1)}"`, boxX, resultY);
  resultY += 4.5;

  // Status line
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  if (overallStatus === 'WITHIN LIMITS') {
    doc.setTextColor(22, 163, 74);
  } else {
    doc.setTextColor(220, 38, 38);
  }
  doc.text(overallStatus, boxX, resultY);

  // Reset
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  y = mainSectionY + mainSectionHeight + 4;

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION 4: Flight Planning (~22mm) - only if burn data exists
  // ──────────────────────────────────────────────────────────────────────────────
  if (fuelBurnState && fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0) {
    const landing = calculateLandingWeightAndCG(loadingState, aircraft, settings, fuelBurnState);
    const fuelBurnGallons = fuelBurnState.burnRateGPH * fuelBurnState.flightDurationHours;
    const exceedsMLW = landing.weight > aircraft.maxLandingWeightLbs;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Flight Planning', margin, y + 3);
    y += 5;

    const burnLbl = useKg
      ? `${(fuelBurnGallons * GALLONS_TO_LITRES).toFixed(1)} L`
      : `${fuelBurnGallons.toFixed(1)} gal`;
    const fuelRemLbl = useKg
      ? `${(landing.fuelRemaining * GALLONS_TO_LITRES).toFixed(1)} L`
      : `${landing.fuelRemaining.toFixed(1)} gal`;
    const landWtLbl = useKg
      ? `${(landing.weight * LBS_TO_KG).toFixed(1)} kg`
      : `${landing.weight.toFixed(1)} lbs`;
    const landCGLbl = `${(landing.cgPosition * MM_TO_INCHES).toFixed(1)}"`;
    const mlwStatus = exceedsMLW ? 'EXCEEDS' : 'WITHIN';

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      headStyles: { fillColor: [66, 66, 66], fontSize: 7 },
      head: [['Burn Rate', 'Duration', 'Fuel Burn', 'Fuel Rem.', 'Land Wt', 'Land CG', 'MLW']],
      body: [[
        `${fuelBurnState.burnRateGPH.toFixed(1)} GPH`,
        `${fuelBurnState.flightDurationHours.toFixed(1)} hrs`,
        burnLbl,
        fuelRemLbl,
        landWtLbl,
        landCGLbl,
        mlwStatus,
      ]],
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === 'body') {
          if (exceedsMLW) {
            data.cell.styles.textColor = [220, 38, 38];
          } else {
            data.cell.styles.textColor = [22, 163, 74];
          }
        }
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION 5: Aircraft Reference + Disclaimer (~20mm)
  // ──────────────────────────────────────────────────────────────────────────────
  // Aircraft summary line
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const acSummary = `Aircraft: BEW ${aircraft.emptyWeightLbs.toFixed(0)} lbs | MTOW ${aircraft.maxTakeoffWeightLbs} lbs | MLW ${aircraft.maxLandingWeightLbs} lbs | Fuel ${aircraft.fuelCapacityGallons.toFixed(0)} gal | Fwd CG ${(limits.forwardFlatLimit * MM_TO_INCHES).toFixed(1)}" | Aft CG ${(limits.aftLimit * MM_TO_INCHES).toFixed(1)}"`;
  doc.text(acSummary, margin, y);
  y += 4;

  // Disclaimer
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  const disclaimer = 'DISCLAIMER: This loading sheet is for planning purposes only. The pilot-in-command is responsible for verifying all weight and balance calculations against the official Aircraft Flight Manual.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, usableWidth);
  doc.text(disclaimerLines, margin, y);
  y += disclaimerLines.length * 3 + 2;

  // Generated timestamp
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString('en-AU')} | Curtin Flying Club`, margin, y);

  // Reset
  doc.setTextColor(0, 0, 0);

  // ── Save ──
  const dateStr = flightDate.replace(/\//g, '-').replace(/\s/g, '');
  const filename = `W&B_${aircraft.registration}_${dateStr}.pdf`;
  doc.save(filename);
};
