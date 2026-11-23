import { type ExerciseSet, formatClock } from "workout/exercise-set";
import { pluralize } from "../format.ts";

const bestOfKind = (sets: readonly ExerciseSet[], last: ExerciseSet): string => {
  switch (last.kind) {
    case "time":
      return `best ${formatClock(Math.max(...sets.flatMap(set => (set.kind === "time" ? [set.seconds] : []))))}`;
    case "body":
      return `top ${Math.max(...sets.flatMap(set => (set.kind === "body" ? [set.reps] : [])))} reps`;
    case "weight":
      return `top ${Math.max(...sets.flatMap(set => (set.kind === "weight" ? [set.kilograms] : [])))} kg`;
  }
};

export const summarizeSets = (sets: readonly ExerciseSet[]): string => {
  const last = sets.at(-1);
  return last ? `${pluralize(sets.length, "set")} · ${bestOfKind(sets, last)}` : "No sets yet";
};
