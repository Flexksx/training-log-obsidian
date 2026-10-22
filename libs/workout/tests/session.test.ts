import assert from "node:assert/strict";
import { test } from "node:test";
import { muscleGroupOf } from "../src/catalog.ts";
import { formatSet, parseSet } from "../src/exercise-set.ts";
import { exerciseProgress, lastPerformance } from "../src/progress.ts";
import { mergeCatalog, searchCatalog } from "../src/search.ts";
import { appendExercise, appendSet, deleteSet, ExerciseNotFoundError, parseSession } from "../src/session.ts";

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
  sets.forEach(set => assert.deepEqual(parseSet(`- ${formatSet(set)}`), set));
});

test("parseSession groups sets under headings and tracks the last content line", () => {
  const { exercises } = parseSession(NOTE);
  assert.deepEqual(
    exercises.map(exercise => [exercise.name, exercise.sets.length]),
    [["Incline Bench Press", 2], ["Hanging Knee Abs", 2], ["Plank", 2]],
  );
  assert.equal(NOTE.split("\n")[exercises[1]!.lastLine], "felt easy");
});

test("text edits add and remove lines in place", () => {
  const added = appendSet(NOTE, "Incline Bench Press", { kind: "weight", reps: 6, kilograms: 60 });
  assert.deepEqual(parseSession(added).exercises[0]!.sets.at(-1), { kind: "weight", reps: 6, kilograms: 60, line: 9 });
  const removed = deleteSet(added, "Incline Bench Press", 0);
  assert.equal(parseSession(removed).exercises[0]!.sets.length, 2);
  assert.match(appendExercise(NOTE, "Squat"), /- 45 s\n\n## Squat\n$/);
  assert.equal(appendExercise(NOTE, "Plank"), NOTE);
  assert.throws(() => appendSet(NOTE, "Squat", { kind: "body", reps: 5 }), ExerciseNotFoundError);
});

test("search finds abbreviations and ranks recent names first", () => {
  const catalog = mergeCatalog(["Incline Bench Press Machine"]);
  assert.equal(searchCatalog(catalog, "inc db pr", [])[0]?.name, "Incline Dumbbell Press");
  assert.equal(searchCatalog(catalog, "", [])[0]?.name, "Incline Bench Press Machine");
  assert.equal(searchCatalog(catalog, "", ["incline bench press machine"]).length, 8);
});

test("progress compares estimated one-rep max and finds the last earlier session", () => {
  const workouts = [
    { date: "2026-10-01", notePath: "a.md", session: parseSession("## Squat\n- 5 reps × 100 kg") },
    { date: "2026-10-04", notePath: "b.md", session: parseSession("## squat\n- 10 reps × 90 kg") },
  ];
  const [squat] = exerciseProgress(workouts);
  assert.equal(squat?.efforts.length, 2);
  assert.equal(squat?.last.notePath, "b.md");
  assert.ok((squat?.change ?? 0) > 0);
  assert.equal(lastPerformance(workouts.toReversed(), "Squat", "2026-10-04")?.date, "2026-10-01");
  assert.equal(lastPerformance(workouts.toReversed(), "Squat", "2026-10-01"), undefined);
});

test("muscle group rules check arms before back, so a triceps pulldown is arms", () => {
  assert.equal(muscleGroupOf("Cable Triceps Pulldown"), "Arms");
  assert.equal(muscleGroupOf("Wide Grip Lat Pulldown"), "Back");
  assert.equal(muscleGroupOf("Triceps Pushdown"), "Arms");
});
