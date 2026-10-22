/**
 * Reads the vault into plain data for the domain libs.
 * Notes stay the source of truth: nothing here caches or writes.
 */
import type { App, FrontMatterCache, TFile } from "obsidian";
import { activityOfNoteType, GYM } from "activity/activities";
import type { PlannedTask } from "activity/consistency";
import { isIsoDate, type IsoDate } from "activity/iso-date";
import { parseDuration, parseKilocalories, type Visit } from "activity/visit";
import { parseSession, type Workout } from "workout/session";

const ACTIVITY_FOLDER = "29 Life/Physical Activity";
const DAILY_NOTES_FOLDER = "05 Sources/DailyNotes";
const ISO_DATE_LENGTH = 10;
const TASK_PREFIX = /^\s*(?:[-*+]|\d+[.)])\s+\[.\]\s*/;

export class NoteDateError extends Error {
  constructor(notePath: string) {
    super(`${notePath} has no "date" property and its name does not start with YYYY-MM-DD`);
  }
}

const frontmatterOf = (app: App, file: TFile): FrontMatterCache =>
  app.metadataCache.getFileCache(file)?.frontmatter ?? {};

const filesIn = (app: App, folder: string): TFile[] =>
  app.vault.getMarkdownFiles().filter(file => file.path.startsWith(`${folder}/`));

export const noteDate = (app: App, file: TFile): IsoDate => {
  const candidates = [frontmatterOf(app, file).date, file.basename].map(value => String(value ?? "").slice(0, ISO_DATE_LENGTH));
  const date = candidates.find(isIsoDate);
  if (!date) throw new NoteDateError(file.path);
  return date;
};

export const loadVisits = (app: App): Visit[] =>
  filesIn(app, ACTIVITY_FOLDER).flatMap(file => {
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

export const loadWorkoutsNewestFirst = async (app: App): Promise<Workout[]> => {
  const workoutFiles = filesIn(app, ACTIVITY_FOLDER).filter(file => frontmatterOf(app, file).type === GYM.noteType);
  const workouts = await Promise.all(
    workoutFiles.map(async file => ({
      date: noteDate(app, file),
      notePath: file.path,
      session: parseSession(await app.vault.cachedRead(file)),
    })),
  );
  return workouts.toSorted((a, b) => b.date.localeCompare(a.date));
};

export const loadDailyTasks = async (app: App): Promise<PlannedTask[]> => {
  const dailyNotes = filesIn(app, DAILY_NOTES_FOLDER).filter(file => isIsoDate(file.basename.slice(0, ISO_DATE_LENGTH)));
  const perNote = await Promise.all(
    dailyNotes.map(async file => {
      const taskItems = app.metadataCache.getFileCache(file)?.listItems?.filter(item => item.task !== undefined) ?? [];
      if (!taskItems.length) return [];
      const lines = (await app.vault.cachedRead(file)).split("\n");
      return taskItems.map(item => ({
        date: file.basename.slice(0, ISO_DATE_LENGTH),
        status: item.task ?? "",
        text: (lines[item.position.start.line] ?? "").replace(TASK_PREFIX, ""),
      }));
    }),
  );
  return perNote.flat();
};
