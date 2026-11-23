export type SettingsData = { activityFolder: string };

const WHOLE_VAULT = "";

export class TrainingLogSettings {
  activityFolder = $state(WHOLE_VAULT);

  constructor(saved: Partial<SettingsData> | null) {
    this.activityFolder = saved?.activityFolder ?? WHOLE_VAULT;
  }

  toData(): SettingsData {
    return { activityFolder: this.activityFolder };
  }
}
