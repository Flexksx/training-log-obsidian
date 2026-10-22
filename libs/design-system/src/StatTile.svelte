<script lang="ts">
  import type { Snippet } from "svelte";
  import Card from "./Card.svelte";
  import Text from "./Text.svelte";

  let {
    label,
    value,
    unit,
    detail,
    children,
  }: { label: string; value: string; unit?: string; detail: string; children?: Snippet } = $props();
</script>

<Card variant="tile">
  <Text variant="caption">{label}</Text>
  <div class="value">
    <span>{value}{#if unit}<small>{unit}</small>{/if}</span>
  </div>
  {@render children?.()}
  <Text variant="caption">{detail}</Text>
</Card>

<style>
  .value {
    font-size: var(--ds-font-stat);
    font-weight: var(--ds-weight-semibold);
    line-height: 1.15;
    letter-spacing: -0.01em;
  }
  small {
    margin-inline-start: 0.3em;
    color: var(--ds-text-muted);
    font-size: 0.55em;
    font-weight: var(--ds-weight-normal);
    letter-spacing: 0;
  }
</style>
