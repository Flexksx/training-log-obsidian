import { type ExerciseSet, formatSet, parseSet } from "./exercise-set.ts";

export type LoggedSet = ExerciseSet & { line: number };
export type Exercise = { name: string; sets: LoggedSet[]; lastLine: number };
export type Session = { exercises: Exercise[] };
export type Workout = { date: string; notePath: string; session: Session };

export class ExerciseNotFoundError extends Error {
  constructor(exerciseName: string) {
    super(`No "## ${exerciseName}" heading in this note`);
  }
}

export class SetNotFoundError extends Error {
  constructor(exerciseName: string, setIndex: number) {
    super(`${exerciseName} has no set ${setIndex + 1}`);
  }
}

const EXERCISE_HEADING = /^## (.+)$/;

export const parseSession = (text: string): Session => {
  const exercises: Exercise[] = [];
  text.split("\n").forEach((line, index) => {
    const heading = line.match(EXERCISE_HEADING);
    if (heading?.[1]) {
      exercises.push({ name: heading[1].trim(), sets: [], lastLine: index });
      return;
    }
    const current = exercises.at(-1);
    if (!current) return;
    const set = parseSet(line);
    if (set) current.sets.push({ ...set, line: index });
    if (line.trim()) current.lastLine = index;
  });
  return { exercises };
};

export const findExercise = (session: Session, exerciseName: string): Exercise | undefined =>
  session.exercises.find(exercise => exercise.name === exerciseName);

const requireExercise = (text: string, exerciseName: string): Exercise => {
  const exercise = findExercise(parseSession(text), exerciseName);
  if (!exercise) throw new ExerciseNotFoundError(exerciseName);
  return exercise;
};

const insertLine = (text: string, index: number, line: string): string => {
  const lines = text.split("\n");
  lines.splice(index, 0, line);
  return lines.join("\n");
};

const removeLine = (text: string, index: number): string =>
  text
    .split("\n")
    .filter((_, lineIndex) => lineIndex !== index)
    .join("\n");

export const appendSet = (text: string, exerciseName: string, set: ExerciseSet): string =>
  insertLine(text, requireExercise(text, exerciseName).lastLine + 1, `- ${formatSet(set)}`);

export const deleteSet = (text: string, exerciseName: string, setIndex: number): string => {
  const set = requireExercise(text, exerciseName).sets[setIndex];
  if (!set) throw new SetNotFoundError(exerciseName, setIndex);
  return removeLine(text, set.line);
};

export const appendExercise = (text: string, exerciseName: string): string =>
  findExercise(parseSession(text), exerciseName) ? text : `${text.trimEnd()}\n\n## ${exerciseName}\n`;

export const recentExerciseNames = (workoutsNewestFirst: readonly Workout[]): string[] => [
  ...new Set(workoutsNewestFirst.flatMap(workout => workout.session.exercises.map(exercise => exercise.name))),
];
