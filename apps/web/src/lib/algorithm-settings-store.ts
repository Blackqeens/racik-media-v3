'use client';

import { useEffect, useState } from 'react';

export interface AlgorithmSettings {
  pageSize: number; // default 50 jasa / produk per etalase
  antiDuplication: boolean; // default true: mencegah item / toko berulang lintas halaman
  maxItemsPerStorePerPage: number; // default 2: anti-monopoli toko
  aiSmartRanking: boolean; // default true: pengurutan pintar reputasi & kepuasan
  geoRadiusPriority: boolean; // default true: prioritas kedekatan wilayah
  rotationSeedDays: number; // rotasi adil UMKM tiap X hari
  aiFairExposureWeight: number; // bobot eksposur adil (0-100)
  aiRatingWeight: number; // bobot rating & review (0-100)
  aiSlaSpeedWeight: number; // bobot kecepatan SLA & escrow (0-100)
}

export const DEFAULT_ALGORITHM_SETTINGS: AlgorithmSettings = {
  pageSize: 50,
  antiDuplication: true,
  maxItemsPerStorePerPage: 2,
  aiSmartRanking: true,
  geoRadiusPriority: true,
  rotationSeedDays: 1,
  aiFairExposureWeight: 20,
  aiRatingWeight: 45,
  aiSlaSpeedWeight: 35,
};

const STORAGE_KEY = 'racik-algorithm-ai-settings-v1';
const UPDATE_EVENT = 'racik-algorithm-settings-updated';

export function getAlgorithmSettings(): AlgorithmSettings {
  if (typeof window === 'undefined') return DEFAULT_ALGORITHM_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ALGORITHM_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ALGORITHM_SETTINGS,
      ...parsed,
      pageSize: Number(parsed.pageSize) || 50,
    };
  } catch {
    return DEFAULT_ALGORITHM_SETTINGS;
  }
}

export function saveAlgorithmSettings(settings: AlgorithmSettings): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function resetAlgorithmSettings(): AlgorithmSettings {
  if (typeof window === 'undefined') return DEFAULT_ALGORITHM_SETTINGS;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(UPDATE_EVENT));
  return DEFAULT_ALGORITHM_SETTINGS;
}

export function useAlgorithmSettings() {
  const [settings, setSettings] = useState<AlgorithmSettings>(DEFAULT_ALGORITHM_SETTINGS);

  useEffect(() => {
    const sync = () => {
      setSettings(getAlgorithmSettings());
    };
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    settings,
    updateSettings: (newSettings: Partial<AlgorithmSettings>) => {
      const merged = { ...settings, ...newSettings };
      saveAlgorithmSettings(merged);
      setSettings(merged);
    },
    resetSettings: () => {
      const def = resetAlgorithmSettings();
      setSettings(def);
    },
  };
}

export interface SalesAlgorithmAccessors<T> {
  getId: (item: T) => string;
  getTitle: (item: T) => string;
  getDescription: (item: T) => string;
  getStoreName: (item: T) => string;
  getRating: (item: T) => number;
  getPopularityScore: (item: T) => number;
  preserveOrder?: boolean;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Menjalankan algoritma AI Master Admin pada daftar layanan jasa atau barang marketplace:
 * 1. Menghapus duplikasi judul / deskripsi lintas etalase bila antiDuplication aktif.
 * 2. Mengurutkan menggunakan bobot AI (rating, kecepatan SLA/populer, dan rotasi adil UMKM).
 * 3. Membatasi kemunculan toko yang sama per halaman agar distribusi etalase antar halaman tetap unik & adil.
 */
export function applySalesAlgorithm<T>(
  items: T[],
  settings: AlgorithmSettings,
  acc: SalesAlgorithmAccessors<T>,
): T[] {
  let working = [...items];

  // 1. Kunci Anti-Duplikasi Produk / Deskripsi
  if (settings.antiDuplication) {
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    const seenDescs = new Set<string>();

    working = working.filter((item) => {
      const id = acc.getId(item).trim().toLowerCase();
      const titleKey = acc.getTitle(item).trim().toLowerCase().replace(/\s+/g, ' ');
      const descKey = acc.getDescription(item).trim().toLowerCase().replace(/\s+/g, ' ');

      if (seenIds.has(id) || seenTitles.has(titleKey)) {
        return false;
      }
      if (descKey.length > 20 && seenDescs.has(descKey)) {
        return false;
      }

      seenIds.add(id);
      seenTitles.add(titleKey);
      if (descKey.length > 20) seenDescs.add(descKey);
      return true;
    });
  }

  // 2. Pembobotan AI Smart Ranking (jika tidak sedang diurutkan manual harga/populer)
  if (settings.aiSmartRanking && !acc.preserveOrder) {
    const seedBucket = Math.max(1, settings.rotationSeedDays || 1);
    const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * seedBucket));

    working.sort((a, b) => {
      const scoreItem = (item: T) => {
        const ratingNorm = Math.min(5, Math.max(0, acc.getRating(item))) / 5;
        const slaNorm = Math.min(1, Math.max(0, acc.getPopularityScore(item)) / 500);
        const fairJitter =
          ((stableHash(`${acc.getId(item)}-${daySeed}`) % 100) / 100);

        return (
          ratingNorm * (settings.aiRatingWeight || 45) +
          slaNorm * (settings.aiSlaSpeedWeight || 35) +
          fairJitter * (settings.aiFairExposureWeight || 20)
        );
      };
      return scoreItem(b) - scoreItem(a);
    });
  }

  // 3. Pembatasan Anti-Monopoli Toko per Halaman (maxItemsPerStorePerPage)
  if (settings.antiDuplication && settings.maxItemsPerStorePerPage > 0) {
    const pageSize = Math.max(1, settings.pageSize || 50);
    const maxPerStore = Math.max(1, settings.maxItemsPerStorePerPage);
    const remaining = [...working];
    const arranged: T[] = [];

    while (remaining.length > 0) {
      const pageStoreCounts = new Map<string, number>();
      const deferred: T[] = [];
      let placedInPage = 0;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const storeKey = acc.getStoreName(candidate).trim().toLowerCase() || 'official';
        const count = pageStoreCounts.get(storeKey) ?? 0;

        if (placedInPage < pageSize && count < maxPerStore) {
          arranged.push(candidate);
          pageStoreCounts.set(storeKey, count + 1);
          placedInPage++;
        } else {
          deferred.push(candidate);
        }
      }

      // Jika satu halaman tidak bisa penuh karena pembatasan toko tersisa di akhir katalog,
      // isi sisa slot halaman terakhir dari item deferred agar tidak terjadi loop tak terbatas.
      if (placedInPage === 0 && deferred.length > 0) {
        arranged.push(...deferred);
        break;
      }

      remaining.splice(0, remaining.length, ...deferred);
    }

    return arranged;
  }

  return working;
}
