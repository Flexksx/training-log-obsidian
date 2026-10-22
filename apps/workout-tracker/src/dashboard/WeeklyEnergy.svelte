<script lang="ts">
  import { ACTIVITIES } from "activity/activities";
  import { totalSeconds, type WeekEnergy, weeklyEnergy } from "activity/energy";
  import type { IsoDate } from "activity/iso-date";
  import type { Visit } from "activity/visit";
  import { formatCount, formatDayMonth, formatHours, pluralize } from "../format.ts";
  import DashboardSection from "./DashboardSection.svelte";

  let { visits, today }: { visits: readonly Visit[]; today: IsoDate } = $props();

  const WEEK_COUNT = 8;
  const MINIMUM_SCALE_SECONDS = 3600;
  const PERCENT = 100;

  const weeks = $derived(weeklyEnergy(visits, today, WEEK_COUNT));
  const scale = $derived(Math.max(MINIMUM_SCALE_SECONDS, ...weeks.map(totalSeconds)));

  const summarize = (week: WeekEnergy | undefined): string =>
    week ? `${formatHours(totalSeconds(week))} · ${formatCount(week.kilocalories)} kcal` : "nothing logged";

  const describeWeek = (week: WeekEnergy): string =>
    [
      `Week of ${formatDayMonth(week.weekStart)}`,
      ...ACTIVITIES.filter(activity => week.seconds[activity.key]).map(
        activity => `${activity.label} ${formatHours(week.seconds[activity.key])}`,
      ),
      `${formatCount(week.kilocalories)} kcal`,
      week.untimedVisits ? `${pluralize(week.untimedVisits, "session")} without duration` : "",
    ]
      .filter(Boolean)
      .join("\n");
</script>

{#if weeks.length}
  <DashboardSection title="Time and calories" note="per week, from the watch">
    <div class="wd-energy-sum">
      <span><b>This week </b>{summarize(weeks.at(-1))}</span>
      <span><b>Last week </b>{summarize(weeks.at(-2))}</span>
    </div>
    <div class="wd-cols" style:--cols={WEEK_COUNT}>
      {#each weeks as week (week.weekStart)}
        {@const total = totalSeconds(week)}
        <div class="wd-col" role="img" title={describeWeek(week)} aria-label={describeWeek(week)}>
          <span class="wd-col-value">{total ? formatHours(total) : "–"}</span>
          <div class="wd-col-track">
            <div class="wd-col-stack" style:height="{(total / scale) * PERCENT}%">
              {#each ACTIVITIES.filter(activity => week.seconds[activity.key]) as activity (activity.key)}
                <span class="wd-col-seg is-{activity.key}" style:flex-grow={week.seconds[activity.key]}></span>
              {/each}
            </div>
          </div>
          <span class="wd-col-kcal">{week.kilocalories ? formatCount(week.kilocalories) : ""}</span>
          <span class="wd-col-week">{formatDayMonth(week.weekStart)}</span>
        </div>
      {/each}
    </div>
    <div class="wd-heat-foot">
      <span class="wd-note">Bar is time. Number under it is kcal.</span>
      <div class="wd-legend">
        {#each ACTIVITIES as activity (activity.key)}
          <span class="wd-key"><i class="wd-cell is-{activity.key}"></i>{activity.label}</span>
        {/each}
      </div>
    </div>
  </DashboardSection>
{/if}
