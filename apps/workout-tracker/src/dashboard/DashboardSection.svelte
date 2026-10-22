<script lang="ts">
  import type { Snippet } from "svelte";

  let { title, note, children }: { title: string; note?: string; children: Snippet } = $props();
</script>

<section class="wd-section">
  <header class="wd-section-head">
    <h3>{title}</h3>
    {#if note}<span class="wd-note">{note}</span>{/if}
  </header>
  {@render children()}
</section>
