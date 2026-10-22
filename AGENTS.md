# AGENTS.md

## Project map

An Obsidian plugin for physical activity. The vault notes are the source of
truth. The plugin reads them and writes sets back into them.

- `apps/workout-tracker`: the Obsidian plugin. The `workout-logger` code block
  goes inside a workout note and logs sets. A ribbon icon opens the dashboard
  in its own tab. It shows consistency, time and calories, sets per muscle and
  exercise progress. The settings tab sets the activity folder, the only place
  the plugin reads. The app holds the Svelte views and every vault read and
  write (`src/notes.ts`).
- `libs/workout`: gym sessions. Set parsing and formatting, note text edits,
  the exercise catalog, fuzzy search and progress stats.
- `libs/activity`: attendance across activities (gym, capoeira). Activity
  notes become active days, week streaks, and weekly time and calories.

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
- `just publish` builds the plugin into your vault.

The plugin build writes `main.js`, `manifest.json` and `styles.css` to
`apps/workout-tracker/dist`. `just publish` writes them to
`$OBSIDIAN_VAULT/.obsidian/plugins/<id>` instead, with the id from the root
`manifest.json`, and fails if `OBSIDIAN_VAULT` is unset. It skips the build
cache, so it rewrites the files even after Obsidian replaced them with a
release:

```bash
export OBSIDIAN_VAULT="$HOME/Obsidian/obsidian-vault"
just publish
```

Then reload the plugin in Obsidian.

To release, set `version` in the root `manifest.json` and merge to `main`.
`.github/workflows/release.yml` runs on every push to `main`. If a release for
that version already exists, it stops. Otherwise it lints, tests and builds the
plugin, tags the commit with the version (no `v` prefix, for example `0.1.0`)
and publishes a GitHub release with the three files. The Obsidian community
directory installs from that release.

The wiring of `just`, `moon` and `nix` follows the project-bootstrap template.
