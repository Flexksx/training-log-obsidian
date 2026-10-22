<script lang="ts">
  import type { Visit } from "activity/visit";
  import Dot from "design-system/Dot";
  import ListRow from "design-system/ListRow";
  import Section from "design-system/Section";
  import Text from "design-system/Text";
  import type { Workout } from "workout/session";
  import { formatShortDate } from "../format.ts";
  import { SERIES_OF_ACTIVITY } from "../series.ts";
  import { interceptLink } from "./open-note.ts";
  import { recentSessionRows } from "./recent-sessions.ts";

  let {
    visits,
    workouts,
    onOpen,
  }: { visits: readonly Visit[]; workouts: readonly Workout[]; onOpen: (notePath: string) => void } = $props();

  const rows = $derived(recentSessionRows(visits, workouts));
</script>


<Section title="Recent sessions" note="{visits.length} logged">
  <div>
    {#each rows as { visit, title, numbers } (visit.notePath)}
      <ListRow variant="roomy" href={visit.notePath} onclick={event => interceptLink(event, () => onOpen(visit.notePath))}>
        <div class="session">
          <span class="date">
            <Text variant="emphasis"><Dot series={SERIES_OF_ACTIVITY[visit.activity]} />{formatShortDate(visit.date)}</Text>
          </span>
          <Text variant="truncate">{title}</Text>
          <Text variant="caption">{numbers.join(" · ") || "No details"}</Text>
        </div>
      </ListRow>
    {/each}
  </div>
</Section>

<style>
  .session {
    display: grid;
    grid-template-columns: 8.5em 1fr;
    gap: var(--ds-space-2xs) var(--ds-space-m);
  }
  .date {
    grid-row: span 2;
    white-space: nowrap;
  }
</style>
