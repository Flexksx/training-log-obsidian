<script lang="ts">
  import type { IsoDate } from "activity/iso-date";
  import Text from "design-system/Text";
  import Theme from "design-system/Theme";
  import { type App, Notice, type TFile } from "obsidian";
  import { parseSession } from "workout/adapter/markdown-session";
  import { lastPerformance } from "workout/application/progress";
  import { mergeCatalog } from "workout/application/search";
  import { recentExerciseNames, type Workout } from "workout/application/workout";
  import { BUILT_IN_CATALOG } from "workout/data/built-in-catalog";
  import type { ExerciseSet } from "workout/domain/exercise-set";
  import { findExercise } from "workout/domain/session";
  import { loadWorkoutsNewestFirst, noteDate, workoutNote } from "../notes.ts";
  import type { TrainingLogSettings } from "../settings.svelte.ts";
  import AddExercise from "./AddExercise.svelte";
  import ExerciseCard from "./ExerciseCard.svelte";
  import type { ExerciseLoggerState } from "./exercise-logger-state.svelte.ts";

  type History = { sessionDate: IsoDate; pastWorkouts: Workout[] };

  let {
    app,
    file,
    ui,
    settings,
  }: { app: App; file: TFile; ui: ExerciseLoggerState; settings: TrainingLogSettings } = $props();

  let noteText = $state<string>();
  let history = $state<History>();
  let loadError = $state<Error>();

  const loadHistory = async (note: TFile, activityFolder: string): Promise<History> => ({
    sessionDate: noteDate(app, note),
    pastWorkouts: (await loadWorkoutsNewestFirst(app, activityFolder)).filter(workout => workout.notePath !== note.path),
  });

  $effect(() => {
    const note = file;
    const activityFolder = settings.activityFolder;
    const fail = (error: Error) => {
      loadError = error;
    };
    const readNote = () =>
      app.vault.read(note).then(text => {
        noteText = text;
      }, fail);
    void readNote();
    loadHistory(note, activityFolder).then(loaded => {
      history = loaded;
    }, fail);
    const reference = app.vault.on("modify", changed => {
      if (changed === note) void readNote();
    });
    return () => app.vault.offref(reference);
  });

  const session = $derived(parseSession(noteText ?? ""));
  const takenNames = $derived(session.exercises.map(exercise => exercise.name));
  const catalog = $derived(mergeCatalog(BUILT_IN_CATALOG, recentExerciseNames(history?.pastWorkouts ?? [])));
  const active = $derived(findExercise(session, ui.value.activeExercise ?? "") ?? session.exercises.at(-1));
  const previous = $derived(active && history && lastPerformance(history.pastWorkouts, active.name, history.sessionDate));

  const log = $derived(workoutNote(app, file));
  const showError = (error: Error) => new Notice(`Exercise logger: ${error.message}`);

  const addExercise = (exerciseName: string) =>
    void log.addExercise(exerciseName).then(() => ui.dispatch({ type: "exerciseAdded", name: exerciseName }), showError);
</script>

<Theme>
  {#if loadError}
    <Text variant="error">Exercise logger error: {loadError.message}</Text>
  {:else if noteText !== undefined && history}
    <div class="exercise-logger">
      {#each session.exercises as exercise, index (index)}
        <ExerciseCard
          {exercise}
          savedDraft={ui.value.drafts[exercise.name]}
          onSaveDraft={draft => ui.dispatch({ type: "saveDraft", name: exercise.name, draft })}
          onSelect={() => ui.dispatch({ type: "select", name: exercise.name })}
          isActive={exercise === active}
          previous={exercise === active ? previous : undefined}
          onLogSet={(set: ExerciseSet) => void log.addSet(exercise.name, set).catch(showError)}
          onDeleteSet={(setIndex: number) => void log.deleteSet(exercise.name, setIndex).catch(showError)}
        />
      {/each}
      <AddExercise
        {catalog}
        {takenNames}
        isAdding={ui.value.isAdding}
        query={ui.value.query}
        onQueryChange={query => ui.dispatch({ type: "changeQuery", query })}
        onOpen={() => ui.dispatch({ type: "openAdd" })}
        onClose={() => ui.dispatch({ type: "closeAdd" })}
        onAdd={addExercise}
      />
    </div>
  {/if}
</Theme>

<style>
  .exercise-logger {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-s);
    margin: var(--ds-space-xs) 0 var(--ds-space-l);
    container-type: inline-size;
  }
</style>
