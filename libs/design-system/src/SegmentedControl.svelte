<script lang="ts" generics="Value extends string">
  type Option = { value: Value; label: string };

  let {
    options,
    selected,
    onselect,
  }: { options: readonly Option[]; selected: Value; onselect: (value: Value) => void } = $props();
</script>

<fieldset>
  {#each options as option (option.value)}
    <button
      type="button"
      class:selected={option.value === selected}
      aria-pressed={option.value === selected}
      onclick={() => onselect(option.value)}
    >
      {option.label}
    </button>
  {/each}
</fieldset>

<style>
  fieldset {
    display: flex;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: none;
    gap: var(--ds-space-xs);
  }
  button {
    all: unset;
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--ds-compact-height);
    padding: 0 var(--ds-space-xs);
    border-radius: var(--ds-radius-control);
    background: var(--ds-control);
    box-shadow: var(--ds-control-shadow);
    font-size: var(--ds-font-small);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:hover {
    background: var(--ds-control-hover);
  }
  button:focus-visible {
    outline: 2px solid var(--ds-border-focus);
    outline-offset: 1px;
  }
  button.selected {
    background: var(--ds-accent);
    color: var(--ds-text-on-accent);
  }
  @media (hover: none) and (pointer: coarse) {
    button {
      min-height: 44px;
      transition: transform 120ms ease, background-color 120ms ease;
    }
    button:active {
      transform: scale(0.96);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }
    button:active {
      transform: none;
    }
  }
</style>
