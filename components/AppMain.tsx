"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDoctor = pathname.startsWith("/doctor");

  return (
    <main
      className={`flex-1 ${
        isDoctor ? "pt-18 sm:pt-20" : "pt-28 sm:pt-28"
      } pb-24 sm:pb-12 max-w-7xl w-full mx-auto px-4 sm:px-6`}
    >
      {children}
    </main>
  );
}
