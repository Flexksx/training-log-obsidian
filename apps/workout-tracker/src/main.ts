import { type MarkdownPostProcessorContext, MarkdownRenderChild, Plugin, TFile } from "obsidian";
import { type Component, mount, unmount } from "svelte";
import WorkoutDashboard from "./dashboard/WorkoutDashboard.svelte";
import { LoggerState } from "./logger/logger-state.svelte.ts";
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
  readonly #loggerStatesByNotePath = new Map<string, LoggerState>();

  override async onload(): Promise<void> {
    this.registerMarkdownCodeBlockProcessor("workout-logger", (_source, element, context) => {
      const file = this.app.vault.getAbstractFileByPath(context.sourcePath);
      if (!(file instanceof TFile)) {
        element.createDiv({ cls: "wl-error", text: `Workout logger: cannot find ${context.sourcePath}` });
        return;
      }
      mountView(WorkoutLogger, { app: this.app, file, ui: this.#loggerStateFor(file.path) }, element, context);
    });
    this.registerMarkdownCodeBlockProcessor("workout-dashboard", (_source, element, context) =>
      mountView(WorkoutDashboard, { app: this.app, sourcePath: context.sourcePath }, element, context),
    );
  }

  #loggerStateFor(notePath: string): LoggerState {
    const state = this.#loggerStatesByNotePath.get(notePath) ?? new LoggerState();
    this.#loggerStatesByNotePath.set(notePath, state);
    return state;
  }
}
