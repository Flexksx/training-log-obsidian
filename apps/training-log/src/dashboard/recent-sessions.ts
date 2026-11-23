import { activityLabel, GYM } from "activity/activities";
import type { Visit } from "activity/visit";
import { workoutTotals } from "workout/progress";
import type { Workout } from "workout/session";
import { formatCount, formatHours, pluralize } from "../format.ts";

const RECENT_SESSION_COUNT = 6;

export type SessionRow = { visit: Visit; title: string; numbers: string[] };

const describeVisit = (visit: Visit, workout: Workout | undefined): { title: string; numbers: string[] } => {
  const watch = [
    visit.seconds ? formatHours(visit.seconds) : "",
    visit.kilocalories ? `${formatCount(visit.kilocalories)} kcal` : "",
  ].filter(Boolean);
  if (visit.activity !== GYM.key) return { title: activityLabel(visit.activity), numbers: watch };
  const totals = workout && workoutTotals(workout.session);
  if (!totals?.exerciseNames.length) return { title: "Gym · no sets logged", numbers: watch };
  return {
    title: totals.exerciseNames.join(", "),
    numbers: [
      ...watch,
      pluralize(totals.exerciseNames.length, "exercise"),
      `${totals.setCount} sets`,
      `${formatCount(totals.volumeKilograms)} kg`,
    ],
  };
};

export const recentSessionRows = (visits: readonly Visit[], workouts: readonly Workout[]): SessionRow[] => {
  const workoutsByPath = new Map(workouts.map(workout => [workout.notePath, workout]));
  return visits
    .toSorted((a, b) => b.date.localeCompare(a.date))
    .slice(0, RECENT_SESSION_COUNT)
    .map(visit => ({ visit, ...describeVisit(visit, workoutsByPath.get(visit.notePath)) }));
};
