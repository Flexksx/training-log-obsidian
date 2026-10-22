<script lang="ts">
  let { label, step, value = $bindable() }: { label: string; step: number; value: number | null } = $props();

  const id = $props.id();
  const ROUNDING = 100;

  const nudge = (delta: number) => {
    value = Math.max(0, Math.round(((value ?? 0) + delta) * ROUNDING) / ROUNDING);
  };
</script>

<div class="wl-step">
  <label for={id}>{label}</label>
  <div class="wl-step-row">
    <button class="wl-step-btn" aria-label="Decrease {label}" onclick={() => nudge(-step)}>−</button>
    <input {id} type="number" inputmode="decimal" step="any" bind:value />
    <button class="wl-step-btn" aria-label="Increase {label}" onclick={() => nudge(step)}>+</button>
  </div>
</div>
