"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useApp } from "@/context/AppContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExtractedMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  confidence: number;
  needs_verification: boolean;
  status: "pending" | "verified" | "rejected";
  user_edited?: boolean;
}

interface AnalysisResult {
  document_type: string;
  patient_info: { name: string; age: string; gender: string } | null;
  conditions: Array<{ name: string; confidence: number }>;
  medicines: ExtractedMedicine[];
  uncertain_items: string[];
  summary: string;
  filename: string;
  filesize: number;
  analyzed_at: string;
}

interface Recommendations {
  diet: {
    summary: string;
    breakfast: string[];
    lunch: string[];
    snacks: string[];
    dinner: string[];
    foods_to_limit: string[];
    sodium_limit_mg: number;
    hydration_target_liters: number;
  };
  exercise: {
    summary: string;
    recommended: string[];
    avoid: string[];
    frequency: string;
    target_hr_ceiling_bpm: number;
  };
  safety_notes: string[];
  disclaimer: string;
  generated_at: string;
}

type FlowStep = "idle" | "uploading" | "verifying" | "preferences" | "generating" | "done";

interface PlanPreferences {
  frequency: "daily" | "weekly" | "monthly" | "manual";
  tracking: {
    medication: "Mark completed" | "Enter manually" | "Untracked";
    diet: "Log meals" | "Mark plan completed" | "Untracked";
    exercise: "Mark completed" | "Enter manually" | "Untracked";
    hydration: "Water intake" | "Mark completed" | "Untracked";
  };
  progressSync: "Several times a day" | "Once a day" | "A few times a week" | "Once a week" | "When I remember";
  factors: string[];
}

const defaultPreferences: PlanPreferences = {
  frequency: "weekly",
  tracking: {
    medication: "Mark completed",
    diet: "Log meals",
    exercise: "Mark completed",
    hydration: "Water intake",
  },
  progressSync: "Once a day",
  factors: [
    "Medication adherence",
    "Diet adherence",
    "Exercise adherence",
    "Hydration",
    "Overall progress",
    "Doctor's instructions",
  ],
};

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 90 ? "bg-emerald-50 text-emerald-700" :
    pct >= 75 ? "bg-amber-50 text-amber-700" :
    "bg-red-50 text-red-700";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {pct}% confidence
    </span>
  );
}

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
    summary: "Dr. Thomas titration authorization for Lisinopril 10mg nocturnal dosing.",
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
  const { showToast, setActiveCondition } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [medicines, setMedicines] = useState<ExtractedMedicine[]>([]);
  const [editingMed, setEditingMed] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Partial<ExtractedMedicine>>({});
  const [selectedDoc, setSelectedDoc] = useState<DocumentArchiveItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"diet" | "exercise" | "safety">("diet");
  const [preferences, setPreferences] = useState<PlanPreferences>(defaultPreferences);

  // ─── LocalStorage Persistence ──────────────────────────────────────────────
  // 1. Restore saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kaelus_medical_session");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.flowStep && s.flowStep !== "uploading" && s.flowStep !== "generating") {
          setFlowStep(s.flowStep);
        }
        if (s.analysisResult) {
          setAnalysisResult(s.analysisResult);
          if (s.analysisResult.conditions && s.analysisResult.conditions.length > 0) {
            const detectedName = s.analysisResult.conditions.map((c: any) => c.name).slice(0, 2).join(" & ");
            setActiveCondition(detectedName);
          }
        }
        if (s.medicines) setMedicines(s.medicines);
        if (s.recommendations) setRecommendations(s.recommendations);
        if (s.activeTab) setActiveTab(s.activeTab);
      }
    } catch (e) {
      console.warn("Failed to restore medical session from localStorage", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Save state to localStorage whenever key data changes
  useEffect(() => {
    if (flowStep === "idle") return;
    try {
      localStorage.setItem(
        "kaelus_medical_session",
        JSON.stringify({
          flowStep,
          analysisResult,
          medicines,
          recommendations,
          activeTab,
        })
      );
    } catch (e) {
      console.warn("Failed to persist medical session to localStorage", e);
    }
  }, [flowStep, analysisResult, medicines, recommendations, activeTab]);

  // ─── Upload & Analyze ──────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setAnalysisResult(null);
    setRecommendations(null);
    setMedicines([]);
    setFlowStep("uploading");
    setUploadProgress(10);

    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 8, 85));
    }, 600);

    try {
      const form = new FormData();
      form.append("file", file);
      showToast("Sending document to Gemini AI for analysis...");
      const res = await fetch("/api/analyze-document", { method: "POST", body: form });
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(err.error || "Document analysis failed");
      }

      const data: AnalysisResult = await res.json();
      setAnalysisResult(data);
      setMedicines(data.medicines);

      // Dynamically sync detected conditions from uploaded prescription across the app
      if (data.conditions && data.conditions.length > 0) {
        const detectedName = data.conditions.map((c) => c.name).slice(0, 2).join(" & ");
        setActiveCondition(detectedName);
      }

      setFlowStep("verifying");
      showToast(`AI extracted ${data.medicines.length} medicines — please verify below.`);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || "Upload failed. Please try again.");
      setFlowStep("idle");
      showToast("Analysis failed. Please check the file and try again.");
    }
  }, [showToast, setActiveCondition]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  // ─── Verification ──────────────────────────────────────────────────────────
  const verifyMed = (id: string) =>
    setMedicines((prev) => prev.map((m) => m.id === id ? { ...m, status: "verified", needs_verification: false } : m));

  const rejectMed = (id: string) =>
    setMedicines((prev) => prev.map((m) => m.id === id ? { ...m, status: "rejected" } : m));

  const undoReject = (id: string) =>
    setMedicines((prev) => prev.map((m) => m.id === id ? { ...m, status: "pending" } : m));

  const startEdit = (med: ExtractedMedicine) => {
    setEditingMed(med.id);
    setEditBuffer({ name: med.name, dosage: med.dosage, frequency: med.frequency, instructions: med.instructions });
  };

  const saveEdit = (id: string) => {
    setMedicines((prev) =>
      prev.map((m) => m.id === id ? { ...m, ...editBuffer, status: "verified", needs_verification: false, user_edited: true } : m)
    );
    setEditingMed(null);
    setEditBuffer({});
    showToast("Medicine details updated and verified ✓");
  };

  const verifyAll = () => {
    setMedicines((prev) => prev.map((m) => m.status !== "rejected" ? { ...m, status: "verified", needs_verification: false } : m));
    showToast("All medicines verified ✓");
  };

  // ─── Go to Preferences step ────────────────────────────────────────────────
  const handleProceedToPreferences = () => {
    const verifiedMeds = medicines.filter((m) => m.status === "verified");
    if (verifiedMeds.length === 0 && (!analysisResult?.conditions || analysisResult.conditions.length === 0)) {
      showToast("Please verify at least one medicine or condition first.");
      return;
    }
    setFlowStep("preferences");
  };

  // ─── Generate Recommendations ──────────────────────────────────────────────
  const handleGenerateRecommendations = async () => {
    const verifiedMeds = medicines.filter((m) => m.status === "verified");
    setFlowStep("generating");
    showToast("Generating personalized diet & exercise plan...");

    try {
      const res = await fetch("/api/generate-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicines: verifiedMeds,
          conditions: analysisResult?.conditions || [],
          patientInfo: analysisResult?.patient_info || {},
          preferences,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(err.error || "Failed to generate recommendations");
      }

      const data: Recommendations = await res.json();
      setRecommendations(data);
      setFlowStep("done");
      showToast("Personalized health plan generated! ✓");
    } catch (err: any) {
      setError(err.message || "Could not generate recommendations.");
      setFlowStep("preferences");
      showToast("Recommendation generation failed. Please try again.");
    }
  };

  const resetFlow = () => {
    setFlowStep("idle");
    setAnalysisResult(null);
    setRecommendations(null);
    setMedicines([]);
    setError(null);
    setUploadProgress(0);
    try {
      localStorage.removeItem("kaelus_medical_session");
    } catch {}
  };

  const verifiedCount = medicines.filter((m) => m.status === "verified").length;
  const pendingCount = medicines.filter((m) => m.needs_verification && m.status !== "rejected").length;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0f2b48]">Medical Reports</h1>
            <span className="bg-[#c9e6ff] text-[#001e2f] text-xs font-headline font-bold px-2.5 py-0.5 rounded-full">Gemini AI</span>
          </div>
          <p className="text-xs sm:text-sm text-[#43474d] mt-1">
            Upload prescriptions or lab reports — AI extracts, you verify, then get a personalized health plan.
          </p>
        </div>
        {flowStep !== "idle" && (
          <button onClick={resetFlow} className="flex items-center gap-2 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0f2b48] px-4 py-2.5 rounded-2xl text-xs font-headline font-bold transition-all">
            <span className="material-symbols-outlined text-base">refresh</span>
            New Upload
          </button>
        )}
      </div>

      {/* ── STEP 1: Upload Drop Zone ── */}
      {flowStep === "idle" && (
        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
              <span className="material-symbols-outlined text-red-500 flex-shrink-0">error</span>
              <div><p className="font-bold">Analysis Failed</p><p className="text-xs mt-0.5">{error}</p></div>
            </div>
          )}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
              dragOver ? "border-[#006591] bg-[#eff4ff] scale-[1.01]" : "border-[#c9e6ff] bg-[#f8f9ff] hover:border-[#006591] hover:bg-[#eff4ff]"
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={onFileInputChange} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#c9e6ff] flex items-center justify-center text-[#006591]">
                <span className="material-symbols-outlined text-4xl">upload_file</span>
              </div>
              <div>
                <p className="font-headline font-bold text-[#0f2b48] text-base">
                  {dragOver ? "Drop your document here" : "Upload Medical Report or Prescription"}
                </p>
                <p className="text-xs text-[#74777e] mt-1">Drag & drop or click — PDF, PNG, JPG, WEBP (max 10MB)</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
                {["Handwritten Rx", "Lab Reports", "Discharge Summaries"].map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full bg-white border border-[#e5eeff] text-[11px] text-[#006591] font-bold">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: "document_scanner", step: "1", title: "AI Reads Document", desc: "Gemini AI extracts medicines, conditions, and biomarkers." },
              { icon: "fact_check", step: "2", title: "You Verify", desc: "Confirm, edit, or reject each medicine for safety." },
              { icon: "spa", step: "3", title: "Get Health Plan", desc: "Personalized diet & exercise plan based on verified medicines." },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-[#e5eeff]">
                <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#006591] flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#006591] uppercase tracking-wide">Step {step}</p>
                  <p className="font-headline font-bold text-sm text-[#0f2b48]">{title}</p>
                  <p className="text-[11px] text-[#74777e] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Analyzing ── */}
      {flowStep === "uploading" && (
        <div className="bg-white rounded-3xl p-8 border border-[#e5eeff] shadow-sm flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#c9e6ff] flex items-center justify-center text-[#006591]">
            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-lg text-[#0f2b48]">Gemini AI is reading your document…</h2>
            <p className="text-sm text-[#74777e] mt-1">Extracting medications, conditions, and biomarkers.</p>
          </div>
          <div className="w-full max-w-md">
            <div className="flex justify-between text-xs text-[#74777e] mb-1.5">
              <span>Analyzing document</span><span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#e5eeff] rounded-full h-2 overflow-hidden">
              <div className="bg-[#006591] h-2 rounded-full transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-[11px]">
            {["OCR & Parsing", "Handwriting Analysis", "Drug Recognition", "Safety Check"].map((label, i) => (
              <span key={label} className={`px-3 py-1 rounded-full font-bold ${uploadProgress > i * 25 ? "bg-[#c9e6ff] text-[#001e2f]" : "bg-[#f8f9ff] text-[#74777e]"}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: Verification ── */}
      {(flowStep === "verifying" || flowStep === "generating") && analysisResult && (
        <div className="space-y-5">
          {/* Summary Banner */}
          <div className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c9e6ff] flex items-center justify-center text-[#006591]">
                  <span className="material-symbols-outlined text-xl">auto_awesome</span>
                </div>
                <div>
                  <h2 className="font-headline font-bold text-sm text-[#0f2b48]">AI Analysis Complete</h2>
                  <p className="text-xs text-[#74777e] mt-0.5">{analysisResult.filename} · {analysisResult.document_type}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#eff4ff] text-[#006591] text-xs font-bold">{medicines.length} Medicines</span>
                <span className="px-3 py-1 rounded-full bg-[#eff4ff] text-[#006591] text-xs font-bold">{analysisResult.conditions.length} Conditions</span>
                {pendingCount > 0 && <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">{pendingCount} Need Review</span>}
              </div>
            </div>
            <p className="text-xs text-[#43474d] mt-3 bg-[#f8f9ff] p-3 rounded-2xl leading-relaxed">{analysisResult.summary}</p>
          </div>

          {/* Patient Info */}
          {analysisResult.patient_info && (analysisResult.patient_info.name || analysisResult.patient_info.age) && (
            <div className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
              <h3 className="font-headline font-bold text-sm text-[#0f2b48] mb-3">Extracted Patient Information</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Name", value: analysisResult.patient_info.name || "—", icon: "person" },
                  { label: "Age", value: analysisResult.patient_info.age || "—", icon: "cake" },
                  { label: "Gender", value: analysisResult.patient_info.gender || "—", icon: "wc" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-[#f8f9ff] rounded-2xl p-3 text-center">
                    <span className="material-symbols-outlined text-[#006591] text-base">{icon}</span>
                    <p className="text-xs text-[#74777e] mt-0.5">{label}</p>
                    <p className="font-headline font-bold text-sm text-[#0f2b48]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uncertain Items Warning */}
          {analysisResult.uncertain_items.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-600">warning</span>
                <h3 className="font-headline font-bold text-sm text-amber-800">Handwriting Unclear — Verification Required</h3>
              </div>
              <ul className="space-y-1">
                {analysisResult.uncertain_items.map((item, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-xs mt-0.5 flex-shrink-0">arrow_right</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medicine Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline font-bold text-lg text-[#0f2b48]">Verify Extracted Medicines</h2>
                <p className="text-xs text-[#74777e]">Confirm each medicine matches your prescription exactly</p>
              </div>
              {pendingCount > 0 && (
                <button onClick={verifyAll} className="text-xs font-bold text-[#006591] px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#c9e6ff] transition-colors">
                  Verify All →
                </button>
              )}
            </div>

            {medicines.length === 0 && (
              <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-2xl p-6 text-center text-sm text-[#74777e]">
                <span className="material-symbols-outlined text-3xl text-[#c4c6ce] block mb-2">medication</span>
                No medicines were extracted from this document.
              </div>
            )}

            {medicines.map((med) => (
              <div key={med.id} className={`bg-white rounded-3xl p-5 border shadow-sm transition-all ${
                med.status === "verified" ? "border-emerald-200 bg-emerald-50/30" :
                med.status === "rejected" ? "border-red-200 bg-red-50/30 opacity-60" :
                med.needs_verification ? "border-amber-300 bg-amber-50/30" : "border-[#e5eeff]"
              }`}>
                {editingMed === med.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[#006591]">edit</span>
                      <h3 className="font-headline font-bold text-sm text-[#0f2b48]">Edit Medicine Details</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {([
                        { field: "name" as const, label: "Medicine Name", placeholder: "e.g. Metformin" },
                        { field: "dosage" as const, label: "Dosage", placeholder: "e.g. 500mg" },
                        { field: "frequency" as const, label: "Frequency", placeholder: "e.g. BID with meals" },
                        { field: "instructions" as const, label: "Instructions", placeholder: "e.g. Take with food" },
                      ]).map(({ field, label, placeholder }) => (
                        <div key={field}>
                          <label className="text-[11px] font-bold text-[#74777e] uppercase tracking-wide mb-1 block">{label}</label>
                          <input
                            type="text"
                            value={(editBuffer[field] as string) || ""}
                            onChange={(e) => setEditBuffer((b) => ({ ...b, [field]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full border border-[#c9e6ff] rounded-xl px-3 py-2 text-sm text-[#0f2b48] focus:outline-none focus:ring-2 focus:ring-[#006591]/30 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => saveEdit(med.id)} className="flex-1 bg-[#006591] text-white rounded-xl py-2 text-xs font-bold hover:bg-[#005077] transition-colors">Save & Verify</button>
                      <button onClick={() => setEditingMed(null)} className="flex-1 bg-[#eff4ff] text-[#0f2b48] rounded-xl py-2 text-xs font-bold hover:bg-[#e5eeff] transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          med.status === "verified" ? "bg-emerald-100 text-emerald-700" :
                          med.status === "rejected" ? "bg-red-100 text-red-500" : "bg-[#c9e6ff] text-[#006591]"
                        }`}>
                          <span className="material-symbols-outlined text-xl">
                            {med.status === "verified" ? "check_circle" : med.status === "rejected" ? "cancel" : "medication"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-headline font-bold text-sm text-[#0f2b48]">{med.name}</h3>
                            {med.user_edited && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">Edited</span>}
                            <ConfidenceBadge confidence={med.confidence} />
                          </div>
                          <p className="text-xs text-[#74777e] mt-0.5">{med.dosage} · {med.frequency} · {med.duration}</p>
                        </div>
                      </div>
                      <div>
                        {med.status === "verified" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ Verified</span>}
                        {med.status === "rejected" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">✗ Rejected</span>}
                      </div>
                    </div>
                    {med.instructions && med.instructions !== "Follow physician advice" && (
                      <p className="text-[11px] text-[#43474d] bg-[#f8f9ff] rounded-xl px-3 py-2 mb-3">
                        <span className="font-bold">Instructions:</span> {med.instructions}
                      </p>
                    )}
                    {med.status !== "rejected" ? (
                      <div className="flex gap-2 flex-wrap">
                        {med.status !== "verified" && (
                          <button onClick={() => verifyMed(med.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors">
                            <span className="material-symbols-outlined text-sm">check</span> Confirm
                          </button>
                        )}
                        <button onClick={() => startEdit(med)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#c9e6ff] text-[#0f2b48] text-xs font-bold transition-colors">
                          <span className="material-symbols-outlined text-sm">edit</span> Edit
                        </button>
                        <button onClick={() => rejectMed(med.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors">
                          <span className="material-symbols-outlined text-sm">close</span> Reject
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => undoReject(med.id)} className="text-xs text-[#006591] hover:underline">↩ Undo rejection</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Conditions */}
          {analysisResult.conditions.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
              <h3 className="font-headline font-bold text-sm text-[#0f2b48] mb-3">Identified Medical Conditions</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.conditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#eff4ff] border border-[#c9e6ff] rounded-xl px-3 py-1.5">
                    <span className="text-xs font-bold text-[#0f2b48]">{c.name}</span>
                    <ConfidenceBadge confidence={c.confidence} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate CTA */}
          <div className="bg-gradient-to-r from-[#0f2b48] to-[#006591] rounded-3xl p-6 text-white">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-headline font-bold text-lg">Ready for Your Health Plan?</h2>
                <p className="text-sm text-white/75 mt-1">
                  {verifiedCount} medicine{verifiedCount !== 1 ? "s" : ""} verified{pendingCount > 0 ? ` · ${pendingCount} still need review` : " · All clear!"}
                </p>
                {pendingCount > 0 && <p className="text-xs text-amber-300 mt-1">⚠ Verify or reject remaining medicines first.</p>}
              </div>
              <button
                onClick={handleProceedToPreferences}
                disabled={verifiedCount === 0}
                className="flex items-center gap-2 bg-white text-[#0f2b48] hover:bg-[#c9e6ff] disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-2xl text-sm font-headline font-bold transition-all active:scale-95 shadow-lg"
              >
                <span className="material-symbols-outlined text-base">tune</span>
                Set My Preferences →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3b: Plan Preferences ── */}
      {flowStep === "preferences" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f2b48] to-[#006591] rounded-3xl p-6 text-white">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">tune</span>
              </div>
              <div>
                <h2 className="font-headline font-bold text-xl">Plan Update Preferences</h2>
                <p className="text-sm text-white/75 mt-1">Customise how your health plan is tracked and updated.</p>
              </div>
            </div>
          </div>

          {/* Frequency Cards */}
          <div className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
            <h3 className="font-headline font-bold text-sm text-[#0f2b48] mb-1">How often should your plan update?</h3>
            <p className="text-xs text-[#74777e] mb-4">Choose a frequency that matches your health journey rhythm.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { value: "daily", icon: "today", label: "Daily", sub: "Every morning" },
                { value: "weekly", icon: "date_range", label: "Weekly", sub: "Monday refresh" },
                { value: "monthly", icon: "calendar_month", label: "Monthly", sub: "Month-end review" },
                { value: "manual", icon: "touch_app", label: "Manual", sub: "On your schedule" },
              ] as const).map(({ value, icon, label, sub }) => (
                <button
                  key={value}
                  onClick={() => setPreferences((p) => ({ ...p, frequency: value }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    preferences.frequency === value
                      ? "border-[#006591] bg-[#eff4ff] text-[#0f2b48]"
                      : "border-[#e5eeff] bg-[#f8f9ff] text-[#74777e] hover:border-[#c9e6ff]"
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${ preferences.frequency === value ? "text-[#006591]" : "" }`}>{icon}</span>
                  <span className="font-headline font-bold text-sm">{label}</span>
                  <span className="text-[10px]">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tracking Toggles */}
          <div className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
            <h3 className="font-headline font-bold text-sm text-[#0f2b48] mb-1">Tracking preferences</h3>
            <p className="text-xs text-[#74777e] mb-4">Choose how each health dimension is monitored.</p>
            <div className="space-y-4">
              {([
                {
                  key: "medication" as const,
                  icon: "medication",
                  label: "Medication",
                  options: ["Mark completed", "Enter manually", "Untracked"] as const,
                },
                {
                  key: "diet" as const,
                  icon: "restaurant",
                  label: "Diet",
                  options: ["Log meals", "Mark plan completed", "Untracked"] as const,
                },
                {
                  key: "exercise" as const,
                  icon: "fitness_center",
                  label: "Exercise",
                  options: ["Mark completed", "Enter manually", "Untracked"] as const,
                },
                {
                  key: "hydration" as const,
                  icon: "water_drop",
                  label: "Hydration",
                  options: ["Water intake", "Mark completed", "Untracked"] as const,
                },
              ]).map(({ key, icon, label, options }) => (
                <div key={key} className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 min-w-[110px]">
                    <div className="w-8 h-8 rounded-xl bg-[#eff4ff] flex items-center justify-center">
                      <span className="material-symbols-outlined text-base text-[#006591]">{icon}</span>
                    </div>
                    <span className="font-headline font-bold text-sm text-[#0f2b48]">{label}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setPreferences((p) => ({
                            ...p,
                            tracking: { ...p.tracking, [key]: opt },
                          }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          preferences.tracking[key] === opt
                            ? "bg-[#006591] text-white border-[#006591]"
                            : "bg-[#f8f9ff] text-[#74777e] border-[#e5eeff] hover:border-[#c9e6ff]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Sync */}
          <div className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
            <h3 className="font-headline font-bold text-sm text-[#0f2b48] mb-1">Progress sync frequency</h3>
            <p className="text-xs text-[#74777e] mb-4">How often should your data sync with your care team?</p>
            <div className="flex flex-wrap gap-2">
              {([
                "Several times a day",
                "Once a day",
                "A few times a week",
                "Once a week",
                "When I remember",
              ] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPreferences((p) => ({ ...p, progressSync: opt }))}
                  className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                    preferences.progressSync === opt
                      ? "bg-[#0f2b48] text-white border-[#0f2b48]"
                      : "bg-[#f8f9ff] text-[#74777e] border-[#e5eeff] hover:border-[#c9e6ff]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Factors */}
          <div className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
            <h3 className="font-headline font-bold text-sm text-[#0f2b48] mb-1">Factors to track</h3>
            <p className="text-xs text-[#74777e] mb-4">Select which factors the AI should prioritise in your plan.</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Medication adherence",
                "Diet adherence",
                "Exercise adherence",
                "Hydration",
                "Overall progress",
                "Doctor's instructions",
                "Sleep quality",
                "Stress levels",
                "Blood pressure",
                "Blood sugar",
              ].map((factor) => {
                const active = preferences.factors.includes(factor);
                return (
                  <button
                    key={factor}
                    onClick={() =>
                      setPreferences((p) => ({
                        ...p,
                        factors: active
                          ? p.factors.filter((f) => f !== factor)
                          : [...p.factors, factor],
                      }))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                      active
                        ? "bg-[#006591] text-white border-[#006591]"
                        : "bg-[#f8f9ff] text-[#74777e] border-[#e5eeff] hover:border-[#c9e6ff]"
                    }`}
                  >
                    {active && <span className="material-symbols-outlined text-[12px]">check</span>}
                    {factor}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFlowStep("verifying")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#f8f9ff] text-[#74777e] text-sm font-bold hover:bg-[#e5eeff] transition-all border border-[#e5eeff]"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </button>
            <button
              onClick={handleGenerateRecommendations}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f2b48] to-[#006591] text-white px-5 py-3 rounded-2xl text-sm font-headline font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              Save & Generate My Health Plan
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Recommendations ── */}
      {flowStep === "done" && recommendations && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-emerald-700 to-[#006591] rounded-3xl p-6 text-white">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-3xl mt-0.5">health_and_safety</span>
              <div>
                <h2 className="font-headline font-bold text-xl">Your Personalized Health Plan</h2>
                <p className="text-sm text-white/80 mt-1">
                  Based on {medicines.filter((m) => m.status === "verified").length} verified medicines & {analysisResult?.conditions.length || 0} conditions
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#f0f4ff] p-1 rounded-2xl">
            {(["diet", "exercise", "safety"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-xl text-xs font-headline font-bold transition-all ${activeTab === tab ? "bg-white text-[#0f2b48] shadow-sm" : "text-[#74777e] hover:text-[#0f2b48]"}`}>
                {tab === "diet" ? "🥗 Diet" : tab === "exercise" ? "🏃 Exercise" : "⚠️ Safety"}
              </button>
            ))}
          </div>

          {activeTab === "diet" && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
                <p className="text-sm text-[#43474d] leading-relaxed">{recommendations.diet.summary}</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-[#f0fdf4] rounded-2xl p-3 text-center border border-emerald-100">
                    <p className="text-[10px] text-emerald-700 font-bold uppercase">Sodium Limit</p>
                    <p className="font-headline font-bold text-lg text-[#0f2b48]">{recommendations.diet.sodium_limit_mg.toLocaleString()}</p>
                    <p className="text-xs text-emerald-700">mg/day</p>
                  </div>
                  <div className="bg-[#eff4ff] rounded-2xl p-3 text-center border border-[#c9e6ff]">
                    <p className="text-[10px] text-[#006591] font-bold uppercase">Hydration</p>
                    <p className="font-headline font-bold text-lg text-[#0f2b48]">{recommendations.diet.hydration_target_liters}L</p>
                    <p className="text-xs text-[#006591]">per day</p>
                  </div>
                </div>
              </div>
              {[
                { label: "Breakfast", icon: "free_breakfast", items: recommendations.diet.breakfast },
                { label: "Lunch", icon: "lunch_dining", items: recommendations.diet.lunch },
                { label: "Snacks", icon: "nutrition", items: recommendations.diet.snacks },
                { label: "Dinner", icon: "dinner_dining", items: recommendations.diet.dinner },
              ].map(({ label, icon, items }) => (
                <div key={label} className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#006591]">{icon}</span>
                    <h3 className="font-headline font-bold text-sm text-[#0f2b48]">{label}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#43474d]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006591] flex-shrink-0 mt-2" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="bg-red-50 rounded-3xl p-5 border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-red-600">block</span>
                  <h3 className="font-headline font-bold text-sm text-red-800">Foods to Limit or Avoid</h3>
                </div>
                <ul className="space-y-1.5">
                  {recommendations.diet.foods_to_limit.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                      <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">remove_circle</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "exercise" && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-[#e5eeff] shadow-sm">
                <p className="text-sm text-[#43474d] leading-relaxed">{recommendations.exercise.summary}</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-[#eff4ff] rounded-2xl p-3 text-center border border-[#c9e6ff]">
                    <p className="text-[10px] text-[#006591] font-bold uppercase">Schedule</p>
                    <p className="font-bold text-sm text-[#0f2b48] mt-1">{recommendations.exercise.frequency}</p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-3 text-center border border-red-100">
                    <p className="text-[10px] text-red-700 font-bold uppercase">Max Heart Rate</p>
                    <p className="font-headline font-bold text-lg text-[#0f2b48]">{recommendations.exercise.target_hr_ceiling_bpm} BPM</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-emerald-600">fitness_center</span>
                  <h3 className="font-headline font-bold text-sm text-[#0f2b48]">Recommended Activities</h3>
                </div>
                <ul className="space-y-2">
                  {recommendations.exercise.recommended.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#43474d]">
                      <span className="material-symbols-outlined text-sm text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 rounded-3xl p-5 border border-red-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-red-600">warning</span>
                  <h3 className="font-headline font-bold text-sm text-red-800">Exercises to Avoid</h3>
                </div>
                <ul className="space-y-2">
                  {recommendations.exercise.avoid.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                      <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">cancel</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "safety" && (
            <div className="space-y-4">
              {recommendations.safety_notes.map((note, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <span className="material-symbols-outlined text-amber-600 flex-shrink-0">health_and_safety</span>
                  <p className="text-sm text-amber-800 leading-relaxed">{note}</p>
                </div>
              ))}
              <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-2xl p-4 text-xs text-[#74777e] leading-relaxed">
                <span className="font-bold">⚕ Disclaimer: </span>{recommendations.disclaimer}
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button onClick={() => showToast("Health plan downloaded as PDF.")} className="flex-1 flex items-center justify-center gap-2 bg-[#0f2b48] text-white rounded-2xl py-3 text-sm font-headline font-bold hover:bg-[#00162d] transition-all">
              <span className="material-symbols-outlined text-base">download</span>Download Plan
            </button>
            <button onClick={() => showToast("Health plan shared with Dr. Thomas, MD.")} className="flex-1 flex items-center justify-center gap-2 bg-[#eff4ff] text-[#006591] rounded-2xl py-3 text-sm font-headline font-bold hover:bg-[#c9e6ff] transition-all">
              <span className="material-symbols-outlined text-base">forward_to_inbox</span>Share with Doctor
            </button>
            <button onClick={resetFlow} className="px-4 py-3 rounded-2xl bg-[#f8f9ff] text-[#74777e] text-sm font-bold hover:bg-[#e5eeff] transition-all">
              <span className="material-symbols-outlined text-base">refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Static Clinical Archive ── */}
      {(flowStep === "idle" || flowStep === "done") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline font-bold text-lg text-[#0f2b48]">Verified Clinical Archive</h2>
              <p className="text-xs text-[#74777e]">Digitally signed and cross-referenced with EHR systems</p>
            </div>
            <span className="text-xs font-semibold text-[#006591] bg-[#e5eeff] px-2.5 py-1 rounded-full">{initialArchive.length} Documents</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {initialArchive.map((doc) => (
              <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e5eeff] hover:border-[#006591] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] group-hover:bg-[#c9e6ff] flex items-center justify-center text-[#006591] transition-colors">
                      <span className="material-symbols-outlined text-2xl">{doc.icon}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c9e6ff] text-[#001e2f] text-[10px] font-bold uppercase font-headline">{doc.status}</span>
                  </div>
                  <h3 className="font-headline font-bold text-sm text-[#0f2b48] group-hover:text-[#006591] transition-colors line-clamp-1">{doc.title}</h3>
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
      )}

      {/* Archive Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#c4c6ce]/30 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-[#eff4ff]">
              <div>
                <span className="text-[11px] font-mono font-bold bg-[#c9e6ff] text-[#001e2f] px-2 py-0.5 rounded">{selectedDoc.category}</span>
                <h3 className="font-headline font-bold text-lg text-[#0f2b48] mt-1">{selectedDoc.title}</h3>
                <p className="text-xs text-[#74777e]">{selectedDoc.date}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#e5eeff] flex items-center justify-center text-[#74777e]">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar">
              <p className="text-xs text-[#43474d] bg-[#eff4ff] p-3 rounded-2xl">{selectedDoc.summary}</p>
              <div>
                <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#74777e] mb-2">Extracted Biomarkers & LOINC Data</h4>
                <div className="divide-y divide-[#eff4ff] border border-[#e5eeff] rounded-2xl overflow-hidden">
                  {selectedDoc.extractedValues.map((val, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-[#f8f9ff]">
                      <div>
                        <div className="font-semibold text-[#0f2b48] flex items-center gap-2">
                          <span>{val.test}</span>
                          <span className="text-[10px] text-[#74777e] font-mono bg-[#eff4ff] px-1.5 py-0.5 rounded">{val.code}</span>
                        </div>
                        <div className="text-[11px] text-[#74777e]">Reference: {val.range}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-[#0f2b48] font-mono">{val.result} {val.unit}</span>
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${val.status === "Normal" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
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
              <button onClick={() => showToast("Downloading FHIR JSON & Signed Clinical PDF...")} className="px-4 py-2 rounded-xl border border-[#c4c6ce]/50 text-xs font-bold text-[#0f2b48] hover:bg-[#eff4ff] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">download</span>Download PDF
              </button>
              <button onClick={() => { showToast("Report forwarded to Dr. Thomas's clinical inbox."); setSelectedDoc(null); }} className="px-4 py-2 rounded-xl bg-[#0f2b48] text-white text-xs font-bold hover:bg-[#00162d] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">forward_to_inbox</span>Share with Clinician
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
