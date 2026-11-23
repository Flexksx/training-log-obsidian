import type { ExerciseSet } from "./exercise-set.ts";

export type Exercise = { name: string; sets: ExerciseSet[] };
export type Session = { exercises: Exercise[] };

export const findExercise = (session: Session, exerciseName: string): Exercise | undefined =>
  session.exercises.find(exercise => exercise.name === exerciseName);
