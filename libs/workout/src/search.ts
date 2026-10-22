/**
 * Fuzzy search over the built-in catalog plus the names from past sessions.
 * A query matches when every word is a subsequence of the name.
 * Consecutive letters and word starts score higher, so "inc db" finds
 * "Incline Dumbbell Press".
 */
import { BUILT_IN_CATALOG } from "./built-in-catalog.ts";
import { exerciseKey, muscleGroupOf, type CatalogEntry } from "./catalog.ts";

export type SearchEntry = CatalogEntry & { recentRank?: number };

const MAX_RESULTS = 12;
const RECENT_LIMIT = 8;
const RECENT_BONUS = 2;
const LETTER_SCORE = 1;
const CONSECUTIVE_SCORE = 3;
const WORD_START_BONUS = 2;
const MIN_SCORE_PER_LETTER = 2;
const LENGTH_PENALTY = 0.01;
const WORD_SEPARATORS = " -(";

/** A past-session spelling replaces the catalog one, so stats keep one name per exercise. */
export const mergeCatalog = (recentNames: readonly string[]): SearchEntry[] => {
  const byKey = new Map<string, SearchEntry>(BUILT_IN_CATALOG.map(entry => [exerciseKey(entry.name), entry]));
  recentNames.forEach((name, recentRank) => {
    const key = exerciseKey(name);
    const known = byKey.get(key);
    if (known?.recentRank !== undefined) return;
    byKey.set(key, { group: muscleGroupOf(name), ...known, name, recentRank });
  });
  return [...byKey.values()];
};

const searchText = (text: string): string => text.trim().toLowerCase().replace(/\s+/g, " ");

const isWordStart = (target: string, index: number): boolean =>
  index === 0 || WORD_SEPARATORS.includes(target[index - 1] ?? "");

const scoreFrom = (token: string, target: string, start: number): number | undefined => {
  let score = 0;
  let from = start;
  let previous = -2;
  for (const letter of token) {
    const index = target.indexOf(letter, from);
    if (index < 0) return undefined;
    score += (index === previous + 1 ? CONSECUTIVE_SCORE : LETTER_SCORE) + (isWordStart(target, index) ? WORD_START_BONUS : 0);
    from = index + 1;
    previous = index;
  }
  return score;
};

/** Scattered matches score under two points per letter and count as no match. */
const scoreToken = (token: string, target: string): number | undefined => {
  const starts = [...target].flatMap((letter, index) => (letter === token[0] ? [index] : []));
  const best = Math.max(-1, ...starts.map(start => scoreFrom(token, target, start) ?? -1));
  return best >= token.length * MIN_SCORE_PER_LETTER ? best : undefined;
};

const fuzzyScore = (query: string, name: string): number | undefined => {
  const target = searchText(name);
  const scores = searchText(query).split(" ").map(token => scoreToken(token, target));
  if (scores.some(score => score === undefined)) return undefined;
  return scores.reduce<number>((total, score) => total + (score ?? 0), 0) - target.length * LENGTH_PENALTY;
};

const isRecent = (entry: SearchEntry): entry is SearchEntry & { recentRank: number } => entry.recentRank !== undefined;

export const searchCatalog = (
  catalog: readonly SearchEntry[],
  query: string,
  excludedNames: readonly string[],
): SearchEntry[] => {
  const excluded = new Set(excludedNames.map(exerciseKey));
  const pool = catalog.filter(entry => !excluded.has(exerciseKey(entry.name)));
  if (!searchText(query)) {
    const recent = pool.filter(isRecent).toSorted((a, b) => a.recentRank - b.recentRank);
    return (recent.length ? recent : pool).slice(0, RECENT_LIMIT);
  }
  return pool
    .flatMap(entry => {
      const score = fuzzyScore(query, entry.name);
      return score === undefined ? [] : [{ entry, score: score + (isRecent(entry) ? RECENT_BONUS : 0) }];
    })
    .toSorted((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(match => match.entry);
};

export const isKnownName = (names: readonly string[], name: string): boolean =>
  names.some(known => exerciseKey(known) === exerciseKey(name));

export const resolveName = (catalog: readonly SearchEntry[], typed: string): string =>
  catalog.find(entry => exerciseKey(entry.name) === exerciseKey(typed))?.name ?? typed.trim();
