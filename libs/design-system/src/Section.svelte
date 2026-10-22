<script lang="ts">
  import type { Snippet } from "svelte";
  import Text from "./Text.svelte";

  let { title, note, children }: { title: string; note?: string; children: Snippet } = $props();
</script>

<section>
  <header>
    <h3>{title}</h3>
    {#if note}<Text variant="note">{note}</Text>{/if}
  </header>
  {@render children()}
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-m);
  }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--ds-space-m);
  }
  h3 {
    margin: 0;
    color: var(--ds-text);
    font-size: var(--ds-font-medium);
    font-weight: var(--ds-weight-semibold);
  }
</style>
