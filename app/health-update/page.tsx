"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function HealthUpdatePage() {
  const router = useRouter();
  const { submitHealthUpdate, showToast, activeCondition } = useApp();

  const [weight, setWeight] = useState("");
  const [sysBP, setSysBP] = useState("");
  const [diaBP, setDiaBP] = useState("");
  const [sugar, setSugar] = useState("");
  const [mood, setMood] = useState("Good");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const moodOptions = [
    { label: "Great", icon: "sentiment_very_satisfied", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
    { label: "Good", icon: "sentiment_satisfied", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
    { label: "Okay", icon: "sentiment_neutral", color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
    { label: "Poor", icon: "sentiment_dissatisfied", color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
    { label: "Awful", icon: "sentiment_very_dissatisfied", color: "text-red-500", bg: "bg-red-50 border-red-200" },
  ];

  const commonSymptoms = [
    "Headache", "Dizziness", "Shortness of breath", "Fatigue", 
    "Chest pain", "Nausea", "Palpitations", "Swelling in legs"
  ];

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct a rich note from the form data
    const parts = [];
    if (weight) parts.push(`Weight: ${weight} kg`);
    if (sysBP && diaBP) parts.push(`BP: ${sysBP}/${diaBP} mmHg`);
    if (sugar) parts.push(`Sugar: ${sugar} mg/dL`);
    parts.push(`Mood: ${mood}`);
    if (symptoms.length > 0) parts.push(`Symptoms: ${symptoms.join(", ")}`);
    if (notes) parts.push(`Notes: ${notes}`);

    submitHealthUpdate(parts.join(" | "));
    router.push("/");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#006591] hover:underline mb-4">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0f2b48]">Daily Health Update</h1>
            <p className="text-sm text-[#43474d] mt-1">
              Log your vitals and symptoms to keep your adherence record and care team up to date.
            </p>
          </div>
          {activeCondition && (
            <span className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-sm text-blue-600">monitor_heart</span>
              {activeCondition}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vitals Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e5eeff]">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#006591]">vital_signs</span>
            <h2 className="font-headline font-bold text-lg text-[#0f2b48]">Vitals</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Weight */}
            <div>
              <label className="text-[11px] font-bold text-[#74777e] uppercase tracking-wider mb-2 block">Weight (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 72.5"
                  className="w-full border border-[#c9e6ff] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#0f2b48] focus:outline-none focus:ring-2 focus:ring-[#006591]/30 bg-[#f8f9ff] transition-all"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a5b1] text-[20px]">scale</span>
              </div>
            </div>

            {/* Blood Pressure */}
            <div>
              <label className="text-[11px] font-bold text-[#74777e] uppercase tracking-wider mb-2 block">Blood Pressure</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={sysBP}
                    onChange={(e) => setSysBP(e.target.value)}
                    placeholder="Sys"
                    className="w-full border border-[#c9e6ff] rounded-2xl px-3 py-3 text-sm text-[#0f2b48] text-center focus:outline-none focus:ring-2 focus:ring-[#006591]/30 bg-[#f8f9ff] transition-all"
                  />
                </div>
                <span className="text-[#a0a5b1] font-bold">/</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={diaBP}
                    onChange={(e) => setDiaBP(e.target.value)}
                    placeholder="Dia"
                    className="w-full border border-[#c9e6ff] rounded-2xl px-3 py-3 text-sm text-[#0f2b48] text-center focus:outline-none focus:ring-2 focus:ring-[#006591]/30 bg-[#f8f9ff] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Blood Sugar */}
            <div>
              <label className="text-[11px] font-bold text-[#74777e] uppercase tracking-wider mb-2 block">Fasting Sugar (mg/dL)</label>
              <div className="relative">
                <input
                  type="number"
                  value={sugar}
                  onChange={(e) => setSugar(e.target.value)}
                  placeholder="e.g. 95"
                  className="w-full border border-[#c9e6ff] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#0f2b48] focus:outline-none focus:ring-2 focus:ring-[#006591]/30 bg-[#f8f9ff] transition-all"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a5b1] text-[20px]">bloodtype</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e5eeff]">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#006591]">mood</span>
            <h2 className="font-headline font-bold text-lg text-[#0f2b48]">How are you feeling today?</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {moodOptions.map((opt) => {
              const isSelected = mood === opt.label;
              return (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => setMood(opt.label)}
                  className={`flex-1 min-w-[80px] flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    isSelected ? opt.bg + " ring-2 ring-offset-1 " + opt.color.replace("text-", "ring-") : "border-[#e5eeff] bg-[#f8f9ff] text-[#74777e] hover:border-[#c9e6ff]"
                  }`}
                >
                  <span className={`material-symbols-outlined text-3xl ${isSelected ? opt.color : "text-[#a0a5b1]"}`}>{opt.icon}</span>
                  <span className={`text-xs font-bold ${isSelected ? opt.color : ""}`}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Symptoms & Notes Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e5eeff]">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#006591]">assignment_add</span>
            <h2 className="font-headline font-bold text-lg text-[#0f2b48]">Symptoms & Notes</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-bold text-[#74777e] uppercase tracking-wider mb-3 block">Experienced any of the following?</label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((sym) => {
                  const isActive = symptoms.includes(sym);
                  return (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                        isActive
                          ? "bg-[#0f2b48] text-white border-[#0f2b48] shadow-md"
                          : "bg-[#f8f9ff] text-[#43474d] border-[#e5eeff] hover:border-[#c9e6ff]"
                      }`}
                    >
                      {isActive && <span className="material-symbols-outlined text-[14px]">check</span>}
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#74777e] uppercase tracking-wider mb-2 block">Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other details you want to share with your care team..."
                rows={4}
                className="w-full border border-[#c9e6ff] rounded-2xl p-4 text-sm text-[#0f2b48] focus:outline-none focus:ring-2 focus:ring-[#006591]/30 bg-[#f8f9ff] transition-all resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center gap-4 pt-2">
          <Link href="/" className="px-6 py-3.5 rounded-2xl text-[#74777e] font-bold hover:bg-[#e5eeff] transition-colors border border-transparent hover:border-[#c9e6ff]">
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-[#0f2b48] to-[#006591] text-white py-3.5 rounded-2xl text-sm font-headline font-bold shadow-lg hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            Submit Health Update
          </button>
        </div>
      </form>
    </div>
  );
}
