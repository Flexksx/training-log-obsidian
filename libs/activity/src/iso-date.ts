export type IsoDate = string;

const DAY_MILLISECONDS = 86_400_000;
export const DAYS_PER_WEEK = 7;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value: number): string => String(value).padStart(2, "0");

export const isIsoDate = (value: string): value is IsoDate => ISO_DATE.test(value);

export const toIsoDate = (date: Date): IsoDate =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromIsoDate = (date: IsoDate): Date => {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date: IsoDate, days: number): IsoDate => {
  const result = fromIsoDate(date);
  result.setDate(result.getDate() + days);
  return toIsoDate(result);
};

export const daysBetween = (from: IsoDate, to: IsoDate): number =>
  Math.round((fromIsoDate(to).getTime() - fromIsoDate(from).getTime()) / DAY_MILLISECONDS);

const daysSinceMonday = (date: IsoDate): number => (fromIsoDate(date).getDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;

export const weekStart = (date: IsoDate): IsoDate => addDays(date, -daysSinceMonday(date));

export const addWeeks = (date: IsoDate, weeks: number): IsoDate => addDays(date, weeks * DAYS_PER_WEEK);

export const weekEnd = (date: IsoDate): IsoDate => addDays(weekStart(date), DAYS_PER_WEEK - 1);
