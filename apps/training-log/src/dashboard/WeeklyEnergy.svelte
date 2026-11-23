<script lang="ts">
  import { ACTIVITIES } from "activity/activities";
  import { totalSeconds, weeklyEnergy } from "activity/energy";
  import type { IsoDate } from "activity/iso-date";
  import type { Visit } from "activity/visit";
  import Section from "design-system/Section";
  import StackedColumn from "design-system/StackedColumn";
  import Text from "design-system/Text";
  import { formatCount, formatDayMonth, formatHours } from "../format.ts";
  import { SERIES_OF_ACTIVITY } from "../series.ts";
  import Legend from "./Legend.svelte";
  import { describeWeek, scaleOf, segmentsOf, summarizeWeek, WEEK_COUNT } from "./weekly-energy.ts";

  let { visits, today }: { visits: readonly Visit[]; today: IsoDate } = $props();

  const LEGEND_ENTRIES = ACTIVITIES.map(activity => ({
    variant: SERIES_OF_ACTIVITY[activity.key],
    label: activity.label,
  }));

  const weeks = $derived(weeklyEnergy(visits, today, WEEK_COUNT));
  const scale = $derived(scaleOf(weeks));
</script>


{#if weeks.length}
  <Section title="Time and calories" note="per week, from the watch">
    <div class="summary">
      <span><Text variant="strong">This week </Text><Text variant="muted">{summarizeWeek(weeks.at(-1))}</Text></span>
      <span><Text variant="strong">Last week </Text><Text variant="muted">{summarizeWeek(weeks.at(-2))}</Text></span>
    </div>
    <div class="columns" style:--columns={WEEK_COUNT}>
      {#each weeks as week (week.weekStart)}
        {@const total = totalSeconds(week)}
        <div class="column" role="img" title={describeWeek(week)} aria-label={describeWeek(week)}>
          <Text variant="readout">{total ? formatHours(total) : "–"}</Text>
          <StackedColumn fraction={total / scale} segments={segmentsOf(week)} />
          <span class="kilocalories"><Text variant="axis-muted">{week.kilocalories ? formatCount(week.kilocalories) : ""}</Text></span>
          <Text variant="axis">{formatDayMonth(week.weekStart)}</Text>
        </div>
      {/each}
    </div>
    <div class="foot">
      <Text variant="note">Bar is time. Number under it is kcal.</Text>
      <Legend entries={LEGEND_ENTRIES} />
    </div>
  </Section>
{/if}

<style>
  .summary {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ds-space-s) var(--ds-space-xl);
  }
  .columns {
    display: grid;
    grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
    gap: var(--ds-space-s);
  }
  .column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ds-space-xs);
    min-width: 0;
  }
  .kilocalories {
    min-height: 1.2em;
  }
  .foot {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--ds-space-s) var(--ds-space-l);
  }
</style>
