<script lang="ts">
  import { activityLabel, GYM } from "activity/activities";
  import type { Visit } from "activity/visit";
  import { workoutTotals } from "workout/progress";
  import type { Workout } from "workout/session";
  import { formatCount, formatHours, formatShortDate, pluralize } from "../format.ts";
  import DashboardSection from "./DashboardSection.svelte";

  let {
    visits,
    workouts,
    onOpen,
  }: { visits: readonly Visit[]; workouts: readonly Workout[]; onOpen: (notePath: string) => void } = $props();

  const RECENT_SESSION_COUNT = 6;

  const describeVisit = (visit: Visit, workout: Workout | undefined): { title: string; numbers: string[] } => {
    const watch = [
      visit.seconds ? formatHours(visit.seconds) : "",
      visit.kilocalories ? `${formatCount(visit.kilocalories)} kcal` : "",
    ].filter(Boolean);
    if (visit.activity !== GYM.key) return { title: activityLabel(visit.activity), numbers: watch };
    const totals = workout && workoutTotals(workout.session);
    if (!totals?.exerciseNames.length) return { title: "Gym · no sets logged", numbers: watch };
    return {
      title: totals.exerciseNames.join(", "),
      numbers: [
        ...watch,
        pluralize(totals.exerciseNames.length, "exercise"),
        `${totals.setCount} sets`,
        `${formatCount(totals.volumeKilograms)} kg`,
      ],
    };
  };

  const workoutsByPath = $derived(new Map(workouts.map(workout => [workout.notePath, workout])));
  const rows = $derived(
    visits
      .toSorted((a, b) => b.date.localeCompare(a.date))
      .slice(0, RECENT_SESSION_COUNT)
      .map(visit => ({ visit, ...describeVisit(visit, workoutsByPath.get(visit.notePath)) })),
  );

  const open = (event: MouseEvent, notePath: string) => {
    event.preventDefault();
    onOpen(notePath);
  };
</script>

<DashboardSection title="Recent sessions" note="{visits.length} logged">
  <div class="wd-sessions">
    {#each rows as { visit, title, numbers } (visit.notePath)}
      <a class="wd-session is-{visit.activity}" href={visit.notePath} onclick={event => open(event, visit.notePath)}>
        <span class="wd-session-date"><i class="wd-dot is-{visit.activity}"></i>{formatShortDate(visit.date)}</span>
        <span class="wd-session-ex">{title}</span>
        <span class="wd-session-num">{numbers.join(" · ") || "No details"}</span>
      </a>
    {/each}
  </div>
</DashboardSection>
