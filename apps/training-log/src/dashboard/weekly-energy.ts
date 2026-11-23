import { ACTIVITIES } from "activity/activities";
import { totalSeconds, type WeekEnergy } from "activity/energy";
import type { Series } from "design-system/types";
import { formatCount, formatDayMonth, formatHours, pluralize } from "../format.ts";
import { SERIES_OF_ACTIVITY } from "../series.ts";

export const WEEK_COUNT = 8;

const MINIMUM_SCALE_SECONDS = 3600;

export const scaleOf = (weeks: readonly WeekEnergy[]): number =>
  Math.max(MINIMUM_SCALE_SECONDS, ...weeks.map(totalSeconds));

export const summarizeWeek = (week: WeekEnergy | undefined): string =>
  week ? `${formatHours(totalSeconds(week))} · ${formatCount(week.kilocalories)} kcal` : "nothing logged";

export const describeWeek = (week: WeekEnergy): string =>
  [
    `Week of ${formatDayMonth(week.weekStart)}`,
    ...ACTIVITIES.filter(activity => week.seconds[activity.key]).map(
      activity => `${activity.label} ${formatHours(week.seconds[activity.key])}`,
    ),
    `${formatCount(week.kilocalories)} kcal`,
    week.untimedVisits ? `${pluralize(week.untimedVisits, "session")} without duration` : "",
  ]
    .filter(Boolean)
    .join("\n");

export const segmentsOf = (week: WeekEnergy): { series: Series; weight: number }[] =>
  ACTIVITIES.filter(activity => week.seconds[activity.key]).map(activity => ({
    series: SERIES_OF_ACTIVITY[activity.key],
    weight: week.seconds[activity.key],
  }));
