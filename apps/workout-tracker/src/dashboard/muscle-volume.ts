import { addDays, type IsoDate } from "activity/iso-date";
import {
  type ExerciseProgress,
  setsPerMuscleGroup,
  VOLUME_DAYS,
  volumeGroups,
  volumeStatus,
  WEEKLY_SET_RANGE,
} from "workout/progress";

const SCALE_HEADROOM_SETS = 5;

export type VolumeRow = { group: string; sets: number; status: ReturnType<typeof volumeStatus> };

export const muscleVolume = (
  progress: readonly ExerciseProgress[],
  today: IsoDate,
): { scale: number; rows: VolumeRow[] } => {
  const counts = setsPerMuscleGroup(progress, addDays(today, -(VOLUME_DAYS - 1)), today);
  const scale = Math.max(WEEKLY_SET_RANGE.maximum + SCALE_HEADROOM_SETS, ...counts.values());
  const rows = volumeGroups(counts).map(group => {
    const sets = counts.get(group) ?? 0;
    return { group, sets, status: volumeStatus(sets) };
  });
  return { scale, rows };
};
