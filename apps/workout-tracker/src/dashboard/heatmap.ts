import { type ActivityKey, activityLabel } from "activity/activities";
import type { ActivityDays } from "activity/consistency";
import { addDays, addWeeks, DAYS_PER_WEEK, fromIsoDate, type IsoDate, weekStart } from "activity/iso-date";
import type { SwatchVariant } from "design-system/types";
import { formatDate, formatShortDate } from "../format.ts";
import { SERIES_OF_ACTIVITY } from "../series.ts";

export const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

const MONTH_LABEL_MIN_WEEKS = [1, 2];

const monthOf = (date: IsoDate): number => fromIsoDate(date).getMonth();

const firstWeekOf = (today: IsoDate, weekCount: number): IsoDate => addWeeks(weekStart(today), -(weekCount - 1));

export const cellVariant = (activities: ReadonlySet<ActivityKey> | undefined): SwatchVariant => {
  const done = [...(activities ?? [])];
  if (done.length > 1) return "mixed";
  const [only] = done;
  return only ? SERIES_OF_ACTIVITY[only] : "empty";
};

export const describeDay = (days: ActivityDays, date: IsoDate): string => {
  const done = [...(days.get(date) ?? [])].map(activityLabel);
  return `${formatShortDate(date)} · ${done.join(" + ") || "rest"}`;
};

export const monthLabels = (today: IsoDate, weekCount: number): string[] => {
  const firstWeek = firstWeekOf(today, weekCount);
  return Array.from({ length: weekCount }, (_, week) => {
    const date = addWeeks(firstWeek, week);
    const startsMonth =
      week === 0
        ? MONTH_LABEL_MIN_WEEKS.every(weeks => monthOf(addWeeks(date, weeks)) === monthOf(date))
        : monthOf(date) !== monthOf(addWeeks(date, -1));
    return startsMonth && week < weekCount - 1 ? formatDate(date, { month: "short" }) : "";
  });
};

export const heatmapDates = (today: IsoDate, weekCount: number): IsoDate[] => {
  const firstWeek = firstWeekOf(today, weekCount);
  return Array.from({ length: weekCount * DAYS_PER_WEEK }, (_, index) => addDays(firstWeek, index)).filter(
    date => date <= today,
  );
};
