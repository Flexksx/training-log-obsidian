<script lang="ts">
  import { addDays, type IsoDate } from "activity/iso-date";
  import {
    type ExerciseProgress,
    setsPerMuscleGroup,
    VOLUME_DAYS,
    volumeGroups,
    volumeStatus,
    WEEKLY_SET_RANGE,
  } from "workout/progress";
  import { pluralize } from "../format.ts";
  import DashboardSection from "./DashboardSection.svelte";

  let { progress, today }: { progress: readonly ExerciseProgress[]; today: IsoDate } = $props();

  const SCALE_HEADROOM_SETS = 5;
  const PERCENT = 100;

  const counts = $derived(setsPerMuscleGroup(progress, addDays(today, -(VOLUME_DAYS - 1)), today));
  const scale = $derived(Math.max(WEEKLY_SET_RANGE.maximum + SCALE_HEADROOM_SETS, ...counts.values()));
  const rows = $derived(
    volumeGroups(counts).map(group => {
      const sets = counts.get(group) ?? 0;
      return { group, sets, status: volumeStatus(sets) };
    }),
  );

  const percentOfScale = (sets: number): string => `${(sets / scale) * PERCENT}%`;
</script>

<DashboardSection
  title="Sets per muscle"
  note="last {VOLUME_DAYS} days · band is {WEEKLY_SET_RANGE.minimum} to {WEEKLY_SET_RANGE.maximum}"
>
  <div class="wd-bars">
    {#each rows as { group, sets, status } (group)}
      <div class="wd-bar-row" title="{group}: {pluralize(sets, 'set')}">
        <span class="wd-bar-name">{group}</span>
        <span class="wd-bar-track">
          <span
            class="wd-bar-band"
            style:left={percentOfScale(WEEKLY_SET_RANGE.minimum)}
            style:width={percentOfScale(WEEKLY_SET_RANGE.maximum - WEEKLY_SET_RANGE.minimum)}
          ></span>
          {#if sets}<span class="wd-bar" style:width={percentOfScale(sets)}></span>{/if}
        </span>
        <span class="wd-bar-value is-{status}">{sets}</span>
      </div>
    {/each}
  </div>
</DashboardSection>
