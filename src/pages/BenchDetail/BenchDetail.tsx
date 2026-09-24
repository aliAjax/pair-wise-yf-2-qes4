import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Sun,
  Volume2,
  Clock,
  Armchair,
  Compass,
  Edit3,
  Trash2,
  Sunrise,
  Sunset,
  Moon,
  CloudSun,
  Sprout,
  Flower2,
  Leaf,
  Snowflake,
  Plus,
  CalendarDays,
  AlertCircle,
} from 'lucide-react';
import { useBenchStore } from '@/store/useBenchStore';
import {
  MATERIAL_LABELS,
  ORIENTATION_LABELS,
  SHADE_LABELS,
  NOISE_LABELS,
  STAY_DURATION_LABELS,
  TIME_PERIOD_LABELS,
  SEASON_LABELS,
  SEASON_ORDER,
  PHENOLOGY_STATUS_LABELS,
} from '@/types';
import type { TimePeriodType, SeasonType, PhenologyStatusType } from '@/types';
import Rating from '@/components/Rating/Rating';
import { calculateComfortScore, getComfortLevel, getComfortColor } from '@/utils/comfort';
import { findLatestPhenology, getPhenologyStatusStyle, todayString } from '@/utils/phenology';

const seasonIcons: Record<SeasonType, typeof Sprout> = {
  spring: Sprout,
  summer: Sun,
  autumn: Leaf,
  winter: Snowflake,
};

const phenologyStatusIcons: Record<PhenologyStatusType, typeof Sprout> = {
  budding: Sprout,
  blooming: Flower2,
  leafFall: Leaf,
};

export default function BenchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBenchById, deleteBench, initialize, initialized, addPhenology, deletePhenology } = useBenchStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [phenologyForm, setPhenologyForm] = useState({
    season: 'spring' as SeasonType,
    plantName: '',
    status: 'budding' as PhenologyStatusType,
    observedAt: todayString(),
  });
  const [phenologyError, setPhenologyError] = useState('');
  const [phenologyNotice, setPhenologyNotice] = useState('');

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const bench = id ? getBenchById(id) : undefined;

  useEffect(() => {
    if (bench === undefined && initialized) {
      navigate('/');
    }
  }, [bench, initialized, navigate]);

  if (!bench) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-ink-light">加载中...</p>
        </div>
      </div>
    );
  }

  const comfortScore = calculateComfortScore(bench);
  const comfortLevel = getComfortLevel(comfortScore);
  const comfortColor = getComfortColor(comfortScore);

  const timePeriodIcons: Record<TimePeriodType, typeof Sunrise> = {
    morning: Sunrise,
    noon: Sun,
    afternoon: CloudSun,
    evening: Sunset,
    night: Moon,
  };

  const sortedExperiences = [...bench.experiences].sort((a, b) => {
    const order: TimePeriodType[] = ['morning', 'noon', 'afternoon', 'evening', 'night'];
    return order.indexOf(a.timePeriod) - order.indexOf(b.timePeriod);
  });

  const seasonalPhenologies = SEASON_ORDER.map((season) => ({
    season,
    record: findLatestPhenology(bench.phenologies, season),
  }));

  const handleDelete = () => {
    if (id) {
      deleteBench(id);
      navigate('/');
    }
  };

  const handleAddPhenology = (e: React.FormEvent) => {
    e.preventDefault();
    setPhenologyError('');
    setPhenologyNotice('');

    if (!id || !bench) return;
    if (!phenologyForm.plantName.trim()) {
      setPhenologyError('请填写植物名称');
      return;
    }
    if (!phenologyForm.observedAt) {
      setPhenologyError('请选择观察日期');
      return;
    }

    const result = addPhenology(id, {
      season: phenologyForm.season,
      plantName: phenologyForm.plantName.trim(),
      status: phenologyForm.status,
      observedAt: phenologyForm.observedAt,
    });

    if (!result.accepted) {
      const existing = findLatestPhenology(bench.phenologies, phenologyForm.season);
      setPhenologyError(
        `该长椅的${SEASON_LABELS[phenologyForm.season]}季已有 ${existing?.observedAt} 的更新记录，补录更早日期已被退回，原记录保留。`
      );
      return;
    }

    setPhenologyNotice(
      `${SEASON_LABELS[phenologyForm.season]}季物候已更新为 ${phenologyForm.observedAt} 的记录。`
    );
    setPhenologyForm((prev) => ({ ...prev, plantName: '', observedAt: todayString() }));
  };

  const handleDeletePhenology = (recordId: string) => {
    if (id) {
      deletePhenology(id, recordId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-ink-light hover:text-deep-brown mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="paper-texture rounded-xl shadow-paper overflow-hidden fade-in opacity-0 stagger-1">
            <div className="h-48 bg-gradient-to-br from-warm-cream via-warm-beige to-moss-green/10 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-white/60 flex items-center justify-center backdrop-blur-sm">
                  <Armchair className="w-14 h-14 text-moss-green/60" />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-deep-brown mb-2">
                    {bench.name}
                  </h1>
                  <div className="flex items-center gap-1 text-ink-light">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{bench.location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-3xl font-bold font-serif ${comfortColor}`}>
                    {comfortScore}
                  </div>
                  <div className="text-sm text-ink-light">{comfortLevel}</div>
                </div>
              </div>

              <div className="h-2 bg-warm-beige rounded-full mb-6 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    comfortScore >= 4 ? 'bg-moss-green' :
                    comfortScore >= 3 ? 'bg-ochre' :
                    'bg-ink-light'
                  }`}
                  style={{ width: `${(comfortScore / 5) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-moss-green/5 rounded-lg">
                  <Sun className="w-5 h-5 text-moss-green mx-auto mb-1" />
                  <div className="text-xs text-ink-light mb-0.5">遮阴</div>
                  <div className="text-sm font-medium text-deep-brown">
                    {SHADE_LABELS[bench.shadeLevel]}
                  </div>
                </div>
                <div className="text-center p-3 bg-ochre/5 rounded-lg">
                  <Volume2 className="w-5 h-5 text-ochre mx-auto mb-1" />
                  <div className="text-xs text-ink-light mb-0.5">噪音</div>
                  <div className="text-sm font-medium text-deep-brown">
                    {NOISE_LABELS[bench.noiseLevel]}
                  </div>
                </div>
                <div className="text-center p-3 bg-moss-green/5 rounded-lg">
                  <Armchair className="w-5 h-5 text-moss-green mx-auto mb-1" />
                  <div className="text-xs text-ink-light mb-0.5">靠背</div>
                  <div className="text-sm font-medium text-deep-brown">
                    {bench.hasBackrest ? '有' : '无'}
                  </div>
                </div>
                <div className="text-center p-3 bg-ochre/5 rounded-lg">
                  <Compass className="w-5 h-5 text-ochre mx-auto mb-1" />
                  <div className="text-xs text-ink-light mb-0.5">朝向</div>
                  <div className="text-sm font-medium text-deep-brown">
                    {ORIENTATION_LABELS[bench.orientation]}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-6 p-4 bg-warm-cream/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ink-light">材质</span>
                  <span className="text-sm font-medium text-deep-brown">
                    {MATERIAL_LABELS[bench.material]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-ink-light" />
                  <span className="text-sm text-ink-light">适合停留</span>
                  <span className="text-sm font-medium text-deep-brown">
                    {STAY_DURATION_LABELS[bench.stayDuration]}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-serif font-semibold text-deep-brown mb-2">个人评价</h3>
                <p className="text-ink-light leading-relaxed">{bench.review}</p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-deep-brown/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-light">评分</span>
                  <Rating value={bench.rating} readOnly />
                </div>

                <div className="flex-1" />

                <button
                  onClick={() => navigate(`/edit/${bench.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-moss-green hover:bg-moss-green/10 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            </div>
          </div>

          <div className="paper-texture rounded-xl shadow-paper p-6 fade-in opacity-0 stagger-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-deep-brown">
                物候记录
              </h2>
              <span className="text-xs text-ink-light">
                同一季节只保留观察日期最新的一次
              </span>
            </div>

            <form onSubmit={handleAddPhenology} className="mb-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-ink-light mb-1">季节</label>
                  <select
                    value={phenologyForm.season}
                    onChange={(e) => {
                      setPhenologyForm((prev) => ({ ...prev, season: e.target.value as SeasonType }));
                      setPhenologyError('');
                    }}
                    className="w-full px-3 py-2 text-sm bg-white/50 border border-deep-brown/10 rounded-lg text-deep-brown focus:bg-white cursor-pointer"
                  >
                    {SEASON_ORDER.map((season) => (
                      <option key={season} value={season}>
                        {SEASON_LABELS[season]}季
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-light mb-1">状态</label>
                  <select
                    value={phenologyForm.status}
                    onChange={(e) =>
                      setPhenologyForm((prev) => ({ ...prev, status: e.target.value as PhenologyStatusType }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white/50 border border-deep-brown/10 rounded-lg text-deep-brown focus:bg-white cursor-pointer"
                  >
                    {Object.entries(PHENOLOGY_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-light mb-1">植物名称</label>
                  <input
                    type="text"
                    value={phenologyForm.plantName}
                    onChange={(e) => setPhenologyForm((prev) => ({ ...prev, plantName: e.target.value }))}
                    placeholder="如：悬铃木"
                    className="w-full px-3 py-2 text-sm bg-white/50 border border-deep-brown/10 rounded-lg text-deep-brown placeholder:text-ink-light/60 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-light mb-1">观察日期</label>
                  <input
                    type="date"
                    max={todayString()}
                    value={phenologyForm.observedAt}
                    onChange={(e) => {
                      setPhenologyForm((prev) => ({ ...prev, observedAt: e.target.value }));
                      setPhenologyError('');
                    }}
                    className="w-full px-3 py-2 text-sm bg-white/50 border border-deep-brown/10 rounded-lg text-deep-brown focus:bg-white"
                  />
                </div>
              </div>

              {phenologyError && (
                <div className="flex items-start gap-2 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{phenologyError}</span>
                </div>
              )}
              {phenologyNotice && (
                <div className="flex items-start gap-2 mb-3 px-3 py-2 bg-moss-green/10 border border-moss-green/20 rounded-lg text-sm text-moss-green">
                  <Sprout className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{phenologyNotice}</span>
                </div>
              )}

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-moss-green text-white rounded-lg hover:bg-moss-light transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                补录物候
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {seasonalPhenologies.map(({ season, record }) => {
                const SeasonIcon = seasonIcons[season];
                return (
                  <div
                    key={season}
                    className={`p-4 rounded-lg border ${
                      record ? 'bg-warm-cream/60 border-deep-brown/10' : 'bg-warm-beige/40 border-deep-brown/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <SeasonIcon className="w-4 h-4 text-ochre" />
                        <span className="text-sm font-medium text-deep-brown">
                          {SEASON_LABELS[season]}季
                        </span>
                      </div>
                      {record && (
                        <button
                          type="button"
                          onClick={() => handleDeletePhenology(record.id)}
                          className="p-1 text-ink-light/40 hover:text-red-500 rounded transition-colors"
                          title="删除该季节记录"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {record ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md ${
                              getPhenologyStatusStyle(record.status).badge
                            }`}
                          >
                            {(() => {
                              const StatusIcon = phenologyStatusIcons[record.status];
                              return <StatusIcon className="w-3 h-3" />;
                            })()}
                            {PHENOLOGY_STATUS_LABELS[record.status]}
                          </span>
                          <span className="text-sm font-medium text-deep-brown">
                            {record.plantName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-ink-light">
                          <CalendarDays className="w-3 h-3" />
                          <span>观察于 {record.observedAt}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-ink-light/60">暂无记录</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="paper-texture rounded-xl shadow-paper p-6 fade-in opacity-0 stagger-2">
            <h2 className="font-serif text-lg font-semibold text-deep-brown mb-4">
              分时段体验
            </h2>

            {sortedExperiences.length > 0 ? (
              <div className="space-y-4">
                {sortedExperiences.map((experience) => {
                  const TimeIcon = timePeriodIcons[experience.timePeriod];
                  return (
                    <div
                      key={experience.id}
                      className="p-4 bg-warm-cream/50 rounded-lg hover:bg-warm-cream transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TimeIcon className="w-4 h-4 text-ochre" />
                          <span className="font-medium text-deep-brown text-sm">
                            {TIME_PERIOD_LABELS[experience.timePeriod]}
                          </span>
                        </div>
                        <Rating value={experience.rating} readOnly size="sm" />
                      </div>
                      <p className="text-sm text-ink-light leading-relaxed">
                        {experience.notes}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-moss-green/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-moss-green/50" />
                </div>
                <p className="text-sm text-ink-light">
                  还没有分时段体验记录
                </p>
                <p className="text-xs text-ink-light/60 mt-1">
                  编辑长椅时可以添加
                </p>
              </div>
            )}
          </div>

          <div className="paper-texture rounded-xl shadow-paper p-6 fade-in opacity-0 stagger-3">
            <h3 className="font-serif text-sm font-semibold text-deep-brown mb-3">
              档案信息
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-light">创建时间</span>
                <span className="text-deep-brown">
                  {new Date(bench.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-light">更新时间</span>
                <span className="text-deep-brown">
                  {new Date(bench.updatedAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-light">时段记录</span>
                <span className="text-deep-brown">{bench.experiences.length} 条</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-light">物候记录</span>
                <span className="text-deep-brown">{(bench.phenologies ?? []).length} 条</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="paper-texture rounded-xl shadow-paper-hover p-6 max-w-sm w-full fade-in">
            <h3 className="font-serif text-lg font-semibold text-deep-brown mb-2">
              确认删除
            </h3>
            <p className="text-ink-light text-sm mb-6">
              确定要删除这张长椅的档案吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm text-deep-brown bg-warm-beige hover:bg-warm-beige/80 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
