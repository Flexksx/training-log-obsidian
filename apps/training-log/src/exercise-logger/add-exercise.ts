import { isKnownName, resolveName, type SearchEntry } from "workout/search";

export const canCreateExercise = (
  catalog: readonly SearchEntry[],
  takenNames: readonly string[],
  typed: string,
): boolean => typed !== "" && !isKnownName([...catalog.map(entry => entry.name), ...takenNames], typed);

export const exerciseToAdd = (
  results: readonly SearchEntry[],
  catalog: readonly SearchEntry[],
  typed: string,
): string => results[0]?.name ?? resolveName(catalog, typed);
