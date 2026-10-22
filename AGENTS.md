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

- Libs do not import each other. The app composes them.
- Libs ship TypeScript source with no build step. The app imports a module by
  its subpath, for example `workout/session`. Imports inside a lib keep the
  `.ts` extension, so `node --test` runs the tests with type stripping.
- One plugin serves desktop and mobile, because Obsidian loads the same
  `main.js` on both. Branch on `Platform.isMobile` where a view differs.
- Node and pnpm come from `nix/node.nix`, shared by every TypeScript unit.

## Formatting and linting

- Biome formats and lints every TypeScript, JavaScript, JSON, CSS and Svelte
  file. The root `biome.json` is its only config.
- ESLint runs only the `eslint-plugin-svelte` rules, on `.svelte` and
  `.svelte.ts` files. It holds no style rules, so it never fights Biome.
- `svelte-check` type-checks the plugin. `tsc` type-checks each lib.
- dependency-cruiser enforces the import boundaries between apps, libs and
  layers. The rules and their reasons are in `.dependency-cruiser.cjs`. `just lint`
  runs them.
- Dev tool versions shared by several units live in the pnpm `catalog` in
  `pnpm-workspace.yaml`. Biome is pinned exactly, because its output changes
  between versions.
- pnpm rejects packages younger than its minimum release age. Pick an older
  version instead of adding an exception.

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
OBSIDIAN_PLUGIN_DIR="$HOME/Obsidian/obsidian-vault/.obsidian/plugins/training-log" just build workout-tracker
```

Then reload the plugin in Obsidian.

The wiring of `just`, `moon` and `nix` follows the project-bootstrap template.
