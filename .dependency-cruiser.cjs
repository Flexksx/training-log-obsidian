const base = require('./config/dependency-cruiser.base.cjs');

const APP_SOURCE = '^apps/workout-tracker/src/';
const VAULT_ADAPTERS = '^apps/workout-tracker/src/(main|notes|dashboard/load-dashboard)\\.ts$';
const OBSIDIAN = '(^|node_modules/)obsidian(/|$)';
const SVELTE = 'node_modules/svelte/';
const CONFIG_FILES = '\\.config\\.(js|mjs|cjs)$';
const COMPONENTS = '\\.svelte$';
const COMPONENT_OR_STATE = '\\.svelte(\\.ts)?$';

const baseRules = base.forbidden.map(rule => {
  if (rule.name === 'no-dev-deps-in-production') {
    return {
      ...rule,
      from: { ...rule.from, pathNot: [...rule.from.pathNot, CONFIG_FILES] },
      to: { ...rule.to, pathNot: OBSIDIAN, dependencyTypesNot: ['npm-peer'] },
    };
  }
  if (rule.name === 'no-duplicate-dep-types') {
    return { ...rule, to: { ...rule.to, pathNot: SVELTE } };
  }
  if (rule.name === 'no-orphans') {
    return { ...rule, from: { ...rule.from, pathNot: [...rule.from.pathNot, '^apps/workout-tracker/src/main\\.ts$', CONFIG_FILES] } };
  }
  return rule;
});

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  ...base,
  forbidden: [
    ...baseRules,
    {
      name: 'imports-resolve',
      comment: 'A package an import needs must be in that unit package.json.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true, pathNot: OBSIDIAN },
    },
    {
      name: 'libs-do-not-import-each-other',
      comment: 'The app composes libs. A lib never depends on a sibling lib.',
      severity: 'error',
      from: { path: '^libs/([^/]+)/' },
      to: { path: '^libs/', pathNot: '^libs/$1/' },
    },
    {
      name: 'libs-do-not-import-apps',
      severity: 'error',
      from: { path: '^libs/' },
      to: { path: '^apps/' },
    },
    {
      name: 'libs-do-not-import-obsidian',
      comment: 'Only the app talks to Obsidian.',
      severity: 'error',
      from: { path: '^libs/' },
      to: { path: OBSIDIAN },
    },
    {
      name: 'domain-libs-do-not-import-svelte',
      comment: 'workout and activity are plain TypeScript. Only design-system uses Svelte.',
      severity: 'error',
      from: { path: '^libs/(workout|activity)/' },
      to: { path: SVELTE },
    },
    {
      name: 'only-vault-adapters-import-obsidian',
      comment: 'Components and view logic receive data. main.ts, notes.ts and load-dashboard.ts read and write the vault.',
      severity: 'error',
      from: { path: APP_SOURCE, pathNot: [VAULT_ADAPTERS, COMPONENTS] },
      to: { path: OBSIDIAN },
    },
    {
      name: 'view-logic-does-not-import-components',
      comment: 'Plain .ts modules hold view logic. They never depend on a component.',
      severity: 'error',
      from: { path: APP_SOURCE, pathNot: [COMPONENT_OR_STATE, '^apps/workout-tracker/src/main\\.ts$'] },
      to: { path: COMPONENTS },
    },
  ],
  options: {
    ...base.options,
    exclude: { path: '(^|/)dist/' },
  },
};
