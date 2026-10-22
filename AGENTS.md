# AGENTS.md

## Project map

An Obsidian plugin for physical activity. The vault notes are the source of
truth. The plugin reads them and writes sets back into them.

- `apps/workout-tracker`: the Obsidian plugin. It registers two code blocks.
  `workout-logger` goes inside a workout note and logs sets.
  `workout-dashboard` shows consistency, time and calories, sets per muscle and
  exercise progress. The app holds the Svelte views and every vault read and
  write (`src/notes.ts`).
- `libs/workout`: gym sessions. Set parsing and formatting, note text edits,
  the exercise catalog, fuzzy search and progress stats.
- `libs/activity`: attendance across activities (gym, capoeira). Daily-note
  tasks and activity notes become done or missed days, week streaks, and weekly
  time and calories.

## Boundaries

- Each lib is one domain in plain TypeScript. A lib never imports `obsidian` or
  `svelte`. Its `package.json` does not list them, so such an import fails.
- Libs do not import each other. The app composes them.
- Libs ship TypeScript source with no build step. The app imports a module by
  its subpath, for example `workout/session`. Imports inside a lib keep the
  `.ts` extension, so `node --test` runs the tests with type stripping.
- One plugin serves desktop and mobile, because Obsidian loads the same
  `main.js` on both. Branch on `Platform.isMobile` where a view differs.
- Node and pnpm come from `nix/node.nix`, shared by every TypeScript unit.

## Entry points

Every developer action uses `just`. `just` sends the work to `moon`.

- `just format`
- `just lint`
- `just build all`
- `just test all`
- `just start workout-tracker` rebuilds on every change.

The plugin build writes `main.js`, `manifest.json` and `styles.css` to
`apps/workout-tracker/dist`. To write them straight into a vault, set
`OBSIDIAN_PLUGIN_DIR`:

```bash
OBSIDIAN_PLUGIN_DIR="$HOME/Obsidian/obsidian-vault/.obsidian/plugins/workout-tracker" just build workout-tracker
```

Then reload the plugin in Obsidian.

The wiring of `just`, `moon` and `nix` follows the project-bootstrap template.
