<script lang="ts">
  import { Notice } from "obsidian";
  import { formatClock, formatSet, formatShortSet, type ExerciseSet } from "workout/exercise-set";
  import type { Exercise } from "workout/session";
  import { formatDayMonth, pluralize } from "../format.ts";
  import { KIND_FIELDS, KIND_OPTIONS, seedDraft, setFromDraft, withField, type DraftField } from "./draft.ts";
  import type { LoggerState } from "./logger-state.svelte.ts";
  import Stepper from "./Stepper.svelte";

  type PreviousSets = { date: string; sets: ExerciseSet[] };

  let {
    exercise,
    isActive,
    previous,
    ui,
    onLogSet,
    onDeleteSet,
  }: {
    exercise: Exercise;
    isActive: boolean;
    previous?: PreviousSets;
    ui: LoggerState;
    onLogSet: (set: ExerciseSet) => void;
    onDeleteSet: (setIndex: number) => void;
  } = $props();

  const bestOfKind = (sets: readonly ExerciseSet[], last: ExerciseSet): string => {
    switch (last.kind) {
      case "time":
        return `best ${formatClock(Math.max(...sets.flatMap(set => (set.kind === "time" ? [set.seconds] : []))))}`;
      case "body":
        return `top ${Math.max(...sets.flatMap(set => (set.kind === "body" ? [set.reps] : [])))} reps`;
      case "weight":
        return `top ${Math.max(...sets.flatMap(set => (set.kind === "weight" ? [set.kilograms] : [])))} kg`;
    }
  };

  const summarize = (sets: readonly ExerciseSet[]): string => {
    const last = sets.at(-1);
    return last ? `${pluralize(sets.length, "set")} · ${bestOfKind(sets, last)}` : "No sets yet";
  };

  const draft = $derived(ui.draftOf(exercise.name) ?? seedDraft(exercise.name, exercise.sets.at(-1), previous?.sets[0]));
  const fields = $derived(KIND_FIELDS[draft.kind]);

  const setField = (field: DraftField, value: number | null) => ui.saveDraft(exercise.name, withField(draft, field, value));

  const logSet = () => {
    const set = setFromDraft(draft);
    if (set) onLogSet(set);
    else new Notice(draft.kind === "time" ? "Enter a time" : "Enter reps");
  };

  const selectOnKey = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") ui.select(exercise.name);
  };
</script>

<div class="wl-card" class:is-active={isActive}>
  {#if isActive}
    <div class="wl-head">
      <div class="wl-name">{exercise.name}</div>
      <div class="wl-meta">{summarize(exercise.sets)}</div>
    </div>
    <div class="wl-body">
      {#if previous}
        <div class="wl-muted">
          Last time, {formatDayMonth(previous.date)}: {previous.sets.map(formatShortSet).join("  ·  ")}
        </div>
      {/if}

      {#if exercise.sets.length}
        <div class="wl-sets">
          {#each exercise.sets as set, index (set.line)}
            <div class="wl-set">
              <span class="wl-set-n">{index + 1}</span>
              <span class="wl-set-v">{formatSet(set)}</span>
              <button class="wl-del clickable-icon" aria-label="Delete set" onclick={() => onDeleteSet(index)}>✕</button>
            </div>
          {/each}
        </div>
      {/if}

      <div class="wl-kinds">
        {#each KIND_OPTIONS as option (option.kind)}
          <button
            class="wl-kind"
            class:mod-cta={option.kind === draft.kind}
            onclick={() => ui.saveDraft(exercise.name, { ...draft, kind: option.kind })}
          >
            {option.label}
          </button>
        {/each}
      </div>

      <div class="wl-entry" class:is-single={fields.length === 1}>
        {#each fields as { label, field, step } (field)}
          <Stepper {label} {step} bind:value={() => draft[field], value => setField(field, value)} />
        {/each}
        <button class="mod-cta wl-log" onclick={logSet}>Log set {exercise.sets.length + 1}</button>
      </div>
    </div>
  {:else}
    <div class="wl-head" role="button" tabindex="0" onclick={() => ui.select(exercise.name)} onkeydown={selectOnKey}>
      <div class="wl-name">{exercise.name}</div>
      <div class="wl-meta">{summarize(exercise.sets)}</div>
    </div>
  {/if}
</div>
