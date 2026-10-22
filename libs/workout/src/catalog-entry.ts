import type { SetKind } from "./exercise-set.ts";

export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Arms",
  "Core",
  "Full body",
  "Cardio",
  "Mobility",
  "Other",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export type CatalogEntry = { name: string; group: MuscleGroup; kind?: SetKind };
