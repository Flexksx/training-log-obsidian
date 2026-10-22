import assert from "node:assert/strict";
import { test } from "node:test";
import { buildActivityDays, countActivities, weekStreaks } from "../src/consistency.ts";
import { weeklyEnergy } from "../src/energy.ts";
import { weekStart } from "../src/iso-date.ts";
import { parseDuration } from "../src/visit.ts";

const TODAY = "2026-10-22";

test("visits up to today group by day, and later visits are left out", () => {
  const days = buildActivityDays(
    [
      { date: "2026-10-21", activity: "gym", notePath: "a.md" },
      { date: "2026-10-21", activity: "capoeira", notePath: "b.md" },
      { date: "2026-10-22", activity: "gym", notePath: "c.md" },
      { date: "2026-10-23", activity: "gym", notePath: "d.md" },
    ],
    TODAY,
  );
  assert.deepEqual(
    days,
    new Map([
      ["2026-10-21", new Set(["gym", "capoeira"])],
      ["2026-10-22", new Set(["gym"])],
    ]),
  );
});

test("week streak counts full weeks at target and the current week once it hits", () => {
  const visit = (date: string) => ({ date, activity: "gym" as const, notePath: `${date}.md` });
  const dates = ["2026-10-05", "2026-10-07", "2026-10-09", "2026-10-12", "2026-10-14", "2026-10-16", "2026-10-19"];
  const days = buildActivityDays(dates.map(visit), TODAY);
  assert.equal(weekStart(TODAY), "2026-10-19");
  assert.equal(countActivities(days, "2026-10-19", TODAY), 1);
  assert.deepEqual(weekStreaks(days, TODAY), { current: 2, best: 2 });
});

test("durations read the Strava format and plain minutes", () => {
  assert.equal(parseDuration("1h 50m"), 6600);
  assert.equal(parseDuration("53m 30s"), 3210);
  assert.equal(parseDuration(45), 2700);
  assert.equal(parseDuration(""), undefined);
  const weeks = weeklyEnergy(
    [{ date: "2026-10-20", activity: "gym", notePath: "w.md", seconds: 3600, kilocalories: 500 }],
    TODAY,
    8,
  );
  assert.deepEqual(weeks, [
    { weekStart: "2026-10-19", seconds: { gym: 3600, capoeira: 0 }, kilocalories: 500, untimedVisits: 0 },
  ]);
});
