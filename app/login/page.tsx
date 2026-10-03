"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { switchUser, showToast } = useApp();

  const initialRoleParam = searchParams.get("role");
  const isInitialDoctor = initialRoleParam === "doctor" || initialRoleParam === "clinician" || initialRoleParam === null;

  const [role, setRole] = useState<"doctor" | "patient">(isInitialDoctor ? "doctor" : "patient");
  const [username, setUsername] = useState(isInitialDoctor ? "dr.thomas" : "arjun.kumar");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<"authenticating" | "granted" | null>(null);
  const [tapModalOpen, setTapModalOpen] = useState(false);
  const [tapModalType, setTapModalType] = useState<"nfc" | "biometric">("nfc");
  const [tapModalStep, setTapModalStep] = useState<"scanning" | "verified">("scanning");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync role state if searchParams change
  useEffect(() => {
    const r = searchParams.get("role");
    setPassword("");
    setShowPassword(false);
    if (r === "patient") {
      setRole("patient");
      setUsername("arjun.kumar");
    } else if (r === "doctor" || r === "clinician") {
      setRole("doctor");
      setUsername("dr.thomas");
    }
  }, [searchParams]);

  const handleRoleChange = (newRole: "doctor" | "patient") => {
    setRole(newRole);
    setErrorMsg(null);
    setPassword("");
    setShowPassword(false);
    if (newRole === "doctor") {
      setUsername("dr.thomas");
    } else {
      setUsername("arjun.kumar");
    }
  };

  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter both username and password to proceed.");
      return;
    }

    setIsSubmitting(true);
    setSubmitPhase("authenticating");

    if (role === "doctor") {
      showToast("Authenticating Medical Staff ID & FHIR Telemetry...");
      setTimeout(() => {
        setSubmitPhase("granted");
        setTimeout(() => {
          switchUser("clinician");
          showToast("Welcome back, Dr. Thomas! Launching Patient Roster...");
          router.push("/doctor");
        }, 600);
      }, 900);
    } else {
      showToast("Authenticating Patient Identity & Syncing Telemetry...");
      setTimeout(() => {
        setSubmitPhase("granted");
        setTimeout(() => {
          switchUser("patient");
          showToast("Welcome back, Arjun! Launching Health Dashboard...");
          router.push("/");
        }, 600);
      }, 900);
    }
  };

  const triggerNfcTap = () => {
    setTapModalType("nfc");
    setTapModalStep("scanning");
    setTapModalOpen(true);

    setTimeout(() => {
      setTapModalStep("verified");
      setTimeout(() => {
        setTapModalOpen(false);
        if (role === "doctor") {
          setUsername("dr.thomas");
        } else {
          setUsername("arjun.kumar");
        }
        setPassword("demoPassword123");
        handleSignIn();
      }, 800);
    }, 1300);
  };

  const triggerBiometric = () => {
    setTapModalType("biometric");
    setTapModalStep("scanning");
    setTapModalOpen(true);

    setTimeout(() => {
      setTapModalStep("verified");
      setTimeout(() => {
        setTapModalOpen(false);
        if (role === "doctor") {
          setUsername("dr.thomas");
        } else {
          setUsername("arjun.kumar");
        }
        setPassword("demoPassword123");
        handleSignIn();
      }, 800);
    }, 1300);
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center py-4 sm:py-6 -mt-6">
      {/* Container matching mobile / responsive viewport from Stitch screen */}
      <div className="w-full max-w-[420px] flex flex-col">
        {/* Navigation & Role Indicator Switcher */}
        <div className="flex items-center justify-between mb-3 px-1">
          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#005c55] hover:text-[#0f766e] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>All Roles (/auth)</span>
          </Link>

          <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 border border-slate-300/60">
            <button
              type="button"
              onClick={() => handleRoleChange("doctor")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                role === "doctor"
                  ? "bg-[#0f766e] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("patient")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                role === "patient"
                  ? "bg-[#005c55] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Patient
            </button>
          </div>
        </div>

        {/* 1. Header Card (Direct from Stitch screen) */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-[#eff4ff] shadow-sm p-5 mb-4 border border-blue-100/60">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#7bc2ff]/25 pointer-events-none blur-2xl"></div>
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#0f766e] flex items-center justify-center text-white shadow-md mb-2.5">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 32 32"
              >
                <path d="M3 16h5l3-9 6 18 4-12 3 5h5"></path>
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-extrabold text-xl tracking-tight text-[#0b1c30]">
                VITALSYNC
              </span>
              <span className="bg-[#0f766e]/10 text-[#0f766e] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {role === "doctor" ? "Clinical Portal" : "Patient Portal"}
              </span>
            </div>
            <h1 className="font-headline font-bold text-lg sm:text-[19px] text-[#0b1c30] mt-1">
              {role === "doctor" ? "Physician & Clinical Staff Sign In" : "Patient & Family Portal Sign In"}
            </h1>
            <p className="text-xs text-[#3e4947] max-w-xs mt-0.5">
              {role === "doctor"
                ? "Secure portal access for authorized medical personnel"
                : "Secure portal access for patient health records & biometric telemetry"}
            </p>
          </div>
        </div>

        {/* 2. Login Form Card (Direct from Stitch screen) */}
        <div className="w-full bg-white rounded-2xl shadow-md p-5 mb-3.5 border border-slate-200/80">
          <form className="flex flex-col gap-3.5" onSubmit={handleSignIn}>
            {/* Username Field */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#0b1c30]" htmlFor="usernameInput">
                  Username
                </label>
                <span className="text-[11px] font-medium text-slate-500">
                  {role === "doctor" ? "Medical Staff ID" : "Patient MRN / ID"}
                </span>
              </div>
              <div className="relative flex items-center bg-[#eff4ff] rounded-xl border border-transparent focus-within:border-[#0f766e] focus-within:bg-white transition-all">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 select-none text-[20px]">
                  badge
                </span>
                <input
                  id="usernameInput"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "doctor" ? "e.g. dr.thomas" : "e.g. arjun.kumar or VS-1024"}
                  className="w-full pl-10 pr-3 py-2.5 bg-transparent rounded-xl text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#0b1c30]" htmlFor="passwordInput">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      role === "doctor"
                        ? "Clinical Self-Service Password Reset requested for Hospital Staff ID."
                        : "Temporary verification code sent to patient registered mobile number."
                    )
                  }
                  className="text-[11px] font-semibold text-[#0f766e] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative flex items-center bg-[#eff4ff] rounded-xl border border-transparent focus-within:border-[#0f766e] focus-within:bg-white transition-all">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 select-none text-[20px]">
                  lock
                </span>
                <input
                  id="passwordInput"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-20 py-2.5 bg-transparent rounded-xl text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 px-2 py-1 rounded-lg text-xs font-bold text-[#0f766e] hover:bg-[#0f766e]/10 transition-colors flex items-center gap-1 select-none"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#3e4947]">
                <input
                  id="rememberDevice"
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0f766e] focus:ring-0 accent-[#0f766e] cursor-pointer"
                />
                <span>
                  {role === "doctor" ? "Remember on this workstation" : "Remember on this personal device"}
                </span>
              </label>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sign In Submit Button */}
            <button
              id="signInSubmitBtn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-1 py-3 px-4 rounded-xl font-headline font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
                submitPhase === "granted"
                  ? "bg-emerald-600"
                  : role === "doctor"
                  ? "bg-[#0f766e] hover:bg-[#115e59]"
                  : "bg-[#005c55] hover:bg-[#004b45]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">
                    progress_activity
                  </span>
                  <span>
                    {submitPhase === "authenticating"
                      ? role === "doctor"
                        ? "Authenticating Medical Credentials..."
                        : "Authenticating Patient Identity..."
                      : role === "doctor"
                      ? "Access Granted. Initializing Patient Roster..."
                      : "Access Granted. Initializing Dashboard..."}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {role === "doctor" ? "Sign In to Clinical Portal" : "Sign In to Patient Portal"}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Assist / NFC Tap shortcuts from Stitch design */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Quick Credentials:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerNfcTap}
                className="px-2 py-1 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0f766e] font-semibold text-[11px] flex items-center gap-1 transition-colors"
                title="Simulate NFC Badge reader tap"
              >
                <span className="material-symbols-outlined text-[14px]">sensors</span>
                <span>Badge Tap</span>
              </button>
              <button
                type="button"
                onClick={triggerBiometric}
                className="px-2 py-1 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0f766e] font-semibold text-[11px] flex items-center gap-1 transition-colors"
                title="Simulate Biometric Fingerprint authentication"
              >
                <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                <span>Biometric</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Station Assignment / Patient Profile Info Card (From Stitch screen) */}
        <div className="w-full bg-[#eff4ff] rounded-2xl p-3.5 flex items-center justify-between shadow-xs mb-3.5 border border-blue-100/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#0f766e] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">
                {role === "doctor" ? "local_hospital" : "vital_signs"}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                {role === "doctor" ? "Clinical Unit" : "Patient Profile"}
              </span>
              <span className="text-xs text-[#0b1c30] font-bold truncate">
                {role === "doctor"
                  ? "Cardiology & Telehealth Care (Dr. Thomas)"
                  : "Arjun Kumar • VS-1024 (Outpatient Care)"}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#0f766e] bg-white px-2 py-0.5 rounded-md border border-blue-100 shadow-2xs shrink-0">
            {role === "doctor" ? "Active Roster" : "Live Sync"}
          </span>
        </div>

        {/* 4. HIPAA Compliant Session Card (From Stitch screen) */}
        <div className="w-full bg-white rounded-2xl p-3.5 flex flex-col gap-1 shadow-xs mb-3.5 border border-slate-200/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b1c30]">
              <span className="material-symbols-outlined text-[#0f766e] text-[18px]">verified_user</span>
              <span>HIPAA Compliant Session</span>
            </div>
            <span className="bg-[#eff4ff] text-[#0f766e] px-2 py-0.5 rounded-full text-[10px] font-bold">
              256-bit AES SSL
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            System monitoring is active. Access to Protected Health Information (PHI) is strictly audited
            under 45 CFR Part 164.
          </p>
        </div>

        {/* 5. Support & Mesh Network Footer (From Stitch screen) */}
        <div className="flex flex-col items-center text-center gap-1 py-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="material-symbols-outlined text-[16px] text-slate-500">support_agent</span>
            <span className="font-semibold text-[#0b1c30]">Clinical IT Support: Ext. 4040</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span>
            <span className="text-[11px] text-[#0f766e] font-bold">24/7 Priority</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Terminal ID: MED-WS-0941 • Hospital Network Mesh Alpha
          </p>
        </div>
      </div>

      {/* NFC / Biometric Tap Modal (From Stitch screen interactivity) */}
      {tapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center text-center border border-slate-200">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
                tapModalStep === "verified"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[#0f766e]/10 text-[#0f766e] animate-pulse"
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">
                {tapModalStep === "verified"
                  ? "check_circle"
                  : tapModalType === "nfc"
                  ? "sensors"
                  : "fingerprint"}
              </span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#0b1c30]">
              {tapModalStep === "verified"
                ? "Credential Verified"
                : tapModalType === "nfc"
                ? "NFC Badge Reader"
                : "Biometric Touch Sensor"}
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              {tapModalStep === "verified"
                ? role === "doctor"
                  ? "Dr. Thomas, MD (Cardiology Specialist)"
                  : "Arjun Kumar (VS-1024)"
                : tapModalType === "nfc"
                ? "Hold authorized ID badge near workstation reader..."
                : "Validating biometric signature against Hospital Directory..."}
            </p>
            <button
              type="button"
              onClick={() => setTapModalOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-3xl text-[#0f766e]">
            progress_activity
          </span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
