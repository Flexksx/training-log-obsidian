export type ExerciseSet =
  | { kind: "weight"; reps: number; kilograms: number }
  | { kind: "body"; reps: number }
  | { kind: "time"; seconds: number };

export type SetKind = ExerciseSet["kind"];
