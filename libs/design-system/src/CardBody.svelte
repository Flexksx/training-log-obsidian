<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="body">{@render children()}</div>

<style>
  .body {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-m);
    padding: 0 var(--ds-space-l) var(--ds-space-l);
  }
</style>
