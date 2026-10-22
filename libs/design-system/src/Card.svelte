<script lang="ts">
  import type { Snippet } from "svelte";

  let { variant, children }: { variant: "tile" | "panel" | "selected"; children: Snippet } = $props();
</script>

<div class="card {variant}">{@render children()}</div>

<style>
  .card {
    min-width: 0;
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-card);
    background: var(--ds-surface);
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-2xs);
    padding: var(--ds-space-m) var(--ds-space-l);
  }
  .panel,
  .selected {
    overflow: hidden;
  }
  .selected {
    border-color: var(--ds-accent);
  }
</style>
