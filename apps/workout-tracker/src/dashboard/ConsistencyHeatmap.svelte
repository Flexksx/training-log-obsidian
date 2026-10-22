<script lang="ts">
  import { ACTIVITIES, activityLabel } from "activity/activities";
  import type { ActivityDay, ActivityDays } from "activity/consistency";
  import { addDays, addWeeks, DAYS_PER_WEEK, fromIsoDate, weekStart, type IsoDate } from "activity/iso-date";
  import { formatDate, formatShortDate } from "../format.ts";
  import DashboardSection from "./DashboardSection.svelte";

  let { days, today, weekCount }: { days: ActivityDays; today: IsoDate; weekCount: number } = $props();

  const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
  const LABEL_OFFSET = 2;
  const MONTH_LABEL_MIN_WEEKS = [1, 2];

  const monthOf = (date: IsoDate): number => fromIsoDate(date).getMonth();

  const cellClass = (day: ActivityDay | undefined): string => {
    if (!day) return "";
    const done = [...day.done];
    if (done.length > 1) return "is-both";
    if (done[0]) return `is-${done[0]}`;
    return day.missed.size ? "is-missed" : "";
  };

  const describeDay = (date: IsoDate): string => {
    const day = days.get(date);
    const done = [...(day?.done ?? [])].map(activityLabel);
    const missed = [...(day?.missed ?? [])].map(activityLabel);
    const parts = [done.length && done.join(" + "), missed.length && `missed ${missed.join(" + ")}`].filter(Boolean);
    return `${formatShortDate(date)} · ${parts.join(" · ") || "rest"}`;
  };

  const firstWeek = $derived(addWeeks(weekStart(today), -(weekCount - 1)));

  const monthLabels = $derived(
    Array.from({ length: weekCount }, (_, week) => {
      const date = addWeeks(firstWeek, week);
      const startsMonth =
        week === 0
          ? MONTH_LABEL_MIN_WEEKS.every(weeks => monthOf(addWeeks(date, weeks)) === monthOf(date))
          : monthOf(date) !== monthOf(addWeeks(date, -1));
      return startsMonth && week < weekCount - 1 ? formatDate(date, { month: "short" }) : "";
    }),
  );

  const cells = $derived(
    Array.from({ length: weekCount * DAYS_PER_WEEK }, (_, index) => ({
      date: addDays(firstWeek, index),
      column: Math.floor(index / DAYS_PER_WEEK) + LABEL_OFFSET,
      row: (index % DAYS_PER_WEEK) + LABEL_OFFSET,
    })).filter(cell => cell.date <= today),
  );

  let selectedDate = $state<IsoDate>();
  const detail = $derived(describeDay(selectedDate ?? today));
</script>

<DashboardSection title="Consistency" note="last {weekCount} weeks">
  <div class="wd-heat" style:--weeks={weekCount}>
    <span class="wd-heat-corner"></span>
    {#each monthLabels as label, week}
      <span class="wd-heat-month" style:grid-column={week + LABEL_OFFSET}>{label}</span>
    {/each}
    {#each DAY_LABELS as label, row}
      <span class="wd-heat-day" style:grid-row={row + LABEL_OFFSET}>{label}</span>
    {/each}
    {#each cells as cell (cell.date)}
      <button
        class="wd-cell {cellClass(days.get(cell.date))}"
        class:is-today={cell.date === today}
        style:grid-column={cell.column}
        style:grid-row={cell.row}
        title={describeDay(cell.date)}
        aria-label={describeDay(cell.date)}
        onclick={() => (selectedDate = cell.date)}
        onmouseenter={() => (selectedDate = cell.date)}
      ></button>
    {/each}
  </div>
  <div class="wd-heat-foot">
    <div class="wd-detail" aria-live="polite">{detail}</div>
    <div class="wd-legend">
      {#each ACTIVITIES as activity (activity.key)}
        <span class="wd-key"><i class="wd-cell is-{activity.key}"></i>{activity.label}</span>
      {/each}
      <span class="wd-key"><i class="wd-cell is-both"></i>Both</span>
      <span class="wd-key"><i class="wd-cell is-missed"></i>Planned, missed</span>
    </div>
  </div>
</DashboardSection>
