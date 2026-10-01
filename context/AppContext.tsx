"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  role: "patient" | "clinician";
  avatar: string;
  subtitle: string;
  badge: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  icon: string;
  timeSlot: "Morning" | "Afternoon" | "Evening" | "Bedtime";
  taken: boolean;
  takenAt?: string;
  prescribedBy: string;
  refillCount: number;
}

export interface CareTask {
  id: string;
  title: string;
  time: string;
  category: "medication" | "vital" | "exercise" | "diet" | "hydration";
  completed: boolean;
  assignedBy: string;
}

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchUser: (role: "patient" | "clinician") => void;
  medications: Medication[];
  toggleMedication: (id: string) => void;
  careTasks: CareTask[];
  toggleCareTask: (id: string) => void;
  healthScore: number;
  adherenceRate: number;
  notifications: Array<{ id: string; title: string; desc: string; time: string; unread: boolean; type: "alert" | "info" | "success" }>;
  markNotificationRead: (id: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const patientProfile: UserProfile = {
  id: "VS-1024",
  name: "Arjun Kumar",
  role: "patient",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgU4781gMim6lsy5oYMjSQN9WIxYG3OlEf2xVDwe9T5RysmTUHBKRxyj0Wm6xe7dCM_EnNK1iXOpkG12csK7kLlwH_JeQwWui3loB_rBIR0PQEOmjN7-kb01uglipqvyHQ79Y78NCr4QGO3flWXQqLF-PrBbJ8WOMNrjNkJh7k6oRHqH3pt9PRKkoR_5sFPnLH07TOChZtVdu8yw2Tgh0188sQUV5EudnyF-ZbJhOcyE9J50xo5k9e",
  subtitle: "52 y/o Male • Stage 1 HTN + T2D",
  badge: "Patient Active",
};

const clinicianProfile: UserProfile = {
  id: "NPI-94021482",
  name: "Dr. Sarah Vance, MD",
  role: "clinician",
  avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
  subtitle: "Chief Cardiologist • Attending Physician",
  badge: "Attending MD",
};

const initialMedications: Medication[] = [
  {
    id: "med-1",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily at night",
    instructions: "Take with or without food. Monitor standing BP.",
    icon: "dark_mode",
    timeSlot: "Evening",
    taken: true,
    takenAt: "8:00 PM (Yesterday)",
    prescribedBy: "Dr. Sarah Vance, MD",
    refillCount: 2,
  },
  {
    id: "med-2",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily with meals",
    instructions: "Take with breakfast and dinner to reduce GI upset.",
    icon: "schedule",
    timeSlot: "Morning",
    taken: true,
    takenAt: "8:30 AM",
    prescribedBy: "Dr. Sarah Vance, MD",
    refillCount: 3,
  },
  {
    id: "med-3",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    instructions: "Lipid management. Avoid excessive grapefruit intake.",
    icon: "bedtime",
    timeSlot: "Bedtime",
    taken: false,
    prescribedBy: "Dr. Sarah Vance, MD",
    refillCount: 1,
  },
  {
    id: "med-4",
    name: "Omega-3 Cardio EPA",
    dosage: "1000mg",
    frequency: "Once daily with lunch",
    instructions: "Cardiovascular supplement prescribed adjunct.",
    icon: "wb_sunny",
    timeSlot: "Afternoon",
    taken: true,
    takenAt: "1:15 PM",
    prescribedBy: "Dr. Sarah Vance, MD",
    refillCount: 4,
  },
];

const initialCareTasks: CareTask[] = [
  { id: "task-1", title: "Morning BP & Resting HR Log", time: "8:00 AM", category: "vital", completed: true, assignedBy: "Dr. Vance" },
  { id: "task-2", title: "Take Metformin (500mg) with breakfast", time: "8:30 AM", category: "medication", completed: true, assignedBy: "Dr. Vance" },
  { id: "task-3", title: "20-minute brisk walk (aerobic safe)", time: "11:00 AM", category: "exercise", completed: false, assignedBy: "Care AI" },
  { id: "task-4", title: "Post-lunch glucose check (<140 target)", time: "2:00 PM", category: "vital", completed: false, assignedBy: "Dr. Vance" },
  { id: "task-5", title: "Evening hydration check (target 2.5L)", time: "6:00 PM", category: "hydration", completed: false, assignedBy: "Care AI" },
  { id: "task-6", title: "Take Lisinopril 10mg + Atorvastatin 20mg", time: "9:00 PM", category: "medication", completed: false, assignedBy: "Dr. Vance" },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(patientProfile);
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [careTasks, setCareTasks] = useState<CareTask[]>(initialCareTasks);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Protocol Synced by Dr. Sarah Vance",
      desc: "Updated cardiovascular guidelines and sodium limits committed to telemetry record.",
      time: "10m ago",
      unread: true,
      type: "success" as const,
    },
    {
      id: "notif-2",
      title: "Lab Ingestion Complete",
      desc: "Comprehensive Metabolic Panel & Lipid Profile processed (14 LOINC extracted).",
      time: "1h ago",
      unread: true,
      type: "info" as const,
    },
    {
      id: "notif-3",
      title: "Safety Engine Verified Plan",
      desc: "Routine Proposal #804 (20m Walk) cleared all 4 safety gates without conflicts.",
      time: "2h ago",
      unread: false,
      type: "info" as const,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const switchUser = (role: "patient" | "clinician") => {
    if (role === "patient") {
      setCurrentUser(patientProfile);
      showToast("Switched to Arjun Kumar (Patient View)");
    } else {
      setCurrentUser(clinicianProfile);
      showToast("Switched to Dr. Sarah Vance, MD (Clinician View)");
    }
  };

  const toggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const newTaken = !med.taken;
          const updated = {
            ...med,
            taken: newTaken,
            takenAt: newTaken ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
          };
          showToast(newTaken ? `Marked ${med.name} as taken!` : `Reset ${med.name} status`);
          return updated;
        }
        return med;
      })
    );
  };

  const toggleCareTask = (id: string) => {
    setCareTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextState = !task.completed;
          showToast(nextState ? `Task completed: ${task.title}` : `Task reopened: ${task.title}`);
          return { ...task, completed: nextState };
        }
        return task;
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const takenCount = medications.filter((m) => m.taken).length;
  const adherenceRate = Math.round((takenCount / medications.length) * 100);
  // Health score calculation with base 80 + adherence adjustment
  const healthScore = Math.min(100, Math.max(50, 75 + Math.round((takenCount / medications.length) * 10)));

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUser,
        medications,
        toggleMedication,
        careTasks,
        toggleCareTask,
        healthScore,
        adherenceRate,
        notifications,
        markNotificationRead,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
