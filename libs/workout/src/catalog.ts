import { BUILT_IN_CATALOG } from "./built-in-catalog.ts";
import type { CatalogEntry, MuscleGroup } from "./catalog-entry.ts";

export const exerciseKey = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]/g, "");

const CATALOG_BY_KEY = new Map(BUILT_IN_CATALOG.map(entry => [exerciseKey(entry.name), entry]));

const GROUP_RULES_IN_PRIORITY_ORDER: readonly (readonly [MuscleGroup, RegExp])[] = [
  ["Mobility", /\b(stretch(es|ing)?|mobility|foam roll(ing)?|yoga)\b/i],
  ["Core", /\b(abs?|abdominal|crunch|plank|knee raise|leg raise|hanging)\b/i],
  ["Arms", /\b(curls?|biceps?|triceps?|skull)\b/i],
  ["Shoulders", /\b(delts?|shoulder|overhead|lateral raise|shrug)\b/i],
  ["Chest", /\b(bench|chest|fly|pec|push-?ups?|dips?)\b/i],
  ["Back", /\b(rows?|pulldown|pull-?ups?|chin-?ups?|lat|deadlift)\b/i],
  ["Legs", /\b(squats?|leg|lunges?|calf|glute|hip|step-?up)\b/i],
];

export const catalogEntryOf = (name: string): CatalogEntry | undefined => CATALOG_BY_KEY.get(exerciseKey(name));

export const muscleGroupOf = (name: string): MuscleGroup =>
  catalogEntryOf(name)?.group ??
  GROUP_RULES_IN_PRIORITY_ORDER.find(([, pattern]) => pattern.test(name))?.[0] ??
  "Other";
