import { type MarkdownPostProcessorContext, MarkdownRenderChild, Plugin, TFile } from "obsidian";
import { type Component, mount, unmount } from "svelte";
import WorkoutDashboard from "./dashboard/WorkoutDashboard.svelte";
import ErrorMessage from "./ErrorMessage.svelte";
import ExerciseLogger from "./exercise-logger/ExerciseLogger.svelte";
import { ExerciseLoggerState } from "./exercise-logger/exercise-logger-state.svelte.ts";

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
  readonly #exerciseLoggerStatesByNotePath = new Map<string, ExerciseLoggerState>();

  override async onload(): Promise<void> {
    this.registerMarkdownCodeBlockProcessor("workout-logger", (_source, element, context) => {
      const file = this.app.vault.getAbstractFileByPath(context.sourcePath);
      if (!(file instanceof TFile)) {
        mountView(ErrorMessage, { message: `Exercise logger: cannot find ${context.sourcePath}` }, element, context);
        return;
      }
      mountView(ExerciseLogger, { app: this.app, file, ui: this.#exerciseLoggerStateFor(file.path) }, element, context);
    });
    this.registerMarkdownCodeBlockProcessor("workout-dashboard", (_source, element, context) =>
      mountView(WorkoutDashboard, { app: this.app, sourcePath: context.sourcePath }, element, context),
    );
  }

  #exerciseLoggerStateFor(notePath: string): ExerciseLoggerState {
    const state = this.#exerciseLoggerStatesByNotePath.get(notePath) ?? new ExerciseLoggerState();
    this.#exerciseLoggerStatesByNotePath.set(notePath, state);
    return state;
  }
}
