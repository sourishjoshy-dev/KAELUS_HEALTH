/**
 * Care Adherence Utilities
 *
 * Calculates patient update adherence based on their chosen schedule days
 * and their actual submission history. Does NOT represent medical risk.
 *
 * Terminology: "adherence" = completion of scheduled health updates.
 */

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export type DayStatus = "completed" | "missed" | "upcoming" | "not_scheduled";

export interface HealthUpdate {
  /** ISO date string (YYYY-MM-DD) of the submitted update */
  date: string;
  /** Optional note / summary */
  note?: string;
}

export interface AdherenceSchedule {
  /** Days patient has chosen to submit updates */
  scheduledDays: DayOfWeek[];
  /** All health updates the patient has submitted */
  submittedUpdates: HealthUpdate[];
}

export interface DayAdherenceStatus {
  date: string;       // ISO date YYYY-MM-DD
  dayLabel: DayOfWeek;
  status: DayStatus;
}

export interface AdherenceResult {
  /** 0-100 percentage, or null if no schedule / no history yet */
  percentage: number | null;
  /** Human-readable risk level */
  riskLevel: "good" | "moderate" | "high" | "critical" | "no_data";
  /** Risk label text */
  riskLabel: string;
  /** Total scheduled update days in the reference window */
  scheduled: number;
  /** Number of those scheduled days where an update was actually submitted */
  completed: number;
  /** Number of missed scheduled days (past only) */
  missed: number;
  /** Current consecutive missed scheduled updates */
  missedStreak: number;
  /** ISO date string of the last submitted update, or null */
  lastUpdateDate: string | null;
  /** Human-readable label: "Today", "Yesterday", "2 days ago", etc. */
  lastUpdateLabel: string;
  /** ISO date string of the next upcoming scheduled date, or null */
  nextScheduledDate: string | null;
  /** "Monday", "Tuesday", etc. of next scheduled date */
  nextScheduledDayLabel: string | null;
  /** Per-day status for the last N days */
  calendarDays: DayAdherenceStatus[];
  /** Contextual message for the patient */
  contextMessage: string;
  /** 0-100 percentage risk (100 - percentage) */
  adherenceRisk: number | null;
}

// Helpers

const DAY_NAMES: DayOfWeek[] = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDayName(isoDate: string): DayOfWeek {
  const d = new Date(isoDate + "T00:00:00Z");
  return DAY_NAMES[d.getUTCDay()] as DayOfWeek;
}

function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(d);
}

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00Z");
  const to = new Date(toISO + "T00:00:00Z");
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function dayAgoLabel(isoDate: string): string {
  const today = todayISO();
  const diff = daysBetween(isoDate, today);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

// Core Calculation

export function calculateAdherence(
  schedule: AdherenceSchedule,
  windowDays = 28
): AdherenceResult {
  const { scheduledDays, submittedUpdates } = schedule;

  if (!scheduledDays || scheduledDays.length === 0) {
    return buildOnDemandResult(submittedUpdates);
  }

  const today = todayISO();

  // Deduplicate submissions by date
  const submittedSet = new Set<string>();
  for (const u of submittedUpdates) {
    if (u.date) submittedSet.add(u.date);
  }

  const windowStart = addDays(today, -(windowDays - 1));
  const scheduledDatesPast: string[] = [];
  const calendarDays: DayAdherenceStatus[] = [];

  for (let i = 0; i < windowDays + 7; i++) {
    const date = addDays(windowStart, i);
    const dayName = getDayName(date);

    if (!scheduledDays.includes(dayName)) {
      if (daysBetween(today, date) <= 6 && daysBetween(date, today) <= 13) {
        calendarDays.push({ date, dayLabel: dayName, status: "not_scheduled" });
      }
      continue;
    }

    if (date >= today) {
      if (date === today && submittedSet.has(date)) {
        scheduledDatesPast.push(date);
        calendarDays.push({ date, dayLabel: dayName, status: "completed" });
      } else {
        if (daysBetween(today, date) <= 7) {
          calendarDays.push({ date, dayLabel: dayName, status: "upcoming" });
        }
      }
    } else {
      scheduledDatesPast.push(date);
      const status: DayStatus = submittedSet.has(date) ? "completed" : "missed";
      if (daysBetween(date, today) <= 13) {
        calendarDays.push({ date, dayLabel: dayName, status });
      }
    }
  }

  calendarDays.sort((a, b) => a.date.localeCompare(b.date));

  if (scheduledDatesPast.length === 0) {
    return buildNoDataResult("Monitoring not yet established. Your first scheduled update is upcoming.");
  }

  const completed = scheduledDatesPast.filter((d) => submittedSet.has(d)).length;
  const missed = scheduledDatesPast.length - completed;
  const percentage = Math.round((completed / scheduledDatesPast.length) * 100);
  const adherenceRisk = 100 - percentage;

  const sortedPastScheduled = [...scheduledDatesPast].sort().reverse();
  let missedStreak = 0;
  for (const d of sortedPastScheduled) {
    if (!submittedSet.has(d)) {
      missedStreak++;
    } else {
      break;
    }
  }

  const sortedSubmissions = [...submittedSet].sort().reverse();
  const lastUpdateDate = sortedSubmissions.length > 0 ? sortedSubmissions[0] : null;
  const lastUpdateLabel = lastUpdateDate ? dayAgoLabel(lastUpdateDate) : "Never";

  const nextScheduledDate = findNextScheduledDate(today, scheduledDays);
  const nextScheduledDayLabel = nextScheduledDate ? getDayName(nextScheduledDate) : null;

  const { riskLevel, riskLabel } = getRiskLevel(percentage);
  const contextMessage = buildContextMessage(missedStreak, percentage, nextScheduledDayLabel);

  return {
    percentage,
    adherenceRisk,
    riskLevel,
    riskLabel,
    scheduled: scheduledDatesPast.length,
    completed,
    missed,
    missedStreak,
    lastUpdateDate,
    lastUpdateLabel,
    nextScheduledDate,
    nextScheduledDayLabel,
    calendarDays,
    contextMessage,
  };
}

function findNextScheduledDate(today: string, scheduledDays: DayOfWeek[]): string | null {
  for (let i = 1; i <= 7; i++) {
    const date = addDays(today, i);
    const dayName = getDayName(date);
    if (scheduledDays.includes(dayName)) return date;
  }
  return null;
}

function buildOnDemandResult(submittedUpdates: HealthUpdate[]): AdherenceResult {
  const lastUpdateDate = getLastUpdate(submittedUpdates);
  const lastUpdateLabel = lastUpdateDate ? dayAgoLabel(lastUpdateDate) : "Never";
  return {
    percentage: 100,
    adherenceRisk: 0,
    riskLevel: "good",
    riskLabel: "Low Risk",
    scheduled: submittedUpdates.length,
    completed: submittedUpdates.length,
    missed: 0,
    missedStreak: 0,
    lastUpdateDate,
    lastUpdateLabel,
    nextScheduledDate: null,
    nextScheduledDayLabel: null,
    calendarDays: [],
    contextMessage: "You are on an on-demand reporting schedule.",
  };
}

function buildNoDataResult(message: string): AdherenceResult {
  return {
    percentage: null,
    adherenceRisk: null,
    riskLevel: "no_data",
    riskLabel: "No Data",
    scheduled: 0,
    completed: 0,
    missed: 0,
    missedStreak: 0,
    lastUpdateDate: null,
    lastUpdateLabel: "Never",
    nextScheduledDate: null,
    nextScheduledDayLabel: null,
    calendarDays: [],
    contextMessage: message,
  };
}

export function getRiskLevel(percentage: number | null): {
  riskLevel: AdherenceResult["riskLevel"];
  riskLabel: string;
} {
  if (percentage === null) return { riskLevel: "no_data", riskLabel: "No Data" };
  if (percentage >= 80) return { riskLevel: "good", riskLabel: "Low Risk" };
  if (percentage >= 60) return { riskLevel: "moderate", riskLabel: "Moderate Risk" };
  if (percentage >= 40) return { riskLevel: "high", riskLabel: "High Risk" };
  return { riskLevel: "critical", riskLabel: "Critical Risk" };
}

function buildContextMessage(
  missedStreak: number,
  percentage: number,
  nextDay: string | null
): string {
  if (percentage >= 80) {
    return "Great job! You are consistently completing your scheduled health updates.";
  }
  if (missedStreak === 0) {
    return `You are on track.${nextDay ? ` Next scheduled update: ${nextDay}.` : ""}`;
  }
  if (missedStreak === 1) {
    return "You have missed 1 scheduled health update. Complete your next update to maintain your monitoring schedule.";
  }
  return `You have missed ${missedStreak} consecutive scheduled updates. Please submit a health update to re-establish your monitoring schedule.`;
}

export function getLastUpdate(submittedUpdates: HealthUpdate[]): string | null {
  if (!submittedUpdates || submittedUpdates.length === 0) return null;
  return [...submittedUpdates].sort((a, b) => b.date.localeCompare(a.date))[0].date;
}

export function getNextScheduledUpdate(scheduledDays: DayOfWeek[]): string | null {
  const today = todayISO();
  return findNextScheduledDate(today, scheduledDays);
}

export function calculateMissedStreak(
  scheduledDays: DayOfWeek[],
  submittedUpdates: HealthUpdate[],
  windowDays = 28
): number {
  return calculateAdherence({ scheduledDays, submittedUpdates }, windowDays).missedStreak;
}
