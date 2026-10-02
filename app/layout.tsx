import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Toast from "@/components/Toast";
import AppMain from "@/components/AppMain";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VITALSYNC — Intelligent Clinical Patient Portal & Telemetry",
  description: "Next-generation clinical-grade patient portal with real-time biometric telemetry, AI health profile synthesis, safety conflict engines, and care protocol synchronization.",
  icons: {
    icon: "/brand-emblem.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f2b48",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-[#f8f9ff] font-body text-[#0b1c30] min-h-screen selection:bg-[#c9e6ff] antialiased flex flex-col">
        <AppProvider>
          <Header />
          <AppMain>{children}</AppMain>
          <BottomNav />
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
