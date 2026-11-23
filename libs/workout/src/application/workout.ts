import type { Session } from "../domain/session.ts";

export type Workout = { date: string; notePath: string; session: Session };

export const recentExerciseNames = (workoutsNewestFirst: readonly Workout[]): string[] => [
  ...new Set(workoutsNewestFirst.flatMap(workout => workout.session.exercises.map(exercise => exercise.name))),
];
