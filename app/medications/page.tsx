"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function MedicationsPage() {
  const { medications, toggleMedication, adherenceRate, showToast } = useApp();
  const [filterTime, setFilterTime] = useState<string>("all");
  const [refillModalMed, setRefillModalMed] = useState<string | null>(null);

  const filteredMeds = filterTime === "all" ? medications : medications.filter((m) => m.timeSlot.toLowerCase() === filterTime);

  const handleRequestRefill = (medName: string) => {
    setRefillModalMed(null);
    showToast(`Refill request submitted to Walgreens Pharmacy #4829 for ${medName}.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0f2b48]">Medications</h1>
            <span className="bg-[#c9e6ff] text-[#001e2f] text-xs font-headline font-bold px-2.5 py-0.5 rounded-full">
              RxNorm Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#43474d] mt-1">
            Active pharmacological prescriptions, dosage schedules, adherence tracking, and pharmacy sync.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#c4c6ce]/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#006591] animate-pulse"></span>
          <span className="text-xs font-bold text-[#0f2b48]">Walgreens Pharmacy #4829 Synced</span>
        </div>
      </div>

      {/* Adherence Summary Card */}
      <div className="bg-gradient-to-r from-[#0f2b48] to-[#001c37] rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#39b8fd] shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-3xl">medication</span>
          </div>
          <div>
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#c9e6ff]">
              Today&apos;s Regimen Adherence
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-headline font-extrabold text-2xl sm:text-3xl">{adherenceRate}%</span>
              <span className="text-xs text-[#c9e6ff]">
                ({medications.filter((m) => m.taken).length} of {medications.length} doses logged)
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Marking medications as taken updates your VitalSync Health Score in real time.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-white/10 p-3 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex justify-between text-[11px] text-[#c9e6ff] font-semibold mb-1">
            <span>Overall Adherence</span>
            <span>{adherenceRate}%</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#39b8fd] rounded-full transition-all duration-500"
              style={{ width: `${adherenceRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs font-bold text-[#74777e] uppercase font-headline mr-1">Time Slot:</span>
        {["all", "morning", "afternoon", "evening", "bedtime"].map((slot) => (
          <button
            key={slot}
            onClick={() => setFilterTime(slot)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-headline font-semibold transition-all capitalize whitespace-nowrap ${
              filterTime === slot
                ? "bg-[#0f2b48] text-white shadow-xs"
                : "bg-white text-[#43474d] hover:bg-[#eff4ff] border border-[#c4c6ce]/30"
            }`}
          >
            {slot === "all" ? "All Doses" : slot}
          </button>
        ))}
      </div>

      {/* Medications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeds.map((med) => (
          <div
            key={med.id}
            className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-all flex flex-col justify-between ${
              med.taken ? "border-emerald-200 bg-emerald-50/20" : "border-[#e5eeff] hover:border-[#006591]"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      med.taken ? "bg-emerald-100 text-emerald-800" : "bg-[#eff4ff] text-[#006591]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">{med.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-bold text-base text-[#0f2b48]">{med.name}</h3>
                      <span className="text-xs font-mono font-bold bg-[#eff4ff] text-[#006591] px-2 py-0.5 rounded">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-[#74777e] mt-0.5">{med.frequency}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    med.taken ? "bg-emerald-100 text-emerald-800" : "bg-[#eff4ff] text-[#0f2b48]"
                  }`}
                >
                  {med.taken ? "Taken" : med.timeSlot}
                </span>
              </div>

              <p className="text-xs text-[#43474d] bg-[#eff4ff]/60 p-3 rounded-2xl leading-relaxed mb-3">
                {med.instructions}
              </p>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-[#74777e] gap-2 pt-1 border-t border-[#eff4ff]">
                <span>Prescriber: {med.prescribedBy}</span>
                <span className="font-semibold text-[#006591]">{med.refillCount} Refills Remaining</span>
              </div>
            </div>

            <div className="pt-4 mt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => setRefillModalMed(med.name)}
                className="text-xs font-bold text-[#006591] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">local_pharmacy</span>
                <span>Refill</span>
              </button>

              <button
                onClick={() => toggleMedication(med.id)}
                className={`px-4 py-2 rounded-xl text-xs font-headline font-bold flex items-center gap-2 transition-all active:scale-95 ${
                  med.taken
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-[#0f2b48] text-white hover:bg-[#00162d] shadow-xs"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {med.taken ? "check_circle" : "radio_button_unchecked"}
                </span>
                <span>{med.taken ? `Logged (${med.takenAt || "Today"})` : "Mark as Taken"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Refill Modal */}
      {refillModalMed && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#c4c6ce]/30 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-[#006591]">local_pharmacy</span>
                <h3 className="font-headline font-bold text-base text-[#0f2b48]">Request Pharmacy Refill</h3>
              </div>
              <button
                onClick={() => setRefillModalMed(null)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#74777e]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <p className="text-xs text-[#43474d] leading-relaxed">
              Order automatic refill for <strong>{refillModalMed}</strong> at your preferred pharmacy:
            </p>

            <div className="p-3.5 rounded-2xl bg-[#eff4ff] border border-[#e5eeff] text-xs space-y-1">
              <p className="font-bold text-[#0f2b48]">Walgreens Pharmacy #4829</p>
              <p className="text-[#74777e]">1400 Health Science Blvd, Medical District</p>
              <p className="text-[#006591] font-semibold">Ready for pickup within 2 hours of physician signoff</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRefillModalMed(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#c4c6ce]/40 text-xs font-bold text-[#74777e]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestRefill(refillModalMed)}
                className="flex-1 py-2.5 rounded-xl bg-[#0f2b48] hover:bg-[#00162d] text-white text-xs font-bold"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
