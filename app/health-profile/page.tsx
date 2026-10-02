"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function HealthProfilePage() {
  const { currentUser, showToast } = useApp();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const [conditions, setConditions] = useState([
    {
      id: "c-1",
      title: "Essential (Primary) Hypertension",
      icd: "ICD-10: I10",
      status: "Monitored",
      target: "Resting BP < 130/80 mmHg",
      notes: "Stage 1 HTN. Regimen stable under Lisinopril 10mg nocturnal dosing.",
    },
    {
      id: "c-2",
      title: "Type 2 Diabetes Mellitus",
      icd: "ICD-10: E11.9",
      status: "Controlled",
      target: "Pre-prandial glucose < 110 mg/dL • HbA1c < 6.5%",
      notes: "Reconciled with Metformin 500mg BID with morning & evening meals.",
    },
    {
      id: "c-3",
      title: "Hyperlipidemia (Dyslipidemia)",
      icd: "ICD-10: E78.5",
      status: "Controlled",
      target: "Serum LDL-C < 100 mg/dL",
      notes: "Atorvastatin 20mg nocte. Lipid panel demonstrates 24% LDL reduction.",
    },
  ]);

  const [allergies, setAllergies] = useState([
    { name: "No Known Drug Allergies (NKDA)", status: "Negative", type: "Pharmacological", verified: true },
    { name: "Penicillin & Beta-Lactams", status: "Negative", type: "Pharmacological", verified: true },
    { name: "Sulfonamides", status: "Negative", type: "Pharmacological", verified: true },
    { name: "Shellfish / Crustaceans", status: "Mild Sensitivity", type: "Dietary", verified: false },
  ]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0f2b48]">AI Health Profile</h1>
            <span className="bg-[#c9e6ff] text-[#001e2f] text-xs font-headline font-bold px-2.5 py-0.5 rounded-full">
              Clinical Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#43474d] mt-1">
            Synthesized longitudinal health summary, diagnostic coding, baselines, and allergy immunograms.
          </p>
        </div>

        <button
          onClick={() => showToast("Exporting comprehensive FHIR R4 Patient Clinical Summary...")}
          className="flex items-center gap-2 bg-white hover:bg-[#eff4ff] border border-[#c4c6ce]/40 text-[#0f2b48] px-4 py-2.5 rounded-2xl text-xs font-headline font-bold shadow-xs transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
          <span>Export Clinical Summary</span>
        </button>
      </div>

      {/* Patient Overview Header Card */}
      <div className="bg-gradient-to-r from-[#0f2b48] to-[#001c37] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#39b8fd]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-[#39b8fd]/40 shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={currentUser.name} src={currentUser.avatar} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-bold text-xl sm:text-2xl text-white">{currentUser.name}</h2>
                <span className="text-[11px] font-mono bg-white/15 text-[#c9e6ff] px-2 py-0.5 rounded">
                  {currentUser.id}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#c9e6ff]/90 mt-0.5">
                52 Years Old • Male • DOB: 14 May 1974 • Blood Group: O Positive (Rh+)
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-medium">BMI: 26.4 (Overweight)</span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-medium">Height: 178 cm</span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-medium">Weight: 83.5 kg</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <span className="text-[11px] text-[#c9e6ff] uppercase tracking-wider font-bold">Supervising Physician</span>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-base text-[#39b8fd]">stethoscope</span>
              <span className="text-xs font-semibold text-white">Dr. Thomas, MD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Snapshots 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Chronic Conditions & ICD-10 */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c9e6ff] flex items-center justify-center text-[#006591]">
                <span className="material-symbols-outlined text-lg">medical_information</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-[#0f2b48]">Primary Chronic Diagnoses</h3>
                <p className="text-xs text-[#74777e]">3 ICD-10 coded diagnostic entities</p>
              </div>
            </div>
            <button
              onClick={() => setEditingSection("conditions")}
              className="text-xs text-[#006591] font-bold hover:underline"
            >
              Update
            </button>
          </div>

          <div className="space-y-3">
            {conditions.map((c) => (
              <div key={c.id} className="p-3.5 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-xs sm:text-sm text-[#0f2b48]">{c.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#c9e6ff] text-[#001e2f] text-[10px] font-bold">
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#74777e]">
                  <span className="font-mono text-[#006591] font-bold">{c.icd}</span>
                  <span>•</span>
                  <span>{c.target}</span>
                </div>
                <p className="text-xs text-[#43474d] pt-1">{c.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Active Prescription Snapshot */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c9e6ff] flex items-center justify-center text-[#006591]">
                <span className="material-symbols-outlined text-lg">pill</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-[#0f2b48]">Current Active Medications</h3>
                <p className="text-xs text-[#74777e]">Direct clinical regimen with dosage schedules</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              3 Active
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-xs sm:text-sm text-[#0f2b48]">Metformin 500mg</span>
                  <span className="text-[10px] bg-white px-2 py-0.2 rounded font-mono text-[#006591] font-bold">
                    Rx-6809
                  </span>
                </div>
                <p className="text-xs text-[#74777e] mt-0.5">Twice daily with meals • Morning/Evening</p>
              </div>
              <span className="material-symbols-outlined text-[#006591] text-lg">schedule</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-xs sm:text-sm text-[#0f2b48]">Lisinopril 10mg</span>
                  <span className="text-[10px] bg-white px-2 py-0.2 rounded font-mono text-[#006591] font-bold">
                    Rx-29046
                  </span>
                </div>
                <p className="text-xs text-[#74777e] mt-0.5">Once daily at night • Vasodilator</p>
              </div>
              <span className="material-symbols-outlined text-[#006591] text-lg">dark_mode</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-xs sm:text-sm text-[#0f2b48]">Atorvastatin 20mg</span>
                  <span className="text-[10px] bg-white px-2 py-0.2 rounded font-mono text-[#006591] font-bold">
                    Rx-83367
                  </span>
                </div>
                <p className="text-xs text-[#74777e] mt-0.5">Once daily at bedtime • Lipid stabilization</p>
              </div>
              <span className="material-symbols-outlined text-[#006591] text-lg">bedtime</span>
            </div>
          </div>
        </div>

        {/* Card 3: Allergies & Immunological Sensitivities */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c9e6ff] flex items-center justify-center text-[#006591]">
                <span className="material-symbols-outlined text-lg">shield_with_heart</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-[#0f2b48]">Allergies &amp; Sensitivities</h3>
                <p className="text-xs text-[#74777e]">Immunological cross-reactivity matrix</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              Verified Clean
            </span>
          </div>

          <div className="space-y-2.5">
            {allergies.map((a, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#c9e6ff] flex items-center justify-center text-[#001e2f] shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">
                      {a.status === "Negative" ? "check_circle" : "warning"}
                    </span>
                  </div>
                  <div>
                    <span className="font-headline font-semibold text-xs text-[#0f2b48]">{a.name}</span>
                    <p className="text-[11px] text-[#74777e]">{a.type}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    a.status === "Negative" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Doctor Directives & Clinical Governance */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c9e6ff] flex items-center justify-center text-[#006591]">
                <span className="material-symbols-outlined text-lg">assignment_ind</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-[#0f2b48]">Doctor Directives</h3>
                <p className="text-xs text-[#74777e]">Direct instructions signed by Dr. Thomas</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-base text-[#006591] shrink-0 mt-0.5">verified_user</span>
              <p className="text-xs text-[#0b1c30] leading-relaxed">
                <strong>Cardiovascular Regimen:</strong> Maintain 20–30 mins moderate walking daily. Heart rate ceiling:
                130 bpm. Continue evening Lisinopril 10mg.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-base text-[#006591] shrink-0 mt-0.5">verified_user</span>
              <p className="text-xs text-[#0b1c30] leading-relaxed">
                <strong>Dietary Sodium Constraint:</strong> Limit dietary sodium strictly under 2,000 mg/day. Restrict
                cured meats, high-saline broth, and processed snacks.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-base text-[#ba1a1a] shrink-0 mt-0.5">emergency</span>
              <p className="text-xs text-[#0b1c30] leading-relaxed">
                <strong>Escalation Gate:</strong> If home systolic BP exceeds 145 mmHg or diastolic exceeds 90 mmHg on two
                consecutive days, dispatch automated clinic telemetry notification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Baseline Biomarker Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff]">
        <h3 className="font-headline font-bold text-sm text-[#0f2b48] mb-3">
          Longitudinal Biomarker Baselines (LOINC Synced)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#eff4ff] text-center">
            <span className="text-[11px] text-[#74777e] uppercase font-bold">eGFR</span>
            <p className="font-headline font-black text-xl text-[#0f2b48] mt-0.5">84</p>
            <span className="text-[10px] text-emerald-700 font-semibold">mL/min • Normal</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#eff4ff] text-center">
            <span className="text-[11px] text-[#74777e] uppercase font-bold">HbA1c</span>
            <p className="font-headline font-black text-xl text-[#0f2b48] mt-0.5">6.4%</p>
            <span className="text-[10px] text-emerald-700 font-semibold">Target &lt; 7.0%</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#eff4ff] text-center">
            <span className="text-[11px] text-[#74777e] uppercase font-bold">Total Chol</span>
            <p className="font-headline font-black text-xl text-[#0f2b48] mt-0.5">172</p>
            <span className="text-[10px] text-emerald-700 font-semibold">mg/dL • Optimal</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#eff4ff] text-center">
            <span className="text-[11px] text-[#74777e] uppercase font-bold">Resting HR</span>
            <p className="font-headline font-black text-xl text-[#0f2b48] mt-0.5">68</p>
            <span className="text-[10px] text-emerald-700 font-semibold">bpm • Sinus Normal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
