import { MarkdownRenderChild, Plugin, TFile, type MarkdownPostProcessorContext } from "obsidian";
import { mount, unmount, type Component } from "svelte";
import WorkoutDashboard from "./dashboard/WorkoutDashboard.svelte";
import { loggerStateFor } from "./logger/logger-state.svelte.ts";
import WorkoutLogger from "./logger/WorkoutLogger.svelte";

const mountView = <Props extends Record<string, unknown>>(
  view: Component<Props>,
  props: Props,
  element: HTMLElement,
  context: MarkdownPostProcessorContext,
): void => {
  const child = new MarkdownRenderChild(element);
  const mounted = mount(view, { target: element, props });
  child.register(() => void unmount(mounted));
  context.addChild(child);
};

export default class WorkoutTrackerPlugin extends Plugin {
  override async onload(): Promise<void> {
    this.registerMarkdownCodeBlockProcessor("workout-logger", (_source, element, context) => {
      const file = this.app.vault.getAbstractFileByPath(context.sourcePath);
      if (!(file instanceof TFile)) {
        element.createDiv({ cls: "wl-error", text: `Workout logger: cannot find ${context.sourcePath}` });
        return;
      }
      mountView(WorkoutLogger, { app: this.app, file, ui: loggerStateFor(file.path) }, element, context);
    });
    this.registerMarkdownCodeBlockProcessor("workout-dashboard", (_source, element, context) =>
      mountView(WorkoutDashboard, { app: this.app, sourcePath: context.sourcePath }, element, context),
    );
  }
}
