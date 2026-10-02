"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

export const navItems = [
  { name: "1. Auth & Access", href: "/auth", icon: "lock" },
  { name: "2. Dashboard", href: "/", icon: "dashboard" },
  { name: "3. Medical Reports", href: "/medical-reports", icon: "description" },
  { name: "4. Health Profile", href: "/health-profile", icon: "account_circle" },
  { name: "5. Care Plan", href: "/care-plan", icon: "assignment" },
  { name: "6. Safety Engine", href: "/safety-engine", icon: "health_and_safety" },
  { name: "7. Medications", href: "/medications", icon: "medication" },
  { name: "8. AI Assistant", href: "/ai-assistant", icon: "neurology" },
  { name: "9. Progress Analytics", href: "/progress-analytics", icon: "insights" },
  { name: "10. Doctor Portal", href: "/doctor", icon: "stethoscope" },
];

export default function Header() {
  const pathname = usePathname();
  const { currentUser, switchUser, notifications, markNotificationRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const isDoctor = pathname.startsWith("/doctor");

  const isActive = (href: string) => {
    if (href === "/" && (pathname === "/" || pathname === "/dashboard")) return true;
    if (href === "/doctor" && pathname.startsWith("/doctor")) return true;
    return pathname === href;
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#e5eeff]/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 pt-3 ${isDoctor ? "pb-3" : "pb-2"} flex flex-col gap-2`}>
        {/* Top bar with Brand, Status, and Controls */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#0f2b48] flex items-center justify-center text-[#39b8fd] shadow-sm border border-[#39b8fd]/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px] fill-icon text-[#39b8fd]">ecg_heart</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline text-lg sm:text-xl text-[#0f2b48] font-extrabold tracking-tight leading-none">
                  VITALSYNC
                </span>
                <span className="text-[10px] bg-[#c9e6ff] text-[#001e2f] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-headline">
                  v2.4
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006591] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006591]"></span>
                </span>
                <span className="font-label text-[10px] text-[#006591] font-bold uppercase tracking-wider">
                  SYNC ACTIVE • TELEMETRY 12MS
                </span>
              </div>
            </div>
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Role switch toggle pill */}
            <button
              onClick={() => setShowUserModal(!showUserModal)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-[#eff4ff] border border-[#c4c6ce]/40 shadow-xs transition-all text-xs font-semibold text-[#0f2b48]"
              title="Click to switch persona (Patient / Clinician)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{currentUser.name}</span>
              <span className="text-[10px] text-[#74777e] bg-[#e5eeff] px-1.5 py-0.2 rounded font-mono">
                {currentUser.id}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#74777e]">expand_more</span>
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 relative flex items-center justify-center rounded-full text-[#0b1c30] hover:bg-[#e5eeff] transition-colors"
                id="notification-bell-btn"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-[#f8f9ff] animate-pulse"></span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#c4c6ce]/30 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-sm text-[#0f2b48]">Clinical Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[#74777e] hover:text-[#0f2b48] text-xs font-medium"
                    >
                      Close
                    </button>
                  </div>
                  <div className="divide-y divide-[#eff4ff] max-h-72 overflow-y-auto no-scrollbar">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 text-left transition-colors cursor-pointer hover:bg-[#eff4ff]/60 rounded-xl my-1 ${
                          n.unread ? "bg-[#e5eeff]/40" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-headline font-bold text-[#0f2b48]">{n.title}</span>
                          <span className="text-[10px] text-[#74777e] whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-xs text-[#43474d] mt-1 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowUserModal(!showUserModal)}
                className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#c9e6ff] shadow-xs hover:ring-[#006591] transition-all flex items-center justify-center bg-[#0f2b48] text-white"
                title="Account Settings & Persona"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={currentUser.name}
                  src={currentUser.avatar}
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Persona Switcher Modal */}
              {showUserModal && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#c4c6ce]/30 p-3 z-50 animate-in fade-in duration-150">
                  <div className="p-2 border-b border-[#eff4ff]">
                    <div className="font-headline font-bold text-xs text-[#74777e] uppercase tracking-wider mb-2">
                      Active Portal Identity
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0f2b48] truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-[#74777e] truncate">{currentUser.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1.5">
                    <div className="text-[11px] font-semibold text-[#74777e] mb-1">Switch Perspective:</div>
                    <button
                      onClick={() => {
                        switchUser("patient");
                        setShowUserModal(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        currentUser.role === "patient" ? "bg-[#c9e6ff] text-[#001e2f]" : "hover:bg-[#eff4ff] text-[#0f2b48]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        <span>Arjun Kumar (Patient)</span>
                      </div>
                      {currentUser.role === "patient" && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchUser("clinician");
                        setShowUserModal(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        currentUser.role === "clinician" ? "bg-[#c9e6ff] text-[#001e2f]" : "hover:bg-[#eff4ff] text-[#0f2b48]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                        <span>Dr. Thomas, MD (Attending)</span>
                      </div>
                      {currentUser.role === "clinician" && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Switcher Carousel — 9 Screens (Hidden on Doctor Portal) */}
        {!isDoctor && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-headline font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 active:scale-95 ${
                    active
                      ? "bg-[#0f2b48] text-white shadow-sm ring-1 ring-[#0f2b48]"
                      : "bg-[#eff4ff] text-[#43474d] hover:bg-[#e5eeff] hover:text-[#0f2b48]"
                  }`}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-[#39b8fd] animate-pulse"></span>}
                  <span className="material-symbols-outlined text-[15px] opacity-80">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
