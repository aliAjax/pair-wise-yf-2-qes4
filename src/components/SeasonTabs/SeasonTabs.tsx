import { Sprout, Sun, Leaf, Snowflake } from 'lucide-react';
import { useBenchStore } from '@/store/useBenchStore';
import type { SeasonType } from '@/types';
import { SEASON_LABELS } from '@/types';

const seasonIcons: Record<SeasonType, typeof Sprout> = {
  spring: Sprout,
  summer: Sun,
  autumn: Leaf,
  winter: Snowflake,
};

const seasonActiveStyles: Record<SeasonType, string> = {
  spring: 'bg-moss-green text-white shadow-sm',
  summer: 'bg-ochre text-white shadow-sm',
  autumn: 'bg-amber-600 text-white shadow-sm',
  winter: 'bg-sky-600 text-white shadow-sm',
};

export default function SeasonTabs() {
  const seasonFilter = useBenchStore((state) => state.seasonFilter);
  const setSeasonFilter = useBenchStore((state) => state.setSeasonFilter);

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-warm-beige/80 rounded-lg">
      <button
        type="button"
        onClick={() => setSeasonFilter(null)}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          seasonFilter === null
            ? 'bg-deep-brown text-white shadow-sm'
            : 'text-ink-light hover:text-deep-brown hover:bg-white/60'
        }`}
      >
        全部季节
      </button>
      {(Object.keys(SEASON_LABELS) as SeasonType[]).map((season) => {
        const SeasonIcon = seasonIcons[season];
        const active = seasonFilter === season;
        return (
          <button
            key={season}
            type="button"
            onClick={() => setSeasonFilter(active ? null : season)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
              active
                ? seasonActiveStyles[season]
                : 'text-ink-light hover:text-deep-brown hover:bg-white/60'
            }`}
          >
            <SeasonIcon className="w-3.5 h-3.5" />
            {SEASON_LABELS[season]}
          </button>
        );
      })}
    </div>
  );
}
