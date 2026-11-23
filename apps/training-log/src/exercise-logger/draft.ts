import { catalogEntryOf } from "workout/catalog";
import { type ExerciseSet, joinMinutes, type SetKind, splitMinutes } from "workout/exercise-set";

export type Draft = {
  kind: SetKind;
  reps: number | null;
  kilograms: number | null;
  minutes: number | null;
  seconds: number | null;
};

export type DraftField = Exclude<keyof Draft, "kind">;

const DEFAULT_DRAFT: Draft = { kind: "weight", reps: 8, kilograms: 20, minutes: 1, seconds: 0 };
const REP_STEP = 1;
const KILOGRAM_STEP = 2.5;
const MINUTE_STEP = 1;
const SECOND_STEP = 5;

export const KIND_OPTIONS = [
  { value: "weight", label: "Weight" },
  { value: "body", label: "Body weight" },
  { value: "time", label: "Time" },
] as const satisfies readonly { value: SetKind; label: string }[];

export const KIND_FIELDS: Record<SetKind, readonly { label: string; field: DraftField; step: number }[]> = {
  weight: [
    { label: "Reps", field: "reps", step: REP_STEP },
    { label: "Weight (kg)", field: "kilograms", step: KILOGRAM_STEP },
  ],
  body: [{ label: "Reps", field: "reps", step: REP_STEP }],
  time: [
    { label: "Min", field: "minutes", step: MINUTE_STEP },
    { label: "Sec", field: "seconds", step: SECOND_STEP },
  ],
};

const draftFieldsOf = (set: ExerciseSet): Partial<Draft> => {
  switch (set.kind) {
    case "weight":
      return { kind: set.kind, reps: set.reps, kilograms: set.kilograms };
    case "body":
      return { kind: set.kind, reps: set.reps };
    case "time":
      return { kind: set.kind, ...splitMinutes(set.seconds) };
  }
};

export const seedDraft = (exerciseName: string, lastSetToday?: ExerciseSet, firstSetLastTime?: ExerciseSet): Draft => {
  const seed = lastSetToday ?? firstSetLastTime;
  const kind = catalogEntryOf(exerciseName)?.kind;
  return { ...DEFAULT_DRAFT, ...(kind && { kind }), ...(seed && draftFieldsOf(seed)) };
};

export const withField = (draft: Draft, field: DraftField, value: number | null): Draft => {
  const next = { ...draft };
  next[field] = value;
  return next;
};

export const setFromDraft = (draft: Draft): ExerciseSet | undefined => {
  const reps = Math.round(draft.reps ?? 0);
  switch (draft.kind) {
    case "weight":
      return reps > 0 && draft.kilograms !== null ? { kind: "weight", reps, kilograms: draft.kilograms } : undefined;
    case "body":
      return reps > 0 ? { kind: "body", reps } : undefined;
    case "time": {
      const seconds = joinMinutes(Math.round(draft.minutes ?? 0), Math.round(draft.seconds ?? 0));
      return seconds > 0 ? { kind: "time", seconds } : undefined;
    }
  }
};

export const missingInputMessage = (kind: SetKind): string => (kind === "time" ? "Enter a time" : "Enter reps");
