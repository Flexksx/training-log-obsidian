<script lang="ts">
  import Button from "./Button.svelte";
  import Text from "./Text.svelte";

  let { label, step, value = $bindable() }: { label: string; step: number; value: number | null } = $props();

  const id = $props.id();
  const ROUNDING = 100;

  const nudge = (delta: number) => {
    value = Math.max(0, Math.round(((value ?? 0) + delta) * ROUNDING) / ROUNDING);
  };
</script>

<div class="stepper">
  <label for={id}><Text variant="label">{label}</Text></label>
  <div class="row">
    <Button variant="stepper" aria-label="Decrease {label}" onclick={() => nudge(-step)}>−</Button>
    <input {id} type="number" inputmode="decimal" step="any" bind:value />
    <Button variant="stepper" aria-label="Increase {label}" onclick={() => nudge(step)}>+</Button>
  </div>
</div>

<style>
  .stepper {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-xs);
    min-width: 0;
  }
  .row {
    display: flex;
    gap: var(--ds-space-xs);
  }
  input {
    all: unset;
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    height: var(--ds-control-height);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-field);
    background: var(--ds-surface-field);
    font-size: var(--ds-font-medium);
    text-align: center;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input:focus {
    border-color: var(--ds-border-focus);
    box-shadow: 0 0 0 2px var(--ds-border-focus);
  }
</style>
