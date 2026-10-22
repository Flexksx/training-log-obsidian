<script lang="ts">
  import { ACTIVITIES, activityLabel, type ActivityKey } from "activity/activities";
  import {
    countActivities,
    countByActivity,
    lastActivity,
    weekStreaks,
    WEEKLY_TARGET,
    type ActivityDays,
  } from "activity/consistency";
  import { addDays, addWeeks, weekStart, type IsoDate } from "activity/iso-date";
  import type { Visit } from "activity/visit";
  import { formatDate, formatHours, formatRelativeDay, pluralize } from "../format.ts";

  let { days, today, visits }: { days: ActivityDays; today: IsoDate; visits: readonly Visit[] } = $props();

  const LOOKBACK_WEEKS = 4;
  const AVERAGE_DECIMALS = 1;

  const thisWeek = $derived(countActivities(days, weekStart(today), today));
  const pips = $derived(Array.from({ length: Math.max(WEEKLY_TARGET, thisWeek) }, (_, index) => index < thisWeek));
  const remaining = $derived(Math.max(0, WEEKLY_TARGET - thisWeek));
  const streak = $derived(weekStreaks(days, today));
  const lookbackStart = $derived(addDays(addWeeks(today, -LOOKBACK_WEEKS), 1));
  const lookbackAverage = $derived(countActivities(days, lookbackStart, today) / LOOKBACK_WEEKS);
  const split = $derived(countByActivity(days, lookbackStart, today));
  const last = $derived(lastActivity(days, today));

  const describeLast = (date: IsoDate, activities: readonly ActivityKey[]): string => {
    const seconds = visits.filter(visit => visit.date === date).reduce((total, visit) => total + (visit.seconds ?? 0), 0);
    return [activities.map(activityLabel).join(" + "), formatDate(date, { weekday: "short" }), ...(seconds ? [formatHours(seconds)] : [])].join(" · ");
  };
</script>

<div class="wd-tiles">
  <div class="wd-tile">
    <div class="wd-tile-name">This week</div>
    <div class="wd-tile-value"><span>{thisWeek}<small> / {WEEKLY_TARGET}</small></span></div>
    <div class="wd-pips" aria-hidden="true">
      {#each pips as isOn}<span class:is-on={isOn}></span>{/each}
    </div>
    <div class="wd-tile-sub">{remaining ? `${pluralize(remaining, "session")} to go` : "Target hit"}</div>
  </div>

  <div class="wd-tile">
    <div class="wd-tile-name">Week streak</div>
    <div class="wd-tile-value">
      <span>{streak.current}<small>{streak.current === 1 ? " week" : " weeks"}</small></span>
    </div>
    <div class="wd-tile-sub">at {WEEKLY_TARGET}+ per week · best {streak.best}</div>
  </div>

  <div class="wd-tile">
    <div class="wd-tile-name">Last {LOOKBACK_WEEKS} weeks</div>
    <div class="wd-tile-value"><span>{lookbackAverage.toFixed(AVERAGE_DECIMALS)}<small> / week</small></span></div>
    <div class="wd-tile-sub">{ACTIVITIES.map(activity => `${activity.label} ${split[activity.key]}`).join(" · ")}</div>
  </div>

  <div class="wd-tile">
    <div class="wd-tile-name">Last session</div>
    <div class="wd-tile-value">{last ? formatRelativeDay(last.date, today) : "None"}</div>
    <div class="wd-tile-sub">{last ? describeLast(last.date, last.activities) : "Log one to start"}</div>
  </div>
</div>
