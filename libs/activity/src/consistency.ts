import { ACTIVITIES, type ActivityKey } from "./activities.ts";
import { addDays, addWeeks, type IsoDate, weekEnd, weekStart } from "./iso-date.ts";
import type { Visit } from "./visit.ts";

export type ActivityDays = ReadonlyMap<IsoDate, ReadonlySet<ActivityKey>>;

export const WEEKLY_TARGET = 3;

export const buildActivityDays = (visits: readonly Visit[], today: IsoDate): ActivityDays => {
  const days = new Map<IsoDate, Set<ActivityKey>>();
  for (const visit of visits.filter(candidate => candidate.date <= today)) {
    days.set(visit.date, (days.get(visit.date) ?? new Set()).add(visit.activity));
  }
  return days;
};

export const countActivities = (days: ActivityDays, from: IsoDate, to: IsoDate): number => {
  let count = 0;
  for (let date = from; date <= to; date = addDays(date, 1)) count += days.get(date)?.size ?? 0;
  return count;
};

export const countByActivity = (days: ActivityDays, from: IsoDate, to: IsoDate): Record<ActivityKey, number> => {
  const inRange = [...days].filter(([date]) => date >= from && date <= to).map(([, day]) => day);
  return Object.fromEntries(
    ACTIVITIES.map(activity => [activity.key, inRange.filter(day => day.has(activity.key)).length]),
  ) as Record<ActivityKey, number>;
};

export const weekStreaks = (days: ActivityDays, today: IsoDate): { current: number; best: number } => {
  const thisWeek = weekStart(today);
  const first = [...days.keys()].sort()[0];
  if (!first) return { current: 0, best: 0 };
  const hits: boolean[] = [];
  for (let week = weekStart(first); week < thisWeek; week = addWeeks(week, 1)) {
    hits.push(countActivities(days, week, weekEnd(week)) >= WEEKLY_TARGET);
  }
  let current = 0;
  for (let index = hits.length - 1; index >= 0 && hits[index]; index--) current++;
  if (countActivities(days, thisWeek, today) >= WEEKLY_TARGET) current++;
  let best = 0;
  let run = 0;
  hits.forEach(hit => {
    run = hit ? run + 1 : 0;
    best = Math.max(best, run);
  });
  return { current, best: Math.max(best, current) };
};

export const lastActivity = (
  days: ActivityDays,
  today: IsoDate,
): { date: IsoDate; activities: ActivityKey[] } | undefined => {
  const date = [...days.keys()]
    .filter(day => day <= today && days.get(day)?.size)
    .sort()
    .at(-1);
  return date === undefined ? undefined : { date, activities: [...(days.get(date) ?? [])] };
};
