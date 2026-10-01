"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

interface SimulationResult {
  candidate: string;
  type: "medication" | "diet" | "exercise";
  status: "Approved" | "Blocked" | "Remediated";
  latency: number;
  gates: {
    condition: { pass: boolean; note: string };
    interactions: { pass: boolean; note: string };
    allergies: { pass: boolean; note: string };
    doctorGate: { pass: boolean; note: string };
  };
  remediation?: {
    original: string;
    substitute: string;
    reason: string;
  };
}

export default function SafetyEnginePage() {
  const { showToast } = useApp();
  const [testInput, setTestInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeResult, setActiveResult] = useState<SimulationResult | null>(null);

  const predefinedTests = [
    { label: "Cured Prosciutto Salad (High Sodium)", value: "Prosciutto & Artichoke Salad" },
    { label: "Ibuprofen 400mg (NSAID)", value: "Ibuprofen 400mg" },
    { label: "Grapefruit Juice 250ml", value: "Fresh Grapefruit Juice" },
    { label: "Grilled Salmon & Quinoa Bowl", value: "Grilled Salmon & Quinoa Bowl" },
    { label: "High-Intensity Sprinting", value: "HIIT Sprint Interval (160 bpm)" },
  ];

  const runSafetyAudit = (candidate: string) => {
    setIsSimulating(true);
    setActiveResult(null);
    showToast(`Evaluating "${candidate}" across 4 clinical safety gates...`);

    setTimeout(() => {
      setIsSimulating(false);
      const lower = candidate.toLowerCase();

      if (lower.includes("prosciutto") || lower.includes("sodium") || lower.includes("ramen")) {
        setActiveResult({
          candidate,
          type: "diet",
          status: "Remediated",
          latency: 14,
          gates: {
            condition: { pass: false, note: "Violates Stage 1 HTN peripheral vascular pressure thresholds." },
            interactions: { pass: true, note: "No pharmacological binding interference with Lisinopril." },
            allergies: { pass: true, note: "Zero known food allergen triggers." },
            doctorGate: { pass: false, note: "Exceeds Dr. Vance 2,000mg/day sodium ceiling (2,840mg detected)." },
          },
          remediation: {
            original: candidate,
            substitute: "Grilled Lemon Herb Turkey Salad with Avocado (Sodium: 380mg)",
            reason: "Intercepted 2,840mg sodium overload. Automatically substituted heart-safe low-saline protein.",
          },
        });
        showToast("Harm Neutralized! Auto-remediation generated.");
      } else if (lower.includes("ibuprofen") || lower.includes("nsaid") || lower.includes("advil")) {
        setActiveResult({
          candidate,
          type: "medication",
          status: "Blocked",
          latency: 11,
          gates: {
            condition: { pass: false, note: "NSAIDs reduce renal blood flow in hypertensive patients." },
            interactions: { pass: false, note: "Severe interaction: Blunts Lisinopril ACE-inhibitor antihypertensive efficacy." },
            allergies: { pass: true, note: "Negative for aspirin/NSAID hypersensitivity." },
            doctorGate: { pass: false, note: "Physician Directive Violation: NSAIDs contraindicated under active protocol." },
          },
          remediation: {
            original: candidate,
            substitute: "Acetaminophen 500mg (Tylenol)",
            reason: "Safe analgesic without renal vasoconstriction or ACE-inhibitor antagonism.",
          },
        });
        showToast("Severe interaction intercepted! Prescription blocked.");
      } else if (lower.includes("grapefruit")) {
        setActiveResult({
          candidate,
          type: "diet",
          status: "Blocked",
          latency: 12,
          gates: {
            condition: { pass: true, note: "Normal glycemic impact." },
            interactions: { pass: false, note: "CYP3A4 inhibition increases serum Atorvastatin bioavailability to toxic levels." },
            allergies: { pass: true, note: "No allergy flags." },
            doctorGate: { pass: false, note: "Contraindicated in Dr. Vance lipid protocol." },
          },
          remediation: {
            original: candidate,
            substitute: "Fresh Squeezed Orange Juice or Cranberry Spritzer",
            reason: "CYP3A4 neutral citrus alternative.",
          },
        });
        showToast("CYP3A4 enzyme inhibition risk detected!");
      } else if (lower.includes("sprint") || lower.includes("hiit")) {
        setActiveResult({
          candidate,
          type: "exercise",
          status: "Blocked",
          latency: 13,
          gates: {
            condition: { pass: false, note: "Excessive hemodynamic shear stress in Stage 1 HTN." },
            interactions: { pass: true, note: "No drug binding conflicts." },
            allergies: { pass: true, note: "N/A" },
            doctorGate: { pass: false, note: "Heart rate projected at 160 bpm; exceeds 130 bpm ceiling." },
          },
          remediation: {
            original: candidate,
            substitute: "25-Minute Zone 2 Power Walk (Target HR: 115-125 bpm)",
            reason: "Stimulates nitric oxide endothelially without blood pressure spiking.",
          },
        });
        showToast("Heart rate ceiling violation blocked.");
      } else {
        // Safe item
        setActiveResult({
          candidate,
          type: "diet",
          status: "Approved",
          latency: 12,
          gates: {
            condition: { pass: true, note: "Cardiovascular and glycemic parameters optimal." },
            interactions: { pass: true, note: "Compatible with Lisinopril, Metformin, and Atorvastatin." },
            allergies: { pass: true, note: "Zero immunologic cross-reactivity." },
            doctorGate: { pass: true, note: "Complies with Dr. Vance cardiovascular recovery quotas." },
          },
        });
        showToast("All 4 clinical safety gates approved!");
      }
    }, 900);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0f2b48]">Safety Engine</h1>
            <span className="bg-[#c9e6ff] text-[#001e2f] text-xs font-headline font-bold px-2.5 py-0.5 rounded-full">
              4-Gate Interception
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#43474d] mt-1">
            Real-time conflict detection across medical conditions, drug interactions, allergies, and physician hard-gates.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#c4c6ce]/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-[#0f2b48]">Telemetry Latency: 12ms</span>
        </div>
      </div>

      {/* 4-Gate Architectural Flow Diagram */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c9e6ff] flex items-center justify-center text-[#006591]">
              <span className="material-symbols-outlined text-lg">alt_route</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-sm text-[#0f2b48]">
                Real-Time 4-Gate Safety Pipeline Architecture
              </h2>
              <p className="text-xs text-[#74777e]">Every proposal must achieve unanimous clearance before commitment</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#006591] bg-[#eff4ff] px-2 py-0.5 rounded font-bold">
            Zero-Tolerance Policy
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
          {/* Gate 1 */}
          <div className="p-3 rounded-2xl bg-[#eff4ff] border border-[#e5eeff] text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#c9e6ff] text-[#001e2f] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-base">vital_signs</span>
            </div>
            <span className="text-[10px] font-bold text-[#74777e] uppercase tracking-wider block">Gate 1</span>
            <p className="font-headline font-bold text-xs text-[#0f2b48]">Conditions</p>
            <p className="text-[10px] text-[#74777e]">HTN &amp; T2D check</p>
          </div>

          {/* Gate 2 */}
          <div className="p-3 rounded-2xl bg-[#eff4ff] border border-[#e5eeff] text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#c9e6ff] text-[#001e2f] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-base">medication_liquid</span>
            </div>
            <span className="text-[10px] font-bold text-[#74777e] uppercase tracking-wider block">Gate 2</span>
            <p className="font-headline font-bold text-xs text-[#0f2b48]">Drug-Drug / Food</p>
            <p className="text-[10px] text-[#74777e]">CYP3A4 &amp; ACE-I check</p>
          </div>

          {/* Gate 3 */}
          <div className="p-3 rounded-2xl bg-[#eff4ff] border border-[#e5eeff] text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#c9e6ff] text-[#001e2f] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-base">shield_with_heart</span>
            </div>
            <span className="text-[10px] font-bold text-[#74777e] uppercase tracking-wider block">Gate 3</span>
            <p className="font-headline font-bold text-xs text-[#0f2b48]">Allergies</p>
            <p className="text-[10px] text-[#74777e]">NKDA &amp; Sensitivities</p>
          </div>

          {/* Gate 4 */}
          <div className="p-3 rounded-2xl bg-[#eff4ff] border border-[#e5eeff] text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#c9e6ff] text-[#001e2f] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-base">policy</span>
            </div>
            <span className="text-[10px] font-bold text-[#74777e] uppercase tracking-wider block">Gate 4</span>
            <p className="font-headline font-bold text-xs text-[#0f2b48]">Doctor Hard Gate</p>
            <p className="text-[10px] text-[#74777e]">Dr. Vance protocol caps</p>
          </div>

          {/* Output */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1 col-span-2 md:col-span-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-base">task_alt</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Outcome</span>
            <p className="font-headline font-bold text-xs text-emerald-900">Safe Commitment</p>
            <p className="text-[10px] text-emerald-700">Committed or Remediated</p>
          </div>
        </div>
      </div>

      {/* Interactive Safety Simulator */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-4">
        <div>
          <h3 className="font-headline font-bold text-base text-[#0f2b48]">Interactive Conflict Interception Simulator</h3>
          <p className="text-xs text-[#74777e]">
            Test any food, drug, or exercise regimen against Arjun&apos;s active clinical profile in real time.
          </p>
        </div>

        {/* Quick Chip Suggestions */}
        <div className="flex flex-wrap gap-2 pt-1">
          {predefinedTests.map((test, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTestInput(test.value);
                runSafetyAudit(test.value);
              }}
              className="px-3 py-1.5 rounded-full bg-[#eff4ff] hover:bg-[#c9e6ff] text-[#006591] text-xs font-semibold font-headline transition-colors active:scale-95"
            >
              + {test.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Enter medication, diet item, or activity (e.g. Grapefruit, Ibuprofen)..."
            className="flex-1 p-3 rounded-2xl bg-[#eff4ff] border border-[#c4c6ce]/30 text-xs text-[#0f2b48] placeholder:text-[#74777e] outline-none focus:border-[#006591] font-body"
            onKeyDown={(e) => {
              if (e.key === "Enter" && testInput.trim()) {
                runSafetyAudit(testInput);
              }
            }}
          />
          <button
            type="button"
            disabled={isSimulating || !testInput.trim()}
            onClick={() => runSafetyAudit(testInput)}
            className="bg-[#0f2b48] hover:bg-[#00162d] text-white px-5 py-3 rounded-2xl text-xs font-headline font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            {isSimulating ? (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">verified</span>
            )}
            <span>Verify Safety</span>
          </button>
        </div>

        {/* Simulation Output Card */}
        {activeResult && (
          <div className="mt-4 p-5 rounded-2xl border transition-all animate-in fade-in duration-200 space-y-4 bg-[#f8f9ff] border-[#e5eeff]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <div>
                <span className="text-[10px] font-mono text-[#74777e] uppercase">Evaluated Proposal:</span>
                <h4 className="font-headline font-bold text-sm text-[#0f2b48]">{activeResult.candidate}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#74777e] font-mono">{activeResult.latency}ms latency</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    activeResult.status === "Approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : activeResult.status === "Remediated"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {activeResult.status}
                </span>
              </div>
            </div>

            {/* 4 Gate Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                className={`p-3 rounded-xl border ${
                  activeResult.gates.condition.pass
                    ? "bg-white border-emerald-200 text-emerald-950"
                    : "bg-red-50/70 border-red-200 text-red-950"
                }`}
              >
                <div className="font-bold flex items-center gap-1 mb-0.5">
                  <span className="material-symbols-outlined text-sm">
                    {activeResult.gates.condition.pass ? "check_circle" : "cancel"}
                  </span>
                  Gate 1: Condition Constraint
                </div>
                <p className="text-[11px] opacity-90">{activeResult.gates.condition.note}</p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  activeResult.gates.interactions.pass
                    ? "bg-white border-emerald-200 text-emerald-950"
                    : "bg-red-50/70 border-red-200 text-red-950"
                }`}
              >
                <div className="font-bold flex items-center gap-1 mb-0.5">
                  <span className="material-symbols-outlined text-sm">
                    {activeResult.gates.interactions.pass ? "check_circle" : "cancel"}
                  </span>
                  Gate 2: Drug-Drug &amp; Food Cross-Check
                </div>
                <p className="text-[11px] opacity-90">{activeResult.gates.interactions.note}</p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  activeResult.gates.allergies.pass
                    ? "bg-white border-emerald-200 text-emerald-950"
                    : "bg-red-50/70 border-red-200 text-red-950"
                }`}
              >
                <div className="font-bold flex items-center gap-1 mb-0.5">
                  <span className="material-symbols-outlined text-sm">
                    {activeResult.gates.allergies.pass ? "check_circle" : "cancel"}
                  </span>
                  Gate 3: Allergy &amp; Immunogram
                </div>
                <p className="text-[11px] opacity-90">{activeResult.gates.allergies.note}</p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  activeResult.gates.doctorGate.pass
                    ? "bg-white border-emerald-200 text-emerald-950"
                    : "bg-red-50/70 border-red-200 text-red-950"
                }`}
              >
                <div className="font-bold flex items-center gap-1 mb-0.5">
                  <span className="material-symbols-outlined text-sm">
                    {activeResult.gates.doctorGate.pass ? "check_circle" : "cancel"}
                  </span>
                  Gate 4: Doctor Directives &amp; Caps
                </div>
                <p className="text-[11px] opacity-90">{activeResult.gates.doctorGate.note}</p>
              </div>
            </div>

            {/* Auto-Remediation Banner */}
            {activeResult.remediation && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-headline font-bold text-xs">
                  <span className="material-symbols-outlined text-base">auto_fix_high</span>
                  <span>AI CLINICAL AUTO-REMEDIATION SUGGESTION</span>
                </div>
                <p className="text-xs text-amber-950">{activeResult.remediation.reason}</p>
                <div className="mt-2 p-2.5 rounded-xl bg-white border border-amber-300 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0f2b48]">{activeResult.remediation.substitute}</span>
                  <button
                    onClick={() => showToast("Adopted clinical auto-remediation into today's protocol!")}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                  >
                    Adopt Suggestion
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historical Audit Showcase from Stitch Design */}
      <div className="space-y-4">
        <h3 className="font-headline font-bold text-lg text-[#0f2b48]">Demonstrative Real-World Audit Cards</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Approved Safe Plan */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-emerald-800 uppercase font-headline">Routine Proposal #804</span>
              </div>
              <span className="text-[10px] text-[#74777e] bg-[#eff4ff] px-2 py-0.5 rounded-full font-mono">
                12ms latency
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#c9e6ff] flex items-center justify-center text-[#006591] shrink-0">
                <span className="material-symbols-outlined text-2xl">directions_walk</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-sm text-[#0f2b48]">20-Minute Moderate Walking</h4>
                <p className="text-xs text-[#74777e]">Care Assistant Automated Regimen</p>
                <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  APPROVED &amp; COMMITTED
                </span>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-2xl bg-[#eff4ff] text-[11px] text-[#0b1c30]">
              <p>✓ Aerobic safe, reduces systemic peripheral vascular resistance.</p>
              <p>✓ 100% compatible alongside Lisinopril 10mg and Metformin 500mg.</p>
              <p>✓ Zero allergen or environmental hazard cross-triggers.</p>
              <p>✓ Fulfills Dr. Vance&apos;s cardiovascular quota.</p>
            </div>
          </div>

          {/* Card 2: Intercepted Conflict */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-xs font-bold text-red-700 uppercase font-headline">Harm Neutralized #805</span>
              </div>
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                Violation Blocked
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-700 shrink-0">
                <span className="material-symbols-outlined text-2xl">block</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-sm text-[#0f2b48] line-through text-red-700">
                  Cured Prosciutto &amp; Artichoke Salad
                </h4>
                <p className="text-xs text-red-600 font-semibold">High Sodium Content Intercepted (2,840mg)</p>
                <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                  AUTO-REMEDIATED TO TURKEY SALAD
                </span>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-2xl bg-red-50 text-[11px] text-red-950">
              <p>✗ High saline content violates dietary ceiling by +840mg.</p>
              <p>✗ Triggers fluid retention contraindicating Lisinopril nocturnal dosing.</p>
              <p>✓ Auto-substituted with Lemon Herb Turkey Salad (380mg sodium).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
