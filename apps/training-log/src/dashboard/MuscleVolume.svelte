<script lang="ts">
  import type { IsoDate } from "activity/iso-date";
  import RangeBar from "design-system/RangeBar";
  import Section from "design-system/Section";
  import Text from "design-system/Text";
  import { type ExerciseProgress, VOLUME_DAYS, WEEKLY_SET_RANGE } from "workout/progress";
  import { pluralize } from "../format.ts";
  import { muscleVolume } from "./muscle-volume.ts";

  let { progress, today }: { progress: readonly ExerciseProgress[]; today: IsoDate } = $props();

  const volume = $derived(muscleVolume(progress, today));
</script>


<Section
  title="Sets per muscle"
  note="last {VOLUME_DAYS} days · band is {WEEKLY_SET_RANGE.minimum} to {WEEKLY_SET_RANGE.maximum}"
>
  <div class="bars">
    {#each volume.rows as { group, sets, status } (group)}
      <div class="row" title="{group}: {pluralize(sets, 'set')}">
        <Text variant="muted">{group}</Text>
        <RangeBar
          scale={volume.scale}
          value={sets}
          bandStart={WEEKLY_SET_RANGE.minimum}
          bandEnd={WEEKLY_SET_RANGE.maximum}
        />
        <span class="count"><Text variant={status === "none" ? "tally-none" : "tally"}>{sets}</Text></span>
      </div>
    {/each}
  </div>
</Section>

<style>
  .bars {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-xs);
  }
  .row {
    display: grid;
    grid-template-columns: 5.5em 1fr 2em;
    align-items: center;
    gap: var(--ds-space-s);
  }
  .count {
    text-align: right;
  }
</style>
