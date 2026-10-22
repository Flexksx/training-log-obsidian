import { ACTIVITIES, type ActivityKey, activityLabel } from "activity/activities";
import {
  type ActivityDays,
  countActivities,
  countByActivity,
  lastActivity,
  WEEKLY_TARGET,
  weekStreaks,
} from "activity/consistency";
import { addDays, addWeeks, type IsoDate, weekStart } from "activity/iso-date";
import type { Visit } from "activity/visit";
import { formatDate, formatHours, formatRelativeDay, pluralize } from "../format.ts";

const LOOKBACK_WEEKS = 4;
const AVERAGE_DECIMALS = 1;

export type TileContent = { label: string; value: string; unit?: string; detail: string };

export type SummaryTiles = {
  week: TileContent;
  pips: boolean[];
  streak: TileContent;
  lookback: TileContent;
  lastSession: TileContent;
};

const describeLast = (visits: readonly Visit[], date: IsoDate, activities: readonly ActivityKey[]): string => {
  const seconds = visits.filter(visit => visit.date === date).reduce((total, visit) => total + (visit.seconds ?? 0), 0);
  return [
    activities.map(activityLabel).join(" + "),
    formatDate(date, { weekday: "short" }),
    ...(seconds ? [formatHours(seconds)] : []),
  ].join(" · ");
};

export const summarizeTiles = (days: ActivityDays, today: IsoDate, visits: readonly Visit[]): SummaryTiles => {
  const thisWeek = countActivities(days, weekStart(today), today);
  const remaining = Math.max(0, WEEKLY_TARGET - thisWeek);
  const streak = weekStreaks(days, today);
  const lookbackStart = addDays(addWeeks(today, -LOOKBACK_WEEKS), 1);
  const lookbackAverage = countActivities(days, lookbackStart, today) / LOOKBACK_WEEKS;
  const split = countByActivity(days, lookbackStart, today);
  const last = lastActivity(days, today);

  return {
    week: {
      label: "This week",
      value: String(thisWeek),
      unit: `/ ${WEEKLY_TARGET}`,
      detail: remaining ? `${pluralize(remaining, "session")} to go` : "Target hit",
    },
    pips: Array.from({ length: Math.max(WEEKLY_TARGET, thisWeek) }, (_, index) => index < thisWeek),
    streak: {
      label: "Week streak",
      value: String(streak.current),
      unit: streak.current === 1 ? "week" : "weeks",
      detail: `at ${WEEKLY_TARGET}+ per week · best ${streak.best}`,
    },
    lookback: {
      label: `Last ${LOOKBACK_WEEKS} weeks`,
      value: lookbackAverage.toFixed(AVERAGE_DECIMALS),
      unit: "/ week",
      detail: ACTIVITIES.map(activity => `${activity.label} ${split[activity.key]}`).join(" · "),
    },
    lastSession: {
      label: "Last session",
      value: last ? formatRelativeDay(last.date, today) : "None",
      detail: last ? describeLast(visits, last.date, last.activities) : "Log one to start",
    },
  };
};
