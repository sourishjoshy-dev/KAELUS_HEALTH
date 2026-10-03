"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import CareAdherenceMeter from "@/components/CareAdherenceMeter";
import { calculateAdherence } from "@/lib/adherenceUtils";

export default function DashboardPage() {
  const {
    currentUser,
    medications,
    toggleMedication,
    careTasks,
    toggleCareTask,
    healthScore,
    adherenceRate,
    showToast,
    adherenceSession,
    activeCondition,
  } = useApp();

  const takenMedsCount = medications.filter((m) => m.taken).length;
  const completedTasksCount = careTasks.filter((t) => t.completed).length;

  // Care adherence calculation
  const adherenceResult = useMemo(
    () => calculateAdherence(adherenceSession),
    [adherenceSession]
  );

  // Calculate stroke dashoffset for radial gauge (radius 40, circumference ~251.2)
  const circumference = 251.2;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      {/* 1. Doctor Protocol Sync Pill Banner */}
      <div className="w-full bg-[#c9e6ff]/55 border border-[#89ceff]/60 backdrop-blur-md rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#006591] flex items-center justify-center flex-shrink-0 text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label text-[10px] text-[#006591] font-bold uppercase tracking-wider">
              Protocol Synced
            </span>
            <p className="text-xs sm:text-sm text-[#001e2f] font-semibold truncate">
              Dr. Thomas, MD updated your protocol
            </p>
          </div>
        </div>
        <Link
          href="/care-plan"
          className="flex-shrink-0 flex items-center gap-1.5 bg-white text-[#006591] hover:bg-[#eff4ff] px-3.5 py-1.5 rounded-full text-xs font-headline font-bold shadow-xs transition-all active:scale-95"
        >
          <span>View Plan</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>

      {/* 2. Greeting Banner Block */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-headline text-xl sm:text-2xl md:text-3xl text-[#0b1c30] font-bold">
              Good morning, {currentUser.role === "patient" ? "Arjun" : "Dr. Thomas"}
            </h1>
            <span className="text-2xl">👋</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs sm:text-sm text-[#43474d]">
              {currentUser.role === "patient"
                ? "Today's protocol status & live vitals overview"
                : "Active clinical supervision & patient telemetry feed"}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#dce9ff] text-[#0f2b48] text-xs font-semibold font-mono tracking-wide">
              ID: {currentUser.id}
            </span>
            {currentUser.role === "patient" && activeCondition && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-emerald-600">prescriptions</span>
                <span>Rx: {activeCondition}</span>
              </span>
            )}
          </div>
        </div>
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-2xl overflow-hidden ring-2 ring-[#dce9ff] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={currentUser.name} src={currentUser.avatar} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* 3. Top Metrics Row: Health Score & Live Biometrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* VITALSYNC Health Score Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-[#e5eeff]/80 flex flex-col justify-between">
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[#39b8fd]/15 blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex flex-col max-w-[68%]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[11px] font-headline uppercase tracking-wider text-[#006591] font-bold">
                  VITALSYNC Health Score
                </span>
                <span className="material-symbols-outlined text-[#006591] text-[16px]">show_chart</span>
              </div>
              <p className="font-headline text-lg sm:text-xl md:text-2xl text-[#0f2b48] tracking-tight font-extrabold">
                Optimal Trajectory
              </p>
              <div className="inline-flex items-center gap-1.5 mt-1.5 text-[#006591]">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="text-xs font-headline font-bold">+4% vs last week</span>
                <span className="text-[10px] text-[#74777e] bg-[#eff4ff] px-2 py-0.5 rounded-full font-medium">
                  {adherenceRate}% adherence
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#43474d] mt-2.5 leading-relaxed font-body">
                {activeCondition
                  ? `Adherence and biometric stability are sustaining steady improvement for ${activeCondition}. Dr. Thomas has cleared today's moderate exercise block.`
                  : "Upload a prescription or lab report on the Medical Reports page to personalise your health plan."}
              </p>
            </div>

            {/* Radial gauge */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center flex-shrink-0">
              <svg className="w-28 h-28 sm:w-32 sm:h-32 -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-[#e5eeff]"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-[#006591] transition-all duration-1000 ease-out"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  id="score-ring"
                  r="40"
                  stroke="currentColor"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-headline text-2xl sm:text-3xl text-[#0f2b48] font-black leading-none">
                  {healthScore}
                </span>
                <span className="text-[11px] text-[#74777e] font-semibold mt-0.5">/ 100</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#eff4ff] text-xs text-[#74777e]">
            <span className="flex items-center gap-1 text-[#006591] font-semibold">
              <span className="material-symbols-outlined text-sm">lock_clock</span>
              Continuous IoT Telemetry Active
            </span>
            <Link href="/progress-analytics" className="font-headline font-bold text-[#006591] hover:underline flex items-center gap-1">
              View Analytics <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Live Biometric Telemetry Panel */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#e5eeff]/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-headline uppercase tracking-wider text-[#74777e] font-bold">
              Live Biometrics
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Normal
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#eff4ff]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#006591] shadow-xs">
                  <span className="material-symbols-outlined text-base">monitor_heart</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0f2b48]">Blood Pressure</div>
                  <div className="text-[11px] text-[#74777e]">Sitting • Left Arm</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#0f2b48] font-headline">122 / 78</div>
                <div className="text-[10px] text-emerald-600 font-semibold">mmHg • Controlled</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#eff4ff]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#ba1a1a] shadow-xs">
                  <span className="material-symbols-outlined text-base">favorite</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0f2b48]">Resting HR</div>
                  <div className="text-[11px] text-[#74777e]">Optical Sensor</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#0f2b48] font-headline">68</div>
                <div className="text-[10px] text-[#006591] font-semibold">BPM • Optimal Sinus</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#eff4ff]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#006591] shadow-xs">
                  <span className="material-symbols-outlined text-base">bloodtype</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0f2b48]">Fasting Glucose</div>
                  <div className="text-[11px] text-[#74777e]">CGM Sensor</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#0f2b48] font-headline">98</div>
                <div className="text-[10px] text-emerald-600 font-semibold">mg/dL • Target Met</div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px] text-[#74777e]">
            <span>Next auto sync: 15 mins</span>
            <button
              onClick={() => showToast("Manual telemetry polling completed. All vitals synchronized.")}
              className="text-[#006591] font-bold hover:underline"
            >
              Sync Now
            </button>
          </div>
        </div>
      </div>

      {/* 4. Daily Protocol Vitals 2x2 Grid */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-headline uppercase tracking-wider text-[#74777e] font-bold">
            Daily Protocol Vitals
          </h2>
          <span className="text-[11px] font-semibold text-[#006591] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#006591] animate-pulse"></span>
            Active Sync
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Medications */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e5eeff] flex flex-col justify-between h-36 hover:border-[#89ceff] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#006591]">
                  <span className="material-symbols-outlined text-[18px]">medication</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#c9e6ff] text-[10px] font-semibold text-[#001e2f]">
                  On Track
                </span>
              </div>
              <span className="text-[11px] text-[#74777e] uppercase tracking-wider font-semibold">Medications</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline text-lg sm:text-xl text-[#0f2b48] font-bold">
                  {takenMedsCount} / {medications.length}
                </span>
                <span className="text-xs text-[#74777e]">doses</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-[#74777e] mb-1 font-medium">
                <span>Adherence</span>
                <span className="text-[#006591] font-bold">{adherenceRate}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006591] rounded-full transition-all duration-500"
                  style={{ width: `${adherenceRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 2. Diet */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e5eeff] flex flex-col justify-between h-36 hover:border-[#89ceff] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#006591]">
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[10px] font-semibold text-[#0f2b48]">
                  Tracked
                </span>
              </div>
              <span className="text-[11px] text-[#74777e] uppercase tracking-wider font-semibold">Diet</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline text-lg sm:text-xl text-[#0f2b48] font-bold">85%</span>
                <span className="text-xs text-[#74777e]">adherent</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-[#74777e] mb-1 font-medium">
                <span className="truncate">Target &lt;2,000mg</span>
                <span className="text-[#006591] font-bold">Safe</span>
              </div>
              <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
                <div className="h-full bg-[#39b8fd] rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>

          {/* 3. Exercise */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e5eeff] flex flex-col justify-between h-36 hover:border-[#89ceff] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#006591]">
                  <span className="material-symbols-outlined text-[18px]">directions_walk</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#43474d] text-[10px] font-semibold">
                  Scheduled
                </span>
              </div>
              <span className="text-[11px] text-[#74777e] uppercase tracking-wider font-semibold">Exercise</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline text-lg sm:text-xl text-[#0f2b48] font-bold">20m</span>
                <span className="text-xs text-[#74777e]">moderate</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-[#74777e] mb-1 font-medium">
                <span>Heart Rate Target</span>
                <span className="text-[#006591] font-bold">110-125 bpm</span>
              </div>
              <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
                <div className="h-full bg-[#006591] rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
          </div>

          {/* 4. Hydration */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e5eeff] flex flex-col justify-between h-36 hover:border-[#89ceff] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#006591]">
                  <span className="material-symbols-outlined text-[18px]">water_drop</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#c9e6ff] text-[10px] font-semibold text-[#001e2f]">
                  Optimal
                </span>
              </div>
              <span className="text-[11px] text-[#74777e] uppercase tracking-wider font-semibold">Hydration</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline text-lg sm:text-xl text-[#0f2b48] font-bold">1.8 L</span>
                <span className="text-xs text-[#74777e]">/ 2.5 L</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-[#74777e] mb-1 font-medium">
                <span>Daily Quota</span>
                <span className="text-[#006591] font-bold">72%</span>
              </div>
              <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
                <div className="h-full bg-[#39b8fd] rounded-full" style={{ width: "72%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Care Adherence Risk Meter ── */}
      <CareAdherenceMeter
        result={adherenceResult}
        variant="card"
      />

      {/* 5. Lower Grid: Daily Task Checklist & Active Medication Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Protocol Checklist */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline font-bold text-base text-[#0f2b48]">Today&apos;s Protocol Checklist</h3>
              <p className="text-xs text-[#74777e]">
                {completedTasksCount} of {careTasks.length} tasks completed
              </p>
            </div>
            <Link
              href="/care-plan"
              className="text-xs font-bold text-[#006591] hover:underline flex items-center gap-1 font-headline"
            >
              Full Care Plan <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {careTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleCareTask(task.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  task.completed
                    ? "bg-[#f8f9ff] border-[#e5eeff] opacity-80"
                    : "bg-white border-[#c4c6ce]/40 hover:border-[#006591]/50 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      task.completed ? "bg-[#006591] text-white" : "border-2 border-[#c4c6ce] text-transparent"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm font-semibold text-[#0f2b48] ${
                        task.completed ? "line-through text-[#74777e]" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-[11px] text-[#74777e]">
                      {task.time} • Assigned by {task.assignedBy}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006591]">
                  {task.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Regimen / Dose Logger */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0f2b48]">Active Medication Regimen</h3>
                <p className="text-xs text-[#74777e]">Direct RxNorm verification &amp; intake logging</p>
              </div>
              <Link
                href="/medications"
                className="text-xs font-bold text-[#006591] hover:underline flex items-center gap-1 font-headline"
              >
                Manage All <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>

            <div className="space-y-2.5">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff] hover:bg-[#eff4ff] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#c9e6ff] flex items-center justify-center text-[#006591] shrink-0">
                      <span className="material-symbols-outlined text-lg">{med.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline font-bold text-xs sm:text-sm text-[#0f2b48] truncate">
                          {med.name}
                        </span>
                        <span className="text-[11px] font-mono text-[#006591] bg-white px-1.5 py-0.2 rounded font-semibold">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#74777e] truncate">{med.frequency}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleMedication(med.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-headline font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                      med.taken
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-[#0f2b48] text-white hover:bg-[#00162d] shadow-xs"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {med.taken ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span>{med.taken ? "Taken" : "Take Dose"}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#eff4ff] flex items-center justify-between">
            <span className="text-[11px] text-[#74777e] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
              Refills synchronized with Walgreens Pharmacy #4829
            </span>
            <Link href="/safety-engine" className="text-xs font-bold text-[#006591] hover:underline">
              Safety Audit
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Quick Navigation Shortcuts to all Screens */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0f2b48] to-[#00162d] p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-headline font-bold text-base sm:text-lg">VitalSync Clinical Ecosystem</h3>
            <p className="text-xs text-[#c9e6ff]/90">
              Access AI diagnostics, drug-drug safety engines, and lab reports
            </p>
          </div>
          <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full text-[#39b8fd] font-mono">
            FHIR R4 • HL7 Interoperable
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/medical-reports"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
          >
            <span className="material-symbols-outlined text-2xl text-[#39b8fd] mb-2 group-hover:scale-110 transition-transform">
              description
            </span>
            <div>
              <p className="text-xs font-bold font-headline">Medical Reports</p>
              <p className="text-[10px] text-white/70">6-Stage LOINC Pipeline</p>
            </div>
          </Link>

          <Link
            href="/safety-engine"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
          >
            <span className="material-symbols-outlined text-2xl text-[#39b8fd] mb-2 group-hover:scale-110 transition-transform">
              health_and_safety
            </span>
            <div>
              <p className="text-xs font-bold font-headline">Safety Engine</p>
              <p className="text-[10px] text-white/70">4-Gate Conflict Gate</p>
            </div>
          </Link>

          <Link
            href="/ai-assistant"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
          >
            <span className="material-symbols-outlined text-2xl text-[#39b8fd] mb-2 group-hover:scale-110 transition-transform">
              neurology
            </span>
            <div>
              <p className="text-xs font-bold font-headline">AI Assistant</p>
              <p className="text-[10px] text-white/70">Clinical Triage &amp; Q&amp;A</p>
            </div>
          </Link>

          <Link
            href="/progress-analytics"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
          >
            <span className="material-symbols-outlined text-2xl text-[#39b8fd] mb-2 group-hover:scale-110 transition-transform">
              insights
            </span>
            <div>
              <p className="text-xs font-bold font-headline">Progress Analytics</p>
              <p className="text-[10px] text-white/70">BP &amp; Adherence Curves</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
