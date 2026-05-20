import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function formatDateID(date: Date) {
  const d = new Date(date);
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTimeID(date: Date) {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}.${mm}`;
}

export function formatDateKey(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const ROUND_LABEL: Record<string, string> = {
  R32: "32 Besar",
  R16: "16 Besar",
  QF: "Perempat Final",
  SF: "Semi Final",
  FINAL: "Final",
};

export const ROUND_ORDER = ["R32", "R16", "QF", "SF", "FINAL"] as const;

export const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Jadwal",
  LIVE: "LIVE",
  FINISHED: "FT",
  POSTPONED: "Ditunda",
};
