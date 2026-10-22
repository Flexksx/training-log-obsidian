<script lang="ts">
  import Swatch from "design-system/Swatch";
  import Text from "design-system/Text";
  import type { SwatchVariant } from "design-system/types";

  let { entries }: { entries: readonly { variant: SwatchVariant; label: string }[] } = $props();
</script>

<div class="legend">
  {#each entries as entry (entry.label)}
    <span class="key">
      <Swatch variant={entry.variant} size="key" />
      <Text variant="caption">{entry.label}</Text>
    </span>
  {/each}
</div>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ds-space-m);
  }
  .key {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-xs);
  }
</style>
