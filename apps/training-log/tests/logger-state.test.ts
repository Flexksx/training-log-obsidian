import assert from "node:assert/strict";
import { test } from "node:test";
import { initialLoggerState, updateLoggerState } from "../src/exercise-logger/logger-state.ts";

test("adding an exercise selects it and closes and clears the search", () => {
  const initial = initialLoggerState();
  const opened = updateLoggerState(initial, { type: "openAdd" });
  const searched = updateLoggerState(opened, { type: "changeQuery", query: "squat" });
  const added = updateLoggerState(searched, { type: "exerciseAdded", name: "Squat" });

  assert.deepEqual(added, { activeExercise: "Squat", isAdding: false, query: "", drafts: {} });
  assert.equal(searched.query, "squat");
  assert.equal(initial.isAdding, false);
});

test("saving a draft keeps other drafts and does not retain a mutable input", () => {
  const draft = { kind: "body" as const, reps: 8, kilograms: null, minutes: null, seconds: null };
  const initial = initialLoggerState();
  const saved = updateLoggerState(initial, { type: "saveDraft", name: "Pull-up", draft });
  const next = updateLoggerState(saved, { type: "saveDraft", name: "Dip", draft });
  draft.reps = 9;

  assert.equal(next.drafts["Pull-up"]?.reps, 8);
  assert.equal(next.drafts.Dip?.reps, 8);
  assert.deepEqual(initial.drafts, {});
});

test("closing and reopening the search clears its query", () => {
  const searched = updateLoggerState(initialLoggerState(), { type: "changeQuery", query: "press" });
  const closed = updateLoggerState(searched, { type: "closeAdd" });
  const reopened = updateLoggerState(searched, { type: "openAdd" });
  assert.equal(closed.query, "");
  assert.equal(closed.isAdding, false);
  assert.equal(reopened.query, "");
  assert.equal(reopened.isAdding, true);
});
