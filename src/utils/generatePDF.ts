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

// Format weight in both units
const fmtWeight = (lbs: number): string => {
  return `${lbs.toFixed(1)} lbs / ${(lbs * LBS_TO_KG).toFixed(1)} kg`;
};

// Format arm in both units
const fmtArm = (mm: number): string => {
  return `${(mm * MM_TO_INCHES).toFixed(1)}" / ${mm.toFixed(0)} mm`;
};

// Format moment
const fmtMoment = (kgMm: number): string => {
  return kgMm.toFixed(0);
};

export const generateWeightBalancePDF = (options: PDFOptions): void => {
  const { aircraft, loadingState, calculations, settings, fuelBurnState, flightDate, pilotName } = options;

  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // Helper: get station arm
  const getStationArm = (id: string): number => {
    const station = aircraft.loadingStations.find(s => s.id === id);
    return station?.armMm || 0;
  };

  // Helper: calculate moment for a station (returns kg.mm)
  const calcMoment = (weightLbs: number, armMm: number): number => {
    return weightLbs * LBS_TO_KG * armMm;
  };

  // ---- HEADER ----
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Weight & Balance Loading Sheet', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Curtin Flying Club', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // ---- FLIGHT INFO ----
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Flight Information', margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] },
    body: [
      ['Aircraft', `${aircraft.registration} - ${aircraft.model}`],
      ['Date of Flight', flightDate],
      ['Pilot', pilotName],
      ['Units', `Weight: ${settings.weightUnits} | Fuel: ${settings.fuelUnits} | Distance: ${settings.distanceUnits}`],
    ],
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' },
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ---- AIRCRAFT DATA ----
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Aircraft Data', margin, y);
  y += 6;

  const limits = extractEnvelopeLimits(aircraft);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] },
    body: [
      ['Basic Empty Weight', fmtWeight(aircraft.emptyWeightLbs)],
      ['Empty CG', fmtArm(aircraft.emptyCGMm)],
      ['Max Takeoff Weight', fmtWeight(aircraft.maxTakeoffWeightLbs)],
      ['Max Landing Weight', fmtWeight(aircraft.maxLandingWeightLbs)],
      ['Fuel Capacity', `${aircraft.fuelCapacityGallons.toFixed(1)} gal / ${aircraft.fuelCapacityLitres.toFixed(1)} L`],
      ['CG Forward Limit', `${(limits.forwardFlatLimit * MM_TO_INCHES).toFixed(1)}" (≤${limits.forwardFlatMaxWeight} lbs) to ${(limits.forwardTaperLimit * MM_TO_INCHES).toFixed(1)}" (at MTOW)`],
      ['CG Aft Limit', `${(limits.aftLimit * MM_TO_INCHES).toFixed(1)}" (constant)`],
    ],
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' },
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ---- LOADING TABLE ----
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Loading Calculation', margin, y);
  y += 6;

  // Check if aircraft has baggageC
  const hasBaggageC = aircraft.loadingStations.some(s => s.id === 'baggageC');

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

  if (hasBaggageC) {
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

  // Calculate totals
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
      fmtMoment(moment),
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
    fmtMoment(totalMomentKgMm),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    head: [['Station', 'Weight (lbs)', 'Weight (kg)', 'Arm (in)', 'Arm (mm)', 'Moment (kg.mm)']],
    body: tableBody,
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 38 },
      1: { halign: 'right', cellWidth: 24 },
      2: { halign: 'right', cellWidth: 24 },
      3: { halign: 'right', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 20 },
      5: { halign: 'right', cellWidth: 28 },
    },
    didParseCell: (data) => {
      // Bold the totals row
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ---- RESULTS ----
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Results', margin, y);
  y += 6;

  // Determine status
  const forwardLimit = getForwardCGLimit(calculations.totalWeight, aircraft);
  const aftLimit = limits.aftLimit;
  const withinWeight = calculations.totalWeight <= aircraft.maxTakeoffWeightLbs;
  const withinCG = calculations.withinEnvelope;
  const status = withinWeight && withinCG ? 'WITHIN LIMITS' : 'OUT OF LIMITS';

  const resultsBody: string[][] = [
    ['Total Weight', fmtWeight(calculations.totalWeight)],
    ['CG Position', fmtArm(calculations.cgPosition)],
    ['Forward CG Limit (at this weight)', fmtArm(forwardLimit)],
    ['Aft CG Limit', fmtArm(aftLimit)],
    ['Weight Status', withinWeight ? `WITHIN LIMITS (margin: ${fmtWeight(calculations.weightMargin)})` : `EXCEEDS MTOW by ${fmtWeight(-calculations.weightMargin)}`],
    ['CG Status', withinCG ? 'WITHIN ENVELOPE' : 'OUTSIDE ENVELOPE'],
    ['Overall Status', status],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] },
    body: resultsBody,
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      // Color the overall status row
      if (data.row.index === resultsBody.length - 1 && data.column.index === 1) {
        if (status === 'WITHIN LIMITS') {
          data.cell.styles.textColor = [22, 163, 74]; // green
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // red
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ---- FLIGHT PLANNING (if provided) ----
  if (fuelBurnState && fuelBurnState.burnRateGPH > 0 && fuelBurnState.flightDurationHours > 0) {
    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Flight Planning', margin, y);
    y += 6;

    const landing = calculateLandingWeightAndCG(loadingState, aircraft, settings, fuelBurnState);
    const fuelBurnGallons = fuelBurnState.burnRateGPH * fuelBurnState.flightDurationHours;
    const fuelBurnLitres = fuelBurnGallons * GALLONS_TO_LITRES;
    const exceedsMLW = landing.weight > aircraft.maxLandingWeightLbs;

    const planningBody: string[][] = [
      ['Fuel Burn Rate', `${fuelBurnState.burnRateGPH.toFixed(1)} GPH / ${(fuelBurnState.burnRateGPH * GALLONS_TO_LITRES).toFixed(1)} L/hr`],
      ['Flight Duration', `${fuelBurnState.flightDurationHours.toFixed(1)} hours`],
      ['Total Fuel Burn', `${fuelBurnGallons.toFixed(1)} gal / ${fuelBurnLitres.toFixed(1)} L (${fmtWeight(fuelBurnGallons * 6)})`],
      ['Fuel Remaining', `${landing.fuelRemaining.toFixed(1)} gal / ${(landing.fuelRemaining * GALLONS_TO_LITRES).toFixed(1)} L`],
      ['Landing Weight', fmtWeight(landing.weight)],
      ['Landing CG', fmtArm(landing.cgPosition)],
      ['MLW Status', exceedsMLW ? `EXCEEDS MLW (${fmtWeight(aircraft.maxLandingWeightLbs)})` : `Within MLW (${fmtWeight(aircraft.maxLandingWeightLbs)})`],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] },
      body: planningBody,
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.row.index === planningBody.length - 1 && data.column.index === 1) {
          if (exceedsMLW) {
            data.cell.styles.textColor = [220, 38, 38]; // red
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [22, 163, 74]; // green
          }
        }
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // ---- DISCLAIMER ----
  // Check if we need a new page
  if (y > 255) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  const disclaimer = 'DISCLAIMER: This loading sheet is for planning purposes only. The pilot-in-command is responsible for verifying all weight and balance calculations against the official Aircraft Flight Manual and current Weight & Balance documentation.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
  doc.text(disclaimerLines, margin, y);
  y += disclaimerLines.length * 4 + 4;

  doc.setFontSize(7);
  doc.text(`Generated: ${new Date().toLocaleString('en-AU')} | Curtin Flying Club Weight & Balance Calculator`, margin, y);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // ---- SAVE ----
  const dateStr = flightDate.replace(/\//g, '-').replace(/\s/g, '');
  const filename = `W&B_${aircraft.registration}_${dateStr}.pdf`;
  doc.save(filename);
};
