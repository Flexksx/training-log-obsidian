import assert from "node:assert/strict";
import { test } from "node:test";
import {
  appendExercise,
  appendSet,
  deleteSet,
  ExerciseNotFoundError,
  parseSession,
} from "../src/adapter/markdown-session.ts";
import { formatSet, parseSet } from "../src/adapter/set-format.ts";
import { exerciseProgress, lastPerformance } from "../src/application/progress.ts";
import { mergeCatalog, searchCatalog } from "../src/application/search.ts";
import { BUILT_IN_CATALOG } from "../src/data/built-in-catalog.ts";
import { muscleGroupOf } from "../src/domain/catalog.ts";

const NOTE = `---
type: workout
---
\`\`\`workout-logger
\`\`\`

## Incline Bench Press
- 10 reps × 40 kg
- 7 reps x 60kg

## Hanging Knee Abs
- 10 reps
- 8 reps × 0 kg
felt easy

## Plank
- 1 min 30 s
- 45 s
`;

test("parseSet reads each kind and rejects other lines", () => {
  assert.deepEqual(parseSet("- 8 reps × 17.5 kg"), { kind: "weight", reps: 8, kilograms: 17.5 });
  assert.deepEqual(parseSet("- 10 reps"), { kind: "body", reps: 10 });
  assert.deepEqual(parseSet("- 8 reps × 0 kg"), { kind: "body", reps: 8 });
  assert.deepEqual(parseSet("- 2 min 5 s"), { kind: "time", seconds: 125 });
  assert.equal(parseSet("- felt heavy"), undefined);
  assert.equal(parseSet("- "), undefined);
});

test("formatSet output parses back to the same set", () => {
  const sets = [
    { kind: "weight", reps: 8, kilograms: 22.5 },
    { kind: "body", reps: 12 },
    { kind: "time", seconds: 95 },
  ] as const;
  for (const set of sets) assert.deepEqual(parseSet(`- ${formatSet(set)}`), set);
});

test("parseSession groups sets under headings", () => {
  const { exercises } = parseSession(NOTE);
  assert.deepEqual(
    exercises.map(exercise => [exercise.name, exercise.sets.length]),
    [
      ["Incline Bench Press", 2],
      ["Hanging Knee Abs", 2],
      ["Plank", 2],
    ],
  );
});

test("text edits add and remove lines in place", () => {
  const added = appendSet(NOTE, "Incline Bench Press", { kind: "weight", reps: 6, kilograms: 60 });
  assert.deepEqual(parseSession(added).exercises[0]?.sets.at(-1), { kind: "weight", reps: 6, kilograms: 60 });
  const removed = deleteSet(added, "Incline Bench Press", 0);
  assert.equal(parseSession(removed).exercises[0]?.sets.length, 2);
  assert.match(appendExercise(NOTE, "Squat"), /- 45 s\n\n## Squat\n$/);
  assert.equal(appendExercise(NOTE, "Plank"), NOTE);
  assert.throws(() => appendSet(NOTE, "Squat", { kind: "body", reps: 5 }), ExerciseNotFoundError);
});

test("search finds abbreviations and ranks recent names first", () => {
  const catalog = mergeCatalog(BUILT_IN_CATALOG, ["Incline Bench Press Machine"]);
  assert.equal(searchCatalog(catalog, "inc db pr", [])[0]?.name, "Incline Dumbbell Press");
  assert.equal(searchCatalog(catalog, "", [])[0]?.name, "Incline Bench Press Machine");
  assert.equal(searchCatalog(catalog, "", ["incline bench press machine"]).length, 8);
});

test("progress compares estimated one-rep max and finds the last earlier session", () => {
  const workouts = [
    { date: "2026-10-01", notePath: "a.md", session: parseSession("## Squat\n- 5 reps × 100 kg") },
    { date: "2026-10-04", notePath: "b.md", session: parseSession("## squat\n- 10 reps × 90 kg") },
  ];
  const [squat] = exerciseProgress(BUILT_IN_CATALOG, workouts);
  assert.equal(squat?.efforts.length, 2);
  assert.equal(squat?.last.notePath, "b.md");
  assert.ok((squat?.change ?? 0) > 0);
  assert.equal(lastPerformance(workouts.toReversed(), "Squat", "2026-10-04")?.date, "2026-10-01");
  assert.equal(lastPerformance(workouts.toReversed(), "Squat", "2026-10-01"), undefined);
});

test("muscle group rules check arms before back, so a triceps pulldown is arms", () => {
  assert.equal(muscleGroupOf(BUILT_IN_CATALOG, "Cable Triceps Pulldown"), "Arms");
  assert.equal(muscleGroupOf(BUILT_IN_CATALOG, "Wide Grip Lat Pulldown"), "Back");
  assert.equal(muscleGroupOf(BUILT_IN_CATALOG, "Triceps Pushdown"), "Arms");
});

test("catalog inputs control search and progress without changing the defaults", () => {
  const custom = { entries: [{ name: "Squat", group: "Arms" as const }], groupRules: [] };
  const workouts = [{ date: "2026-10-01", notePath: "a.md", session: parseSession("## Squat\n- 5 reps × 100 kg") }];
  assert.equal(mergeCatalog(custom, [])[0]?.group, "Arms");
  assert.equal(exerciseProgress(custom, workouts)[0]?.group, "Arms");
  assert.equal(exerciseProgress(BUILT_IN_CATALOG, workouts)[0]?.group, "Legs");
  assert.equal(muscleGroupOf(custom, "Squat variation"), "Other");
});
