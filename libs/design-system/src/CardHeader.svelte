<script lang="ts">
  import type { Snippet } from "svelte";

  let { onclick, children }: { onclick?: () => void; children: Snippet } = $props();
</script>

{#if onclick}
  <button type="button" class="header" {onclick}>{@render children()}</button>
{:else}
  <div class="header">{@render children()}</div>
{/if}

<style>
  button {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    cursor: pointer;
  }
  button:focus-visible {
    box-shadow: inset 0 0 0 2px var(--ds-border-focus);
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--ds-space-m);
    padding: var(--ds-space-m) var(--ds-space-l);
    min-height: var(--ds-control-height);
  }
</style>
