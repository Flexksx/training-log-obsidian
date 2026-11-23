<script lang="ts">
  import Button from "design-system/Button";
  import Card from "design-system/Card";
  import CardBody from "design-system/CardBody";
  import CardHeader from "design-system/CardHeader";
  import ListRow from "design-system/ListRow";
  import SegmentedControl from "design-system/SegmentedControl";
  import Stepper from "design-system/Stepper";
  import Text from "design-system/Text";
  import { Notice } from "obsidian";
  import { type ExerciseSet, formatSet, formatShortSet } from "workout/exercise-set";
  import type { Exercise } from "workout/session";
  import { formatDayMonth } from "../format.ts";
  import {
    type DraftField,
    KIND_FIELDS,
    KIND_OPTIONS,
    missingInputMessage,
    seedDraft,
    setFromDraft,
    withField,
  } from "./draft.ts";
  import type { ExerciseLoggerState } from "./exercise-logger-state.svelte.ts";
  import { summarizeSets } from "./set-summary.ts";

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
    ui: ExerciseLoggerState;
    onLogSet: (set: ExerciseSet) => void;
    onDeleteSet: (setIndex: number) => void;
  } = $props();

  const draft = $derived(ui.draftOf(exercise.name) ?? seedDraft(exercise.name, exercise.sets.at(-1), previous?.sets[0]));
  const fields = $derived(KIND_FIELDS[draft.kind]);

  const setField = (field: DraftField, value: number | null) => ui.saveDraft(exercise.name, withField(draft, field, value));

  const logSet = () => {
    const set = setFromDraft(draft);
    if (set) onLogSet(set);
    else new Notice(missingInputMessage(draft.kind));
  };
</script>


<Card variant={isActive ? "selected" : "panel"}>
  {#if isActive}
    <CardHeader>
      <Text variant="title">{exercise.name}</Text>
      <Text variant="meta">{summarizeSets(exercise.sets)}</Text>
    </CardHeader>
    <CardBody>
      {#if previous}
        <Text variant="muted">
          Last time, {formatDayMonth(previous.date)}: {previous.sets.map(formatShortSet).join("  ·  ")}
        </Text>
      {/if}

      {#if exercise.sets.length}
        <div>
          {#each exercise.sets as set, index (set.line)}
            <ListRow variant="compact">
              <div class="set">
                <span class="number"><Text variant="faint">{index + 1}</Text></span>
                <span class="description">{formatSet(set)}</span>
                <Button variant="icon" aria-label="Delete set" onclick={() => onDeleteSet(index)}>✕</Button>
              </div>
            </ListRow>
          {/each}
        </div>
      {/if}

      <SegmentedControl
        options={KIND_OPTIONS}
        selected={draft.kind}
        onselect={kind => ui.saveDraft(exercise.name, { ...draft, kind })}
      />

      <div class="entry" class:single={fields.length === 1}>
        {#each fields as { label, field, step } (field)}
          <Stepper {label} {step} bind:value={() => draft[field], value => setField(field, value)} />
        {/each}
        <div class="log">
          <Button variant="primary" onclick={logSet}>Log set {exercise.sets.length + 1}</Button>
        </div>
      </div>
    </CardBody>
  {:else}
    <CardHeader onclick={() => ui.select(exercise.name)}>
      <Text variant="title">{exercise.name}</Text>
      <Text variant="meta">{summarizeSets(exercise.sets)}</Text>
    </CardHeader>
  {/if}
</Card>

<style>
  .set {
    display: flex;
    align-items: center;
    gap: var(--ds-space-m);
  }
  .number {
    width: 1.5em;
    text-align: right;
  }
  .description {
    flex: 1;
  }
  .entry {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--ds-space-s);
  }
  .single {
    grid-template-columns: 1fr;
  }
  .log {
    grid-column: 1 / -1;
  }
  @container (min-width: 520px) {
    .entry {
      grid-template-columns: 1fr 1fr auto;
      align-items: end;
    }
    .single {
      grid-template-columns: 1fr auto;
    }
    .log {
      grid-column: auto;
    }
  }
</style>
