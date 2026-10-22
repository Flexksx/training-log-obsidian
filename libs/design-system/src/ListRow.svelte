<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    variant,
    href,
    onclick,
    children,
  }: {
    variant: "roomy" | "compact";
    href?: string;
    onclick?: (event: MouseEvent) => void;
    children: Snippet;
  } = $props();
</script>

{#if href}
  <a class="row {variant}" {href} {onclick}>{@render children()}</a>
{:else}
  <div class="row {variant}">{@render children()}</div>
{/if}

<style>
  .row {
    display: block;
    color: var(--ds-text);
    text-decoration: none;
  }
  a:hover {
    --ds-emphasis-color: var(--ds-text-accent);
  }
  .roomy {
    padding: var(--ds-space-s) 0;
    border-top: var(--ds-border-width) solid var(--ds-border);
  }
  .compact {
    padding: var(--ds-space-xs) 0;
    border-bottom: var(--ds-border-width) solid var(--ds-border);
  }
  .compact:last-child {
    border-bottom: none;
  }
</style>
