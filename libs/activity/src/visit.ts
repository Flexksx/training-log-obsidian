import type { ActivityKey } from "./activities.ts";
import type { IsoDate } from "./iso-date.ts";

/** One activity note. Duration and calories come from the watch, when logged. */
export type Visit = {
  date: IsoDate;
  activity: ActivityKey;
  notePath: string;
  seconds?: number;
  kilocalories?: number;
};

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const PLAIN_NUMBER = /^\d+(\.\d+)?$/;

/** Duration as Strava shows it: "1h 50m", "53m 30s". A plain number is minutes. */
export const parseDuration = (value: unknown): number | undefined => {
  if (value == null || value === "") return undefined;
  if (typeof value === "number") return value * SECONDS_PER_MINUTE;
  const text = String(value).trim();
  if (PLAIN_NUMBER.test(text)) return Number(text) * SECONDS_PER_MINUTE;
  const part = (pattern: RegExp): number => Number(text.match(pattern)?.[1] ?? 0);
  const seconds = part(/(\d+)\s*h/i) * SECONDS_PER_HOUR + part(/(\d+)\s*m(?!o)/i) * SECONDS_PER_MINUTE + part(/(\d+)\s*s/i);
  return seconds || undefined;
};

export const parseKilocalories = (value: unknown): number | undefined => {
  if (value == null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};
