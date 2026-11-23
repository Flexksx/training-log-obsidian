import type { CatalogEntry, MuscleGroup } from "./catalog-entry.ts";

export type ExerciseCatalog = {
  entries: readonly CatalogEntry[];
  groupRules: readonly (readonly [MuscleGroup, RegExp])[];
};

export const exerciseKey = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]/g, "");

export const catalogEntryOf = (catalog: ExerciseCatalog, name: string): CatalogEntry | undefined =>
  catalog.entries.find(entry => exerciseKey(entry.name) === exerciseKey(name));

export const muscleGroupOf = (catalog: ExerciseCatalog, name: string): MuscleGroup =>
  catalogEntryOf(catalog, name)?.group ?? catalog.groupRules.find(([, pattern]) => pattern.test(name))?.[0] ?? "Other";
