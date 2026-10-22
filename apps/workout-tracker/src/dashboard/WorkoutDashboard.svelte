<script lang="ts">
  import Text from "design-system/Text";
  import Theme from "design-system/Theme";
  import { type App, debounce, Platform } from "obsidian";
  import ConsistencyHeatmap from "./ConsistencyHeatmap.svelte";
  import ExerciseProgressList from "./ExerciseProgressList.svelte";
  import { type Dashboard, loadDashboard } from "./load-dashboard.ts";
  import MuscleVolume from "./MuscleVolume.svelte";
  import RecentSessions from "./RecentSessions.svelte";
  import SummaryTiles from "./SummaryTiles.svelte";
  import WeeklyEnergy from "./WeeklyEnergy.svelte";

  let { app, sourcePath }: { app: App; sourcePath: string } = $props();

  const RELOAD_DELAY_MILLISECONDS = 1000;
  const HEATMAP_WEEKS_DESKTOP = 26;
  const HEATMAP_WEEKS_MOBILE = 15;

  let dashboard = $state<Dashboard>();
  let loadError = $state<Error>();

  $effect(() => {
    const reload = () =>
      loadDashboard(app).then(
        loaded => {
          dashboard = loaded;
          loadError = undefined;
        },
        (error: Error) => {
          loadError = error;
        },
      );
    void reload();
    const reference = app.metadataCache.on("changed", debounce(reload, RELOAD_DELAY_MILLISECONDS, true));
    return () => app.metadataCache.offref(reference);
  });

  const openNote = (notePath: string) => void app.workspace.openLinkText(notePath, sourcePath, false);
</script>

<Theme>
  {#if loadError}
    <Text variant="error">Workout dashboard error: {loadError.message}</Text>
  {:else if dashboard}
    <div class="dashboard">
      <SummaryTiles days={dashboard.days} today={dashboard.today} visits={dashboard.visits} />
      <ConsistencyHeatmap
        days={dashboard.days}
        today={dashboard.today}
        weekCount={Platform.isMobile ? HEATMAP_WEEKS_MOBILE : HEATMAP_WEEKS_DESKTOP}
      />
      {#if dashboard.visits.length}
        <RecentSessions visits={dashboard.visits} workouts={dashboard.workouts} onOpen={openNote} />
      {/if}
      <WeeklyEnergy visits={dashboard.visits} today={dashboard.today} />
      {#if dashboard.progress.length}
        <MuscleVolume progress={dashboard.progress} today={dashboard.today} />
        <ExerciseProgressList progress={dashboard.progress} today={dashboard.today} onOpen={openNote} />
      {/if}
    </div>
  {/if}
</Theme>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-xl);
    margin: var(--ds-space-s) 0 var(--ds-space-2xl);
    container-type: inline-size;
  }
</style>
