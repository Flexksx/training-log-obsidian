<script lang="ts">
  import type { Snippet } from "svelte";

  type Variant =
    | "title"
    | "body"
    | "muted"
    | "meta"
    | "caption"
    | "note"
    | "label"
    | "eyebrow"
    | "faint"
    | "strong"
    | "emphasis"
    | "truncate"
    | "axis"
    | "axis-muted"
    | "readout"
    | "tally"
    | "tally-none"
    | "delta"
    | "delta-active"
    | "error";

  let { variant, children }: { variant: Variant; children: Snippet } = $props();
</script>

<span class={variant}>{@render children()}</span>

<style>
  .title {
    font-weight: var(--ds-weight-semibold);
    font-size: var(--ds-font-medium);
  }
  .body {
    color: var(--ds-text);
    font-size: var(--ds-font-small);
  }
  .muted {
    color: var(--ds-text-muted);
    font-size: var(--ds-font-small);
  }
  .meta {
    color: var(--ds-text-muted);
    font-size: var(--ds-font-small);
    white-space: nowrap;
  }
  .caption {
    color: var(--ds-text-muted);
    font-size: var(--ds-font-smaller);
  }
  .note {
    color: var(--ds-text-faint);
    font-size: var(--ds-font-smaller);
  }
  .label {
    color: var(--ds-text-muted);
    font-size: var(--ds-font-smaller);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .eyebrow {
    color: var(--ds-text-faint);
    font-size: var(--ds-font-smaller);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .faint {
    color: var(--ds-text-faint);
  }
  .strong {
    color: var(--ds-text);
    font-weight: var(--ds-weight-semibold);
  }
  .emphasis {
    color: var(--ds-emphasis-color, var(--ds-text));
    font-weight: var(--ds-weight-medium);
  }
  .truncate {
    font-size: var(--ds-font-small);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .axis {
    color: var(--ds-text-faint);
    font-size: var(--ds-font-axis);
    white-space: nowrap;
  }
  .axis-muted {
    color: var(--ds-text-muted);
    font-size: var(--ds-font-axis);
  }
  .readout {
    color: var(--ds-text);
    font-size: var(--ds-font-smaller);
    white-space: nowrap;
  }
  .tally {
    color: var(--ds-text);
    font-size: var(--ds-font-small);
    font-weight: var(--ds-weight-semibold);
  }
  .tally-none {
    color: var(--ds-text-faint);
    font-size: var(--ds-font-small);
  }
  .delta {
    color: var(--ds-text-faint);
    font-size: var(--ds-font-smaller);
    white-space: nowrap;
  }
  .delta-active {
    color: var(--ds-text-muted);
    font-size: var(--ds-font-smaller);
    white-space: nowrap;
  }
  .error {
    color: var(--ds-error);
  }
</style>
