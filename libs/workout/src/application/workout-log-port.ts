import type { ExerciseSet } from "../domain/exercise-set.ts";

export type WorkoutLogPort = {
  addExercise: (exerciseName: string) => Promise<void>;
  addSet: (exerciseName: string, set: ExerciseSet) => Promise<void>;
  deleteSet: (exerciseName: string, setIndex: number) => Promise<void>;
};
