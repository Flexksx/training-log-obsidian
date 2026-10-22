import { ACTIVITIES, type ActivityKey } from "./activities.ts";
import { addWeeks, type IsoDate, weekStart } from "./iso-date.ts";
import type { Visit } from "./visit.ts";

export type WeekEnergy = {
  weekStart: IsoDate;
  seconds: Record<ActivityKey, number>;
  kilocalories: number;
  untimedVisits: number;
};

export const weeklyEnergy = (visits: readonly Visit[], today: IsoDate, weekCount: number): WeekEnergy[] => {
  const firstTimed = visits
    .filter(visit => visit.seconds && visit.date <= today)
    .map(visit => visit.date)
    .sort()[0];
  if (!firstTimed) return [];
  const weeks: WeekEnergy[] = [];
  for (let week = weekStart(firstTimed); week <= weekStart(today); week = addWeeks(week, 1)) {
    const inWeek = visits.filter(visit => weekStart(visit.date) === week);
    weeks.push({
      weekStart: week,
      seconds: Object.fromEntries(
        ACTIVITIES.map(activity => [
          activity.key,
          inWeek
            .filter(visit => visit.activity === activity.key)
            .reduce((total, visit) => total + (visit.seconds ?? 0), 0),
        ]),
      ) as Record<ActivityKey, number>,
      kilocalories: inWeek.reduce((total, visit) => total + (visit.kilocalories ?? 0), 0),
      untimedVisits: inWeek.filter(visit => !visit.seconds).length,
    });
  }
  return weeks.slice(-weekCount);
};

export const totalSeconds = (week: WeekEnergy): number =>
  ACTIVITIES.reduce((total, activity) => total + week.seconds[activity.key], 0);
