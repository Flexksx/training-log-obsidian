import { copyFile, mkdir, rename } from "node:fs/promises";
import { builtinModules } from "node:module";
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";

const outputDirectory = process.env.OBSIDIAN_PLUGIN_DIR ?? "dist";

const renameStylesheet = {
  name: "rename-stylesheet",
  setup(build) {
    build.onEnd(() => rename(`${outputDirectory}/main.css`, `${outputDirectory}/styles.css`));
  },
};

const options = {
  entryPoints: ["src/main.ts"],
  outfile: `${outputDirectory}/main.js`,
  bundle: true,
  format: "cjs",
  target: "es2022",
  conditions: ["svelte", "browser"],
  external: ["obsidian", "electron", "@codemirror/*", "@lezer/*", ...builtinModules],
  plugins: [sveltePlugin({ compilerOptions: { css: "external" } }), renameStylesheet],
  logLevel: "info",
};

await mkdir(outputDirectory, { recursive: true });
await copyFile("../../manifest.json", `${outputDirectory}/manifest.json`);

if (process.argv.includes("--watch")) await (await esbuild.context(options)).watch();
else await esbuild.build(options);
