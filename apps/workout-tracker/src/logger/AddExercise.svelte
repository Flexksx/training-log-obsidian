<script lang="ts">
  import { isKnownName, resolveName, searchCatalog, type SearchEntry } from "workout/search";
  import type { LoggerState } from "./logger-state.svelte.ts";

  let {
    ui,
    catalog,
    takenNames,
    onAdd,
  }: {
    ui: LoggerState;
    catalog: readonly SearchEntry[];
    takenNames: readonly string[];
    onAdd: (exerciseName: string) => void;
  } = $props();

  const hasExercises = $derived(takenNames.length > 0);
  const results = $derived(searchCatalog(catalog, ui.query, takenNames));
  const typed = $derived(ui.query.trim());
  const canCreate = $derived(typed !== "" && !isKnownName([...catalog.map(entry => entry.name), ...takenNames], typed));

  const addTopResult = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || !typed) return;
    onAdd(results[0]?.name ?? resolveName(catalog, typed));
  };

  const focusWhenAdding = (input: HTMLInputElement) => {
    if (ui.isAdding) input.focus();
  };
</script>

{#if hasExercises && !ui.isAdding}
  <button class="wl-add-btn" onclick={() => ui.openAdd()}>+ Add exercise</button>
{:else}
  <div class="wl-card is-active">
    <div class="wl-head">
      <div class="wl-name">{hasExercises ? "Add exercise" : "Start with your first exercise"}</div>
      {#if hasExercises}
        <button class="wl-link" onclick={() => ui.closeAdd()}>Cancel</button>
      {/if}
    </div>
    <div class="wl-body">
      <input
        type="search"
        class="wl-search"
        placeholder={'Search, for example "bp" or "inc db"'}
        bind:value={ui.query}
        onkeydown={addTopResult}
        {@attach focusWhenAdding}
      />
      <div class="wl-chips">
        {#each results as entry (entry.name)}
          <button class="wl-chip" onclick={() => onAdd(entry.name)}>
            <span>{entry.name}</span>
            <span class="wl-chip-group">{entry.recentRank === undefined ? entry.group : "recent"}</span>
          </button>
        {/each}
        {#if canCreate}
          <button class="wl-chip mod-cta" onclick={() => onAdd(typed)}>+ New: “{typed}”</button>
        {/if}
        {#if !results.length && !canCreate}
          <div class="wl-muted">Type a name to search or add an exercise.</div>
        {/if}
      </div>
    </div>
  </div>
{/if}
