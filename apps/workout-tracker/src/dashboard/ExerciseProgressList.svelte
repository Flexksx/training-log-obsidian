<script lang="ts">
  import type { IsoDate } from "activity/iso-date";
  import { MUSCLE_GROUPS } from "workout/catalog";
  import type { ExerciseProgress } from "workout/progress";
  import { formatCount, formatRelativeDay, formatTopSet, pluralize } from "../format.ts";
  import DashboardSection from "./DashboardSection.svelte";

  let {
    progress,
    today,
    onOpen,
  }: { progress: readonly ExerciseProgress[]; today: IsoDate; onOpen: (notePath: string) => void } = $props();

  const SPARK_WIDTH = 72;
  const SPARK_HEIGHT = 24;
  const SPARK_PADDING = 4;
  const PERCENT = 100;

  const groups = $derived(
    MUSCLE_GROUPS.filter(group => progress.some(exercise => exercise.group === group)).map(group => ({
      group,
      exercises: progress
        .filter(exercise => exercise.group === group)
        .toSorted((a, b) => b.last.date.localeCompare(a.last.date) || a.name.localeCompare(b.name)),
    })),
  );

  const sparkline = (exercise: ExerciseProgress) => {
    const values = exercise.efforts.map(effort => effort.value);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const lastIndex = values.length - 1;
    const x = (index: number) => SPARK_PADDING + (index / lastIndex) * (SPARK_WIDTH - 2 * SPARK_PADDING);
    const y = (value: number) =>
      maximum === minimum
        ? SPARK_HEIGHT / 2
        : SPARK_HEIGHT - SPARK_PADDING - ((value - minimum) / (maximum - minimum)) * (SPARK_HEIGHT - 2 * SPARK_PADDING);
    return {
      points: values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" "),
      endX: x(lastIndex),
      endY: y(values[lastIndex] ?? minimum),
    };
  };

  const metric = (exercise: ExerciseProgress): string => {
    switch (exercise.kind) {
      case "weight":
        return `${formatCount(exercise.best)} kg`;
      case "body":
        return `${exercise.best} reps`;
      case "time":
        return formatTopSet(exercise.last.topSet);
    }
  };

  const trendOf = (change: number | undefined): { text: string; className: string } => {
    if (change === undefined) return { text: "baseline", className: "" };
    const percent = Math.round(change * PERCENT);
    if (percent > 0) return { text: `▲ ${percent}%`, className: "is-up" };
    if (percent < 0) return { text: `▼ ${-percent}%`, className: "is-down" };
    return { text: "■ 0%", className: "" };
  };

  const open = (event: MouseEvent, notePath: string) => {
    event.preventDefault();
    onOpen(notePath);
  };
</script>

<DashboardSection title="Exercises" note="best estimated 1-rep max · change vs last time">
  {#each groups as { group, exercises } (group)}
    <div class="wd-group">
      <div class="wd-group-name">{group}</div>
      {#each exercises as exercise (exercise.name)}
        {@const trend = trendOf(exercise.change)}
        <div class="wd-ex" title={exercise.efforts.map(effort => `${effort.date}: ${formatTopSet(effort.topSet)}`).join("\n")}>
          <div class="wd-ex-main">
            <a class="wd-ex-name" href={exercise.last.notePath} onclick={event => open(event, exercise.last.notePath)}>
              {exercise.name}
            </a>
            <span class="wd-ex-sub">
              Last top set {formatTopSet(exercise.last.topSet)} · {pluralize(exercise.efforts.length, "session")} · {formatRelativeDay(
                exercise.last.date,
                today,
              )}
            </span>
          </div>
          <div class="wd-ex-trend">
            {#if exercise.efforts.length > 1}
              {@const spark = sparkline(exercise)}
              <svg class="wd-spark" viewBox="0 0 {SPARK_WIDTH} {SPARK_HEIGHT}" width={SPARK_WIDTH} height={SPARK_HEIGHT} aria-hidden="true">
                <polyline points={spark.points} />
                <circle cx={spark.endX} cy={spark.endY} r="3" />
              </svg>
            {/if}
            <div class="wd-ex-metric">
              <span class="wd-ex-best">{metric(exercise)}</span>
              <span class="wd-change {trend.className}">{trend.text}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/each}
</DashboardSection>
