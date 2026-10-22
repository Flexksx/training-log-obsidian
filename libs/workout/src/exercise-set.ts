export type ExerciseSet =
  | { kind: "weight"; reps: number; kilograms: number }
  | { kind: "body"; reps: number }
  | { kind: "time"; seconds: number };

export type SetKind = ExerciseSet["kind"];

const SECONDS_PER_MINUTE = 60;
const WEIGHT_SET = /^- *(\d+) *reps? *[xX×]? *(\d+(?:\.\d+)?) *kg/i;
const BODY_SET = /^- *(\d+) *reps? *$/i;
const TIME_SET = /^- *(?:(\d+) *min)? *(?:(\d+) *s(?:ec)?)? *$/i;

export const parseSet = (line: string): ExerciseSet | undefined => {
  const weight = line.match(WEIGHT_SET);
  if (weight) {
    const reps = Number(weight[1]);
    const kilograms = Number(weight[2]);
    return kilograms ? { kind: "weight", reps, kilograms } : { kind: "body", reps };
  }
  const body = line.match(BODY_SET);
  if (body) return { kind: "body", reps: Number(body[1]) };
  const time = line.match(TIME_SET);
  const seconds = time ? Number(time[1] ?? 0) * SECONDS_PER_MINUTE + Number(time[2] ?? 0) : 0;
  return seconds ? { kind: "time", seconds } : undefined;
};

export const splitMinutes = (seconds: number) => ({
  minutes: Math.floor(seconds / SECONDS_PER_MINUTE),
  seconds: seconds % SECONDS_PER_MINUTE,
});

export const joinMinutes = (minutes: number, seconds: number): number => minutes * SECONDS_PER_MINUTE + seconds;

export const formatClock = (totalSeconds: number): string => {
  const { minutes, seconds } = splitMinutes(totalSeconds);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const formatDuration = (totalSeconds: number): string => {
  const { minutes, seconds } = splitMinutes(totalSeconds);
  return [minutes && `${minutes} min`, seconds && `${seconds} s`].filter(Boolean).join(" ");
};

export const formatSet = (set: ExerciseSet): string => {
  switch (set.kind) {
    case "weight":
      return `${set.reps} reps × ${set.kilograms} kg`;
    case "body":
      return `${set.reps} reps`;
    case "time":
      return formatDuration(set.seconds);
  }
};

export const formatShortSet = (set: ExerciseSet): string => {
  switch (set.kind) {
    case "weight":
      return `${set.reps}×${set.kilograms}`;
    case "body":
      return `${set.reps}×BW`;
    case "time":
      return formatClock(set.seconds);
  }
};
