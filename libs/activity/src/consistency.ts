import { ACTIVITIES, type ActivityKey, activityOfTask } from "./activities.ts";
import { addDays, addWeeks, type IsoDate, weekEnd, weekStart } from "./iso-date.ts";
import type { Visit } from "./visit.ts";

export type PlannedTask = { date: IsoDate; text: string; status: string };
export type ActivityDay = { done: Set<ActivityKey>; missed: Set<ActivityKey> };
export type ActivityDays = ReadonlyMap<IsoDate, ActivityDay>;

export const WEEKLY_TARGET = 3;
const DONE_STATUSES = new Set(["x", "X"]);
const MISSED_STATUS = "-";

export const buildActivityDays = (
  tasks: readonly PlannedTask[],
  visits: readonly Visit[],
  today: IsoDate,
): ActivityDays => {
  const days = new Map<IsoDate, ActivityDay>();
  const dayOf = (date: IsoDate): ActivityDay => {
    const day = days.get(date) ?? { done: new Set(), missed: new Set() };
    days.set(date, day);
    return day;
  };
  tasks.forEach(task => {
    const activity = activityOfTask(task.text);
    if (!activity || task.date > today) return;
    if (DONE_STATUSES.has(task.status)) dayOf(task.date).done.add(activity.key);
    else if (task.status === MISSED_STATUS || task.date < today) dayOf(task.date).missed.add(activity.key);
  });
  for (const visit of visits.filter(candidate => candidate.date <= today)) dayOf(visit.date).done.add(visit.activity);
  for (const day of days.values()) {
    for (const activity of day.done) day.missed.delete(activity);
  }
  return days;
};

export const countActivities = (days: ActivityDays, from: IsoDate, to: IsoDate): number => {
  let count = 0;
  for (let date = from; date <= to; date = addDays(date, 1)) count += days.get(date)?.done.size ?? 0;
  return count;
};

export const countByActivity = (days: ActivityDays, from: IsoDate, to: IsoDate): Record<ActivityKey, number> => {
  const inRange = [...days].filter(([date]) => date >= from && date <= to).map(([, day]) => day);
  return Object.fromEntries(
    ACTIVITIES.map(activity => [activity.key, inRange.filter(day => day.done.has(activity.key)).length]),
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
    .filter(day => day <= today && days.get(day)?.done.size)
    .sort()
    .at(-1);
  return date === undefined ? undefined : { date, activities: [...(days.get(date)?.done ?? [])] };
};
