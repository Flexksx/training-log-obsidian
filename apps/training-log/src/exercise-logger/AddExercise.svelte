<script lang="ts">
  import Button from "design-system/Button";
  import Card from "design-system/Card";
  import CardBody from "design-system/CardBody";
  import CardHeader from "design-system/CardHeader";
  import Chip from "design-system/Chip";
  import SearchField from "design-system/SearchField";
  import Text from "design-system/Text";
  import { type SearchEntry, searchCatalog } from "workout/application/search";
  import { canCreateExercise, exerciseToAdd } from "./add-exercise.ts";

  let {
    isAdding,
    query,
    onQueryChange,
    onOpen,
    onClose,
    catalog,
    takenNames,
    onAdd,
  }: {
    isAdding: boolean;
    query: string;
    onQueryChange: (query: string) => void;
    onOpen: () => void;
    onClose: () => void;
    catalog: readonly SearchEntry[];
    takenNames: readonly string[];
    onAdd: (exerciseName: string) => void;
  } = $props();

  const hasExercises = $derived(takenNames.length > 0);
  const results = $derived(searchCatalog(catalog, query, takenNames));
  const typed = $derived(query.trim());
  const canCreate = $derived(canCreateExercise(catalog, takenNames, typed));

  const addTopResult = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || !typed) return;
    onAdd(exerciseToAdd(results, catalog, typed));
  };
</script>

{#if hasExercises && !isAdding}
  <div class="add">
    <Button variant="dashed" onclick={onOpen}>+ Add exercise</Button>
  </div>
{:else}
  <Card variant="selected">
    <CardHeader>
      <Text variant="title">{hasExercises ? "Add exercise" : "Start with your first exercise"}</Text>
      {#if hasExercises}
        <Button variant="link" onclick={onClose}>Cancel</Button>
      {/if}
    </CardHeader>
    <CardBody>
      <SearchField
        bind:value={() => query, onQueryChange}
        placeholder="Search, for example &quot;bp&quot; or &quot;inc db&quot;"
        focusOnMount={isAdding}
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
