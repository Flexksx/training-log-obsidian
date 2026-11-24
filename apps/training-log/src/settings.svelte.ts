export type SettingsData = { activityFolder: string };

const WHOLE_VAULT = "";

export class TrainingLogSettings {
  activityFolder = $state(WHOLE_VAULT);

  constructor(saved: unknown) {
    if (!saved || typeof saved !== "object") return;
    if ("activityFolder" in saved && typeof saved.activityFolder === "string")
      this.activityFolder = saved.activityFolder;
  }

  toData(): SettingsData {
    return { activityFolder: this.activityFolder };
  }
}
