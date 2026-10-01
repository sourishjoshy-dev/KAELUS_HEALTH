"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function Toast() {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 bg-[#0f2b48] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#39b8fd]/30 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-sm">
      <div className="w-6 h-6 rounded-full bg-[#006591] flex items-center justify-center text-[#39b8fd] shrink-0">
        <span className="material-symbols-outlined text-[16px]">check_circle</span>
      </div>
      <p className="text-xs font-semibold leading-snug">{toastMessage}</p>
    </div>
  );
}
