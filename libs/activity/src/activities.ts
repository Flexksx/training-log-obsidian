export const GYM = { key: "gym", label: "Gym", noteType: "workout", taskPattern: /^go to (the )?gym\b/i } as const;
export const CAPOEIRA = { key: "capoeira", label: "Capoeira", noteType: "capoeira", taskPattern: /^go to capoeira\b/i } as const;
export const ACTIVITIES = [GYM, CAPOEIRA] as const;

export type Activity = (typeof ACTIVITIES)[number];
export type ActivityKey = Activity["key"];

export const activityOfNoteType = (noteType: unknown): Activity | undefined =>
  ACTIVITIES.find(activity => activity.noteType === noteType);

export const activityOfTask = (text: string): Activity | undefined =>
  ACTIVITIES.find(activity => activity.taskPattern.test(text.trim()));

export const activityLabel = (key: ActivityKey): string => ACTIVITIES.find(activity => activity.key === key)?.label ?? key;
