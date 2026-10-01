"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function CarePlanPage() {
  const { careTasks, toggleCareTask, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"schedule" | "milestones" | "guidelines">("schedule");
  const [feedbackNote, setFeedbackNote] = useState("");

  const milestones = [
    {
      week: "Week 1",
      title: "Baseline Stabilization & Nocturnal Titration",
      status: "Completed",
      percent: 100,
      desc: "Confirmed Lisinopril 10mg tolerance with zero orthostatic hypotension events.",
    },
    {
      week: "Week 2",
      title: "Aerobic Capacity & Sodium Restriction",
      status: "Active",
      percent: 75,
      desc: "Daily 20m moderate walking + strict dietary sodium monitoring under 2,000mg.",
    },
    {
      week: "Week 3",
      title: "Glycemic Stability & Post-Prandial Balance",
      status: "Upcoming",
      percent: 20,
      desc: "Evaluate Metformin timing with meals to flatten glycemic excursions.",
    },
    {
      week: "Week 4",
      title: "Comprehensive Clinical Telemetry Audit",
      status: "Scheduled",
      percent: 0,
      desc: "Full 30-day review with Dr. Vance and updated biometric trend report.",
    },
  ];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNote.trim()) return;
    showToast("Message dispatched to Dr. Sarah Vance's clinical care team.");
    setFeedbackNote("");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0f2b48]">Care Plan</h1>
            <span className="bg-[#c9e6ff] text-[#001e2f] text-xs font-headline font-bold px-2.5 py-0.5 rounded-full">
              Protocol v2.4
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#43474d] mt-1">
            Cardiovascular Recovery &amp; Glycemic Stabilization Protocol prescribed by Dr. Sarah Vance, MD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold font-headline">
            <span className="material-symbols-outlined text-sm">verified</span>
            APPROVED &amp; COMMITTED
          </span>
        </div>
      </div>

      {/* Protocol Banner Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c9e6ff] flex items-center justify-center text-[#006591] shrink-0">
            <span className="material-symbols-outlined text-2xl">assignment_turned_in</span>
          </div>
          <div>
            <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#006591]">
              Active Clinical Regimen
            </span>
            <h2 className="font-headline font-bold text-base sm:text-lg text-[#0f2b48]">
              Cardiovascular &amp; Metabolic Care Pathway #804
            </h2>
            <p className="text-xs text-[#74777e] mt-0.5">
              Supervising Clinician: Dr. Sarah Vance, MD • Last updated: Today at 08:30 AM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => showToast("Requesting protocol review from Dr. Vance")}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#006591] text-xs font-headline font-bold transition-all text-center"
          >
            Request Change
          </button>
          <button
            onClick={() => showToast("Downloading FHIR Protocol Summary...")}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-[#0f2b48] text-white hover:bg-[#00162d] text-xs font-headline font-bold transition-all text-center"
          >
            Export Plan
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-[#eff4ff] pb-2">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all ${
            activeTab === "schedule"
              ? "bg-[#0f2b48] text-white shadow-xs"
              : "text-[#74777e] hover:text-[#0f2b48] hover:bg-[#eff4ff]"
          }`}
        >
          Daily Schedule &amp; Tasks
        </button>
        <button
          onClick={() => setActiveTab("milestones")}
          className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all ${
            activeTab === "milestones"
              ? "bg-[#0f2b48] text-white shadow-xs"
              : "text-[#74777e] hover:text-[#0f2b48] hover:bg-[#eff4ff]"
          }`}
        >
          4-Week Recovery Roadmap
        </button>
        <button
          onClick={() => setActiveTab("guidelines")}
          className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all ${
            activeTab === "guidelines"
              ? "bg-[#0f2b48] text-white shadow-xs"
              : "text-[#74777e] hover:text-[#0f2b48] hover:bg-[#eff4ff]"
          }`}
        >
          Clinical Guardrails &amp; Ceilings
        </button>
      </div>

      {/* TAB 1: Daily Schedule */}
      {activeTab === "schedule" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-base text-[#0f2b48]">Interactive Protocol Tasks</h3>
                <span className="text-xs text-[#74777e]">Click task to toggle completion</span>
              </div>

              <div className="space-y-3">
                {careTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleCareTask(task.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      task.completed
                        ? "bg-[#f8f9ff] border-[#e5eeff] opacity-75"
                        : "bg-white border-[#c4c6ce]/40 hover:border-[#006591] shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                          task.completed
                            ? "bg-[#006591] text-white"
                            : "border-2 border-[#c4c6ce] text-transparent hover:border-[#006591]"
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

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006591] uppercase">
                      {task.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Doctor Note Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006591]">forum</span>
              <h3 className="font-headline font-bold text-sm text-[#0f2b48]">Message Dr. Vance&apos;s Team</h3>
            </div>
            <p className="text-xs text-[#74777e]">
              Have questions about your care plan? Send a secure asynchronous query directly to the cardiology team.
            </p>

            <form onSubmit={handleSendFeedback} className="space-y-3">
              <textarea
                rows={4}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Describe symptoms, schedule conflicts, or medication concerns..."
                className="w-full p-3 rounded-2xl bg-[#eff4ff] border border-[#c4c6ce]/30 text-xs text-[#0f2b48] placeholder:text-[#74777e] outline-none focus:border-[#006591] font-body"
              />
              <button
                type="submit"
                className="w-full bg-[#0f2b48] hover:bg-[#00162d] text-white py-2.5 rounded-xl text-xs font-headline font-bold transition-all shadow-xs"
              >
                Send Secure Clinical Note
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Milestones */}
      {activeTab === "milestones" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e5eeff] space-y-6">
          <div>
            <h3 className="font-headline font-bold text-base text-[#0f2b48]">4-Week Protocol Progress</h3>
            <p className="text-xs text-[#74777e]">Phase 2 of 4: Aerobic capacity &amp; sodium restriction active</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#006591] bg-white px-2 py-0.5 rounded">
                    {m.week}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.status === "Completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : m.status === "Active"
                        ? "bg-[#c9e6ff] text-[#001e2f]"
                        : "bg-[#e5eeff] text-[#74777e]"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-[#0f2b48]">{m.title}</h4>
                  <p className="text-xs text-[#43474d] mt-1">{m.desc}</p>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[#74777e] mb-1 font-semibold">
                    <span>Milestone Completion</span>
                    <span>{m.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#e5eeff] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.status === "Completed" ? "bg-emerald-600" : "bg-[#006591]"
                      }`}
                      style={{ width: `${m.percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Guidelines & Ceilings */}
      {activeTab === "guidelines" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e5eeff] space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006591]">health_and_safety</span>
              <h3 className="font-headline font-bold text-sm text-[#0f2b48]">Physiological Ceilings</h3>
            </div>
            <ul className="text-xs text-[#43474d] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-[#006591] mt-0.5">check_circle</span>
                <span>
                  <strong>Systolic BP Ceiling:</strong> 135 mmHg (Target &lt;130 mmHg).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-[#006591] mt-0.5">check_circle</span>
                <span>
                  <strong>Diastolic BP Ceiling:</strong> 85 mmHg (Target &lt;80 mmHg).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-[#006591] mt-0.5">check_circle</span>
                <span>
                  <strong>Exercise Heart Rate Ceiling:</strong> 130 bpm during moderate walking.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e5eeff] space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006591]">restaurant</span>
              <h3 className="font-headline font-bold text-sm text-[#0f2b48]">Dietary &amp; Lifestyle Quotas</h3>
            </div>
            <ul className="text-xs text-[#43474d] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-[#006591] mt-0.5">check_circle</span>
                <span>
                  <strong>Sodium Cap:</strong> Strict maximum 2,000 mg/day (DASH cardiovascular protocol).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-[#006591] mt-0.5">check_circle</span>
                <span>
                  <strong>Hydration Target:</strong> 2.0 to 2.5 Liters of water daily.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-[#006591] mt-0.5">check_circle</span>
                <span>
                  <strong>Daily Aerobic Target:</strong> 20–30 minutes continuous brisk walking.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
