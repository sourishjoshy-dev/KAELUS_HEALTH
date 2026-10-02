"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileTabs = [
  { label: "Dashboard", href: "/", icon: "ecg_heart" },
  { label: "Reports", href: "/medical-reports", icon: "biotech" },
  { label: "Care Plan", href: "/care-plan", icon: "verified_user" },
  { label: "Meds", href: "/medications", icon: "pill" },
  { label: "AI Triage", href: "/ai-assistant", icon: "neurology" },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/doctor")) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/" && (pathname === "/" || pathname === "/dashboard")) return true;
    return pathname === href;
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#e5eeff] px-2 py-2 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      {mobileTabs.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              active ? "text-[#006591] font-bold" : "text-[#74777e] hover:text-[#0f2b48]"
            }`}
          >
            <div
              className={`w-9 h-8 rounded-full flex items-center justify-center transition-all ${
                active ? "bg-[#c9e6ff] text-[#001e2f]" : ""
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${active ? "fill-icon" : ""}`}>
                {tab.icon}
              </span>
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-headline">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
