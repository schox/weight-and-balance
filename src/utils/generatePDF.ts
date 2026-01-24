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

  const polyPoints = envelope.slice(0, -1);
  const xCoords = polyPoints.map(p => scaleX(p.cgPosition * MM_TO_INCHES));
  const yCoords = polyPoints.map(p => scaleY(p.weight));

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
  doc.line(plotLeft, plotBottom, plotRight, plotBottom);
  doc.line(plotLeft, plotTop, plotLeft, plotBottom);

  // ── Axis tick labels ──
  doc.setFontSize(5.5);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  for (let cg = cgStart; cg <= maxCG; cg += cgStep) {
    const x = scaleX(cg);
    if (x >= plotLeft && x <= plotRight) {
      doc.text(cg.toFixed(0), x, plotBottom + 3.5, { align: 'center' });
      doc.line(x, plotBottom, x, plotBottom + 1);
    }
  }

  for (let w = weightStart; w <= maxWeight; w += weightStep) {
    const yPos = scaleY(w);
    if (yPos >= plotTop && yPos <= plotBottom) {
      doc.text(w.toFixed(0), plotLeft - 1.5, yPos + 1, { align: 'right' });
      doc.line(plotLeft - 1, yPos, plotLeft, yPos);
    }
  }

  // ── Axis titles ──
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('CG Position (inches)', (plotLeft + plotRight) / 2, plotBottom + 8, { align: 'center' });
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

  // Landscape A4: 297mm × 210mm
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();  // 297mm
  const margin = 12;
  const usableWidth = pageWidth - 2 * margin; // 273mm
  let y = margin;

  // Helper: get station arm
  const getStationArm = (id: string): number => {
    const station = aircraft.loadingStations.find(s => s.id === id);
    return station?.armMm || 0;
  };

  // Helper: calculate moment (kg.mm)
  const calcMoment = (weightLbs: number, armMm: number): number => {
    return weightLbs * LBS_TO_KG * armMm;
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION 1: Header
  // ──────────────────────────────────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Weight & Balance Loading Sheet', pageWidth / 2, y + 5, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Curtin Flying Club', pageWidth / 2, y + 10, { align: 'center' });
  y += 13;

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION 2: Flight Info (2×2 grid)
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
  // SECTION 3: Main Section - Chart (left) + Loading Table + Results (right)
  // ──────────────────────────────────────────────────────────────────────────────
  const mainSectionY = y;
  const chartWidth = 100;
  const chartHeight = 100;
  const tableGap = 5;
  const tableX = margin + chartWidth + tableGap;
  const tableWidth = usableWidth - chartWidth - tableGap;

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
    chartHeight,
    aircraft,
    calculations,
    landingData
  );

  // ── Loading Calculation Table (right side) ──
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Loading Calculation', tableX, mainSectionY + 4);

  // Build loading rows
  const fuelLeftLbs = getFuelWeightLbs(loadingState.fuelLeft, settings.fuelUnits);
  const fuelRightLbs = getFuelWeightLbs(loadingState.fuelRight, settings.fuelUnits);

  interface LoadingRow {
    label: string;
    weightLbs: number;
    armMm: number;
  }

  const loadingRows: LoadingRow[] = [
    { label: 'Basic Empty Weight', weightLbs: aircraft.emptyWeightLbs, armMm: aircraft.emptyCGMm },
    { label: 'Pilot', weightLbs: loadingState.pilot, armMm: getStationArm('pilot') },
    { label: 'Front Passenger', weightLbs: loadingState.frontPassenger, armMm: getStationArm('frontPassenger') },
    { label: 'Rear Passenger 1', weightLbs: loadingState.rearPassenger1, armMm: getStationArm('rearPassenger1') },
    { label: 'Rear Passenger 2', weightLbs: loadingState.rearPassenger2, armMm: getStationArm('rearPassenger2') },
    { label: aircraft.loadingStations.find(s => s.id === 'baggageA')?.name || 'Baggage A', weightLbs: loadingState.baggageA, armMm: getStationArm('baggageA') },
    { label: aircraft.loadingStations.find(s => s.id === 'baggageB')?.name || 'Baggage B', weightLbs: loadingState.baggageB, armMm: getStationArm('baggageB') },
  ];

  // Add Baggage C if aircraft has it
  if (aircraft.loadingStations.some(s => s.id === 'baggageC')) {
    loadingRows.push({
      label: 'Baggage Area C',
      weightLbs: loadingState.baggageC,
      armMm: getStationArm('baggageC'),
    });
  }

  loadingRows.push(
    { label: aircraft.loadingStations.find(s => s.id === 'fuelLeft')?.name || 'Fuel Left', weightLbs: fuelLeftLbs, armMm: getStationArm('fuelLeft') },
    { label: aircraft.loadingStations.find(s => s.id === 'fuelRight')?.name || 'Fuel Right', weightLbs: fuelRightLbs, armMm: getStationArm('fuelRight') },
  );

  // Calculate totals and build table body
  let totalWeightLbs = 0;
  let totalMomentKgMm = 0;

  const tableBody = loadingRows.map(row => {
    const moment = calcMoment(row.weightLbs, row.armMm);
    totalWeightLbs += row.weightLbs;
    totalMomentKgMm += moment;
    return [
      row.label,
      row.weightLbs.toFixed(1),
      (row.weightLbs * LBS_TO_KG).toFixed(1),
      (row.armMm * MM_TO_INCHES).toFixed(1),
      row.armMm.toFixed(0),
      moment.toFixed(0),
    ];
  });

  // Add totals row
  const cgMm = totalMomentKgMm / (totalWeightLbs * LBS_TO_KG);
  tableBody.push([
    'TOTALS',
    totalWeightLbs.toFixed(1),
    (totalWeightLbs * LBS_TO_KG).toFixed(1),
    (cgMm * MM_TO_INCHES).toFixed(1),
    cgMm.toFixed(0),
    totalMomentKgMm.toFixed(0),
  ]);

  autoTable(doc, {
    startY: mainSectionY + 6,
    margin: { left: tableX, right: margin },
    tableWidth: tableWidth,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.3 },
    headStyles: { fillColor: [66, 66, 66], fontSize: 7 },
    head: [['Station', 'Wt (lbs)', 'Wt (kg)', 'Arm (in)', 'Arm (mm)', 'Mom (kg.mm)']],
    body: tableBody,
    columnStyles: {
      0: { cellWidth: tableWidth * 0.25 },
      1: { halign: 'right', cellWidth: tableWidth * 0.13 },
      2: { halign: 'right', cellWidth: tableWidth * 0.13 },
      3: { halign: 'right', cellWidth: tableWidth * 0.13 },
      4: { halign: 'right', cellWidth: tableWidth * 0.13 },
      5: { halign: 'right', cellWidth: tableWidth * 0.23 },
    },
    didParseCell: (data) => {
      if (data.row.index === tableBody.length - 1 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [235, 235, 235];
      }
    },
  });

  const afterTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;

  // ── Results section (below loading table, right side) ──
  const limits = extractEnvelopeLimits(aircraft);
  const forwardLimit = getForwardCGLimit(calculations.totalWeight, aircraft);
  const withinWeight = calculations.totalWeight <= aircraft.maxTakeoffWeightLbs;
  const withinCG = calculations.withinEnvelope;
  const overallStatus = withinWeight && withinCG ? 'WITHIN LIMITS' : 'OUTSIDE LIMITS';

  const weightMarginLbs = aircraft.maxTakeoffWeightLbs - calculations.totalWeight;

  const resultsBody: string[][] = [
    ['Total Weight', `${calculations.totalWeight.toFixed(1)} lbs / ${(calculations.totalWeight * LBS_TO_KG).toFixed(1)} kg`],
    ['Weight Margin', withinWeight ? `${weightMarginLbs.toFixed(0)} lbs below MTOW` : `${(-weightMarginLbs).toFixed(0)} lbs OVER MTOW`],
    ['CG Position', `${(calculations.cgPosition * MM_TO_INCHES).toFixed(1)}" / ${calculations.cgPosition.toFixed(0)} mm`],
    ['Fwd Limit (at wt)', `${(forwardLimit * MM_TO_INCHES).toFixed(1)}" / Aft Limit: ${(limits.aftLimit * MM_TO_INCHES).toFixed(1)}"`],
    ['Status', overallStatus],
  ];

  autoTable(doc, {
    startY: afterTableY,
    margin: { left: tableX, right: margin },
    tableWidth: tableWidth,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.3 },
    headStyles: { fillColor: [50, 50, 50], fontSize: 7 },
    head: [['Results', '']],
    body: resultsBody,
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: tableWidth * 0.32 },
      1: { cellWidth: tableWidth * 0.68 },
    },
    didParseCell: (data) => {
      // Color the status row
      if (data.row.index === resultsBody.length - 1 && data.column.index === 1 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        if (overallStatus === 'WITHIN LIMITS') {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
      // Color weight margin if over
      if (data.row.index === 1 && data.column.index === 1 && data.section === 'body' && !withinWeight) {
        data.cell.styles.textColor = [220, 38, 38];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Determine y position after main section (max of chart bottom and results table bottom)
  const afterResultsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  y = Math.max(mainSectionY + chartHeight, afterResultsY) + 4;

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION 4: Flight Planning (only if burn data exists)
  // ──────────────────────────────────────────────────────────────────────────────
  if (fuelBurnState && fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0) {
    const landing = calculateLandingWeightAndCG(loadingState, aircraft, settings, fuelBurnState);
    const fuelBurnGallons = fuelBurnState.burnRateGPH * fuelBurnState.flightDurationHours;
    const fuelBurnLitres = fuelBurnGallons * GALLONS_TO_LITRES;
    const exceedsMLW = landing.weight > aircraft.maxLandingWeightLbs;

    const planningBody: string[][] = [
      ['Fuel Burn Rate', `${fuelBurnState.burnRateGPH.toFixed(1)} GPH / ${(fuelBurnState.burnRateGPH * GALLONS_TO_LITRES).toFixed(1)} L/hr`],
      ['Flight Duration', `${fuelBurnState.flightDurationHours.toFixed(1)} hours`],
      ['Total Fuel Burn', `${fuelBurnGallons.toFixed(1)} gal / ${fuelBurnLitres.toFixed(1)} L`],
      ['Fuel Remaining', `${landing.fuelRemaining.toFixed(1)} gal / ${(landing.fuelRemaining * GALLONS_TO_LITRES).toFixed(1)} L`],
      ['Landing Weight', `${landing.weight.toFixed(1)} lbs / ${(landing.weight * LBS_TO_KG).toFixed(1)} kg`],
      ['Landing CG', `${(landing.cgPosition * MM_TO_INCHES).toFixed(1)}" / ${landing.cgPosition.toFixed(0)} mm`],
      ['MLW Status', exceedsMLW ? `EXCEEDS MLW (${aircraft.maxLandingWeightLbs} lbs)` : `Within MLW (${aircraft.maxLandingWeightLbs} lbs)`],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      tableWidth: usableWidth,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.3 },
      headStyles: { fillColor: [50, 50, 50], fontSize: 7 },
      head: [['Flight Planning', '']],
      body: planningBody,
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: usableWidth - 40 },
      },
      didParseCell: (data) => {
        if (data.row.index === planningBody.length - 1 && data.column.index === 1 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
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
  // SECTION 5: Disclaimer + Timestamp
  // ──────────────────────────────────────────────────────────────────────────────
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  const disclaimer = 'DISCLAIMER: This loading sheet is for planning purposes only. The pilot-in-command is responsible for verifying all weight and balance calculations against the official Aircraft Flight Manual.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, usableWidth);
  doc.text(disclaimerLines, margin, y);
  y += disclaimerLines.length * 3 + 2;

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
