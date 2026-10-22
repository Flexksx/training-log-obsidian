<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="theme">{@render children()}</div>

<style>
  .theme {
    display: contents;
    font-variant-numeric: tabular-nums;

    --ds-text: var(--text-normal);
    --ds-text-muted: var(--text-muted);
    --ds-text-faint: var(--text-faint);
    --ds-text-accent: var(--text-accent);
    --ds-text-on-accent: var(--text-on-accent);
    --ds-error: var(--text-error);

    --ds-surface-page: var(--background-primary);
    --ds-surface: var(--background-secondary);
    --ds-surface-field: var(--background-modifier-form-field);
    --ds-surface-hover: var(--background-modifier-hover);
    --ds-border: var(--background-modifier-border);
    --ds-border-focus: var(--background-modifier-border-focus);
    --ds-border-width: var(--border-width);
    --ds-accent: var(--interactive-accent);
    --ds-accent-hover: var(--interactive-accent-hover);
    --ds-control: var(--interactive-normal);
    --ds-control-hover: var(--interactive-hover);
    --ds-control-shadow: var(--input-shadow);

    --ds-series-primary: #2f9e4f;
    --ds-series-secondary: #7c5cd6;
    --ds-empty: var(--ds-border);

    --ds-space-2xs: var(--size-2-2);
    --ds-space-xs: var(--size-4-1);
    --ds-space-s: var(--size-4-2);
    --ds-space-m: var(--size-4-3);
    --ds-space-l: var(--size-4-4);
    --ds-space-xl: var(--size-4-6);
    --ds-space-2xl: var(--size-4-8);

    --ds-font-axis: 10px;
    --ds-font-smaller: var(--font-ui-smaller);
    --ds-font-small: var(--font-ui-small);
    --ds-font-medium: var(--font-ui-medium);
    --ds-font-large: var(--font-ui-large);
    --ds-font-stat: 1.6em;
    --ds-weight-normal: var(--font-normal);
    --ds-weight-medium: var(--font-medium);
    --ds-weight-semibold: var(--font-semibold);

    --ds-radius-card: var(--radius-l);
    --ds-radius-control: var(--button-radius);
    --ds-radius-field: var(--input-radius);
    --ds-radius-chip: var(--tag-radius);

    --ds-compact-height: var(--input-height);
    --ds-control-height: calc(var(--input-height) * 1.3);
  }

  :global(.theme-dark) .theme {
    --ds-series-primary: #3fae5c;
    --ds-series-secondary: #8b72e0;
  }

  :global(.is-mobile) .theme {
    --ds-compact-height: 36px;
    --ds-control-height: 48px;
    --ds-radius-card: 12px;
    --ds-radius-chip: 999px;
  }
</style>
