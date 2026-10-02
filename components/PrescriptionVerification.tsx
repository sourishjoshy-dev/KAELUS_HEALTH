"use client";

import React, { useState } from "react";

export interface ExtractedMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  confidence: number; // 0.0 to 1.0
  needs_verification: boolean;
  status: "pending" | "verified" | "edited";
  verified_by_user?: boolean;
  ai_extracted_value: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  };
  user_verified_value: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  };
}

export interface ExtractedCondition {
  name: string;
  confidence: number;
}

export interface VerifiedMedicalProfile {
  conditions: string[];
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    verified_by_user: boolean;
    ai_extracted_value?: any;
    user_verified_value?: any;
  }>;
  document_type?: string;
  patient_info?: {
    name?: string;
    age?: string;
    gender?: string;
  };
}

interface PrescriptionVerificationProps {
  documentType?: string;
  patientInfo?: { name?: string; age?: string; gender?: string } | null;
  initialConditions?: ExtractedCondition[];
  initialMedicines: Array<{
    id?: string;
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
    confidence?: number;
    needs_verification?: boolean;
    status?: "pending" | "verified" | "edited";
  }>;
  uncertainItems?: string[];
  filePreviewUrl?: string | null;
  fileName?: string;
  onConfirm: (verifiedProfile: VerifiedMedicalProfile) => void;
  onCancel?: () => void;
}

export default function PrescriptionVerification({
  documentType = "prescription",
  patientInfo,
  initialConditions = [],
  initialMedicines = [],
  uncertainItems = [],
  filePreviewUrl,
  fileName,
  onConfirm,
  onCancel,
}: PrescriptionVerificationProps) {
  // Normalize medicines with dual-state tracking
  const [medicines, setMedicines] = useState<ExtractedMedicine[]>(() => {
    return initialMedicines.map((m, idx) => {
      const conf = typeof m.confidence === "number" ? m.confidence : 0.85;
      const isUncertain = conf < 0.80 || Boolean(m.needs_verification);
      const name = m.name || "Unknown Medicine";
      const dosage = m.dosage || "10mg";
      const frequency = m.frequency || "Once daily";
      const duration = m.duration || "30 days";
      const instructions = m.instructions || "As directed by physician";

      return {
        id: m.id || `med-item-${idx}-${Date.now()}`,
        name,
        dosage,
        frequency,
        duration,
        instructions,
        confidence: conf,
        needs_verification: isUncertain,
        status: isUncertain ? "pending" : "verified",
        verified_by_user: !isUncertain,
        ai_extracted_value: {
          name,
          dosage,
          frequency,
          duration,
          instructions,
        },
        user_verified_value: {
          name,
          dosage,
          frequency,
          duration,
          instructions,
        },
      };
    });
  });

  const [conditions, setConditions] = useState<string[]>(() =>
    initialConditions.map((c) => c.name)
  );
  const [newConditionInput, setNewConditionInput] = useState("");

  // Editing state for specific medicine
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  // Calculate unverified items count
  const pendingCount = medicines.filter((m) => m.status === "pending").length;
  const hasUncertainItems = medicines.some((m) => m.needs_verification);

  // Start editing a medicine
  const handleStartEdit = (med: ExtractedMedicine) => {
    setEditingId(med.id);
    setEditForm({
      name: med.user_verified_value.name,
      dosage: med.user_verified_value.dosage,
      frequency: med.user_verified_value.frequency,
      duration: med.user_verified_value.duration,
      instructions: med.user_verified_value.instructions,
    });
  };

  // Save an edited medicine
  const handleSaveEdit = (id: string) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          name: editForm.name.trim() || m.name,
          dosage: editForm.dosage.trim() || m.dosage,
          frequency: editForm.frequency.trim() || m.frequency,
          duration: editForm.duration.trim() || m.duration,
          instructions: editForm.instructions.trim() || m.instructions,
          status: "edited",
          needs_verification: false,
          verified_by_user: true,
          user_verified_value: {
            name: editForm.name.trim() || m.name,
            dosage: editForm.dosage.trim() || m.dosage,
            frequency: editForm.frequency.trim() || m.frequency,
            duration: editForm.duration.trim() || m.duration,
            instructions: editForm.instructions.trim() || m.instructions,
          },
        };
      })
    );
    setEditingId(null);
  };

  // Mark as verified without editing
  const handleVerifyMedicine = (id: string) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          status: "verified",
          needs_verification: false,
          verified_by_user: true,
        };
      })
    );
  };

  // Delete an erroneously parsed medicine
  const handleDeleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  // Add a medicine manually
  const handleAddMedicine = () => {
    const newMed: ExtractedMedicine = {
      id: `med-custom-${Date.now()}`,
      name: "New Medicine",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "30 days",
      instructions: "Take with water",
      confidence: 1.0,
      needs_verification: false,
      status: "edited",
      verified_by_user: true,
      ai_extracted_value: {
        name: "Manually Added",
        dosage: "-",
        frequency: "-",
        duration: "-",
        instructions: "-",
      },
      user_verified_value: {
        name: "New Medicine",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take with water",
      },
    };
    setMedicines((prev) => [...prev, newMed]);
    handleStartEdit(newMed);
  };

  // Add condition
  const handleAddCondition = () => {
    if (!newConditionInput.trim()) return;
    setConditions((prev) => [...prev, newConditionInput.trim()]);
    setNewConditionInput("");
  };

  // Remove condition
  const handleRemoveCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Final Confirmation
  const handleConfirmAll = () => {
    const verifiedProfile: VerifiedMedicalProfile = {
      document_type: documentType,
      patient_info: patientInfo || undefined,
      conditions,
      medicines: medicines.map((m) => ({
        name: m.user_verified_value.name,
        dosage: m.user_verified_value.dosage,
        frequency: m.user_verified_value.frequency,
        duration: m.user_verified_value.duration,
        instructions: m.user_verified_value.instructions,
        verified_by_user: true,
        ai_extracted_value: m.ai_extracted_value,
        user_verified_value: m.user_verified_value,
      })),
    };

    onConfirm(verifiedProfile);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-[#e5eeff] space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">fact_check</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-bold text-xl text-[#0b1c30]">
                Prescription &amp; Report Verification
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0f766e] border border-teal-200/50">
                Human In The Loop
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and verify the AI transcription of your physician&apos;s handwritten prescription.
            </p>
          </div>
        </div>

        {fileName && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 self-start sm:self-auto font-mono">
            <span className="material-symbols-outlined text-[16px] text-slate-400">description</span>
            <span className="truncate max-w-[200px]">{fileName}</span>
          </div>
        )}
      </div>

      {/* Uncertainty Alert Banner (Crucial Requirement) */}
      {hasUncertainItems ? (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-700 text-[22px] shrink-0 mt-0.5">
            warning
          </span>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Handwriting Uncertainty Detected
            </h4>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              Some information could not be read confidently from the physician&apos;s handwriting.
              Please verify each item marked below before continuing.
            </p>
            {uncertainItems.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {uncertainItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold bg-white/80 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-300/60"
                  >
                    ⚠ {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
          <span>
            Document handwriting was transcribed with high legibility confidence. Please double-check all items.
          </span>
        </div>
      )}

      {/* Side-by-side or Stacked: Document Preview & Extracted Medicine Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Uploaded Document Viewer */}
        {filePreviewUrl && (
          <div className="lg:col-span-4 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">image</span>
                Original Document
              </span>
              <a
                href={filePreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-[#0f766e] hover:underline flex items-center gap-0.5"
              >
                <span>View Full Size</span>
                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
              </a>
            </div>

            <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center min-h-[220px] max-h-[380px] p-2 group shadow-inner">
              {filePreviewUrl.startsWith("data:application/pdf") ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <span className="material-symbols-outlined text-red-500 text-5xl mb-2">picture_as_pdf</span>
                  <span className="text-xs font-bold text-slate-700">PDF Prescription Loaded</span>
                  <p className="text-[11px] text-slate-500 mt-1">Multi-page LOINC / Rx report</p>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={filePreviewUrl}
                  alt="Uploaded prescription"
                  className="w-full h-full object-contain max-h-[340px] rounded-lg transition-transform group-hover:scale-[1.02]"
                />
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center italic">
              Cross-reference the handwritten notes against the cards on the right.
            </p>
          </div>
        )}

        {/* Right Col: Extracted Medicines & Conditions */}
        <div className={filePreviewUrl ? "lg:col-span-8 space-y-5" : "lg:col-span-12 space-y-5"}>
          {/* Conditions Section */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0f766e]">diagnostics</span>
                Detected Conditions &amp; Diagnoses ({conditions.length})
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {conditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0b1c30] shadow-xs"
                >
                  <span>{cond}</span>
                  <button
                    onClick={() => handleRemoveCondition(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove condition"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  placeholder="+ Add condition..."
                  value={newConditionInput}
                  onChange={(e) => setNewConditionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCondition()}
                  className="px-2.5 py-1 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0f766e]"
                />
                {newConditionInput && (
                  <button
                    onClick={handleAddCondition}
                    className="p-1 rounded-lg bg-[#0f766e] text-white hover:bg-[#0d625b]"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Medicines Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-sm text-[#0b1c30]">
                  Extracted Medications ({medicines.length})
                </h3>
                {pendingCount > 0 ? (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {pendingCount} Pending Verification
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    All Verified
                  </span>
                )}
              </div>

              <button
                onClick={handleAddMedicine}
                className="text-xs font-semibold text-[#0f766e] hover:text-[#0b5c56] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Add Medicine</span>
              </button>
            </div>

            {medicines.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-1">medication</span>
                <p className="text-xs">No medications detected in this document.</p>
                <button
                  onClick={handleAddMedicine}
                  className="mt-2 text-xs font-bold text-[#0f766e] hover:underline"
                >
                  + Add Medication Manually
                </button>
              </div>
            ) : (
              medicines.map((med) => {
                const isEditing = editingId === med.id;
                const isLowConfidence = med.confidence < 0.80 || med.needs_verification;
                const isEdited = med.status === "edited";
                const isVerified = med.status === "verified" || isEdited;

                return (
                  <div
                    key={med.id}
                    className={`rounded-2xl p-4 transition-all border ${
                      isEditing
                        ? "bg-teal-50/40 border-[#0f766e] shadow-md"
                        : isLowConfidence && !isVerified
                        ? "bg-amber-50/30 border-amber-300 shadow-xs"
                        : isEdited
                        ? "bg-blue-50/30 border-blue-200"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isEditing ? (
                      /* Inline Edit Mode */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-teal-200/50">
                          <span className="text-xs font-bold text-[#0f766e] uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Editing Medicine Details
                          </span>
                          <span className="text-[11px] text-slate-500">
                            AI Confidence: {Math.round(med.confidence * 100)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Medicine Name *
                            </label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                              placeholder="e.g. Metformin HCl"
                            />
                            {med.ai_extracted_value.name !== editForm.name && (
                              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                                AI detected: &quot;{med.ai_extracted_value.name}&quot;
                              </span>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Dosage *
                            </label>
                            <input
                              type="text"
                              value={editForm.dosage}
                              onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                              placeholder="e.g. 500mg, 10mg"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Frequency *
                            </label>
                            <input
                              type="text"
                              value={editForm.frequency}
                              onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                              placeholder="e.g. Twice daily, Once daily"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Duration
                            </label>
                            <input
                              type="text"
                              value={editForm.duration}
                              onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                              placeholder="e.g. 30 days, Ongoing"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Instructions / Notes
                          </label>
                          <input
                            type="text"
                            value={editForm.instructions}
                            onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                            placeholder="e.g. Take with meals, At bedtime"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(med.id)}
                            className="px-4 py-1.5 rounded-xl bg-[#0f766e] hover:bg-[#0d625b] text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                            <span>Save &amp; Verify</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Read / Verify Mode */
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isLowConfidence && !isVerified
                                  ? "bg-amber-100 text-amber-800"
                                  : isEdited
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-teal-100 text-[#0f766e]"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {isEdited ? "edit_note" : "pill"}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-headline font-bold text-base text-[#0b1c30]">
                                  {med.user_verified_value.name}
                                </h4>
                                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {med.user_verified_value.dosage}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 mt-0.5">
                                <span className="font-semibold text-slate-700">
                                  {med.user_verified_value.frequency}
                                </span>
                                {med.user_verified_value.duration && (
                                  <span> • {med.user_verified_value.duration}</span>
                                )}
                              </p>

                              <p className="text-xs text-slate-500 mt-0.5">
                                <em>{med.user_verified_value.instructions}</em>
                              </p>

                              {/* Show AI extracted value if edited */}
                              {isEdited && med.ai_extracted_value.name !== med.user_verified_value.name && (
                                <div className="mt-1 text-[11px] text-blue-700 font-mono flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">history</span>
                                  <span>Original AI: &quot;{med.ai_extracted_value.name}&quot;</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Confidence Badge & Verification Pill */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {isLowConfidence && !isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                                <span className="material-symbols-outlined text-[14px]">warning</span>
                                <span>⚠ Please verify this medicine</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                <span>✓ Looks readable</span>
                              </span>
                            )}

                            <span className="text-[11px] text-slate-400 font-mono">
                              AI Confidence: {Math.round(med.confidence * 100)}%
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            {isVerified ? (
                              <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                                <span>Verified by patient</span>
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold text-xs flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">pending</span>
                                <span>Verification needed</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(med)}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                              <span>Edit</span>
                            </button>

                            {!isVerified && (
                              <button
                                type="button"
                                onClick={() => handleVerifyMedicine(med.id)}
                                className="px-3.5 py-1 rounded-lg bg-[#0f766e] hover:bg-[#0d625b] text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                <span>Verify OK</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteMedicine(med.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete medicine"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Confirmation Bar */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-headline font-bold text-sm text-[#0b1c30]">
            Are these medicines and conditions correct?
          </p>
          <p className="text-xs text-slate-500">
            {pendingCount > 0
              ? `Please verify the remaining ${pendingCount} flagged medicine(s) before generating diet and exercise plan.`
              : "All medicines verified. Ready to synthesize personalized nutritional & cardiac protocols."}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Re-upload
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmAll}
            disabled={pendingCount > 0}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-headline font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              pendingCount > 0
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-[#0f766e] hover:bg-[#0b5c56] text-white active:scale-95"
            }`}
          >
            <span>Confirm Prescription</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
