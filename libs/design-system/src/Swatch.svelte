<script lang="ts">
  import type { SwatchVariant } from "./types.ts";

  let {
    variant,
    size,
    marked,
  }: { variant: SwatchVariant; size: "fill" | "key"; marked?: boolean } = $props();
</script>

<i class="{variant} {size}" class:marked={marked}></i>

<style>
  i {
    display: block;
    box-sizing: border-box;
    border-radius: 3px;
  }
  .fill {
    width: 100%;
    height: 100%;
  }
  .key {
    width: 10px;
    height: 10px;
  }
  .empty {
    background: var(--ds-empty);
  }
  .primary {
    background: var(--ds-series-primary);
  }
  .secondary {
    background: var(--ds-series-secondary);
  }
  .mixed {
    background: linear-gradient(135deg, var(--ds-series-primary) 0 50%, var(--ds-series-secondary) 50% 100%);
  }
  .missed {
    background: transparent;
    box-shadow: inset 0 0 0 1.5px var(--ds-text-faint);
  }
  .marked {
    box-shadow: inset 0 0 0 2px var(--ds-text-muted);
  }
</style>
