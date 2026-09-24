import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Armchair, Info, Sprout, Flower2, Leaf } from 'lucide-react';
import { useBenchStore } from '@/store/useBenchStore';
import { calculateComfortScore, getComfortColor } from '@/utils/comfort';
import { findLatestPhenology, getPhenologyStatusStyle } from '@/utils/phenology';
import { SEASON_LABELS, PHENOLOGY_STATUS_LABELS } from '@/types';
import type { Bench, PhenologyStatusType } from '@/types';
import SeasonTabs from '@/components/SeasonTabs/SeasonTabs';

const statusIcons: Record<PhenologyStatusType, typeof Sprout> = {
  budding: Sprout,
  blooming: Flower2,
  leafFall: Leaf,
};

export default function MapPage() {
  const { benches, initialize, initialized, seasonFilter } = useBenchStore();
  const navigate = useNavigate();
  const [hoveredBench, setHoveredBench] = useState<Bench | null>(null);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const getPositionStyle = (bench: Bench) => {
    const latRange = { min: 31.22, max: 31.25 };
    const lngRange = { min: 121.46, max: 121.495 };

    const normalizedLat = (bench.lat - latRange.min) / (latRange.max - latRange.min);
    const normalizedLng = (bench.lng - lngRange.min) / (lngRange.max - lngRange.min);

    return {
      left: `${10 + normalizedLng * 80}%`,
      top: `${85 - normalizedLat * 70}%`,
    };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-deep-brown mb-1">
            地图分布
          </h2>
          <p className="text-ink-light text-sm">
            {seasonFilter
              ? `${SEASON_LABELS[seasonFilter]}季物候：标记颜色表示当季最新状态`
              : '查看长椅在城市中的分布位置'}
          </p>
        </div>
        <SeasonTabs />
      </div>

      <div className="paper-texture rounded-xl shadow-paper overflow-hidden">
        <div className="relative w-full h-[600px] bg-gradient-to-br from-moss-green/5 via-warm-beige to-ochre/5">
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6B8E5A" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-32 h-20 rounded-full bg-moss-green/10 blur-xl" />
            <div className="absolute bottom-1/3 right-1/4 w-40 h-24 rounded-full bg-ochre/10 blur-xl" />
            <div className="absolute top-1/2 left-1/2 w-24 h-16 rounded-full bg-moss-green/5 blur-lg" />
          </div>

          {benches.map((bench) => {
            const position = getPositionStyle(bench);
            const comfortScore = calculateComfortScore(bench);
            const seasonRecord = seasonFilter
              ? findLatestPhenology(bench.phenologies, seasonFilter)
              : undefined;

            let pinColor: string;
            let CenterIcon: typeof Armchair = Armchair;
            if (seasonFilter) {
              pinColor = seasonRecord
                ? getPhenologyStatusStyle(seasonRecord.status).pin
                : 'text-ink-light/30';
              if (seasonRecord) {
                CenterIcon = statusIcons[seasonRecord.status];
              }
            } else {
              pinColor = getComfortColor(comfortScore);
            }

            return (
              <button
                key={bench.id}
                onClick={() => navigate(`/bench/${bench.id}`)}
                onMouseEnter={() => setHoveredBench(bench)}
                onMouseLeave={() => setHoveredBench(null)}
                className="absolute -translate-x-1/2 -translate-y-full group"
                style={position}
              >
                <div className={`relative ${
                  hoveredBench?.id === bench.id ? 'scale-125 z-10' : 'z-0'
                } transition-transform duration-200`}>
                  <MapPin
                    className={`w-8 h-8 ${pinColor} drop-shadow-md group-hover:drop-shadow-lg transition-all`}
                    fill="currentColor"
                  />
                  <div className="absolute top-1 left-1/2 -translate-x-1/2">
                    <CenterIcon className="w-3 h-3 text-white" />
                  </div>
                </div>

                {hoveredBench?.id === bench.id && (
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 translate-y-full w-52 paper-texture rounded-lg shadow-paper-hover p-3 z-20 pointer-events-none">
                    <h4 className="font-serif font-medium text-deep-brown text-sm mb-1 line-clamp-1">
                      {bench.name}
                    </h4>
                    <p className="text-xs text-ink-light line-clamp-1 mb-2">
                      {bench.location}
                    </p>
                    {seasonFilter ? (
                      seasonRecord ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-ink-light">
                              {SEASON_LABELS[seasonFilter]}季物候
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                getPhenologyStatusStyle(seasonRecord.status).text
                              }`}
                            >
                              {PHENOLOGY_STATUS_LABELS[seasonRecord.status]}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-ink-light">{seasonRecord.plantName}</span>
                            <span className="text-xs text-ink-light">{seasonRecord.observedAt}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-ink-light/70">
                          该季节暂无物候记录
                        </p>
                      )
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ink-light">舒适度</span>
                        <span className={`text-sm font-medium ${getComfortColor(comfortScore)}`}>
                          {comfortScore}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          <div className="absolute bottom-4 left-4 paper-texture rounded-lg shadow-paper p-3">
            <div className="flex items-center gap-2 text-xs text-ink-light">
              <Info className="w-3.5 h-3.5" />
              <span>点击标记查看详情</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 paper-texture rounded-lg shadow-paper p-3">
            <h4 className="text-xs font-medium text-deep-brown mb-2">图例</h4>
            {seasonFilter ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-moss-green" fill="currentColor" />
                  <span className="text-xs text-ink-light">萌芽</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-500" fill="currentColor" />
                  <span className="text-xs text-ink-light">盛花</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ochre" fill="currentColor" />
                  <span className="text-xs text-ink-light">落叶</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ink-light/30" fill="currentColor" />
                  <span className="text-xs text-ink-light">当季无记录</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-moss-green" fill="currentColor" />
                  <span className="text-xs text-ink-light">极佳/优秀</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ochre" fill="currentColor" />
                  <span className="text-xs text-ink-light">良好</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ink-light" fill="currentColor" />
                  <span className="text-xs text-ink-light">一般/较差</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-ink-light">
          共 <span className="font-medium text-deep-brown">{benches.length}</span> 张长椅
        </p>
      </div>
    </div>
  );
}
