<script lang="ts">
  let {
    scale,
    value,
    bandStart,
    bandEnd,
  }: { scale: number; value: number; bandStart: number; bandEnd: number } = $props();

  const PERCENT = 100;

  const percentOfScale = (amount: number): string => `${(amount / scale) * PERCENT}%`;
</script>

<span class="track">
  <span class="band" style:left={percentOfScale(bandStart)} style:width={percentOfScale(bandEnd - bandStart)}></span>
  {#if value}<span class="fill" style:width={percentOfScale(value)}></span>{/if}
</span>

<style>
  .track {
    position: relative;
    height: 12px;
    border-radius: 4px;
    background: var(--ds-surface);
  }
  .band {
    position: absolute;
    top: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--ds-series-primary) 18%, transparent);
    border-left: 1px dashed color-mix(in srgb, var(--ds-series-primary) 60%, transparent);
    border-right: 1px dashed color-mix(in srgb, var(--ds-series-primary) 60%, transparent);
  }
  .fill {
    position: absolute;
    left: 0;
    top: 2px;
    bottom: 2px;
    min-width: 3px;
    border-radius: 0 4px 4px 0;
    background: var(--ds-series-primary);
  }
</style>
