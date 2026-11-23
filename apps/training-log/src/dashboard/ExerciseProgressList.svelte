<script lang="ts">
  import type { IsoDate } from "activity/iso-date";
  import Link from "design-system/Link";
  import ListRow from "design-system/ListRow";
  import Section from "design-system/Section";
  import Sparkline from "design-system/Sparkline";
  import Text from "design-system/Text";
  import type { ExerciseProgress } from "workout/progress";
  import { describeEfforts, describeLastSession, groupByMuscle, metricOf, trendOf } from "./exercise-progress.ts";
  import { interceptLink } from "./open-note.ts";

  let {
    progress,
    today,
    onOpen,
  }: { progress: readonly ExerciseProgress[]; today: IsoDate; onOpen: (notePath: string) => void } = $props();

  const groups = $derived(groupByMuscle(progress));
</script>


<Section title="Exercises" note="best estimated 1-rep max · change vs last time">
  {#each groups as { group, exercises } (group)}
    <div class="group">
      <span class="group-name"><Text variant="eyebrow">{group}</Text></span>
      {#each exercises as exercise (exercise.name)}
        {@const trend = trendOf(exercise.change)}
        <ListRow variant="roomy">
          <div class="exercise" title={describeEfforts(exercise)}>
            <div class="main">
              <Link href={exercise.last.notePath} onclick={event => interceptLink(event, () => onOpen(exercise.last.notePath))}>
                {exercise.name}
              </Link>
              <Text variant="caption">{describeLastSession(exercise, today)}</Text>
            </div>
            <div class="trend">
              {#if exercise.efforts.length > 1}
                <div class="spark"><Sparkline values={exercise.efforts.map(effort => effort.value)} /></div>
              {/if}
              <div class="metric">
                <Text variant="strong">{metricOf(exercise)}</Text>
                <Text variant={trend.variant}>{trend.text}</Text>
              </div>
            </div>
          </div>
        </ListRow>
      {/each}
    </div>
  {/each}
</Section>

<style>
  .group {
    display: flex;
    flex-direction: column;
  }
  .group + .group {
    margin-top: var(--ds-space-m);
  }
  .group-name {
    padding-bottom: var(--ds-space-2xs);
  }
  .exercise {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-m);
  }
  .main {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-2xs);
    min-width: 0;
  }
  .trend {
    display: flex;
    align-items: center;
    gap: var(--ds-space-m);
    flex-shrink: 0;
  }
  .metric {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 4.8em;
  }
  @container (max-width: 420px) {
    .spark {
      display: none;
    }
  }
</style>
