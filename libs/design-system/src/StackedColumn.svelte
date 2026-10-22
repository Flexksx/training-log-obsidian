<script lang="ts">
  import type { Series } from "./types.ts";

  type Segment = { series: Series; weight: number };

  let { fraction, segments }: { fraction: number; segments: readonly Segment[] } = $props();

  const PERCENT = 100;
</script>

<div class="track">
  <div class="stack" style:height="{fraction * PERCENT}%">
    {#each segments as segment (segment.series)}
      <span class={segment.series} style:flex-grow={segment.weight}></span>
    {/each}
  </div>
</div>

<style>
  .track {
    display: flex;
    align-items: flex-end;
    width: 100%;
    max-width: 36px;
    height: 96px;
    border-bottom: 1px solid var(--ds-border);
  }
  .stack {
    display: flex;
    flex-direction: column-reverse;
    gap: 2px;
    width: 100%;
  }
  span {
    display: block;
    flex-basis: 0;
    min-height: 2px;
  }
  span:last-child {
    border-radius: 4px 4px 0 0;
  }
  .primary {
    background: var(--ds-series-primary);
  }
  .secondary {
    background: var(--ds-series-secondary);
  }
</style>
