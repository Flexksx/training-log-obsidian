<script lang="ts">
  let { values }: { values: readonly number[] } = $props();

  const WIDTH = 72;
  const HEIGHT = 24;
  const PADDING = 4;
  const END_RADIUS = 3;

  const geometry = $derived.by(() => {
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const lastIndex = values.length - 1;
    const x = (index: number) => PADDING + (index / lastIndex) * (WIDTH - 2 * PADDING);
    const y = (value: number) =>
      maximum === minimum
        ? HEIGHT / 2
        : HEIGHT - PADDING - ((value - minimum) / (maximum - minimum)) * (HEIGHT - 2 * PADDING);
    return {
      points: values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" "),
      endX: x(lastIndex),
      endY: y(values[lastIndex] ?? minimum),
    };
  });
</script>

<svg viewBox="0 0 {WIDTH} {HEIGHT}" width={WIDTH} height={HEIGHT} aria-hidden="true">
  <polyline points={geometry.points} />
  <circle cx={geometry.endX} cy={geometry.endY} r={END_RADIUS} />
</svg>

<style>
  polyline {
    fill: none;
    stroke: var(--ds-series-primary);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  circle {
    fill: var(--ds-series-primary);
    stroke: var(--ds-surface-page);
    stroke-width: 2;
  }
</style>
