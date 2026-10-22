<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    variant,
    onclick,
    children,
  }: { variant: "default" | "primary"; onclick: () => void; children: Snippet } = $props();
</script>

<button type="button" class={variant} {onclick}>{@render children()}</button>

<style>
  button {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: baseline;
    gap: var(--ds-space-xs);
    min-height: var(--ds-compact-height);
    padding: var(--ds-space-xs) var(--ds-space-m);
    border-radius: var(--ds-radius-chip);
    font-size: var(--ds-font-small);
    cursor: pointer;
  }
  button:focus-visible {
    outline: 2px solid var(--ds-border-focus);
    outline-offset: 1px;
  }
  .default {
    background: var(--ds-control);
    box-shadow: var(--ds-control-shadow);
  }
  .default:hover {
    background: var(--ds-control-hover);
  }
  .primary {
    background: var(--ds-accent);
    color: var(--ds-text-on-accent);
  }
  .primary:hover {
    background: var(--ds-accent-hover);
  }
</style>
