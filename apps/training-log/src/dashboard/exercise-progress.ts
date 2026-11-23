import type { IsoDate } from "activity/iso-date";
import { MUSCLE_GROUPS } from "workout/catalog-entry";
import type { ExerciseProgress } from "workout/progress";
import { formatCount, formatRelativeDay, formatTopSet, pluralize } from "../format.ts";

const PERCENT = 100;

export type Trend = { text: string; variant: "delta" | "delta-active" };

export const groupByMuscle = (progress: readonly ExerciseProgress[]) =>
  MUSCLE_GROUPS.filter(group => progress.some(exercise => exercise.group === group)).map(group => ({
    group,
    exercises: progress
      .filter(exercise => exercise.group === group)
      .toSorted((a, b) => b.last.date.localeCompare(a.last.date) || a.name.localeCompare(b.name)),
  }));

export const metricOf = (exercise: ExerciseProgress): string => {
  switch (exercise.kind) {
    case "weight":
      return `${formatCount(exercise.best)} kg`;
    case "body":
      return `${exercise.best} reps`;
    case "time":
      return formatTopSet(exercise.last.topSet);
  }
};

export const trendOf = (change: number | undefined): Trend => {
  if (change === undefined) return { text: "baseline", variant: "delta" };
  const percent = Math.round(change * PERCENT);
  if (percent > 0) return { text: `▲ ${percent}%`, variant: "delta-active" };
  if (percent < 0) return { text: `▼ ${-percent}%`, variant: "delta-active" };
  return { text: "■ 0%", variant: "delta" };
};

export const describeEfforts = (exercise: ExerciseProgress): string =>
  exercise.efforts.map(effort => `${effort.date}: ${formatTopSet(effort.topSet)}`).join("\n");

export const describeLastSession = (exercise: ExerciseProgress, today: IsoDate): string =>
  `Last top set ${formatTopSet(exercise.last.topSet)} · ${pluralize(exercise.efforts.length, "session")} · ${formatRelativeDay(exercise.last.date, today)}`;
