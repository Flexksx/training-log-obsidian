<script lang="ts">
  import Swatch from "./Swatch.svelte";
  import type { SwatchVariant } from "./types.ts";

  let {
    variant,
    marked,
    label,
    onselect,
  }: { variant: SwatchVariant; marked: boolean; label: string; onselect: () => void } = $props();
</script>

<button type="button" title={label} aria-label={label} onclick={onselect} onmouseenter={onselect}>
  <Swatch {variant} size="fill" {marked} />
</button>

<style>
  button {
    all: unset;
    display: block;
    box-sizing: border-box;
    aspect-ratio: 1;
    width: 100%;
    max-width: 22px;
    min-width: 0;
    border-radius: 3px;
    cursor: pointer;
  }
  button:hover,
  button:focus-visible {
    outline: 2px solid var(--ds-text);
    outline-offset: 1px;
  }
</style>
