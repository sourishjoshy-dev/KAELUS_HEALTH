"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function ProgressAnalyticsPage() {
  const { showToast, healthScore, adherenceRate } = useApp();
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d");

  // Sample data points for 7 Days
  const bp7d = [
    { day: "Mon", systolic: 128, diastolic: 82 },
    { day: "Tue", systolic: 126, diastolic: 80 },
    { day: "Wed", systolic: 124, diastolic: 79 },
    { day: "Thu", systolic: 125, diastolic: 81 },
    { day: "Fri", systolic: 123, diastolic: 78 },
    { day: "Sat", systolic: 121, diastolic: 77 },
    { day: "Sun", systolic: 122, diastolic: 78 },
  ];

  // Adherence curve
  const adherence7d = [85, 90, 100, 75, 100, 100, adherenceRate];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0f2b48]">Progress Analytics</h1>
            <span className="bg-[#c9e6ff] text-[#001e2f] text-xs font-headline font-bold px-2.5 py-0.5 rounded-full">
              Longitudinal AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#43474d] mt-1">
            Biometric telemetry curves, blood pressure recovery trajectories, and adherence correlations.
          </p>
        </div>

        {/* Time Horizon Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#c4c6ce]/30 shadow-xs">
          {(["7d", "30d", "90d"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold transition-all uppercase ${
                timeframe === t ? "bg-[#0f2b48] text-white shadow-xs" : "text-[#74777e] hover:text-[#0f2b48]"
              }`}
            >
              {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* High-Level Recovery Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#e5eeff] space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#74777e]">VITALSYNC Score</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline font-black text-2xl text-[#0f2b48]">{healthScore}</span>
            <span className="text-xs text-emerald-700 font-bold">+4% wk</span>
          </div>
          <p className="text-[11px] text-[#74777e]">Optimal cardiovascular trajectory</p>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#e5eeff] space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#74777e]">Mean Blood Pressure</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline font-black text-2xl text-[#0f2b48]">122/78</span>
            <span className="text-xs text-emerald-700 font-bold">-16 mmHg</span>
          </div>
          <p className="text-[11px] text-[#74777e]">Reduced from baseline 138/88</p>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#e5eeff] space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#74777e]">Med Adherence</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline font-black text-2xl text-[#0f2b48]">{adherenceRate}%</span>
            <span className="text-xs text-[#006591] font-bold">Stable</span>
          </div>
          <p className="text-[11px] text-[#74777e]">94% 30-day aggregate compliance</p>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#e5eeff] space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#74777e]">Avg Resting HR</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline font-black text-2xl text-[#0f2b48]">68</span>
            <span className="text-xs text-[#006591] font-bold">bpm</span>
          </div>
          <p className="text-[11px] text-[#74777e]">Zero arrhythmic anomalies</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Blood Pressure Recovery Curves */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <div>
              <h3 className="font-headline font-bold text-base text-[#0f2b48]">Blood Pressure Trajectory</h3>
              <p className="text-xs text-[#74777e]">Systolic &amp; Diastolic recovery curves vs Clinical Ceiling (130 mmHg)</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-[#006591]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006591]"></span> Systolic
              </span>
              <span className="flex items-center gap-1 text-[#39b8fd]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#39b8fd]"></span> Diastolic
              </span>
            </div>
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="h-64 w-full relative flex flex-col justify-end pt-6">
            {/* Target line */}
            <div className="absolute top-16 left-0 right-0 border-b border-dashed border-red-300 flex items-center justify-between text-[10px] text-red-500 font-mono pr-2">
              <span>Target Ceiling: 130 mmHg</span>
            </div>

            {/* Bars / Points */}
            <div className="flex items-end justify-between h-48 px-2 gap-2">
              {bp7d.map((item, idx) => {
                const sysHeight = ((item.systolic - 60) / 100) * 100;
                const diaHeight = ((item.diastolic - 50) / 70) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center gap-1 h-40">
                      {/* Systolic Bar */}
                      <div
                        className="w-3 sm:w-4 bg-[#006591] rounded-t-md hover:bg-[#0f2b48] transition-all relative"
                        style={{ height: `${sysHeight}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0f2b48] text-white text-[10px] px-1 py-0.2 rounded font-mono transition-opacity">
                          {item.systolic}
                        </span>
                      </div>
                      {/* Diastolic Bar */}
                      <div
                        className="w-3 sm:w-4 bg-[#39b8fd] rounded-t-md hover:bg-[#0284c7] transition-all relative"
                        style={{ height: `${diaHeight}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#006591] text-white text-[10px] px-1 py-0.2 rounded font-mono transition-opacity">
                          {item.diastolic}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#74777e] mt-1 font-mono">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#eff4ff] flex items-center justify-between text-xs text-[#0f2b48]">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
              All 7 readings remain below Dr. Thomas&apos;s Stage 1 ceiling (135/85 mmHg).
            </span>
          </div>
        </div>

        {/* Chart 2: Medication Adherence vs Vital Stability */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <div>
              <h3 className="font-headline font-bold text-base text-[#0f2b48]">Adherence Correlation</h3>
              <p className="text-xs text-[#74777e]">Daily prescription intake vs glycemic stability index</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              96% Correlation
            </span>
          </div>

          <div className="h-64 w-full flex flex-col justify-end pt-4">
            <div className="flex items-end justify-between h-48 px-2 gap-2">
              {adherence7d.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center h-40">
                    <div
                      className={`w-6 sm:w-8 rounded-t-xl transition-all relative ${
                        val >= 90 ? "bg-emerald-600" : val >= 75 ? "bg-[#006591]" : "bg-amber-500"
                      }`}
                      style={{ height: `${val}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0f2b48] text-white text-[10px] px-1 py-0.2 rounded font-mono transition-opacity">
                        {val}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#74777e] mt-1 font-mono">
                    {["M", "T", "W", "T", "F", "S", "S"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#eff4ff] flex items-center justify-between text-xs text-[#0f2b48]">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="material-symbols-outlined text-[#006591] text-sm">insights</span>
              High adherence directly correlated with 14% lower post-prandial glycemic spikes.
            </span>
          </div>
        </div>
      </div>

      {/* Export Clinical Report Button Banner */}
      <div className="bg-gradient-to-r from-[#0f2b48] to-[#001c37] rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline font-bold text-base sm:text-lg">Export Clinical Telemetry Report</h3>
          <p className="text-xs text-[#c9e6ff]/90 mt-0.5">
            Compile this 7-day or 30-day telemetry dossier into a verified FHIR R4 report for your upcoming consultation.
          </p>
        </div>

        <button
          onClick={() => showToast("Compiling VitalSync Clinical Telemetry PDF (14 LOINC + 7-Day Vitals)...")}
          className="flex items-center gap-2 bg-[#39b8fd] hover:bg-[#2cb2fa] text-[#001e2f] px-5 py-3 rounded-2xl text-xs font-headline font-bold shadow-md transition-all active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
          <span>Generate Physician PDF</span>
        </button>
      </div>
    </div>
  );
}
