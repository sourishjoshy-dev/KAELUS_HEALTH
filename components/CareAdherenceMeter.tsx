"use client";

import React from "react";
import type { AdherenceResult } from "@/lib/adherenceUtils";
import Link from "next/link";

// ─── Risk color map ───────────────────────────────────────────────────────────

const RISK_COLORS = {
  good: {
    bar: "#16a34a",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    text: "text-emerald-700",
    ring: "#16a34a",
  },
  moderate: {
    bar: "#006399",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-[#cde5ff] text-[#004f7b]",
    text: "text-[#006399]",
    ring: "#006399",
  },
  high: {
    bar: "#d97706",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    text: "text-amber-700",
    ring: "#d97706",
  },
  critical: {
    bar: "#ba1a1a",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-800",
    text: "text-rose-700",
    ring: "#ba1a1a",
  },
  no_data: {
    bar: "#94a3b8",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-600",
    text: "text-slate-500",
    ring: "#94a3b8",
  },
} as const;

const STATUS_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  completed: { icon: "check_circle", color: "text-emerald-600", label: "Completed" },
  missed:    { icon: "cancel",       color: "text-rose-500",    label: "Missed" },
  upcoming:  { icon: "radio_button_unchecked", color: "text-[#006399]", label: "Upcoming" },
  not_scheduled: { icon: "remove", color: "text-slate-300", label: "—" },
};

// ─── Patient Card (compact) ───────────────────────────────────────────────────

interface CareAdherenceMeterProps {
  result: AdherenceResult;
  /** If true, shows the full card with calendar. Otherwise shows a compact inline meter. */
  variant?: "card" | "compact" | "doctor-chart";
  /** Called when patient clicks "Update Health Status" */
  onUpdateClick?: () => void;
  patientName?: string;
}

export default function CareAdherenceMeter({
  result,
  variant = "card",
  onUpdateClick,
  patientName,
}: CareAdherenceMeterProps) {
  const colors = RISK_COLORS[result.riskLevel];
  const pct = result.percentage ?? 0;

  // ── Compact variant (for doctor patient list) ──
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${colors.bg} ${colors.border}`}>
        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: colors.bar }}
          />
        </div>
        <span className={`text-[11px] font-bold font-mono ${colors.text}`}>
          {result.percentage !== null ? `${pct}%` : "—"}
        </span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
          {result.riskLabel}
        </span>
      </div>
    );
  }

  // ── Doctor Chart variant ──
  if (variant === "doctor-chart") {
    return (
      <div className={`rounded-2xl p-5 border ${colors.bg} ${colors.border} space-y-4`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-600">insights</span>
            <h3 className="font-headline font-bold text-base text-[#0b1c30]">Care Adherence</h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wide ${colors.badge}`}>
            {result.riskLabel}
          </span>
        </div>

        {/* Main meter */}
        <div className="flex items-center gap-4">
          {/* Radial gauge */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="30" fill="transparent" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="30" fill="transparent"
                stroke={colors.bar} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={188.4}
                strokeDashoffset={188.4 - (pct / 100) * 188.4}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-headline font-black text-lg text-[#0b1c30] leading-none">
                {result.percentage !== null ? `${pct}%` : "—"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-1.5">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Scheduled", val: result.scheduled },
                { label: "Completed", val: result.completed },
                { label: "Missed", val: result.missed },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white/60 rounded-xl p-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{label}</span>
                  <span className="font-mono font-bold text-sm text-[#0b1c30]">{val}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/60 rounded-xl p-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Missed Streak</span>
                <span className={`font-mono font-bold text-sm ${result.missedStreak > 0 ? colors.text : "text-[#0b1c30]"}`}>
                  {result.missedStreak} {result.missedStreak === 1 ? "update" : "updates"}
                </span>
              </div>
              <div className="bg-white/60 rounded-xl p-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Last Update</span>
                <span className="font-mono font-bold text-sm text-[#0b1c30]">{result.lastUpdateLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar – last 14 days scheduled */}
        {result.calendarDays.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Last 14 Days (Scheduled)</p>
            <div className="flex flex-wrap gap-1.5">
              {result.calendarDays.filter(d => d.status !== "upcoming" && d.status !== "not_scheduled").slice(-14).map((day) => {
                const s = STATUS_ICONS[day.status];
                return (
                  <div key={day.date} className="flex flex-col items-center gap-0.5" title={`${day.date}: ${s.label}`}>
                    <span className={`material-symbols-outlined text-[16px] ${s.color}`}>{s.icon}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">{day.dayLabel.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Safety disclaimer */}
        <p className="text-[10px] text-slate-400 italic border-t border-slate-200 pt-2">
          Care adherence reflects completion of scheduled health updates. It does not represent a medical diagnosis or determine whether a patient is medically safe.
        </p>
      </div>
    );
  }

  // ── Full patient card ──
  return (
    <div className={`rounded-3xl p-5 sm:p-6 border shadow-sm ${colors.bg} ${colors.border} space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-headline uppercase tracking-wider text-[#006591] font-bold">
              Care Adherence Risk
            </span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-[#0f2b48] mt-0.5">
            {result.percentage !== null ? `${pct}%` : "—"}
          </h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors.badge}`}>
          {result.riskLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: colors.bar }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
          <span>0%</span>
          <span className="text-amber-600">40%</span>
          <span className="text-[#006399]">60%</span>
          <span className="text-emerald-600">80%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Scheduled", val: result.scheduled },
          { label: "Completed", val: result.completed },
          { label: "Missed",    val: result.missed },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white/70 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">{label}</span>
            <span className="font-headline font-bold text-lg text-[#0f2b48]">{val}</span>
            <span className="text-[10px] text-slate-400">updates</span>
          </div>
        ))}
      </div>

      {/* Streak + Last + Next row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-white/70 rounded-2xl p-3 flex items-center gap-2">
          <span className={`material-symbols-outlined text-base ${result.missedStreak > 0 ? colors.text : "text-emerald-600"}`}>
            {result.missedStreak > 0 ? "warning" : "check_circle"}
          </span>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Missed Streak</p>
            <p className="font-bold text-[#0f2b48]">{result.missedStreak} {result.missedStreak === 1 ? "update" : "updates"}</p>
          </div>
        </div>
        <div className="bg-white/70 rounded-2xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#006591]">schedule</span>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Last Update</p>
            <p className="font-bold text-[#0f2b48]">{result.lastUpdateLabel}</p>
          </div>
        </div>
        <div className="bg-white/70 rounded-2xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#006591]">event</span>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Next Scheduled</p>
            <p className="font-bold text-[#0f2b48]">{result.nextScheduledDayLabel ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Contextual message */}
      {result.contextMessage && (
        <div className={`flex items-start gap-2 rounded-2xl p-3 bg-white/60 border ${colors.border}`}>
          <span className={`material-symbols-outlined text-base mt-0.5 flex-shrink-0 ${colors.text}`}>
            {result.riskLevel === "good" ? "thumb_up" : result.missedStreak === 0 ? "info" : "notification_important"}
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">{result.contextMessage}</p>
        </div>
      )}

      {/* Calendar - last 14 scheduled days */}
      {result.calendarDays.filter(d => d.status !== "not_scheduled").length > 0 && (
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Update Calendar</p>
          <div className="grid grid-cols-7 gap-1">
            {result.calendarDays.slice(-14).map((day) => {
              const s = STATUS_ICONS[day.status];
              return (
                <div key={day.date} className="flex flex-col items-center gap-0.5" title={`${day.date}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    day.status === "completed" ? "bg-emerald-100" :
                    day.status === "missed" ? "bg-rose-100" :
                    day.status === "upcoming" ? "bg-blue-50" : "bg-slate-50"
                  }`}>
                    <span className={`material-symbols-outlined text-[14px] ${s.color}`}>{s.icon}</span>
                  </div>
                  <span className="text-[8px] text-slate-400 font-semibold leading-tight text-center">
                    {day.dayLabel.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {[
              { status: "completed", label: "Completed" },
              { status: "missed",    label: "Missed" },
              { status: "upcoming",  label: "Upcoming" },
            ].map(({ status, label }) => {
              const s = STATUS_ICONS[status];
              return (
                <div key={status} className="flex items-center gap-1">
                  <span className={`material-symbols-outlined text-[12px] ${s.color}`}>{s.icon}</span>
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA + Disclaimer */}
      <div className="space-y-2 pt-1">
        {onUpdateClick ? (
          <button
            onClick={onUpdateClick}
            className="w-full flex items-center justify-center gap-2 bg-[#0f2b48] hover:bg-[#00162d] text-white py-3 rounded-2xl text-sm font-headline font-bold transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            Update Health Status
          </button>
        ) : (
          <Link
            href="/health-update"
            className="w-full flex items-center justify-center gap-2 bg-[#0f2b48] hover:bg-[#00162d] text-white py-3 rounded-2xl text-sm font-headline font-bold transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            Update Health Status
          </Link>
        )}
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          Care adherence reflects completion of scheduled health updates. It does not represent a medical diagnosis or determine whether a patient is medically safe.
        </p>
      </div>
    </div>
  );
}
