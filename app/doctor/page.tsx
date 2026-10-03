"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import CareAdherenceMeter from "@/components/CareAdherenceMeter";
import { calculateAdherence } from "@/lib/adherenceUtils";
import type { DayOfWeek, HealthUpdate } from "@/lib/adherenceUtils";

export type DoctorTab = "overview" | "roster" | "record" | "insights" | "protocols";

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  bed?: string;
  room?: string;
  careProgram?: string;
  diagnosis: string;
  status: "stable" | "monitor" | "attention";
  syncScore: number;
  medAdherence: number;
  exercisePlan: number;
  lastUpdated: string;
  avatar?: string;
  initials?: string;
  vitals?: {
    bp: string;
    hr: number;
    spo2: number;
    glucose: number;
  };
  allergy?: {
    allergen: string;
    reaction: string;
  };
  notes?: string;
  /** Care update adherence percentage (0-100) */
  updateAdherence: number;
  /** Human-readable label for last health update submission */
  lastHealthUpdate: string;
  /** Scheduled update days for this patient */
  scheduledDays: DayOfWeek[];
  /** Submitted health updates (mock) */
  submittedUpdates: HealthUpdate[];
}

const ALL_PATIENTS: PatientRecord[] = [
  {
    id: "VS-1012",
    name: "Meera Nair",
    age: 45,
    gender: "F",
    bed: "4B-12",
    room: "Room 412",
    diagnosis: "Post-Op Cardiac Telemetry",
    status: "attention",
    syncScore: 61,
    medAdherence: 58,
    exercisePlan: 52,
    lastUpdated: "Yesterday, 19:40",
    updateAdherence: 48,
    lastHealthUpdate: "5 days ago",
    scheduledDays: ["Monday", "Wednesday", "Friday"],
    submittedUpdates: [],
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGNVh1nte9kwr-mVUQ8FlDY9HLKY9rPgj1yPC0qRp47BIpwWJapiVbL9ko_r5YzFdUZ8qBWXKh1Uef-S7tqBoxevpPBcdlPd4NNna3vgdoU_FuxEt1iyeBQoWDjlNAoGb855CkQuyhcMdbf1ehvbLfJLD2efETrCBl4mxDAl2o_zes_WSLmZbyQ6-0MdvvkJIoLAwuuS8aCSfzZGby6NUFwtdIt4LmTaS27serxENYeQLraEmcyA7Yow",
    vitals: { bp: "142/88", hr: 88, spo2: 97, glucose: 134 },
    allergy: { allergen: "Sulfa Drugs", reaction: "Anaphylaxis" },
    notes: "Medication adherence dropped to 58%. Missed 3 evening doses of Lisinopril. High priority telemetry follow-up scheduled.",
  },
  {
    id: "VS-1019",
    name: "David Chen",
    age: 58,
    gender: "M",
    bed: "4B-04",
    room: "Room 404",
    diagnosis: "Heart Failure Stage C",
    status: "attention",
    syncScore: 59,
    medAdherence: 52,
    exercisePlan: 48,
    lastUpdated: "Today, 06:20 AM",
    updateAdherence: 25,
    lastHealthUpdate: "9 days ago",
    scheduledDays: ["Monday", "Thursday"],
    submittedUpdates: [],
    initials: "DC",
    vitals: { bp: "138/90", hr: 84, spo2: 95, glucose: 140 },
    allergy: { allergen: "Aspirin", reaction: "GI Bleeding" },
    notes: "Fluid retention monitored. BNP elevated at 480 pg/mL. Furosemide titration under review.",
  },
  {
    id: "VS-1038",
    name: "Rahul Sharma",
    age: 31,
    gender: "M",
    bed: "4B-07",
    room: "Room 407",
    diagnosis: "Hypertension (Stage 2)",
    status: "monitor",
    syncScore: 68,
    medAdherence: 74,
    exercisePlan: 61,
    lastUpdated: "Today, 07:45 AM",
    updateAdherence: 72,
    lastHealthUpdate: "2 days ago",
    scheduledDays: ["Monday", "Wednesday", "Friday"],
    submittedUpdates: [],
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdh0KKWwSWkjzbRvNsPC7Y3DdOO4XXzESRUNMt6ADhODQnpj1gwk1fMLR1tsFUpZQldu0N7gw0L4VMGZxPrfks3vVxTlMDJZprMArVTDpwtZdo_MNyrto_sX-qaKQbuYA1U8Wx-WjBmq9SvnAfw_w_r9AyQIALO4YMO_3ezmJOBh0gmiXxBlE0uzOs5DP6cnmabswzFiQt9Nm2zaK5oczft-G_is39tppEMFmlzQPuaqYh42pLZACqag",
    vitals: { bp: "148/94", hr: 78, spo2: 98, glucose: 104 },
    notes: "Resting systolic trended from 132 to 148 mmHg over 72 hours. Beta-blocker titration recommended.",
  },
  {
    id: "VS-1044",
    name: "Sarah Jenkins",
    age: 63,
    gender: "F",
    bed: "4B-15",
    room: "Room 415",
    diagnosis: "Post-PCI Stenting",
    status: "monitor",
    syncScore: 71,
    medAdherence: 76,
    exercisePlan: 68,
    lastUpdated: "Today, 08:00 AM",
    updateAdherence: 64,
    lastHealthUpdate: "Today",
    scheduledDays: ["Tuesday", "Friday"],
    submittedUpdates: [],
    initials: "SJ",
    vitals: { bp: "128/82", hr: 68, spo2: 98, glucose: 112 },
    notes: "Dual antiplatelet therapy compliance monitored. No chest tightness reported.",
  },
  {
    id: "VS-1052",
    name: "Elena Rostova",
    age: 39,
    gender: "F",
    bed: "4B-19",
    room: "Room 419",
    diagnosis: "Atrial Fibrillation",
    status: "monitor",
    syncScore: 69,
    medAdherence: 70,
    exercisePlan: 64,
    lastUpdated: "Today, 08:10 AM",
    updateAdherence: 80,
    lastHealthUpdate: "Today",
    scheduledDays: ["Monday", "Wednesday", "Friday"],
    submittedUpdates: [],
    initials: "ER",
    vitals: { bp: "124/80", hr: 82, spo2: 99, glucose: 98 },
    notes: "Holter telemetry indicates episodic paroxysmal rhythm. Anticoagulation steady.",
  },
  {
    id: "VS-1061",
    name: "Marcus Brody",
    age: 48,
    gender: "M",
    bed: "4B-21",
    room: "Room 421",
    diagnosis: "Coronary Artery Disease",
    status: "monitor",
    syncScore: 73,
    medAdherence: 78,
    exercisePlan: 66,
    lastUpdated: "Today, 08:12 AM",
    updateAdherence: 75,
    lastHealthUpdate: "Yesterday",
    scheduledDays: ["Monday", "Thursday", "Saturday"],
    submittedUpdates: [],
    initials: "MB",
    vitals: { bp: "130/84", hr: 74, spo2: 97, glucose: 118 },
    notes: "Post-exercise ischemia test negative. Statin adherence compliant.",
  },
  {
    id: "VS-1024",
    name: "Anu Kumar",
    age: 24,
    gender: "F",
    bed: "4B-02",
    room: "Room 302",
    diagnosis: "Type 2 Diabetes (Diagnosed 2024)",
    status: "stable",
    syncScore: 82,
    medAdherence: 94,
    exercisePlan: 88,
    lastUpdated: "Today, 08:15 AM",
    updateAdherence: 94,
    lastHealthUpdate: "Today",
    scheduledDays: ["Monday", "Wednesday", "Friday"],
    submittedUpdates: [],
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAO-bEX6Mp3I51snRFdo6HbusDwl2xB4UarbrqnHru1DqDQPqMxGNDfqi3tjP0ed9sfniaVHURbyiE89sM-qCHa3CzqQMX-C9439OGVcMRCRl9LtOGE_wBlQy2m62o-qJY9bTrPB--plW5XWfDol-cuZsZPkbYD1PXKvpEJTyAUQYhujnUtebPtERVKldfO6byejn1htzVsDATIroD2YEuXYP4Bqf2LKBxYPTM0qt5GYfiVY26KfCx42A",
    vitals: { bp: "118/76", hr: 72, spo2: 99, glucose: 108 },
    allergy: { allergen: "Penicillin", reaction: "Severe Rash" },
    notes: "Maintaining stable glycemic control. Diet adherence solid. Continue current Metformin dosage and daily 30m brisk walking.",
  },
  {
    id: "VS-1077",
    name: "Sunita Patel",
    age: 52,
    gender: "F",
    bed: "4B-08",
    room: "Room 408",
    diagnosis: "Dyslipidemia & Mild HTN",
    status: "stable",
    syncScore: 86,
    medAdherence: 92,
    exercisePlan: 84,
    lastUpdated: "Today, 09:15 AM",
    updateAdherence: 88,
    lastHealthUpdate: "Today",
    scheduledDays: ["Monday", "Wednesday"],
    submittedUpdates: [],
    initials: "SP",
    vitals: { bp: "122/78", hr: 70, spo2: 99, glucose: 95 },
    notes: "LDL reduced to 88 mg/dL on Atorvastatin 20mg. Target met.",
  },
  {
    id: "VS-1083",
    name: "James Wilson",
    age: 44,
    gender: "M",
    bed: "4B-11",
    room: "Room 411",
    diagnosis: "Post-Myocarditis Follow-up",
    status: "stable",
    syncScore: 88,
    medAdherence: 95,
    exercisePlan: 86,
    lastUpdated: "Today, 09:30 AM",
    updateAdherence: 91,
    lastHealthUpdate: "Today",
    scheduledDays: ["Monday", "Wednesday", "Friday", "Sunday"],
    submittedUpdates: [],
    initials: "JW",
    vitals: { bp: "116/74", hr: 66, spo2: 99, glucose: 92 },
    notes: "Troponin normalized. Echo shows preserved ejection fraction (60%).",
  },
  {
    id: "VS-1090",
    name: "Aisha Al-Mansoor",
    age: 29,
    gender: "F",
    bed: "4B-14",
    room: "Room 414",
    diagnosis: "Gestational HTN Protocol",
    status: "stable",
    syncScore: 91,
    medAdherence: 98,
    exercisePlan: 90,
    lastUpdated: "Today, 10:00 AM",
    updateAdherence: 100,
    lastHealthUpdate: "Today",
    scheduledDays: ["Monday", "Wednesday", "Friday"],
    submittedUpdates: [],
    initials: "AA",
    vitals: { bp: "114/72", hr: 76, spo2: 99, glucose: 89 },
    notes: "Fetal Doppler check normal. Labetalol 100mg BID effective.",
  },
  {
    id: "VS-1095",
    name: "Carlos Mendez",
    age: 47,
    gender: "M",
    bed: "4B-16",
    room: "Room 416",
    diagnosis: "Cardiometabolic Syndrome",
    status: "stable",
    syncScore: 84,
    medAdherence: 89,
    exercisePlan: 82,
    lastUpdated: "Today, 10:20 AM",
    updateAdherence: 83,
    lastHealthUpdate: "Today",
    scheduledDays: ["Tuesday", "Thursday", "Saturday"],
    submittedUpdates: [],
    initials: "CM",
    vitals: { bp: "126/80", hr: 71, spo2: 98, glucose: 114 },
    notes: "Weight loss 3.2 kg over 30 days. HbA1c down from 7.4 to 6.8%.",
  },
  {
    id: "VS-1102",
    name: "Maria Santos",
    age: 51,
    gender: "F",
    bed: "4B-25",
    room: "Room 425",
    diagnosis: "Post-Valve Repair Day 5",
    status: "stable",
    syncScore: 92,
    medAdherence: 97,
    exercisePlan: 91,
    lastUpdated: "Today, 12:30 PM",
    updateAdherence: 96,
    lastHealthUpdate: "Today",
    scheduledDays: ["Monday", "Wednesday", "Friday"],
    submittedUpdates: [],
    initials: "MS",
    vitals: { bp: "115/75", hr: 68, spo2: 99, glucose: 96 },
    notes: "Incision healing cleanly. INR within target therapeutic range 2.3.",
  },
];

export default function DoctorPortalPage() {
  const router = useRouter();
  const { showToast, switchUser, activeCondition } = useApp();

  const [activeTab, setActiveTab] = useState<DoctorTab>("overview");
  const [filterAcuity, setFilterAcuity] = useState<"all" | "attention" | "monitor" | "stable">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("VS-1024");
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [planTitrated, setPlanTitrated] = useState(false);

  // Selected patient details
  const currentPatient = useMemo(() => {
    return ALL_PATIENTS.find((p) => p.id === selectedPatientId) || ALL_PATIENTS[6];
  }, [selectedPatientId]);

  // Care adherence result for currently selected patient
  const currentPatientAdherence = useMemo(() => {
    return calculateAdherence({
      scheduledDays: currentPatient.scheduledDays,
      submittedUpdates: currentPatient.submittedUpdates,
    });
  }, [currentPatient]);

  // Filtered patients for Overview / Roster
  const filteredPatients = useMemo(() => {
    return ALL_PATIENTS.filter((p) => {
      const matchesAcuity = filterAcuity === "all" || p.status === filterAcuity;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAcuity && matchesSearch;
    });
  }, [filterAcuity, searchQuery]);

  const counts = useMemo(() => {
    const attention = ALL_PATIENTS.filter((p) => p.status === "attention").length;
    const monitor = ALL_PATIENTS.filter((p) => p.status === "monitor").length;
    const stable = ALL_PATIENTS.filter((p) => p.status === "stable").length;
    return { total: ALL_PATIENTS.length, attention, monitor, stable };
  }, []);

  const handleSelectPatientForRecord = (id: string, tab: DoctorTab = "record") => {
    setSelectedPatientId(id);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen -mt-2 sm:-mt-4 pb-24 text-[#0b1c30]">
      {/* Top Clinical Bar / Clinical Suite Banner */}
      <div className="bg-[#041427] text-white rounded-3xl p-5 sm:p-6 mb-6 shadow-xl border border-[#0f766e]/30 relative overflow-hidden">
        {/* Ambient Aurora Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_70%_20%,rgba(15,118,110,0.45),transparent_70%)] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(circle_at_20%_80%,rgba(0,99,153,0.35),transparent_70%)] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0f766e] flex items-center justify-center text-white shadow-lg ring-2 ring-[#80d5cb]/30">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                <circle cx="19" cy="12" fill="currentColor" r="1.5"></circle>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                  VITALSYNC CLINICAL PORTAL
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0f766e] text-[#a3faef] text-[10px] font-bold uppercase tracking-wider">
                  Attending MD
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="text-[#a3faef] font-semibold">{activeCondition || "Cardiology & Chronic Care"}</span>
                <span className="text-teal-400">•</span>
                <span>Remote Patient Monitoring (RPM)</span>
                <span className="text-teal-400">•</span>
                <span className="text-[#80d5cb] font-semibold">Active Roster</span>
              </p>
            </div>
          </div>

          {/* Right Status Badges & Switch Role */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#08223f] px-3.5 py-2 rounded-xl border border-slate-700/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjwO7IopO4JFzf3kmP7hqwb8DOPKQAMfdtGtWOWoQEH5-05c34Q-VCUuwNrtv9j2MbrqY40u67PZu-zSpN9sVg72D1JcbPNOmnT2X18GPmn8BneJXLNYvnsb0LM8kEkdKn5BFMjCrFAhQSa5-KwkBiXMukWzNrzBjRJtzNliP6RvdQU2HXOxaDRTdsxCmAwwX0j1i9BRi0mqpaT7CHyYvQ6HtuOKS0_HZ2PjYIjbFeE5xAPbcHBPEx8A"
                alt="Dr. Thomas"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0f766e]"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Dr. Thomas, MD</p>
                <p className="text-[10px] text-teal-300 font-mono">Attending Physician</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Live Telemetry Connected"></span>
            </div>

            <Link
              href="/"
              onClick={() => switchUser("patient")}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/15"
              title="Switch back to Patient Portal view"
            >
              <span className="material-symbols-outlined text-[16px]">switch_account</span>
              <span className="hidden sm:inline">Patient Portal</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-[#0f766e] text-white shadow-md ring-1 ring-[#80d5cb]/40"
                : "bg-[#08223f] text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            <span>1. Overview</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">24</span>
          </button>

          <button
            onClick={() => setActiveTab("roster")}
            className={`px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "roster"
                ? "bg-[#0f766e] text-white shadow-md ring-1 ring-[#80d5cb]/40"
                : "bg-[#08223f] text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span>2. Authorized Roster</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">24</span>
          </button>

          <button
            onClick={() => setActiveTab("record")}
            className={`px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "record"
                ? "bg-[#0f766e] text-white shadow-md ring-1 ring-[#80d5cb]/40"
                : "bg-[#08223f] text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
            <span>3. Patient Chart ({currentPatient.name.split(" ")[0]})</span>
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "insights"
                ? "bg-[#0f766e] text-white shadow-md ring-1 ring-[#80d5cb]/40"
                : "bg-[#08223f] text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>4. AI Insights</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold">3</span>
          </button>

          <button
            onClick={() => setActiveTab("protocols")}
            className={`px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "protocols"
                ? "bg-[#0f766e] text-white shadow-md ring-1 ring-[#80d5cb]/40"
                : "bg-[#08223f] text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
            <span>5. Care Protocols</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW (DOCTOR DASHBOARD) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Greeting Section */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cde5ff] text-[#001d32] text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-[#006399]"></span>
                <span>Morning Rounds • 08:30 - 16:30</span>
              </div>
              <h2 className="font-headline font-bold text-xl sm:text-2xl text-[#0b1c30]">
                Good Morning, Dr. Thomas
              </h2>
              <p className="text-slate-600 text-sm mt-0.5">
                Review your authorized patients and manage today&apos;s hemodynamic care plans.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast("Exporting clinical morning round log (HL7 FHIR)...")}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Export Rounds</span>
              </button>
              <button
                onClick={() => setActiveTab("roster")}
                className="px-3.5 py-2 rounded-xl bg-[#0f766e] hover:bg-[#0d625b] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">group</span>
                <span>Full Roster (24)</span>
              </button>
            </div>
          </section>

          {/* Metric Summary Grid (4 Cards) */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Patients</span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#005c55] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="font-headline font-extrabold text-2xl sm:text-3xl text-[#0b1c30]">{counts.total}</span>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">Authorized patients</p>
              </div>
            </div>

            {/* Card 2: Stable */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stable</span>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Normal</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="font-headline font-extrabold text-2xl sm:text-3xl text-emerald-700">{counts.stable}</span>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">No immediate concerns</p>
              </div>
            </div>

            {/* Card 3: Monitor */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monitor</span>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#cde5ff] text-[#004f7b] text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006399]"></span>
                  <span>Watch</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="font-headline font-extrabold text-2xl sm:text-3xl text-[#006399]">{counts.monitor}</span>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">Telemetry check</p>
              </div>
            </div>

            {/* Card 4: Needs Attention */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Attention</span>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                  <span>Action</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="font-headline font-extrabold text-2xl sm:text-3xl text-[#ba1a1a]">{counts.attention}</span>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">Requires review</p>
              </div>
            </div>
          </section>

          {/* Urgent Clinical Alert Banner */}
          {!dismissedAlert && (
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-200 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ba1a1a]"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
                <div className="flex items-start gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-rose-200"
                    alt="Meera Nair"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGNVh1nte9kwr-mVUQ8FlDY9HLKY9rPgj1yPC0qRp47BIpwWJapiVbL9ko_r5YzFdUZ8qBWXKh1Uef-S7tqBoxevpPBcdlPd4NNna3vgdoU_FuxEt1iyeBQoWDjlNAoGb855CkQuyhcMdbf1ehvbLfJLD2efETrCBl4mxDAl2o_zes_WSLmZbyQ6-0MdvvkJIoLAwuuS8aCSfzZGby6NUFwtdIt4LmTaS27serxENYeQLraEmcyA7Yow"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">warning</span>
                      <span className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wide">
                        Critical Adherence Drop • Alerted 22m ago
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="font-headline font-bold text-base text-[#0b1c30]">Meera Nair</h3>
                      <span className="text-xs text-slate-500 font-mono">Bed 4B-12</span>
                      <span className="text-xs text-slate-500">• 45y F</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Medication adherence dropped to <strong className="text-rose-600 font-bold">58%</strong>. Post-Op cardiac telemetry review recommended.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setDismissedAlert(true);
                      showToast("Alert dismissed for Meera Nair.");
                    }}
                    className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleSelectPatientForRecord("VS-1012")}
                    className="h-9 px-4 rounded-xl bg-[#ba1a1a] hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Review Patient</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Today's Patient Overview & Acuity Filter Tabs */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline font-bold text-lg text-[#0b1c30]">Today&apos;s Patient Overview</h2>
                  <span className="text-xs text-[#0f766e] font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full">
                    Sorted by Acuity
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Priority queue for morning rounds</p>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setFilterAcuity("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    filterAcuity === "all"
                      ? "bg-[#0f766e] text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All (24)
                </button>
                <button
                  onClick={() => setFilterAcuity("attention")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    filterAcuity === "attention"
                      ? "bg-[#ba1a1a] text-white shadow-xs"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  Needs Attention (2)
                </button>
                <button
                  onClick={() => setFilterAcuity("monitor")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    filterAcuity === "monitor"
                      ? "bg-[#006399] text-white shadow-xs"
                      : "bg-blue-50 text-[#004f7b] hover:bg-blue-100"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  Monitor (4)
                </button>
                <button
                  onClick={() => setFilterAcuity("stable")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    filterAcuity === "stable"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  Stable (18)
                </button>
              </div>
            </div>

            {/* Patients List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPatients.map((patient) => {
                const isAttention = patient.status === "attention";
                const isMonitor = patient.status === "monitor";

                return (
                  <article
                    key={patient.id}
                    className={`rounded-2xl p-4 transition-all border ${
                      isAttention
                        ? "bg-rose-50/40 border-rose-200/80 hover:border-rose-300"
                        : isMonitor
                        ? "bg-[#f4f8ff] border-blue-200/70 hover:border-blue-300"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    } shadow-xs hover:shadow-md flex flex-col justify-between gap-3`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {patient.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={patient.avatar}
                            alt={patient.name}
                            className="w-11 h-11 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          />
                        ) : (
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                              isAttention
                                ? "bg-rose-200 text-rose-800"
                                : isMonitor
                                ? "bg-blue-200 text-blue-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {patient.initials || patient.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-headline font-bold text-sm text-[#0b1c30] truncate">{patient.name}</h3>
                            <span className="text-[11px] text-slate-500">
                              {patient.age}y • {patient.gender}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            {patient.diagnosis} • <span className="font-medium text-teal-700">Outpatient RPM</span>
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                          isAttention
                            ? "bg-rose-100 text-rose-700"
                            : isMonitor
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {isAttention ? "Needs Attention" : isMonitor ? "Monitor" : "Stable"}
                      </span>
                    </div>

                    {/* Metric pill row */}
                    <div className="grid grid-cols-4 gap-2 bg-white/80 rounded-xl p-2 text-center border border-slate-100 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Sync Score</span>
                        <span className={`font-mono font-bold ${patient.syncScore < 65 ? "text-rose-600" : "text-slate-800"}`}>
                          {patient.syncScore}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Med Adherence</span>
                        <span
                          className={`font-mono font-bold ${
                            patient.medAdherence < 60
                              ? "text-rose-600"
                              : patient.medAdherence < 80
                              ? "text-[#006399]"
                              : "text-emerald-600"
                          }`}
                        >
                          {patient.medAdherence}%
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Exercise</span>
                        <span className="font-mono font-bold text-slate-800">{patient.exercisePlan}%</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Update Adh.</span>
                        <span
                          className={`font-mono font-bold ${
                            patient.updateAdherence < 40
                              ? "text-rose-600"
                              : patient.updateAdherence < 60
                              ? "text-amber-600"
                              : patient.updateAdherence < 80
                              ? "text-[#006399]"
                              : "text-emerald-600"
                          }`}
                        >
                          {patient.updateAdherence}%
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          <span>{patient.lastUpdated}</span>
                        </span>
                        <span className={`text-[10px] font-bold ${
                          patient.updateAdherence < 40 ? "text-rose-600" :
                          patient.updateAdherence < 60 ? "text-amber-600" :
                          patient.updateAdherence < 80 ? "text-[#006399]" : "text-emerald-600"
                        }`}>
                          Update adherence: {patient.updateAdherence}% • {patient.lastHealthUpdate}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectPatientForRecord(patient.id)}
                        className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          isAttention
                            ? "bg-[#ba1a1a] text-white hover:bg-rose-800 shadow-xs"
                            : "bg-[#eff4ff] text-[#0f766e] hover:bg-[#0f766e] hover:text-white"
                        }`}
                      >
                        <span>View Patient</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: AUTHORIZED ROSTER */}
      {activeTab === "roster" && (
        <div className="space-y-5">
          {/* Header Controls */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-headline font-bold text-xl text-[#0b1c30]">Authorized Patients Directory</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#0f766e]"></span>
                  <span>24 Patients Active on Telemetry Streams</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast("Quick admit modal / SMART on FHIR integration initiated.")}
                  className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0f766e] text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Quick Admit</span>
                </button>
                <button
                  onClick={() => showToast("Exporting roster CSV...")}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient name, ID (e.g. VS-1024), room, or condition..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Acuity Filter tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  onClick={() => setFilterAcuity("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                    filterAcuity === "all" ? "bg-[#0f766e] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All (24)
                </button>
                <button
                  onClick={() => setFilterAcuity("stable")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                    filterAcuity === "stable" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Stable (18)
                </button>
                <button
                  onClick={() => setFilterAcuity("monitor")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                    filterAcuity === "monitor" ? "bg-[#006399] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Monitor (4)
                </button>
                <button
                  onClick={() => setFilterAcuity("attention")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                    filterAcuity === "attention" ? "bg-[#ba1a1a] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Needs Attention (2)
                </button>
              </div>
            </div>
          </div>

          {/* Roster Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-slate-200 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {patient.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-100 text-[#0f766e] flex items-center justify-center font-bold text-sm">
                          {patient.initials || patient.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" title="Telemetry Online"></span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-sm text-[#0b1c30] group-hover:text-[#0f766e] transition-colors">
                        {patient.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="font-mono">{patient.id}</span>
                        <span>•</span>
                        <span>Outpatient RPM</span>
                      </p>
                      <p className="text-xs text-slate-600 truncate mt-0.5">{patient.diagnosis}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      patient.status === "attention"
                        ? "bg-rose-100 text-rose-700"
                        : patient.status === "monitor"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                {/* Score & Vitals mini preview */}
                <div className="bg-slate-50 rounded-xl p-2.5 grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Health Score</span>
                    <span className="font-headline font-bold text-base text-[#0b1c30]">{patient.syncScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Med Adh.</span>
                    <span className={`font-mono font-bold ${patient.medAdherence < 70 ? "text-rose-600" : "text-[#0f766e]"}`}>{patient.medAdherence}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Update Adh.</span>
                    <span className={`font-mono font-bold ${
                      patient.updateAdherence < 40 ? "text-rose-600" :
                      patient.updateAdherence < 60 ? "text-amber-600" :
                      patient.updateAdherence < 80 ? "text-[#006399]" : "text-emerald-600"
                    }`}>{patient.updateAdherence}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleSelectPatientForRecord(patient.id, "protocols")}
                    className="text-xs font-semibold text-slate-600 hover:text-[#0f766e] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">clinical_notes</span>
                    <span>Care Plan</span>
                  </button>

                  <button
                    onClick={() => handleSelectPatientForRecord(patient.id, "record")}
                    className="h-8 px-3 rounded-lg bg-[#0f766e] hover:bg-[#0d625b] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>View Record</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PATIENT RECORD (DETAILS FOR CURRENT PATIENT) */}
      {activeTab === "record" && (
        <div className="space-y-5">
          {/* Patient Header Card */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentPatient.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentPatient.avatar}
                    alt={currentPatient.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#0f766e]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-teal-100 text-[#0f766e] flex items-center justify-center font-bold text-xl">
                    {currentPatient.initials || currentPatient.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline font-bold text-xl sm:text-2xl text-[#0b1c30]">{currentPatient.name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      currentPatient.status === "attention"
                        ? "bg-rose-100 text-rose-700"
                        : currentPatient.status === "monitor"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {currentPatient.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                    {currentPatient.id}
                  </span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                  Age: {currentPatient.age} • Gender: {currentPatient.gender} • Outpatient Remote Care
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span>Last biometric telemetry sync: {currentPatient.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("protocols")}
                className="h-10 px-4 rounded-xl bg-[#0f766e] hover:bg-[#0d625b] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Update Care Plan</span>
              </button>
              <button
                onClick={() => setActiveTab("roster")}
                className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">people</span>
                <span>Switch Patient</span>
              </button>
            </div>
          </section>

          {/* Clinical Overview & Conditions */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0f766e] text-[20px]">monitor_heart</span>
                  <h3 className="font-headline font-bold text-base text-[#0b1c30]">Clinical Diagnoses</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active Remote Care</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-slate-500 text-[18px] mt-0.5">stethoscope</span>
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">Primary Diagnosis</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {currentPatient.id === "VS-1024" ? (activeCondition || currentPatient.diagnosis) : currentPatient.diagnosis}
                    </span>
                  </div>
                </div>

                {currentPatient.allergy ? (
                  <div className="p-3 bg-rose-50 rounded-xl flex items-start justify-between gap-2 border border-rose-100">
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-rose-600 text-[18px] mt-0.5">warning</span>
                      <div>
                        <span className="text-[11px] text-rose-600 uppercase font-bold tracking-wider block">Allergy Alert</span>
                        <span className="text-sm font-semibold text-rose-900">{currentPatient.allergy.allergen}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-bold">
                      {currentPatient.allergy.reaction}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                    No active drug contraindications logged.
                  </div>
                )}
              </div>

              {/* Physician Notes */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f766e] mb-1">
                  <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                  <span>Attending Physician Directives (Dr. Thomas)</span>
                </div>
                <p className="text-xs text-slate-700 italic bg-teal-50/50 p-2.5 rounded-xl border border-teal-100/60">
                  &ldquo;{currentPatient.notes || "Vitals within targeted therapeutic window. Continue daily compliance review."}&rdquo;
                </p>
              </div>
            </div>

            {/* Vitals Summary Grid */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0f766e] text-[20px]">vital_signs</span>
                  <h3 className="font-headline font-bold text-base text-[#0b1c30]">Continuous Telemetry Vitals</h3>
                </div>
                <span className="text-[11px] text-[#0f766e] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Stream
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Blood Pressure</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline font-bold text-xl text-[#0b1c30]">{currentPatient.vitals?.bp || "120/80"}</span>
                    <span className="text-xs text-slate-500">mmHg</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Normal Range</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Heart Rate</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline font-bold text-xl text-[#0b1c30]">{currentPatient.vitals?.hr || 72}</span>
                    <span className="text-xs text-slate-500">bpm</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Sinus Rhythm</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Oxygen (SpO2)</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline font-bold text-xl text-[#0b1c30]">{currentPatient.vitals?.spo2 || 98}</span>
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Optimal</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Fasting Glucose</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline font-bold text-xl text-[#0b1c30]">{currentPatient.vitals?.glucose || 105}</span>
                    <span className="text-xs text-slate-500">mg/dL</span>
                  </div>
                  <span className="text-[10px] text-[#006399] font-semibold mt-1 block">Pre-prandial</span>
                </div>
              </div>

              {/* Longitudinal Biomarker Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Sync Score:</span>
                  <strong className="text-[#0b1c30] ml-1 font-mono">{currentPatient.syncScore}/100</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Med Adherence:</span>
                  <strong className="text-[#0f766e] ml-1 font-mono">{currentPatient.medAdherence}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Exercise:</span>
                  <strong className="text-slate-800 ml-1 font-mono">{currentPatient.exercisePlan}%</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Care Adherence Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CareAdherenceMeter
                result={currentPatientAdherence}
                variant="doctor-chart"
                patientName={currentPatient.name}
              />
            </div>

            {/* Scheduled Days + Quick Actions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#0f766e] text-[20px]">calendar_month</span>
                  <h3 className="font-headline font-bold text-base text-[#0b1c30]">Update Schedule</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Scheduled update days</p>
                  <div className="flex flex-wrap gap-2">
                    {currentPatient.scheduledDays.map((day) => (
                      <span key={day} className="px-3 py-1 rounded-full bg-[#eff4ff] text-[#006399] text-xs font-bold border border-[#c4daff]">
                        {day}
                      </span>
                    ))}
                    {currentPatient.scheduledDays.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No schedule set</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Adherence Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Update Adherence</span>
                      <span className={`font-headline font-bold text-lg ${
                        currentPatient.updateAdherence < 40 ? "text-rose-600" :
                        currentPatient.updateAdherence < 60 ? "text-amber-600" :
                        currentPatient.updateAdherence < 80 ? "text-[#006399]" : "text-emerald-600"
                      }`}>{currentPatient.updateAdherence}%</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Last Health Update</span>
                      <span className="font-bold text-sm text-[#0b1c30]">{currentPatient.lastHealthUpdate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Quick Actions</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSelectPatientForRecord(currentPatient.id, "protocols")}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0f766e] hover:bg-[#0d625b] text-white text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                    View Care Protocols
                  </button>
                  <button
                    onClick={() => showToast(`Sending adherence reminder to ${currentPatient.name}...`)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Send Update Reminder
                  </button>
                  <button
                    onClick={() => showToast(`Viewing health reports for ${currentPatient.name}...`)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">description</span>
                    View Health Reports
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: AI CLINICAL INSIGHTS */}
      {activeTab === "insights" && (
        <div className="space-y-5">
          {/* Header */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-bold text-xl text-[#0b1c30]">AI Clinical Insights Engine</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0f766e] text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-pulse"></span>
                  3 Active Trends
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically detected anomalies, biometric drifts, and pharmacokinetic safety flags.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              Model: MedLM-Clinical-v3
            </span>
          </div>

          {/* Physician Oversight Notice */}
          <div className="p-4 rounded-2xl bg-[#eff4ff] border border-blue-100 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#006399] text-[20px] shrink-0 mt-0.5">verified_user</span>
            <div>
              <h4 className="text-xs font-bold text-[#004f7b] uppercase tracking-wider">Physician Oversight Protocol</h4>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                Assistive observations generated from patient remote monitoring and pharmacy telemetry. All recommendations require clinical evaluation and doctor approval before action.
              </p>
            </div>
          </div>

          {/* Finding 1: Priority Alert (Meera Nair) */}
          <article className="bg-white rounded-2xl p-5 shadow-sm border border-rose-200 relative overflow-hidden flex flex-col gap-3">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#ba1a1a]"></div>
            <div className="flex items-start justify-between gap-3 pl-2">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                  alt="Meera Nair"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpMW3uZGAS3DodxjYxiHtsNTjXbuZ65Bs0QhQpbZE21o0ICvm6GnIHNCCv1a_7WUN5Hf-IHGOaDp7gG2U37BiFyC4aYmiMTKIRxcWoBtLAoHDYIEnxSJRJqKAZjKCMtL9EPd_clOS6VxrIU0_YjZ_tEaq6MuB__y3w2JTgkVr1RZeqUWxA3aCQMZ4UNtd_MzdaxSLgWby8bfX0dZsMSiht1QfOFBt-VoBr7frNo6Ayhrj2byDT52wbaQ"
                />
                <div>
                  <h3 className="font-headline font-bold text-sm text-[#0b1c30]">Meera Nair</h3>
                  <p className="text-xs text-slate-500">Age 45 • ID: VS-1012 • Bed 4B-12</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">crisis_alert</span>
                <span>Priority Alert</span>
              </span>
            </div>

            <div className="pl-2 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>Medication Adherence Alert</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Medication adherence decreased from <span className="font-semibold text-slate-900">72%</span> to{" "}
                <span className="font-semibold text-rose-600 font-mono">58%</span> over the past 5 days. Smart pill dispenser logged 3 missed evening doses of Lisinopril.
              </p>
            </div>

            <div className="pl-2 p-3 rounded-xl bg-slate-50 flex flex-col gap-1">
              <span className="text-[11px] text-[#0f766e] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">psychology</span>
                <span>Suggested Clinical Action</span>
              </span>
              <p className="text-xs text-slate-600">
                Review recent medication adherence, check for reported side effects, and re-evaluate current dosage or reminder schedule.
              </p>
            </div>

            <div className="pl-2 flex items-center gap-2 pt-1">
              <button
                onClick={() => handleSelectPatientForRecord("VS-1012", "record")}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                <span>Patient Record</span>
              </button>
              <button
                onClick={() => {
                  showToast("Medication review scheduled for Meera Nair.");
                  handleSelectPatientForRecord("VS-1012", "protocols");
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#0f766e] hover:bg-[#0d625b] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">medication</span>
                <span>Review Medication</span>
              </button>
            </div>
          </article>

          {/* Finding 2: Rahul Sharma (BP Trend) */}
          <article className="bg-white rounded-2xl p-5 shadow-sm border border-blue-200 relative overflow-hidden flex flex-col gap-3">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#006399]"></div>
            <div className="flex items-start justify-between gap-3 pl-2">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                  alt="Rahul Sharma"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdh0KKWwSWkjzbRvNsPC7Y3DdOO4XXzESRUNMt6ADhODQnpj1gwk1fMLR1tsFUpZQldu0N7gw0L4VMGZxPrfks3vVxTlMDJZprMArVTDpwtZdo_MNyrto_sX-qaKQbuYA1U8Wx-WjBmq9SvnAfw_w_r9AyQIALO4YMO_3ezmJOBh0gmiXxBlE0uzOs5DP6cnmabswzFiQt9Nm2zaK5oczft-G_is39tppEMFmlzQPuaqYh42pLZACqag"
                />
                <div>
                  <h3 className="font-headline font-bold text-sm text-[#0b1c30]">Rahul Sharma</h3>
                  <p className="text-xs text-slate-500">Age 31 • ID: VS-1038 • Bed 4B-07</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-[#004f7b] text-[11px] font-bold uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Monitoring Warning</span>
              </span>
            </div>

            <div className="pl-2 space-y-1">
              <div className="flex items-center gap-1.5 text-[#006399] font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-[#006399]"></span>
                <span>Systolic Drift Upward</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Continuous ambulatory BP monitor reports 3-day average resting systolic of <span className="font-bold text-[#006399]">148 mmHg</span> (target &lt; 130).
              </p>
            </div>

            <div className="pl-2 p-3 rounded-xl bg-slate-50 flex flex-col gap-1">
              <span className="text-[11px] text-[#0f766e] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">psychology</span>
                <span>AI Recommendation</span>
              </span>
              <p className="text-xs text-slate-600">
                Consider titrating Amlodipine from 5mg to 10mg daily or adding low-dose Chlorthalidone.
              </p>
            </div>

            <div className="pl-2 flex items-center gap-2 pt-1">
              <button
                onClick={() => handleSelectPatientForRecord("VS-1038", "record")}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                <span>Patient Record</span>
              </button>
              <button
                onClick={() => {
                  showToast("Dosage titration review opened for Rahul Sharma.");
                  handleSelectPatientForRecord("VS-1038", "protocols");
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#006399] hover:bg-[#004f7b] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Titrate Dosage</span>
              </button>
            </div>
          </article>
        </div>
      )}

      {/* TAB 5: CARE PLAN MANAGEMENT & PROTOCOLS */}
      {activeTab === "protocols" && (
        <div className="space-y-5">
          {/* Patient Context Banner */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {currentPatient.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentPatient.avatar}
                  alt={currentPatient.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#0f766e]"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-teal-100 text-[#0f766e] flex items-center justify-center font-bold text-lg">
                  {currentPatient.initials || currentPatient.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline font-bold text-lg sm:text-xl text-[#0b1c30]">
                    Care Plan Management: {currentPatient.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#cde5ff] text-[#001d32] text-xs font-mono font-bold">
                    {currentPatient.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active Clinical Prescription Cycle • Attending Physician: Dr. Thomas, MD
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast("Loading previous protocol revisions...")}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">history</span>
                <span>Revisions</span>
              </button>
              <button
                onClick={() => {
                  setPlanTitrated(true);
                  showToast("Care plan titrated and authorized under Dr. Thomas NPI.");
                }}
                className="px-4 py-2 rounded-xl bg-[#0f766e] hover:bg-[#0d625b] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{planTitrated ? "Plan Authorized ✓" : "Authorize & Sign"}</span>
              </button>
            </div>
          </section>

          {/* Current Regimens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Medication Plan */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-teal-50 text-[#0f766e] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">pill</span>
                  </span>
                  <h3 className="font-headline font-bold text-sm text-[#0b1c30]">1. Pharmacological Regimen</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-slate-800 text-sm block">Metformin HCl</strong>
                    <span className="text-slate-500">500mg • Twice daily with meals</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono bg-white px-2 py-1 rounded-lg border border-slate-200">
                    Refill: 3
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-slate-800 text-sm block">Lisinopril</strong>
                    <span className="text-slate-500">10mg • Once daily in evening</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono bg-white px-2 py-1 rounded-lg border border-slate-200">
                    Refill: 2
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-slate-800 text-sm block">Atorvastatin</strong>
                    <span className="text-slate-500">20mg • Once daily at bedtime</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono bg-white px-2 py-1 rounded-lg border border-slate-200">
                    Refill: 4
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Doctor Hard Gates & Safety Ceilings */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-teal-50 text-[#0f766e] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                  </span>
                  <h3 className="font-headline font-bold text-sm text-[#0b1c30]">2. Doctor Safety Hard-Gates</h3>
                </div>
                <span className="text-[11px] font-bold text-[#ba1a1a] bg-rose-50 px-2 py-0.5 rounded-full">Enforced</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0">block</span>
                  <div>
                    <strong className="text-slate-800 block">NSAID Contraindication</strong>
                    <span className="text-slate-600">Strictly prohibited due to renal risk with ACE inhibitors.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0">speed</span>
                  <div>
                    <strong className="text-slate-800 block">Heart Rate Hard Ceiling: 130 BPM</strong>
                    <span className="text-slate-600">Cardiovascular stress cutoff for exercise and telemetry alerts.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-[18px] shrink-0">water_drop</span>
                  <div>
                    <strong className="text-slate-800 block">Sodium Ceiling: 2,000 mg/day</strong>
                    <span className="text-slate-600">Dietary protocol threshold for glycemic and blood pressure balance.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
