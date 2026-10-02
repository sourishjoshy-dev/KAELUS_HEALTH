"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AuthRoleSelectionPage() {
  const router = useRouter();
  const { switchUser, showToast } = useApp();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleSelectRole = (role: "clinician" | "patient") => {
    if (role === "clinician") {
      router.push("/login?role=doctor");
    } else {
      router.push("/login?role=patient");
    }
  };

  const handleSSO = () => {
    router.push("/login?role=doctor");
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center py-6 sm:py-8 -mt-6">
      {/* Mobile-sized shell centered or fluid on wider screens */}
      <div className="relative w-full max-w-[440px] bg-[#f3f6fc] text-slate-800 rounded-[36px] overflow-hidden shadow-[0_20px_50px_rgba(10,25,50,0.12)] border border-slate-200/80 flex flex-col justify-between">
        
        {/* Ambient Gradient & Dot Grid Layer */}
        <div className="absolute inset-x-0 top-0 h-[440px] top-ambient-aurora pointer-events-none"></div>
        <div className="absolute inset-0 bg-dot-pattern pointer-events-none"></div>

        {/* Soft glowing atmospheric spots */}
        <div className="absolute top-[160px] -left-12 w-44 h-44 rounded-full bg-teal-300/30 blur-3xl pointer-events-none"></div>
        <div className="absolute top-[200px] -right-12 w-48 h-48 rounded-full bg-cyan-200/40 blur-3xl pointer-events-none"></div>

        {/* Animated Ambient Floating Nodes */}
        <div className="glow-dot-1 absolute top-[90px] right-[65px] w-2.5 h-2.5 rounded-full bg-purple-200/90 blur-[0.5px]"></div>
        <div className="glow-dot-2 absolute top-[125px] right-[90px] w-2 h-2 rounded-full bg-teal-400"></div>
        <div className="glow-dot-3 absolute top-[190px] left-[85px] w-2.5 h-2.5 rounded-full bg-teal-600"></div>

        {/* Main Content Flow */}
        <div className="relative z-10 px-5 pt-4 pb-6 flex flex-col items-center">
          
          {/* Compliance Pill Header */}
          <header className="w-full flex justify-center pt-1 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/70 shadow-[0_2px_8px_rgba(3,19,41,0.06)] text-[10.5px] font-bold tracking-wider text-[#0e5c54]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009b86]"></span>
              <span>HIPAA COMPLIANT</span>
              <span className="text-teal-700/50">•</span>
              <span>TIER 4 SECURITY</span>
              <span className="text-teal-700/50">•</span>
              <span>DETERMINISTIC AI</span>
            </div>
          </header>

          {/* Brand Header */}
          <section className="flex flex-col items-center text-center mb-6">
            {/* Animated VitalSync Logo Icon */}
            <div className="relative flex items-center justify-center mb-4">
              {/* Sonar Rings */}
              <div className="sonar-ring-1 absolute w-24 h-24 rounded-3xl border border-cyan-400/40 pointer-events-none"></div>
              <div className="sonar-ring-2 absolute w-24 h-24 rounded-3xl border border-teal-300/30 pointer-events-none"></div>

              {/* Outer Glow Box */}
              <div className="relative w-16 h-16 rounded-[22px] bg-[#031526] p-0.5 shadow-[0_12px_32px_rgba(2,18,38,0.45)] border border-[#00d7b9]/40 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,214,0.18),transparent_70%)]"></div>
                
                {/* ECG Animated SVG */}
                <svg className="w-11 h-11 relative z-10" fill="none" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
                  <path
                    className="ecg-line"
                    d="M4 27h11l4.5-9 6 18 5-13 4 5.5 3.5-1.5H50"
                    stroke="#00f3c5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.6"
                  />
                  <circle className="animate-ping opacity-75" cx="34.5" cy="27" fill="#8affea" r="2.2" />
                  <circle cx="34.5" cy="27" fill="#ffffff" r="2" />
                </svg>
              </div>
            </div>

            {/* Wordmark with OS badge */}
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-lg font-bold tracking-[0.2em] text-[#051329] pl-1 font-headline">
                VITALSYNC
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200/80 text-slate-700 border border-slate-300/60 uppercase font-headline">
                OS
              </span>
            </div>

            {/* Headline & Subtitle */}
            <h1 className="text-[28px] sm:text-[30px] font-extrabold tracking-tight text-[#081735] leading-tight mb-1.5 font-headline">
              Welcome to VITALSYNC
            </h1>
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed max-w-[320px] px-1 font-body">
              Choose your role to access real-time clinical intelligence and synchronized care.
            </p>
          </section>

          {/* 1. Healthcare Provider Card */}
          <section className="w-full bg-white rounded-3xl p-5 mb-4 shadow-[0_10px_26px_rgba(20,38,82,0.06)] border border-slate-100 flex flex-col group hover:border-[#005f56]/30 transition-all">
            <div className="flex items-center justify-between mb-3.5">
              {/* Stethoscope container */}
              <div className="w-12 h-12 rounded-2xl bg-[#dbe8fd] flex items-center justify-center text-[#123162] shadow-xs">
                <svg className="w-6 h-6 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3"></path>
                  <path d="M9 12.5v3.5a4.5 4.5 0 0 0 9 0v-2"></path>
                  <circle cx="18" cy="12" r="2"></circle>
                </svg>
              </div>
              {/* Doctor Tag */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e8eef8] border border-blue-100/80 text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-[#007b6e]"></span>
                <span>Demo: Dr. Thomas, MD (Attending)</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight font-headline">
              Healthcare Provider
            </h2>
            <p className="text-[13px] leading-relaxed text-slate-600 mb-3.5 font-body">
              Manage patient panels, clinical alerts &amp; deterministic checks with longitudinal telemetry.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ebf1fb] text-[12px] font-semibold text-slate-800">
                <svg className="w-3.5 h-3.5 text-slate-800" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" fillRule="evenodd"></path>
                </svg>
                Real-Time Triage
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ebf1fb] text-[12px] font-semibold text-slate-800">
                <svg className="w-3.5 h-3.5 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                Contraindication Engine
              </span>
            </div>

            {/* Enter Doctor Portal Button */}
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleSelectRole("clinician")}
              className="w-full py-3.5 px-4 rounded-xl bg-[#041427] hover:bg-[#071f3b] active:scale-[0.99] transition duration-150 text-white font-semibold text-[14.5px] flex items-center justify-center gap-2 shadow-md font-headline"
            >
              {loadingRole === "clinician" ? (
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
              ) : (
                <>
                  <span>Enter Doctor Portal</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </>
              )}
            </button>
          </section>

          {/* 2. Patient Portal Card */}
          <section className="w-full bg-white rounded-3xl p-5 mb-4 shadow-[0_10px_26px_rgba(20,38,82,0.06)] border border-slate-100 flex flex-col group hover:border-[#005f56]/30 transition-all">
            <div className="flex items-center justify-between mb-3.5">
              {/* Heart container */}
              <div className="w-12 h-12 rounded-2xl bg-[#03594f] flex items-center justify-center text-white shadow-sm">
                <svg className="w-6 h-6 stroke-current fill-none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" viewBox="0 0 24 24">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </div>
              {/* Schedule Badge */}
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#82f0da] border border-[#52e7cb] text-xs font-bold text-[#02564c]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>98% On Schedule</span>
              </div>
            </div>

            {/* Title with Live Sync Badge */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-headline">Patient Portal</h2>
              <span className="px-2 py-0.5 rounded-md bg-[#e4e4fc] text-[#5533c2] text-[11px] font-bold">
                Live Sync
              </span>
            </div>

            <p className="text-[13px] leading-relaxed text-slate-600 mb-3.5 font-body">
              Track your daily protocol, verify OTC conflicts, review lab telemetry and sync bio-wearables.
            </p>

            {/* Inset Profile Synced Telemetry Box */}
            <div className="w-full bg-[#f4f7fd] rounded-2xl p-3 mb-4 flex items-center justify-between border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#dbe8fd] flex items-center justify-center text-[#123162]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M3 13h4l2.5-6 4 12 3-8 2 2h3.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium leading-none mb-1">Profile Synced</p>
                  <p className="text-[13.5px] font-bold text-slate-900 leading-tight">Arjun Kumar • VS-1024</p>
                </div>
              </div>
              {/* Signal Bars */}
              <div className="flex items-end gap-1 h-6 pr-1">
                <span className="w-1.5 h-2 rounded-full bg-[#4dd7c1]"></span>
                <span className="w-1.5 h-3.5 rounded-full bg-[#20c2a8]"></span>
                <span className="w-1.5 h-5 rounded-full bg-[#03796a]"></span>
                <span className="w-1.5 h-6 rounded-full bg-[#005147]"></span>
              </div>
            </div>

            {/* Enter Patient Portal Button */}
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleSelectRole("patient")}
              className="w-full py-3.5 px-4 rounded-xl bg-[#005f56] hover:bg-[#00524a] active:scale-[0.99] transition duration-150 text-white font-semibold text-[14.5px] flex items-center justify-center gap-2 shadow-md font-headline"
            >
              {loadingRole === "patient" ? (
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
              ) : (
                <>
                  <span>Enter Patient Portal</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </>
              )}
            </button>
          </section>

          {/* Institutional SSO Section */}
          <section className="w-full mb-5">
            <button
              type="button"
              onClick={handleSSO}
              className="w-full py-3 px-4 rounded-2xl bg-[#edf3fd] border border-blue-100/80 hover:bg-[#e4ecfa] active:scale-[0.99] transition text-slate-900 font-semibold text-[13.5px] flex items-center justify-center gap-2.5 shadow-xs font-headline"
            >
              <svg className="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" width="16" x="4" y="2"></rect>
                <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"></path>
              </svg>
              <span>Institutional SSO (Epic / Cerner FHIR)</span>
            </button>
          </section>

          {/* Security Footer */}
          <footer className="w-full flex flex-col items-center text-center pt-1 pb-1">
            <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 text-slate-700 text-[11px] font-semibold mb-1.5">
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-teal-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect height="10" rx="2" width="14" x="5" y="11"></rect>
                  <circle cx="12" cy="16" r="1.5"></circle>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                </svg>
                <span>256-bit AES</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-teal-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>HL7 / SMART on FHIR</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-teal-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 15a4 4 0 0 0 4 4h10a4 4 0 0 0 2-7.5 4.5 4.5 0 0 0-8.5-2A4.5 4.5 0 0 0 3 15z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>Zero-Knowledge</span>
              </div>
            </div>
            <p className="text-[10.5px] font-medium text-slate-500">
              VitalSync Platform v4.2.1 • Multi-tenant Clinical Sandbox
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
