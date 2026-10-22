<script lang="ts">
  import type { IsoDate } from "activity/iso-date";
  import { type App, Notice, type TFile } from "obsidian";
  import type { ExerciseSet } from "workout/exercise-set";
  import { lastPerformance } from "workout/progress";
  import { mergeCatalog } from "workout/search";
  import {
    appendExercise,
    appendSet,
    deleteSet,
    findExercise,
    parseSession,
    recentExerciseNames,
    type Workout,
  } from "workout/session";
  import { loadWorkoutsNewestFirst, noteDate } from "../notes.ts";
  import AddExercise from "./AddExercise.svelte";
  import ExerciseCard from "./ExerciseCard.svelte";
  import type { LoggerState } from "./logger-state.svelte.ts";

  type History = { sessionDate: IsoDate; pastWorkouts: Workout[] };

  let { app, file, ui }: { app: App; file: TFile; ui: LoggerState } = $props();

  let noteText = $state<string>();
  let history = $state<History>();
  let loadError = $state<Error>();

  const loadHistory = async (note: TFile): Promise<History> => ({
    sessionDate: noteDate(app, note),
    pastWorkouts: (await loadWorkoutsNewestFirst(app)).filter(workout => workout.notePath !== note.path),
  });

  $effect(() => {
    const note = file;
    const fail = (error: Error) => {
      loadError = error;
    };
    const readNote = () =>
      app.vault.read(note).then(text => {
        noteText = text;
      }, fail);
    void readNote();
    loadHistory(note).then(loaded => {
      history = loaded;
    }, fail);
    const reference = app.vault.on("modify", changed => {
      if (changed === note) void readNote();
    });
    return () => app.vault.offref(reference);
  });

  const session = $derived(parseSession(noteText ?? ""));
  const takenNames = $derived(session.exercises.map(exercise => exercise.name));
  const catalog = $derived(mergeCatalog(recentExerciseNames(history?.pastWorkouts ?? [])));
  const active = $derived(findExercise(session, ui.activeExercise ?? "") ?? session.exercises.at(-1));
  const previous = $derived(active && history && lastPerformance(history.pastWorkouts, active.name, history.sessionDate));

  const editNote = (change: (text: string) => string) =>
    app.vault.process(file, change).catch((error: Error) => new Notice(`Workout logger: ${error.message}`));

  const addExercise = (exerciseName: string) => {
    ui.exerciseAdded(exerciseName);
    void editNote(text => appendExercise(text, exerciseName));
  };
</script>

{#if loadError}
  <div class="wl-error">Workout logger error: {loadError.message}</div>
{:else if noteText !== undefined && history}
  <div class="wl">
    {#each session.exercises as exercise, index (index)}
      <ExerciseCard
        {exercise}
        {ui}
        isActive={exercise === active}
        previous={exercise === active ? previous : undefined}
        onLogSet={(set: ExerciseSet) => editNote(text => appendSet(text, exercise.name, set))}
        onDeleteSet={(setIndex: number) => editNote(text => deleteSet(text, exercise.name, setIndex))}
      />
    {/each}
    <AddExercise {ui} {catalog} {takenNames} onAdd={addExercise} />
  </div>
{/if}
