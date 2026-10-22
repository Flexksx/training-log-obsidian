<script lang="ts">
  let {
    value = $bindable(),
    placeholder,
    focusOnMount,
    onkeydown,
  }: {
    value: string;
    placeholder: string;
    focusOnMount: boolean;
    onkeydown: (event: KeyboardEvent) => void;
  } = $props();

  const focusWhenRequested = (input: HTMLInputElement) => {
    if (focusOnMount) input.focus();
  };
</script>

<input type="search" {placeholder} bind:value {onkeydown} {@attach focusWhenRequested} />

<style>
  input {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    height: var(--ds-control-height);
    padding: 0 var(--ds-space-m);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-field);
    background: var(--ds-surface-field);
    font-size: var(--ds-font-medium);
  }
  input::placeholder {
    color: var(--ds-text-faint);
  }
  input:focus {
    border-color: var(--ds-border-focus);
    box-shadow: 0 0 0 2px var(--ds-border-focus);
  }
</style>
