<script lang="ts">
  let { filled }: { filled: readonly boolean[] } = $props();
</script>

<div aria-hidden="true">
  {#each filled as isFilled, index (index)}<span class:filled={isFilled}></span>{/each}
</div>

<style>
  div {
    display: flex;
    gap: var(--ds-space-xs);
  }
  span {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--ds-empty);
  }
  .filled {
    background: var(--ds-text);
  }
</style>
