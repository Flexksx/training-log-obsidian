<script lang="ts">
  import type { Series } from "./types.ts";

  let { series }: { series: Series } = $props();
</script>

<i class={series}></i>

<style>
  i {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 6px;
    border-radius: 50%;
    vertical-align: 1px;
  }
  .primary {
    background: var(--ds-series-primary);
  }
  .secondary {
    background: var(--ds-series-secondary);
  }
</style>
