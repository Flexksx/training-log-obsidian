import type { App } from "obsidian";
import { buildActivityDays, type ActivityDays } from "activity/consistency";
import { toIsoDate, type IsoDate } from "activity/iso-date";
import type { Visit } from "activity/visit";
import { exerciseProgress, type ExerciseProgress } from "workout/progress";
import type { Workout } from "workout/session";
import { loadDailyTasks, loadVisits, loadWorkoutsNewestFirst } from "../notes.ts";

export type Dashboard = {
  today: IsoDate;
  visits: Visit[];
  workouts: Workout[];
  days: ActivityDays;
  progress: ExerciseProgress[];
};

export const loadDashboard = async (app: App): Promise<Dashboard> => {
  const today = toIsoDate(new Date());
  const visits = loadVisits(app);
  const [workouts, tasks] = await Promise.all([loadWorkoutsNewestFirst(app), loadDailyTasks(app)]);
  return {
    today,
    visits,
    workouts,
    days: buildActivityDays(tasks, visits, today),
    progress: exerciseProgress(workouts),
  };
};
