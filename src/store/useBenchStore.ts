import { create } from 'zustand';
import type { Bench, BenchExperience, MaterialType, OrientationType, PhenologyRecord, SeasonType, ShadeLevelType, NoiseLevelType } from '@/types';
import { loadBenches, saveBenches } from '@/utils/storage';
import { generateId } from '@/utils/comfort';
import { isPhenologyAccepted } from '@/utils/phenology';
import { mockBenches } from '@/data/mockBenches';

interface BenchState {
  benches: Bench[];
  searchQuery: string;
  materialFilter: MaterialType | null;
  orientationFilter: OrientationType | null;
  shadeFilter: ShadeLevelType | null;
  noiseFilter: NoiseLevelType | null;
  seasonFilter: SeasonType | null;
  initialized: boolean;
}

interface BenchActions {
  initialize: () => void;
  setSearchQuery: (query: string) => void;
  setMaterialFilter: (material: MaterialType | null) => void;
  setOrientationFilter: (orientation: OrientationType | null) => void;
  setShadeFilter: (shade: ShadeLevelType | null) => void;
  setNoiseFilter: (noise: NoiseLevelType | null) => void;
  setSeasonFilter: (season: SeasonType | null) => void;
  clearFilters: () => void;
  addBench: (bench: Omit<Bench, 'id' | 'createdAt' | 'updatedAt' | 'experiences' | 'phenologies'>) => void;
  updateBench: (id: string, updates: Partial<Bench>) => void;
  deleteBench: (id: string) => void;
  getBenchById: (id: string) => Bench | undefined;
  addExperience: (benchId: string, experience: Omit<BenchExperience, 'id' | 'benchId'>) => void;
  updateExperience: (benchId: string, expId: string, updates: Partial<BenchExperience>) => void;
  deleteExperience: (benchId: string, expId: string) => void;
  addPhenology: (
    benchId: string,
    phenology: Omit<PhenologyRecord, 'id' | 'benchId'>,
  ) => { accepted: boolean; record: PhenologyRecord | null };
  deletePhenology: (benchId: string, recordId: string) => void;
  getFilteredBenches: () => Bench[];
}

const initialState: BenchState = {
  benches: [],
  searchQuery: '',
  materialFilter: null,
  orientationFilter: null,
  shadeFilter: null,
  noiseFilter: null,
  seasonFilter: null,
  initialized: false,
};

export const useBenchStore = create<BenchState & BenchActions>((set, get) => ({
  ...initialState,

  initialize: () => {
    const stored = loadBenches();
    if (stored.length > 0) {
      set({ benches: stored, initialized: true });
    } else {
      set({ benches: mockBenches, initialized: true });
      saveBenches(mockBenches);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setMaterialFilter: (material) => set({ materialFilter: material }),
  setOrientationFilter: (orientation) => set({ orientationFilter: orientation }),
  setShadeFilter: (shade) => set({ shadeFilter: shade }),
  setNoiseFilter: (noise) => set({ noiseFilter: noise }),
  setSeasonFilter: (season) => set({ seasonFilter: season }),

  clearFilters: () => set({
    searchQuery: '',
    materialFilter: null,
    orientationFilter: null,
    shadeFilter: null,
    noiseFilter: null,
    seasonFilter: null,
  }),

  addBench: (benchData) => {
    const now = new Date().toISOString();
    const newBench: Bench = {
      ...benchData,
      id: generateId(),
      experiences: [],
      phenologies: [],
      createdAt: now,
      updatedAt: now,
    };
    const newBenches = [newBench, ...get().benches];
    set({ benches: newBenches });
    saveBenches(newBenches);
  },

  updateBench: (id, updates) => {
    const newBenches = get().benches.map((bench) =>
      bench.id === id
        ? { ...bench, ...updates, updatedAt: new Date().toISOString() }
        : bench
    );
    set({ benches: newBenches });
    saveBenches(newBenches);
  },

  deleteBench: (id) => {
    const newBenches = get().benches.filter((bench) => bench.id !== id);
    set({ benches: newBenches });
    saveBenches(newBenches);
  },

  getBenchById: (id) => {
    return get().benches.find((bench) => bench.id === id);
  },

  addExperience: (benchId, experienceData) => {
    const newExperience: BenchExperience = {
      ...experienceData,
      id: generateId(),
      benchId,
    };
    const newBenches = get().benches.map((bench) =>
      bench.id === benchId
        ? {
            ...bench,
            experiences: [...bench.experiences, newExperience],
            updatedAt: new Date().toISOString(),
          }
        : bench
    );
    set({ benches: newBenches });
    saveBenches(newBenches);
  },

  updateExperience: (benchId, expId, updates) => {
    const newBenches = get().benches.map((bench) =>
      bench.id === benchId
        ? {
            ...bench,
            experiences: bench.experiences.map((exp) =>
              exp.id === expId ? { ...exp, ...updates } : exp
            ),
            updatedAt: new Date().toISOString(),
          }
        : bench
    );
    set({ benches: newBenches });
    saveBenches(newBenches);
  },

  deleteExperience: (benchId, expId) => {
    const newBenches = get().benches.map((bench) =>
      bench.id === benchId
        ? {
            ...bench,
            experiences: bench.experiences.filter((exp) => exp.id !== expId),
            updatedAt: new Date().toISOString(),
          }
        : bench
    );
    set({ benches: newBenches });
    saveBenches(newBenches);
  },

  addPhenology: (benchId, phenologyData) => {
    const target = get().benches.find((bench) => bench.id === benchId);
    if (!target) return { accepted: false, record: null };

    // 同一长椅同一季节只留观察日期最新的一次；补录更早的日期则退回
    if (!isPhenologyAccepted(target, phenologyData.season, phenologyData.observedAt)) {
      return { accepted: false, record: null };
    }

    const newRecord: PhenologyRecord = {
      ...phenologyData,
      id: generateId(),
      benchId,
    };
    const newBenches = get().benches.map((bench) =>
      bench.id === benchId
        ? {
            ...bench,
            // 同一季节只保留最新一次：新记录更晚时替换旧记录
            phenologies: [
              ...(bench.phenologies ?? []).filter((record) => record.season !== phenologyData.season),
              newRecord,
            ],
            updatedAt: new Date().toISOString(),
          }
        : bench
    );
    set({ benches: newBenches });
    saveBenches(newBenches);
    return { accepted: true, record: newRecord };
  },

  deletePhenology: (benchId, recordId) => {
    const newBenches = get().benches.map((bench) =>
      bench.id === benchId
        ? {
            ...bench,
            phenologies: (bench.phenologies ?? []).filter((record) => record.id !== recordId),
            updatedAt: new Date().toISOString(),
          }
        : bench
    );
    set({ benches: newBenches });
    saveBenches(newBenches);
  },

  getFilteredBenches: () => {
    const { benches, searchQuery, materialFilter, orientationFilter, shadeFilter, noiseFilter, seasonFilter } = get();

    return benches.filter((bench) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = bench.name.toLowerCase().includes(query);
        const matchLocation = bench.location.toLowerCase().includes(query);
        const matchReview = bench.review.toLowerCase().includes(query);
        if (!matchName && !matchLocation && !matchReview) return false;
      }

      if (materialFilter && bench.material !== materialFilter) return false;
      if (orientationFilter && bench.orientation !== orientationFilter) return false;
      if (shadeFilter && bench.shadeLevel !== shadeFilter) return false;
      if (noiseFilter && bench.noiseLevel !== noiseFilter) return false;
      if (seasonFilter) {
        const hasSeasonRecord = (bench.phenologies ?? []).some(
          (record) => record.season === seasonFilter
        );
        if (!hasSeasonRecord) return false;
      }

      return true;
    });
  },
}));
