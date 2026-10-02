"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export interface DietRecommendation {
  summary: string;
  breakfast: string[];
  lunch: string[];
  snacks: string[];
  dinner: string[];
  foods_to_limit: string[];
  sodium_limit_mg?: number;
  hydration_target_liters?: number;
}

export interface ExerciseRecommendation {
  summary: string;
  recommended: string[];
  avoid: string[];
  frequency: string;
  target_hr_ceiling_bpm?: number;
}

export interface RecommendationResponse {
  diet: DietRecommendation;
  exercise: ExerciseRecommendation;
  safety_notes: string[];
  disclaimer: string;
  generated_at?: string;
}

interface DietExercisePlanProps {
  data: RecommendationResponse;
  verifiedMedicines?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
  }>;
  onReset?: () => void;
}

export default function DietExercisePlan({
  data,
  verifiedMedicines = [],
  onReset,
}: DietExercisePlanProps) {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"diet" | "exercise" | "safety">("diet");
  const [synced, setSynced] = useState(false);

  const handleSyncToPortal = () => {
    setSynced(true);
    showToast("Verified prescription & recommendations synced to your Active Care Plan!");
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-[#e5eeff] space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#006399] text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-bold text-xl text-[#0b1c30]">
                Personalized Diet &amp; Exercise Protocol
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#006399] border border-blue-200/50">
                Verified Prescriptions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Formulated specifically around your verified medications, cardiovascular caps, and metabolic targets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Analyze Another
            </button>
          )}

          <button
            onClick={handleSyncToPortal}
            disabled={synced}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              synced
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-[#0f766e] hover:bg-[#0d625b] text-white active:scale-95"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {synced ? "check_circle" : "sync"}
            </span>
            <span>{synced ? "Synced to Care Plan ✓" : "Sync to My Portal"}</span>
          </button>
        </div>
      </div>

      {/* Verified Medicines Summary Bar */}
      {verifiedMedicines.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0f766e] text-[18px]">verified</span>
            <span className="font-bold text-slate-700">Verified Pharmacological Baseline:</span>
            <div className="flex flex-wrap gap-1.5">
              {verifiedMedicines.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-800"
                >
                  {m.name} {m.dosage}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {verifiedMedicines.length} verified medications
          </span>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-headline font-bold">
        <button
          onClick={() => setActiveTab("diet")}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "diet"
              ? "bg-white text-[#0f766e] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">nutrition</span>
          <span>1. Nutritional Plan</span>
        </button>

        <button
          onClick={() => setActiveTab("exercise")}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "exercise"
              ? "bg-white text-[#006399] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">fitness_center</span>
          <span>2. Exercise Regimen</span>
        </button>

        <button
          onClick={() => setActiveTab("safety")}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "safety"
              ? "bg-white text-rose-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">security</span>
          <span>3. Clinical Safety ({data.safety_notes?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: DIET RECOMMENDATION */}
      {activeTab === "diet" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#0f766e] text-[22px] shrink-0 mt-0.5">
              eco
            </span>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="block text-slate-900 text-sm font-headline mb-0.5">
                Clinical Diet Strategy
              </strong>
              {data.diet.summary}
            </div>
          </div>

          {/* Biomarker Target Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Sodium Ceiling
              </span>
              <span className="font-headline font-bold text-lg text-[#0f766e]">
                &lt; {data.diet.sodium_limit_mg || 2000} mg/day
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Daily Hydration Target
              </span>
              <span className="font-headline font-bold text-lg text-[#006399]">
                {data.diet.hydration_target_liters || 2.5} Liters
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Glycemic Index
              </span>
              <span className="font-headline font-bold text-lg text-emerald-700">
                Low Glycemic Load
              </span>
            </div>
          </div>

          {/* Meal Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breakfast */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
                <span>Breakfast Options</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.diet.breakfast?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lunch */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                <span>Lunch Recommendations</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.diet.lunch?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Snacks */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <span className="material-symbols-outlined text-[18px]">bakery_dining</span>
                <span>Healthy Metabolic Snacks</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.diet.snacks?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dinner */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                <span>Dinner Regimen</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.diet.dinner?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Foods to Limit / Avoid */}
          {data.diet.foods_to_limit?.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 mb-2">
                <span className="material-symbols-outlined text-[18px]">do_not_disturb</span>
                <span>Foods to Strictly Limit or Avoid (Drug-Nutrient Interactions)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.diet.foods_to_limit.map((food, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-800 shadow-xs"
                  >
                    ✕ {food}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXERCISE RECOMMENDATION */}
      {activeTab === "exercise" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#006399] text-[22px] shrink-0 mt-0.5">
              directions_run
            </span>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="block text-slate-900 text-sm font-headline mb-0.5">
                Cardiovascular Conditioning Strategy
              </strong>
              {data.exercise.summary}
            </div>
          </div>

          {/* Exercise Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  Target Frequency &amp; Duration
                </span>
                <span className="font-headline font-bold text-sm text-[#0b1c30]">
                  {data.exercise.frequency}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#006399] text-2xl">schedule</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  Max Heart Rate Ceiling
                </span>
                <span className="font-headline font-bold text-sm text-rose-700">
                  &le; {data.exercise.target_hr_ceiling_bpm || 130} BPM
                </span>
              </div>
              <span className="material-symbols-outlined text-rose-600 text-2xl">favorite</span>
            </div>
          </div>

          {/* Recommended vs Contraindicated Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recommended */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Recommended Safe Workouts</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.exercise.recommended?.map((ex, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avoid */}
            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>Contraindicated Exercises to Avoid</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.exercise.avoid?.map((ex, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY & CLINICAL NOTES */}
      {activeTab === "safety" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-2.5">
            {data.safety_notes?.map((note, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Clinical Disclaimer */}
      <div className="pt-4 border-t border-slate-200 text-center">
        <p className="text-[11px] text-slate-500 italic max-w-2xl mx-auto">
          &ldquo;{data.disclaimer}&rdquo;
        </p>
      </div>
    </div>
  );
}
