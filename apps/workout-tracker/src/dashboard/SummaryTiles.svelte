<script lang="ts">
  import type { ActivityDays } from "activity/consistency";
  import type { IsoDate } from "activity/iso-date";
  import type { Visit } from "activity/visit";
  import Pips from "design-system/Pips";
  import StatTile from "design-system/StatTile";
  import { summarizeTiles } from "./summary-tiles.ts";

  let { days, today, visits }: { days: ActivityDays; today: IsoDate; visits: readonly Visit[] } = $props();

  const tiles = $derived(summarizeTiles(days, today, visits));
</script>


<div class="tiles">
  <StatTile {...tiles.week}>
    <Pips filled={tiles.pips} />
  </StatTile>
  <StatTile {...tiles.streak} />
  <StatTile {...tiles.lookback} />
  <StatTile {...tiles.lastSession} />
</div>

<style>
  .tiles {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--ds-space-s);
  }
  @container (min-width: 620px) {
    .tiles {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
