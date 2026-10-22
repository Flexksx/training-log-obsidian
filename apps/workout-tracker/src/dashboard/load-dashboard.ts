import { type ActivityDays, buildActivityDays } from "activity/consistency";
import { type IsoDate, toIsoDate } from "activity/iso-date";
import type { Visit } from "activity/visit";
import type { App } from "obsidian";
import { type ExerciseProgress, exerciseProgress } from "workout/progress";
import type { Workout } from "workout/session";
import { loadVisits, loadWorkoutsNewestFirst } from "../notes.ts";

export type Dashboard = {
  today: IsoDate;
  visits: Visit[];
  workouts: Workout[];
  days: ActivityDays;
  progress: ExerciseProgress[];
};

export const loadDashboard = async (app: App, activityFolder: string): Promise<Dashboard> => {
  const today = toIsoDate(new Date());
  const visits = loadVisits(app, activityFolder);
  const workouts = await loadWorkoutsNewestFirst(app, activityFolder);
  return {
    today,
    visits,
    workouts,
    days: buildActivityDays(visits, today),
    progress: exerciseProgress(workouts),
  };
};
