import type { Bench } from '@/types';

const STORAGE_KEY = 'bench-archive-data';

function normalizeBench(raw: Bench): Bench {
  return {
    ...raw,
    experiences: Array.isArray(raw.experiences) ? raw.experiences : [],
    phenologies: Array.isArray(raw.phenologies) ? raw.phenologies : [],
  };
}

export function loadBenches(): Bench[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: Bench[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.map(normalizeBench) : [];
    }
  } catch (error) {
    console.error('Failed to load benches from localStorage:', error);
  }
  return [];
}

export function saveBenches(benches: Bench[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(benches));
  } catch (error) {
    console.error('Failed to save benches to localStorage:', error);
  }
}

export function clearBenches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear benches from localStorage:', error);
  }
}
