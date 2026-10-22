<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    href,
    onclick,
    children,
  }: { href: string; onclick: (event: MouseEvent) => void; children: Snippet } = $props();
</script>

<a {href} {onclick}>{@render children()}</a>

<style>
  a {
    color: var(--ds-text);
    font-weight: var(--ds-weight-medium);
    text-decoration: none;
  }
  a:hover {
    color: var(--ds-text-accent);
  }
</style>
