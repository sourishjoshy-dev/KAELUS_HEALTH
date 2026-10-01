"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

interface DocumentArchiveItem {
  id: string;
  title: string;
  date: string;
  category: string;
  status: "Active" | "Verified" | "Archived";
  icon: string;
  summary: string;
  extractedValues: Array<{ code: string; test: string; result: string; unit: string; range: string; status: "Normal" | "Elevated" | "Borderline" }>;
}

const initialArchive: DocumentArchiveItem[] = [
  {
    id: "doc-1",
    title: "Blood Test & Comprehensive Metabolic Panel",
    date: "Today at 08:30 AM",
    category: "Pathology & LOINC",
    status: "Active",
    icon: "biotech",
    summary: "Complete 14-biomarker metabolic analysis and electrolyte balance.",
    extractedValues: [
      { code: "33914-3", test: "eGFR (Estimated GFR)", result: "84", unit: "mL/min/1.73m²", range: "> 60", status: "Normal" },
      { code: "3094-0", test: "BUN (Blood Urea Nitrogen)", result: "16", unit: "mg/dL", range: "7 - 20", status: "Normal" },
      { code: "2160-0", test: "Serum Creatinine", result: "0.95", unit: "mg/dL", range: "0.7 - 1.3", status: "Normal" },
      { code: "2345-7", test: "Fasting Serum Glucose", result: "98", unit: "mg/dL", range: "70 - 99", status: "Normal" },
      { code: "4548-4", test: "HbA1c (Glycated Hemoglobin)", result: "6.4", unit: "%", range: "< 5.7 (Target <7.0)", status: "Borderline" },
      { code: "2093-3", test: "Total Cholesterol", result: "172", unit: "mg/dL", range: "< 200", status: "Normal" },
      { code: "13457-7", test: "LDL-C (Calculated)", result: "92", unit: "mg/dL", range: "< 100", status: "Normal" },
      { code: "2085-9", test: "HDL-C", result: "48", unit: "mg/dL", range: "> 40", status: "Normal" },
    ],
  },
  {
    id: "doc-2",
    title: "Prescription & Titration Record",
    date: "Uploaded 5 Sep 2026",
    category: "RxNorm Medication",
    status: "Verified",
    icon: "prescriptions",
    summary: "Dr. Vance titration authorization for Lisinopril 10mg nocturnal dosing.",
    extractedValues: [
      { code: "Rx-29046", test: "Lisinopril Oral Tablet", result: "10", unit: "mg", range: "Daily at night", status: "Normal" },
      { code: "Rx-6809", test: "Metformin Hydrochloride", result: "500", unit: "mg", range: "BID with meals", status: "Normal" },
      { code: "Rx-83367", test: "Atorvastatin Calcium", result: "20", unit: "mg", range: "Daily at bedtime", status: "Normal" },
    ],
  },
  {
    id: "doc-3",
    title: "12-Lead Electrocardiogram & Echo Doppler",
    date: "Uploaded 12 Aug 2026",
    category: "Cardiology Imaging",
    status: "Verified",
    icon: "cardiology",
    summary: "Normal sinus rhythm, Left Ventricular Ejection Fraction (LVEF) 62%.",
    extractedValues: [
      { code: "8867-4", test: "Heart Rate Baseline", result: "68", unit: "bpm", range: "60 - 100", status: "Normal" },
      { code: "10230-1", test: "Left Ventricular EF", result: "62", unit: "%", range: "55 - 70", status: "Normal" },
      { code: "8601-7", test: "PR Interval", result: "162", unit: "ms", range: "120 - 200", status: "Normal" },
      { code: "8633-0", test: "QRS Duration", result: "88", unit: "ms", range: "80 - 120", status: "Normal" },
    ],
  },
];

export default function MedicalReportsPage() {
  const { showToast } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<DocumentArchiveItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(92);

  const simulateNewUpload = () => {
    setIsUploading(true);
    setUploadProgress(15);
    showToast("Beginning Document OCR & Tabular Parsing...");

    const intervals = [
      { progress: 40, msg: "Step 2: Extracting Medical Information & LOINC..." },
      { progress: 70, msg: "Step 3: Reconciling active prescriptions with RxNorm..." },
      { progress: 95, msg: "Step 5: Parsing clinical directives from Dr. Vance..." },
      { progress: 100, msg: "Document verified! Added to Clinical Archive." },
    ];

    intervals.forEach((step, idx) => {
      setTimeout(() => {
        setUploadProgress(step.progress);
        showToast(step.msg);
        if (idx === intervals.length - 1) {
          setIsUploading(false);
        }
      }, (idx + 1) * 1200);
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title & Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0f2b48]">Medical Reports</h1>
            <span className="bg-[#c9e6ff] text-[#001e2f] text-xs font-headline font-bold px-2.5 py-0.5 rounded-full">
              LOINC AI Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#43474d] mt-1">
            Automated medical ingestion, OCR extraction, LOINC &amp; RxNorm mapping for clinical records.
          </p>
        </div>

        <button
          onClick={simulateNewUpload}
          disabled={isUploading}
          className="flex items-center gap-2 bg-[#0f2b48] hover:bg-[#00162d] text-white px-4 py-2.5 rounded-2xl text-xs font-headline font-bold shadow-sm transition-all active:scale-95"
        >
          {isUploading ? (
            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-base">upload_file</span>
          )}
          <span>{isUploading ? "Processing Document..." : "Upload New Report"}</span>
        </button>
      </div>

      {/* Live Ingestion Pipeline Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c9e6ff] flex items-center justify-center text-[#006591]">
              <span className="material-symbols-outlined text-lg">memory</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-sm text-[#0f2b48]">
                Diagnostic Ingestion Engine (Live Pipeline)
              </h2>
              <p className="text-xs text-[#74777e]">
                Target: <span className="font-mono text-[#006591]">Discharge_Summary_Panel_2026.pdf</span> (8 pages)
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#006591] text-[11px] font-bold font-mono">
            Pipeline v2.4 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff]">
            <div className="w-7 h-7 rounded-full bg-[#c9e6ff] text-[#001e2f] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-base font-bold">check</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f2b48]">Step 1: Reading Document</span>
                <span className="text-[10px] text-[#006591] font-bold">100% complete</span>
              </div>
              <p className="text-[11px] text-[#74777e] mt-0.5">OCR &amp; Tabular Parsing complete (8 pages)</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff]">
            <div className="w-7 h-7 rounded-full bg-[#c9e6ff] text-[#001e2f] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-base font-bold">check</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f2b48]">Step 2: Medical Biomarkers</span>
                <span className="text-[10px] text-[#006591] font-bold">14 LOINC Found</span>
              </div>
              <p className="text-[11px] text-[#74777e] mt-0.5">eGFR, BUN, Creatinine, Electrolytes</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff]">
            <div className="w-7 h-7 rounded-full bg-[#c9e6ff] text-[#001e2f] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-base font-bold">check</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f2b48]">Step 3: Active Medications</span>
                <span className="text-[10px] text-[#006591] font-bold">RxNorm Match</span>
              </div>
              <p className="text-[11px] text-[#74777e] mt-0.5">Lisinopril 10mg &amp; Metformin 500mg reconciled</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff]">
            <div className="w-7 h-7 rounded-full bg-[#c9e6ff] text-[#001e2f] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-base font-bold">check</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f2b48]">Step 4: Allergy &amp; Contraindication</span>
                <span className="text-[10px] text-[#006591] font-bold">Verified Clean</span>
              </div>
              <p className="text-[11px] text-[#74777e] mt-0.5">Penicillin &amp; Sulfa checks passed</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col p-3 rounded-2xl bg-[#dce9ff]/50 border border-[#89ceff]/50 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#006591] text-white flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                <span className="material-symbols-outlined text-base">sync</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0f2b48]">Step 5: Doctor Directives</span>
                  <span className="text-[10px] text-[#006591] font-bold">{uploadProgress}%</span>
                </div>
                <p className="text-[11px] text-[#0b1c30] mt-0.5">Parsing Dr. Vance clinical instructions...</p>
              </div>
            </div>
            <div className="w-full bg-[#c9e6ff] rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-[#006591] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] opacity-75">
            <div className="w-7 h-7 rounded-full bg-[#e5eeff] text-[#74777e] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-base">hourglass_empty</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#74777e]">Step 6: AI Health Profile</span>
                <span className="text-[10px] text-[#74777e]">Queued</span>
              </div>
              <p className="text-[11px] text-[#74777e] mt-0.5">Updating longitudinal telemetry curves</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Document Archive */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline font-bold text-lg text-[#0f2b48]">Verified Clinical Archive</h2>
            <p className="text-xs text-[#74777e]">Digitally signed and cross-referenced with EHR systems</p>
          </div>
          <span className="text-xs font-semibold text-[#006591] bg-[#e5eeff] px-2.5 py-1 rounded-full">
            {initialArchive.length} Documents Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {initialArchive.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white rounded-3xl p-5 shadow-sm border border-[#e5eeff] hover:border-[#006591] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] group-hover:bg-[#c9e6ff] flex items-center justify-center text-[#006591] transition-colors">
                    <span className="material-symbols-outlined text-2xl">{doc.icon}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#c9e6ff] text-[#001e2f] text-[10px] font-bold uppercase font-headline">
                    {doc.status}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-sm text-[#0f2b48] group-hover:text-[#006591] transition-colors line-clamp-1">
                  {doc.title}
                </h3>
                <p className="text-xs text-[#74777e] mt-1">{doc.date}</p>
                <p className="text-xs text-[#43474d] mt-2.5 leading-relaxed line-clamp-2">{doc.summary}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#eff4ff] flex items-center justify-between text-xs">
                <span className="text-[#006591] font-semibold">{doc.extractedValues.length} Biomarkers</span>
                <span className="text-[#006591] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Inspect <span className="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#c4c6ce]/30 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-[#eff4ff]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold bg-[#c9e6ff] text-[#001e2f] px-2 py-0.5 rounded">
                    {selectedDoc.category}
                  </span>
                  <span className="text-xs text-[#74777e]">{selectedDoc.date}</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-[#0f2b48] mt-1">{selectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#e5eeff] flex items-center justify-center text-[#74777e] hover:text-[#0f2b48]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar">
              <p className="text-xs text-[#43474d] bg-[#eff4ff] p-3 rounded-2xl">{selectedDoc.summary}</p>

              <div>
                <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#74777e] mb-2">
                  Extracted Biomarkers &amp; LOINC Data
                </h4>
                <div className="divide-y divide-[#eff4ff] border border-[#e5eeff] rounded-2xl overflow-hidden">
                  {selectedDoc.extractedValues.map((val, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-[#f8f9ff]">
                      <div>
                        <div className="font-semibold text-[#0f2b48] flex items-center gap-2">
                          <span>{val.test}</span>
                          <span className="text-[10px] text-[#74777e] font-mono bg-[#eff4ff] px-1.5 py-0.2 rounded">
                            {val.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#74777e]">Reference: {val.range}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-[#0f2b48] font-mono">
                          {val.result} {val.unit}
                        </span>
                        <div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              val.status === "Normal"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {val.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#eff4ff] flex items-center justify-between gap-3">
              <button
                onClick={() => showToast("Downloading FHIR JSON & Signed Clinical PDF...")}
                className="px-4 py-2 rounded-xl border border-[#c4c6ce]/50 text-xs font-bold text-[#0f2b48] hover:bg-[#eff4ff] flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => {
                  showToast("Report forwarded to Dr. Sarah Vance's clinical inbox.");
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#0f2b48] text-white text-xs font-bold hover:bg-[#00162d] flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">forward_to_inbox</span>
                <span>Share with Clinician</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
