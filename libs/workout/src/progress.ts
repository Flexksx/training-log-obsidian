import { exerciseKey, muscleGroupOf } from "./catalog.ts";
import type { MuscleGroup } from "./catalog-entry.ts";
import type { ExerciseSet, SetKind } from "./exercise-set.ts";
import type { Session, Workout } from "./session.ts";

export type Effort = {
  date: string;
  notePath: string;
  sets: readonly ExerciseSet[];
  value: number;
  topSet: ExerciseSet;
};

export type ExerciseProgress = {
  name: string;
  kind: SetKind;
  group: MuscleGroup;
  efforts: Effort[];
  last: Effort;
  best: number;
  change?: number;
};

export type VolumeStatus = "none" | "under" | "in" | "over";

export const WEEKLY_SET_RANGE = { minimum: 10, maximum: 20 } as const;
export const VOLUME_DAYS = 7;
export const MUSCLE_GROUPS_FOR_VOLUME: readonly MuscleGroup[] = ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core"];
const NOT_MUSCLE: ReadonlySet<MuscleGroup> = new Set(["Mobility", "Cardio"]);

const EPLEY_REPS_DIVISOR = 30;
const KILOGRAMS_WEIGHT_OVER_REPS = 1000;

export const estimatedOneRepMax = (reps: number, kilograms: number): number =>
  reps === 1 ? kilograms : kilograms * (1 + reps / EPLEY_REPS_DIVISOR);

const dominantKind = (sets: readonly ExerciseSet[]): SetKind => {
  const counts = new Map<SetKind, number>();
  for (const set of sets) counts.set(set.kind, (counts.get(set.kind) ?? 0) + 1);
  return [...counts].toSorted((a, b) => b[1] - a[1])[0]?.[0] ?? "weight";
};

const bestBy = <T>(items: readonly T[], score: (item: T) => number): T =>
  items.reduce((best, item) => (score(item) > score(best) ? item : best));

const comparableValue = (set: ExerciseSet): number => {
  switch (set.kind) {
    case "weight":
      return estimatedOneRepMax(set.reps, set.kilograms);
    case "body":
      return set.reps;
    case "time":
      return set.seconds;
  }
};

const topSetRank = (set: ExerciseSet): number =>
  set.kind === "weight" ? set.kilograms * KILOGRAMS_WEIGHT_OVER_REPS + set.reps : comparableValue(set);

const effortOf = (kind: SetKind, sets: readonly ExerciseSet[]): Pick<Effort, "value" | "topSet"> => {
  const same = sets.filter(set => set.kind === kind);
  return { value: Math.max(...same.map(comparableValue)), topSet: bestBy(same, topSetRank) };
};

type Run = { date: string; notePath: string; sets: readonly ExerciseSet[] };

export const exerciseProgress = (workouts: readonly Workout[]): ExerciseProgress[] => {
  const runsByKey = new Map<string, { name: string; runs: Run[] }>();
  for (const { date, notePath, session } of workouts.toSorted((a, b) => a.date.localeCompare(b.date))) {
    for (const exercise of session.exercises.filter(candidate => candidate.sets.length)) {
      const key = exerciseKey(exercise.name);
      const entry = runsByKey.get(key) ?? { name: exercise.name, runs: [] };
      entry.runs.push({ date, notePath, sets: exercise.sets });
      runsByKey.set(key, entry);
    }
  }
  return [...runsByKey.values()].flatMap(({ name, runs }) => {
    const kind = dominantKind(runs.flatMap(run => run.sets));
    const efforts = runs
      .filter(run => run.sets.some(set => set.kind === kind))
      .map(run => ({ ...run, ...effortOf(kind, run.sets) }));
    const last = efforts.at(-1);
    if (!last) return [];
    const previous = efforts.at(-2);
    return [
      {
        name,
        kind,
        group: muscleGroupOf(name),
        efforts,
        last,
        best: Math.max(...efforts.map(effort => effort.value)),
        change: previous?.value ? (last.value - previous.value) / previous.value : undefined,
      },
    ];
  });
};

export const setsPerMuscleGroup = (
  progress: readonly ExerciseProgress[],
  from: string,
  to: string,
): Map<MuscleGroup, number> => {
  const counts = new Map<MuscleGroup, number>();
  progress.forEach(exercise => {
    const sets = exercise.efforts
      .filter(effort => effort.date >= from && effort.date <= to)
      .reduce((total, effort) => total + effort.sets.length, 0);
    if (sets) counts.set(exercise.group, (counts.get(exercise.group) ?? 0) + sets);
  });
  return counts;
};

export const volumeGroups = (counts: ReadonlyMap<MuscleGroup, number>): MuscleGroup[] => [
  ...MUSCLE_GROUPS_FOR_VOLUME,
  ...[...counts.keys()].filter(group => !MUSCLE_GROUPS_FOR_VOLUME.includes(group) && !NOT_MUSCLE.has(group)),
];

export const volumeStatus = (sets: number): VolumeStatus => {
  if (sets === 0) return "none";
  if (sets < WEEKLY_SET_RANGE.minimum) return "under";
  return sets > WEEKLY_SET_RANGE.maximum ? "over" : "in";
};

export const workoutTotals = (session: Session) => {
  const exercises = session.exercises.filter(exercise => exercise.sets.length);
  const sets = exercises.flatMap(exercise => exercise.sets);
  return {
    exerciseNames: exercises.map(exercise => exercise.name),
    setCount: sets.length,
    volumeKilograms: sets.reduce((total, set) => total + (set.kind === "weight" ? set.reps * set.kilograms : 0), 0),
  };
};

export const lastPerformance = (
  workoutsNewestFirst: readonly Workout[],
  exerciseName: string,
  beforeDate: string,
): { date: string; sets: ExerciseSet[] } | undefined => {
  const key = exerciseKey(exerciseName);
  for (const workout of workoutsNewestFirst) {
    if (workout.date >= beforeDate) continue;
    const exercise = workout.session.exercises.find(candidate => exerciseKey(candidate.name) === key);
    if (exercise?.sets.length) return { date: workout.date, sets: exercise.sets };
  }
  return undefined;
};
