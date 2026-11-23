<script lang="ts">
  import Button from "design-system/Button";
  import Card from "design-system/Card";
  import CardBody from "design-system/CardBody";
  import CardHeader from "design-system/CardHeader";
  import Chip from "design-system/Chip";
  import SearchField from "design-system/SearchField";
  import Text from "design-system/Text";
  import { type SearchEntry, searchCatalog } from "workout/search";
  import { canCreateExercise, exerciseToAdd } from "./add-exercise.ts";
  import type { ExerciseLoggerState } from "./exercise-logger-state.svelte.ts";

  let {
    ui,
    catalog,
    takenNames,
    onAdd,
  }: {
    ui: ExerciseLoggerState;
    catalog: readonly SearchEntry[];
    takenNames: readonly string[];
    onAdd: (exerciseName: string) => void;
  } = $props();

  const hasExercises = $derived(takenNames.length > 0);
  const results = $derived(searchCatalog(catalog, ui.query, takenNames));
  const typed = $derived(ui.query.trim());
  const canCreate = $derived(canCreateExercise(catalog, takenNames, typed));

  const addTopResult = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || !typed) return;
    onAdd(exerciseToAdd(results, catalog, typed));
  };
</script>

{#if hasExercises && !ui.isAdding}
  <div class="add">
    <Button variant="dashed" onclick={() => ui.openAdd()}>+ Add exercise</Button>
  </div>
{:else}
  <Card variant="selected">
    <CardHeader>
      <Text variant="title">{hasExercises ? "Add exercise" : "Start with your first exercise"}</Text>
      {#if hasExercises}
        <Button variant="link" onclick={() => ui.closeAdd()}>Cancel</Button>
      {/if}
    </CardHeader>
    <CardBody>
      <SearchField
        bind:value={ui.query}
        placeholder="Search, for example &quot;bp&quot; or &quot;inc db&quot;"
        focusOnMount={ui.isAdding}
        onkeydown={addTopResult}
      />
      <div class="chips">
        {#each results as entry (entry.name)}
          <Chip variant="default" onclick={() => onAdd(entry.name)}>
            <span>{entry.name}</span>
            <Text variant="note">{entry.recentRank === undefined ? entry.group : "recent"}</Text>
          </Chip>
        {/each}
        {#if canCreate}
          <Chip variant="primary" onclick={() => onAdd(typed)}>+ New: “{typed}”</Chip>
        {/if}
        {#if !results.length && !canCreate}
          <Text variant="muted">Type a name to search or add an exercise.</Text>
        {/if}
      </div>
    </CardBody>
  </Card>
{/if}

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ds-space-xs);
  }
  @container (min-width: 520px) {
    .add {
      align-self: flex-start;
    }
  }
</style>
