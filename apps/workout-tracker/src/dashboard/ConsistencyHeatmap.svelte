<script lang="ts">
  import { ACTIVITIES } from "activity/activities";
  import type { ActivityDays } from "activity/consistency";
  import type { IsoDate } from "activity/iso-date";
  import HeatCell from "design-system/HeatCell";
  import Section from "design-system/Section";
  import Text from "design-system/Text";
  import { SERIES_OF_ACTIVITY } from "../series.ts";
  import { cellVariant, DAY_LABELS, describeDay, heatmapDates, monthLabels } from "./heatmap.ts";
  import Legend from "./Legend.svelte";

  let { days, today, weekCount }: { days: ActivityDays; today: IsoDate; weekCount: number } = $props();

  const LEGEND_ENTRIES = [
    ...ACTIVITIES.map(activity => ({ variant: SERIES_OF_ACTIVITY[activity.key], label: activity.label })),
    { variant: "mixed", label: "Both" },
  ] as const;

  const labels = $derived(monthLabels(today, weekCount));
  const dates = $derived(heatmapDates(today, weekCount));

  let selectedDate = $state<IsoDate>();
  const detail = $derived(describeDay(days, selectedDate ?? today));
</script>


<Section title="Consistency" note="last {weekCount} weeks">
  <div class="heat" style:--weeks={weekCount}>
    <span></span>
    <div class="months">
      {#each labels as label, week (week)}
        <Text variant="axis">{label}</Text>
      {/each}
    </div>
    <div class="days">
      {#each DAY_LABELS as label, row (row)}
        <Text variant="axis">{label}</Text>
      {/each}
    </div>
    <div class="cells">
      {#each dates as date (date)}
        <HeatCell
          variant={cellVariant(days.get(date))}
          marked={date === today}
          label={describeDay(days, date)}
          onselect={() => (selectedDate = date)}
        />
      {/each}
    </div>
  </div>
  <div class="foot">
    <div class="detail" aria-live="polite"><Text variant="body">{detail}</Text></div>
    <Legend entries={LEGEND_ENTRIES} />
  </div>
</Section>

<style>
  .heat {
    display: grid;
    grid-template-columns: 2.2em minmax(0, 1fr);
    gap: var(--ds-space-2xs);
  }
  .months,
  .cells {
    display: grid;
    grid-template-columns: repeat(var(--weeks), minmax(0, 1fr));
    gap: var(--ds-space-2xs);
  }
  .cells {
    grid-template-rows: repeat(7, 1fr);
    grid-auto-flow: column;
  }
  .days {
    display: grid;
    grid-template-rows: repeat(7, 1fr);
    align-items: center;
    gap: var(--ds-space-2xs);
  }
  .foot {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--ds-space-s) var(--ds-space-l);
  }
  .detail {
    min-height: 1.4em;
  }
</style>
