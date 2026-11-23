import type { ExerciseSet } from "../domain/exercise-set.ts";
import type { Exercise, Session } from "../domain/session.ts";
import { formatSet, parseSet } from "./set-format.ts";

type NoteExercise = { exercise: Exercise; setLines: number[]; lastLine: number };

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

const noteExercises = (text: string): NoteExercise[] => {
  const exercises: NoteExercise[] = [];
  text.split("\n").forEach((line, index) => {
    const heading = line.match(EXERCISE_HEADING);
    if (heading?.[1]) {
      exercises.push({ exercise: { name: heading[1].trim(), sets: [] }, setLines: [], lastLine: index });
      return;
    }
    const current = exercises.at(-1);
    if (!current) return;
    const set = parseSet(line);
    if (set) {
      current.exercise.sets.push(set);
      current.setLines.push(index);
    }
    if (line.trim()) current.lastLine = index;
  });
  return exercises;
};

export const parseSession = (text: string): Session => ({
  exercises: noteExercises(text).map(({ exercise }) => exercise),
});

const requireExercise = (text: string, exerciseName: string): NoteExercise => {
  const exercise = noteExercises(text).find(candidate => candidate.exercise.name === exerciseName);
  if (!exercise) throw new ExerciseNotFoundError(exerciseName);
  return exercise;
};

export const appendSet = (text: string, exerciseName: string, set: ExerciseSet): string => {
  const lines = text.split("\n");
  lines.splice(requireExercise(text, exerciseName).lastLine + 1, 0, `- ${formatSet(set)}`);
  return lines.join("\n");
};

export const deleteSet = (text: string, exerciseName: string, setIndex: number): string => {
  const line = requireExercise(text, exerciseName).setLines[setIndex];
  if (line === undefined) throw new SetNotFoundError(exerciseName, setIndex);
  return text
    .split("\n")
    .filter((_, index) => index !== line)
    .join("\n");
};

export const appendExercise = (text: string, exerciseName: string): string =>
  noteExercises(text).some(candidate => candidate.exercise.name === exerciseName)
    ? text
    : `${text.trimEnd()}\n\n## ${exerciseName}\n`;
