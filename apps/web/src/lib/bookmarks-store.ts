'use client';

import { useEffect, useState } from 'react';

export type BookmarkCategory =
  | 'article'
  | 'seller_store'
  | 'distributor_hub'
  | 'service_provider';

export interface MemberBookmarkEntry {
  id: string;
  category: BookmarkCategory;
  targetId: string;
  title: string;
  subtitle: string;
  href: string;
  note?: string;
  createdAt: string;
}

const STORAGE_KEY = 'racik-member-bookmarks-v1';
const UPDATE_EVENT = 'racik-member-bookmarks-updated';

export const INITIAL_MEMBER_BOOKMARKS: MemberBookmarkEntry[] = [
  {
    id: 'bmk-art-01',
    category: 'article',
    targetId: 'art-02',
    title: 'Kopi Gayo, Toraja, dan Flores: Satu Cangkir Tiga Karakter Nusantara',
    subtitle: 'Artikel • Kategori: Pertanian & Pangan • Oleh: Siti Rahmawati',
    href: '/articles/kopi-gayo-toraja-flores-tiga-karakter',
    note: 'Referensi bacaan pascapanen kopi nusantara',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bmk-seller-01',
    category: 'seller_store',
    targetId: 'prd-kopi-gayo',
    title: 'Koperasi Tani Takengon (Seller)',
    subtitle: 'Toko Seller • Spesialis Kopi Arabika Gayo & Rempah Aceh Tengah',
    href: '/marketplace/prd-kopi-gayo',
    note: 'Toko favorit langganan biji kopi sangrai',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bmk-dist-01',
    category: 'distributor_hub',
    targetId: 'prd-kompos-organik',
    title: 'Tani Lestari Nusantara — Gudang Lembang (Distributor)',
    subtitle: 'Distributor Regional • Pasokan Kompos Organik & Pupuk Hayati Jabar',
    href: '/marketplace/prd-kompos-organik',
    note: 'Diikuti untuk stok kompos kelompok tani',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bmk-srv-01',
    category: 'service_provider',
    targetId: 'srv-03-uji-tanah',
    title: 'Dr. Sarah Amalia — Klinik Tanah Agro Lestari',
    subtitle: 'Penyedia Jasa • Pemeriksaan Kesuburan Tanah & Pemupukan Presisi',
    href: '/services/srv-03-uji-tanah',
    note: 'Praktisi ahli untuk jadwal uji sampel lahan musim tanam depan',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getMemberBookmarks(): MemberBookmarkEntry[] {
  if (typeof window === 'undefined') return INITIAL_MEMBER_BOOKMARKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMBER_BOOKMARKS));
      return INITIAL_MEMBER_BOOKMARKS;
    }
    const parsed = JSON.parse(raw) as MemberBookmarkEntry[];
    return Array.isArray(parsed) ? parsed : INITIAL_MEMBER_BOOKMARKS;
  } catch {
    return INITIAL_MEMBER_BOOKMARKS;
  }
}

export function saveMemberBookmarks(list: MemberBookmarkEntry[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function toggleMemberBookmark(
  entry: Omit<MemberBookmarkEntry, 'id' | 'createdAt'>,
): { added: boolean; items: MemberBookmarkEntry[] } {
  const current = getMemberBookmarks();
  const existing = current.find(
    (b) => b.category === entry.category && b.targetId === entry.targetId,
  );
  if (existing) {
    const next = current.filter((b) => b.id !== existing.id);
    saveMemberBookmarks(next);
    return { added: false, items: next };
  }
  const newItem: MemberBookmarkEntry = {
    ...entry,
    id: `bmk-${entry.category}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const next = [newItem, ...current];
  saveMemberBookmarks(next);
  return { added: true, items: next };
}

export function removeMemberBookmark(id: string): MemberBookmarkEntry[] {
  const next = getMemberBookmarks().filter((b) => b.id !== id);
  saveMemberBookmarks(next);
  return next;
}

export function useMemberBookmarks() {
  const [bookmarks, setBookmarks] = useState<MemberBookmarkEntry[]>(INITIAL_MEMBER_BOOKMARKS);

  useEffect(() => {
    const sync = () => setBookmarks(getMemberBookmarks());
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isBookmarked = (category: BookmarkCategory, targetId: string) =>
    bookmarks.some((b) => b.category === category && b.targetId === targetId);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark: (entry: Omit<MemberBookmarkEntry, 'id' | 'createdAt'>) => {
      const res = toggleMemberBookmark(entry);
      setBookmarks(res.items);
      return res;
    },
    removeBookmark: (id: string) => {
      const next = removeMemberBookmark(id);
      setBookmarks(next);
    },
    resetBookmarks: () => {
      saveMemberBookmarks(INITIAL_MEMBER_BOOKMARKS);
      setBookmarks(INITIAL_MEMBER_BOOKMARKS);
    },
  };
}

