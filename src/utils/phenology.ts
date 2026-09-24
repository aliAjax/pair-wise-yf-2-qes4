import { Sprout, Flower2, Leaf, Sun, Snowflake } from 'lucide-react';
import type { Bench, PhenologyRecord, PhenologyStageType, SeasonType } from '@/types';

export function getCurrentSeason(date: Date = new Date()): SeasonType {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function getSeasonRecord(bench: Bench, season: SeasonType): PhenologyRecord | undefined {
  return (bench.phenology ?? []).find((record) => record.season === season);
}

export const SEASON_ICONS: Record<SeasonType, typeof Sprout> = {
  spring: Sprout,
  summer: Sun,
  autumn: Leaf,
  winter: Snowflake,
};

export const PHENOLOGY_STAGE_ICONS: Record<PhenologyStageType, typeof Sprout> = {
  budding: Sprout,
  blooming: Flower2,
  'leaf-fall': Leaf,
};

export const PHENOLOGY_STAGE_COLORS: Record<PhenologyStageType, string> = {
  budding: 'text-moss-green',
  blooming: 'text-rose-400',
  'leaf-fall': 'text-ochre',
};

export const PHENOLOGY_STAGE_BG: Record<PhenologyStageType, string> = {
  budding: 'bg-moss-green/10',
  blooming: 'bg-rose-400/10',
  'leaf-fall': 'bg-ochre/10',
};
