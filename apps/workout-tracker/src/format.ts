import { daysBetween, fromIsoDate, type IsoDate } from "activity/iso-date";
import { formatClock, type ExerciseSet } from "workout/exercise-set";

const LOCALE = "en-GB";
const DAYS_SHOWN_AS_RELATIVE = 7;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

export const formatDate = (date: IsoDate, options: Intl.DateTimeFormatOptions): string =>
  fromIsoDate(date).toLocaleDateString(LOCALE, options);

export const formatDayMonth = (date: IsoDate): string => formatDate(date, { day: "numeric", month: "short" });

export const formatShortDate = (date: IsoDate): string =>
  formatDate(date, { weekday: "short", day: "numeric", month: "short" });

export const formatRelativeDay = (date: IsoDate, today: IsoDate): string => {
  const days = daysBetween(date, today);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return days < DAYS_SHOWN_AS_RELATIVE ? `${days} days ago` : formatDayMonth(date);
};

export const formatCount = (value: number): string => Math.round(value).toLocaleString(LOCALE);

export const pluralize = (count: number, word: string): string => `${count} ${word}${count === 1 ? "" : "s"}`;

export const formatHours = (seconds: number): string => {
  const minutes = Math.round(seconds / SECONDS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR) return `${minutes}m`;
  return `${Math.floor(minutes / MINUTES_PER_HOUR)}h ${String(minutes % MINUTES_PER_HOUR).padStart(2, "0")}m`;
};

export const formatTopSet = (set: ExerciseSet): string => {
  switch (set.kind) {
    case "weight":
      return `${set.reps} × ${set.kilograms} kg`;
    case "body":
      return `${set.reps} reps`;
    case "time":
      return formatClock(set.seconds);
  }
};
