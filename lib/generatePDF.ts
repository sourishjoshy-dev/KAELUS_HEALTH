/**
 * generatePhysicianPDF
 *
 * Generates a VITALSYNC Clinical Telemetry PDF using jsPDF.
 * Called client-side only — no server required.
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Medication } from "@/context/AppContext";
import type { AdherenceResult } from "@/lib/adherenceUtils";

export interface PDFReportData {
  patient: {
    name: string;
    id: string;
    subtitle: string;
  };
  activeCondition?: string;
  healthScore: number;
  adherenceRate: number;
  medications: Medication[];
  bp7d: Array<{ day: string; systolic: number; diastolic: number }>;
  adherence7d: number[];
  adherenceResult: AdherenceResult;
  generatedAt?: string;
}

export function generatePhysicianPDF(
  data: PDFReportData,
  openInNewWindow: boolean = false
): { filename: string; blobUrl: string } {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const MARGIN = 14;
  const COL = PAGE_W - MARGIN * 2;
  const now = data.generatedAt || new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });

  // ─── Color palette ───────────────────────────────────────────────────────
  const NAVY   = [15, 43, 72]   as [number, number, number];
  const TEAL   = [0,  101, 145] as [number, number, number];
  const LTBLUE = [201, 230, 255] as [number, number, number];
  const GRAY   = [116, 119, 126] as [number, number, number];
  const WHITE  = [255, 255, 255] as [number, number, number];
  const GREEN  = [22, 163, 74]   as [number, number, number];
  const AMBER  = [217, 119, 6]   as [number, number, number];
  const RED    = [186, 26, 26]   as [number, number, number];

  let y = 0;

  // ─── Header Banner ───────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 38, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("VITALSYNC", MARGIN, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(201, 230, 255);
  doc.text("CLINICAL TELEMETRY REPORT  •  FHIR R4 COMPATIBLE  •  CONFIDENTIAL", MARGIN, 21);

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Physician PDF Export", MARGIN, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Generated: ${now}`, MARGIN, 35.5);

  // Attending line (right side)
  doc.setTextColor(201, 230, 255);
  doc.setFontSize(8);
  doc.text("Attending: Dr. Thomas, MD", PAGE_W - MARGIN, 14, { align: "right" });
  doc.text(
    data.activeCondition ? `${data.activeCondition.slice(0, 25)} • RPM` : "Outpatient Telehealth & RPM",
    PAGE_W - MARGIN,
    19,
    { align: "right" }
  );
  doc.text("NPI-94021482", PAGE_W - MARGIN, 24, { align: "right" });

  y = 44;

  // ─── Patient Identity Card ────────────────────────────────────────────────
  doc.setFillColor(...LTBLUE);
  doc.roundedRect(MARGIN, y, COL, 22, 3, 3, "F");

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(data.patient.name, MARGIN + 4, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(data.patient.subtitle, MARGIN + 4, y + 14);
  doc.text(`Patient ID: ${data.patient.id}`, MARGIN + 4, y + 19.5);

  // Status chip
  doc.setFillColor(...TEAL);
  doc.roundedRect(PAGE_W - MARGIN - 34, y + 6, 34, 8, 2, 2, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("PATIENT ACTIVE", PAGE_W - MARGIN - 17, y + 11.3, { align: "center" });

  y += 28;

  // ─── Key Metrics Row ──────────────────────────────────────────────────────
  const metrics = [
    { label: "VITALSYNC Score", value: String(data.healthScore), sub: "/ 100", color: TEAL },
    { label: "Med Adherence",   value: `${data.adherenceRate}%`, sub: "Today",      color: data.adherenceRate >= 80 ? GREEN : AMBER },
    { label: "Mean BP",         value: "122/78",  sub: "mmHg",       color: GREEN },
    { label: "Resting HR",      value: "68",      sub: "bpm",        color: TEAL },
  ];

  const cellW = COL / 4;
  metrics.forEach(({ label, value, sub, color }, i) => {
    const x = MARGIN + i * cellW;
    doc.setFillColor(248, 250, 255);
    doc.roundedRect(x, y, cellW - 2, 22, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(label.toUpperCase(), x + (cellW - 2) / 2, y + 6, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...color);
    doc.text(value, x + (cellW - 2) / 2, y + 15, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(sub, x + (cellW - 2) / 2, y + 20, { align: "center" });
  });
  y += 28;

  // ─── Section Helper ────────────────────────────────────────────────────────
  const sectionHeader = (title: string) => {
    doc.setFillColor(...NAVY);
    doc.rect(MARGIN, y, COL, 7, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(title.toUpperCase(), MARGIN + 3, y + 5);
    y += 10;
  };

  // ─── BP Trajectory Table ──────────────────────────────────────────────────
  sectionHeader("Blood Pressure Trajectory (7-Day)");

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Day", "Systolic (mmHg)", "Diastolic (mmHg)", "Status"]],
    body: data.bp7d.map(({ day, systolic, diastolic }) => [
      day,
      systolic,
      diastolic,
      systolic <= 130 && diastolic <= 85 ? "✓ Within Target" : "⚠ Above Target",
    ]),
    headStyles: { fillColor: TEAL, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: {
      0: { cellWidth: 25 },
      3: { textColor: GREEN },
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 3) {
        const val = hookData.cell.raw as string;
        if (val.includes("⚠")) hookData.cell.styles.textColor = AMBER;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ─── Adherence Table ───────────────────────────────────────────────────────
  if (y > 250) { doc.addPage(); y = 20; }
  sectionHeader("Medication Adherence Curve (7-Day)");

  const days7 = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Day", "Adherence %", "Rating"]],
    body: data.adherence7d.map((val, i) => [
      days7[i] || `Day ${i + 1}`,
      `${val}%`,
      val >= 90 ? "Excellent" : val >= 75 ? "Good" : val >= 60 ? "Fair" : "Needs Attention",
    ]),
    headStyles: { fillColor: TEAL, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 2) {
        const val = hookData.cell.raw as string;
        hookData.cell.styles.textColor =
          val === "Excellent" ? GREEN :
          val === "Good"      ? TEAL :
          val === "Fair"      ? AMBER : RED;
        hookData.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ─── Medication Regimen ────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  sectionHeader("Active Medication Regimen");

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Medication", "Dosage", "Frequency", "Time Slot", "Status", "Refills"]],
    body: data.medications.map((m) => [
      m.name,
      m.dosage,
      m.frequency,
      m.timeSlot,
      m.taken ? "✓ Taken" : "○ Pending",
      String(m.refillCount),
    ]),
    headStyles: { fillColor: TEAL, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: { 0: { fontStyle: "bold" } },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 4) {
        const val = hookData.cell.raw as string;
        hookData.cell.styles.textColor = val.includes("✓") ? GREEN : AMBER;
        hookData.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ─── Care Adherence Risk ───────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  sectionHeader("Care Update Adherence Summary");

  const adh = data.adherenceResult;
  const adhColor =
    adh.riskLevel === "good"     ? GREEN :
    adh.riskLevel === "moderate" ? TEAL :
    adh.riskLevel === "high"     ? AMBER : RED;

  // Metric grid
  const adhMetrics = [
    ["Adherence %",    adh.percentage !== null ? `${adh.percentage}%` : "—"],
    ["Risk Level",     adh.riskLabel],
    ["Scheduled",      String(adh.scheduled)],
    ["Completed",      String(adh.completed)],
    ["Missed",         String(adh.missed)],
    ["Missed Streak",  `${adh.missedStreak} updates`],
    ["Last Update",    adh.lastUpdateLabel],
    ["Next Scheduled", adh.nextScheduledDayLabel || "—"],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Metric", "Value"]],
    body: adhMetrics,
    headStyles: { fillColor: TEAL, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 1 && hookData.row.index === 0) {
        hookData.cell.styles.textColor = adhColor;
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fontSize = 11;
      }
      if (hookData.section === "body" && hookData.column.index === 1 && hookData.row.index === 1) {
        hookData.cell.styles.textColor = adhColor;
        hookData.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Disclaimer
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFillColor(245, 248, 255);
  doc.roundedRect(MARGIN, y, COL, 14, 2, 2, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(
    "Care adherence reflects completion of scheduled health updates. It does not represent a medical",
    MARGIN + 3, y + 5
  );
  doc.text(
    "diagnosis or determine whether a patient is medically safe. Consult your physician for clinical guidance.",
    MARGIN + 3, y + 10
  );
  y += 18;

  // ─── Footer on every page ─────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(...NAVY);
    doc.rect(0, 287, PAGE_W, 10, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("VITALSYNC CLINICAL TELEMETRY REPORT  •  CONFIDENTIAL  •  For Physician Use Only", MARGIN, 293);
    doc.text(`Page ${p} of ${pageCount}`, PAGE_W - MARGIN, 293, { align: "right" });
  }

  // ─── Generate Typed PDF Blob & Filename ────────────────────────────────────
  const filename = `VitalSync_Report_${data.patient.id}_${new Date().toISOString().split("T")[0]}.pdf`;
  
  // Output as raw array buffer / blob with explicit application/pdf MIME type
  const pdfBlob = doc.output("blob");
  const blobWithMime = new Blob([pdfBlob], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blobWithMime);

  // Trigger download with explicit download attribute and forced click
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  if (openInNewWindow) {
    window.open(blobUrl, "_blank");
  }

  // Revoke object URL after delay to allow browser download to finish
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 10000);

  return { filename, blobUrl };
}

