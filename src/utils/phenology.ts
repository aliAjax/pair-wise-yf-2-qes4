import type { Bench, PhenologyRecord, PhenologyStatusType, SeasonType } from '@/types';

/** 同一长椅同一季节，只保留观察日期最新的一条 */
export function findLatestPhenology(
  records: PhenologyRecord[] | undefined,
  season: SeasonType,
): PhenologyRecord | undefined {
  if (!records || records.length === 0) return undefined;
  return records
    .filter((record) => record.season === season)
    .sort((a, b) => (a.observedAt < b.observedAt ? 1 : -1))[0];
}

/**
 * 补录规则：同一长椅同一季节只留观察日期最新的一次。
 * 新记录日期不晚于现有记录则退回，保留原记录。
 * 返回 true 表示接受，false 表示被退回。
 */
export function isPhenologyAccepted(bench: Bench, season: SeasonType, observedAt: string): boolean {
  const current = findLatestPhenology(bench.phenologies, season);
  if (!current) return true;
  return observedAt > current.observedAt;
}

export function hasPhenologyInSeason(bench: Bench, season: SeasonType | null): boolean {
  if (!season) return true;
  return findLatestPhenology(bench.phenologies, season) !== undefined;
}

export function todayString(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

interface PhenologyStyle {
  text: string;
  badge: string;
  pin: string;
}

export const PHENOLOGY_STATUS_STYLES: Record<PhenologyStatusType, PhenologyStyle> = {
  budding: {
    text: 'text-moss-green',
    badge: 'bg-moss-green/10 text-moss-green',
    pin: 'text-moss-green',
  },
  blooming: {
    text: 'text-pink-600',
    badge: 'bg-pink-100 text-pink-600',
    pin: 'text-pink-500',
  },
  leafFall: {
    text: 'text-ochre',
    badge: 'bg-ochre/10 text-ochre',
    pin: 'text-ochre',
  },
};

export function getPhenologyStatusStyle(status: PhenologyStatusType): PhenologyStyle {
  return PHENOLOGY_STATUS_STYLES[status];
}
