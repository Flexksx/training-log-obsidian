import { activityOfNoteType, GYM } from "activity/activities";
import { type IsoDate, isIsoDate } from "activity/iso-date";
import { parseDuration, parseKilocalories, type Visit } from "activity/visit";
import { type App, type FrontMatterCache, normalizePath, TFile, TFolder, Vault } from "obsidian";
import { parseSession, type Workout } from "workout/session";

const ISO_DATE_LENGTH = 10;
const MARKDOWN_EXTENSION = "md";
const WORKOUT_NOTE_TITLE = "Workout";
const FRONTMATTER_FENCE = "---";
const CODE_FENCE = "```";

export const WORKOUT_LOGGER_BLOCK = "workout-logger";

export class ActivityFolderNotFoundError extends Error {
  constructor(folderPath: string) {
    super(`The activity folder "${folderPath}" does not exist. Change it in the Training Log settings.`);
  }
}

export class NoteDateError extends Error {
  constructor(notePath: string) {
    super(`${notePath} has no "date" property and its name does not start with YYYY-MM-DD`);
  }
}

const frontmatterOf = (app: App, file: TFile): FrontMatterCache =>
  app.metadataCache.getFileCache(file)?.frontmatter ?? {};

const notesIn = (app: App, folderPath: string): TFile[] => {
  const folder = app.vault.getAbstractFileByPath(normalizePath(folderPath));
  if (!(folder instanceof TFolder)) throw new ActivityFolderNotFoundError(folderPath);
  const notes: TFile[] = [];
  Vault.recurseChildren(folder, file => {
    if (file instanceof TFile && file.extension === MARKDOWN_EXTENSION) notes.push(file);
  });
  return notes;
};

export const noteDate = (app: App, file: TFile): IsoDate => {
  const candidates = [frontmatterOf(app, file).date, file.basename].map(value =>
    String(value ?? "").slice(0, ISO_DATE_LENGTH),
  );
  const date = candidates.find(isIsoDate);
  if (!date) throw new NoteDateError(file.path);
  return date;
};

export const loadVisits = (app: App, activityFolder: string): Visit[] =>
  notesIn(app, activityFolder).flatMap(file => {
    const frontmatter = frontmatterOf(app, file);
    const activity = activityOfNoteType(frontmatter.type);
    if (!activity) return [];
    return [
      {
        date: noteDate(app, file),
        activity: activity.key,
        notePath: file.path,
        seconds: parseDuration(frontmatter.duration),
        kilocalories: parseKilocalories(frontmatter.kcal),
      },
    ];
  });

export const loadWorkoutsNewestFirst = async (app: App, activityFolder: string): Promise<Workout[]> => {
  const workoutFiles = notesIn(app, activityFolder).filter(file => frontmatterOf(app, file).type === GYM.noteType);
  const workouts = await Promise.all(
    workoutFiles.map(async file => ({
      date: noteDate(app, file),
      notePath: file.path,
      session: parseSession(await app.vault.cachedRead(file)),
    })),
  );
  return workouts.toSorted((a, b) => b.date.localeCompare(a.date));
};

const workoutNoteText = (date: IsoDate): string =>
  [
    FRONTMATTER_FENCE,
    `type: ${GYM.noteType}`,
    `date: ${date}`,
    "duration:",
    "kcal:",
    FRONTMATTER_FENCE,
    `${CODE_FENCE}${WORKOUT_LOGGER_BLOCK}`,
    CODE_FENCE,
    "",
  ].join("\n");

export const createWorkoutNote = (app: App, activityFolder: string, date: IsoDate): Promise<TFile> =>
  app.vault.create(
    normalizePath(`${activityFolder}/${date} ${WORKOUT_NOTE_TITLE}.${MARKDOWN_EXTENSION}`),
    workoutNoteText(date),
  );
