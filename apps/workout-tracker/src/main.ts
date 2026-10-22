import {
  ItemView,
  type MarkdownPostProcessorContext,
  MarkdownRenderChild,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  type WorkspaceLeaf,
} from "obsidian";
import { type Component, mount, unmount } from "svelte";
import WorkoutDashboard from "./dashboard/WorkoutDashboard.svelte";
import ErrorMessage from "./ErrorMessage.svelte";
import ExerciseLogger from "./exercise-logger/ExerciseLogger.svelte";
import { ExerciseLoggerState } from "./exercise-logger/exercise-logger-state.svelte.ts";
import { type SettingsData, TrainingLogSettings } from "./settings.svelte.ts";

const DASHBOARD_VIEW_TYPE = "training-log-dashboard";
const DASHBOARD_TITLE = "Training dashboard";
const DASHBOARD_ICON = "dumbbell";
const OPEN_DASHBOARD_LABEL = "Open training dashboard";

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

class DashboardView extends ItemView {
  readonly #settings: TrainingLogSettings;

  constructor(leaf: WorkspaceLeaf, settings: TrainingLogSettings) {
    super(leaf);
    this.#settings = settings;
  }

  override getViewType(): string {
    return DASHBOARD_VIEW_TYPE;
  }

  override getDisplayText(): string {
    return DASHBOARD_TITLE;
  }

  override getIcon(): string {
    return DASHBOARD_ICON;
  }

  override onOpen(): Promise<void> {
    const mounted = mount(WorkoutDashboard, {
      target: this.contentEl,
      props: { app: this.app, settings: this.#settings },
    });
    this.register(() => void unmount(mounted));
    return Promise.resolve();
  }
}

class TrainingLogSettingTab extends PluginSettingTab {
  readonly #settings: TrainingLogSettings;
  readonly #save: (data: SettingsData) => Promise<void>;

  constructor(plugin: Plugin, settings: TrainingLogSettings) {
    super(plugin.app, plugin);
    this.#settings = settings;
    this.#save = data => plugin.saveData(data);
  }

  override display(): void {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName("Activity folder")
      .setDesc("The folder with your activity notes, subfolders included. Leave it empty to read the whole vault.")
      .addText(text =>
        text
          .setPlaceholder("Whole vault")
          .setValue(this.#settings.activityFolder)
          .onChange(value => {
            this.#settings.activityFolder = value;
            void this.#save(this.#settings.toData());
          }),
      );
  }
}

export default class WorkoutTrackerPlugin extends Plugin {
  readonly #exerciseLoggerStatesByNotePath = new Map<string, ExerciseLoggerState>();

  override async onload(): Promise<void> {
    const settings = new TrainingLogSettings(await this.loadData());
    this.addSettingTab(new TrainingLogSettingTab(this, settings));
    this.registerView(DASHBOARD_VIEW_TYPE, leaf => new DashboardView(leaf, settings));
    this.addRibbonIcon(DASHBOARD_ICON, OPEN_DASHBOARD_LABEL, () => void this.#openDashboard());
    this.registerMarkdownCodeBlockProcessor("workout-logger", (_source, element, context) => {
      const file = this.app.vault.getAbstractFileByPath(context.sourcePath);
      if (!(file instanceof TFile)) {
        mountView(ErrorMessage, { message: `Exercise logger: cannot find ${context.sourcePath}` }, element, context);
        return;
      }
      mountView(
        ExerciseLogger,
        { app: this.app, file, ui: this.#exerciseLoggerStateFor(file.path), settings },
        element,
        context,
      );
    });
  }

  async #openDashboard(): Promise<void> {
    const { workspace } = this.app;
    const [openDashboard] = workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
    if (openDashboard) return workspace.revealLeaf(openDashboard);
    return workspace.getLeaf("tab").setViewState({ type: DASHBOARD_VIEW_TYPE, active: true });
  }

  #exerciseLoggerStateFor(notePath: string): ExerciseLoggerState {
    const state = this.#exerciseLoggerStatesByNotePath.get(notePath) ?? new ExerciseLoggerState();
    this.#exerciseLoggerStatesByNotePath.set(notePath, state);
    return state;
  }
}
