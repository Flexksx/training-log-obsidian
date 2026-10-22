<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    variant,
    children,
    ...attributes
  }: {
    variant: "primary" | "stepper" | "dashed" | "link" | "icon";
    children: Snippet;
  } & Pick<HTMLButtonAttributes, "onclick" | "aria-label"> = $props();
</script>

<button type="button" class={variant} {...attributes}>{@render children()}</button>

<style>
  button {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  button:focus-visible {
    outline: 2px solid var(--ds-border-focus);
    outline-offset: 1px;
  }
  .primary {
    width: 100%;
    height: var(--ds-control-height);
    padding: 0 var(--ds-space-xl);
    border-radius: var(--ds-radius-control);
    background: var(--ds-accent);
    color: var(--ds-text-on-accent);
    font-size: var(--ds-font-medium);
    font-weight: var(--ds-weight-semibold);
  }
  .primary:hover {
    background: var(--ds-accent-hover);
  }
  .stepper {
    flex: 0 0 var(--ds-control-height);
    width: var(--ds-control-height);
    height: var(--ds-control-height);
    border-radius: var(--ds-radius-control);
    background: var(--ds-control);
    box-shadow: var(--ds-control-shadow);
    font-size: var(--ds-font-large);
  }
  .stepper:hover {
    background: var(--ds-control-hover);
  }
  .dashed {
    width: 100%;
    height: var(--ds-control-height);
    padding: 0 var(--ds-space-xl);
    border: var(--ds-border-width) dashed var(--ds-border);
    border-radius: var(--ds-radius-card);
    color: var(--ds-text-muted);
    font-size: var(--ds-font-small);
  }
  .dashed:hover {
    color: var(--ds-text);
  }
  .link {
    padding: 0 var(--ds-space-xs);
    color: var(--ds-text-accent);
    font-size: var(--ds-font-small);
  }
  .link:hover {
    text-decoration: underline;
  }
  .icon {
    padding: var(--ds-space-2xs) var(--ds-space-s);
    border-radius: var(--ds-radius-control);
    color: var(--ds-text-faint);
  }
  .icon:hover {
    background: var(--ds-surface-hover);
    color: var(--ds-text-muted);
  }
</style>
