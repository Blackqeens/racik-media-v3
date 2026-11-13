'use client';

import { useEffect, useState } from 'react';

export type ChatPartnerRole = 'seller' | 'distributor' | 'service_provider';

export interface PartnerChatMessage {
  id: string;
  senderRole: 'member' | 'partner';
  senderName: string;
  text: string;
  createdAt: string;
  isAutoReply?: boolean;
}

export interface PartnerChatThread {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerRole: ChatPartnerRole;
  partnerLocation: string;
  subjectTitle: string;
  subjectId?: string;
  unreadByMember: number;
  unreadByPartner: number;
  updatedAt: string;
  messages: PartnerChatMessage[];
}

const STORAGE_KEY = 'racik-partner-chats-v1';
const EVENT_NAME = 'racik-partner-chats-updated';

function makeMinutesAgoIso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

const DEFAULT_THREADS: PartnerChatThread[] = [
  {
    id: 'chat-seller-kopi-gayo',
    partnerId: 'prd-kopi-gayo',
    partnerName: 'Koperasi Tani Takengon',
    partnerRole: 'seller',
    partnerLocation: 'Aceh Tengah, Aceh',
    subjectTitle: 'Kopi Arabika Gayo Single Origin 100g',
    subjectId: 'prd-kopi-gayo',
    unreadByMember: 1,
    unreadByPartner: 0,
    updatedAt: makeMinutesAgoIso(18),
    messages: [
      {
        id: 'msg-s-1',
        senderRole: 'member',
        senderName: 'Member Racik',
        text: 'Halo Kak, apakah kopi Arabika Gayo yang 100g tersedia dalam kondisi sangrai medium (whole bean) dan siap kirim minggu ini?',
        createdAt: makeMinutesAgoIso(25),
      },
      {
        id: 'msg-s-2',
        senderRole: 'partner',
        senderName: 'Koperasi Tani Takengon',
        text: 'Halo Kak! Stok panen terbaru roast medium ready 120 kemasan (biji utuh maupun giling halus). Pengemasan vakum satu arah katup udara agar aroma terjaga saat dikirim.',
        createdAt: makeMinutesAgoIso(18),
      },
    ],
  },
  {
    id: 'chat-dist-logistik-jatim',
    partnerId: 'dist-pupuk-hayati',
    partnerName: 'CV Agro Distribusi Nusantara',
    partnerRole: 'distributor',
    partnerLocation: 'Surabaya & Jawa Timur',
    subjectTitle: 'Pasokan Pupuk Hayati & Media Tanam Grosir',
    subjectId: 'dist-pupuk-hayati',
    unreadByMember: 0,
    unreadByPartner: 1,
    updatedAt: makeMinutesAgoIso(45),
    messages: [
      {
        id: 'msg-d-1',
        senderRole: 'member',
        senderName: 'Member Racik',
        text: 'Selamat siang, untuk pengiriman partai 20 karung ke area Bekasi estimasi armada dan ongkirnya bagaimana ya?',
        createdAt: makeMinutesAgoIso(45),
      },
    ],
  },
  {
    id: 'chat-srv-dr-sarah',
    partnerId: 'srv-tanah-sarah',
    partnerName: 'Dr. Sarah Amalia',
    partnerRole: 'service_provider',
    partnerLocation: 'Kab. Bogor, Jawa Barat',
    subjectTitle: 'Pemeriksaan Kesuburan Tanah & Formulasi Pemupukan Presisi',
    subjectId: 'srv-tanah-sarah',
    unreadByMember: 1,
    unreadByPartner: 0,
    updatedAt: makeMinutesAgoIso(9),
    messages: [
      {
        id: 'msg-j-1',
        senderRole: 'member',
        senderName: 'Member Racik',
        text: 'Permisi Dok, saya ingin tanya detail pekerjaan untuk uji lab tanah seluas 1,5 hektar: apakah sampel tanah harus kami kirim atau tim datang ke lahan?',
        createdAt: makeMinutesAgoIso(14),
      },
      {
        id: 'msg-j-2',
        senderRole: 'partner',
        senderName: 'Dr. Sarah Amalia',
        text: 'Halo! Untuk detail pekerjaan: tim kami bisa survei langsung (onsite Jabodetabek-Jabar) atau memandu pengambilan 5 titik komposit untuk dikirim ke lab. Hasil mencakup pH, NPK, C-Organik, serta dosis racikan pupuk per fase tanam.',
        createdAt: makeMinutesAgoIso(9),
      },
    ],
  },
];

function cloneDefaults(): PartnerChatThread[] {
  return JSON.parse(JSON.stringify(DEFAULT_THREADS)) as PartnerChatThread[];
}

export function getPartnerChatThreads(): PartnerChatThread[] {
  if (typeof window === 'undefined') return cloneDefaults();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = cloneDefaults();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as PartnerChatThread[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

function savePartnerChatThreads(threads: PartnerChatThread[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // ignore storage quota errors
  }
}

export function openOrCreatePartnerChatThread(input: {
  partnerId: string;
  partnerName: string;
  partnerRole: ChatPartnerRole;
  partnerLocation: string;
  subjectTitle: string;
  subjectId?: string;
}): PartnerChatThread {
  const threads = getPartnerChatThreads();
  const normalizedName = input.partnerName.trim().toLowerCase();
  const normalizedSubject = input.subjectTitle.trim().toLowerCase();

  const existing = threads.find(
    (t) =>
      t.partnerRole === input.partnerRole &&
      (t.partnerId === input.partnerId ||
        (t.partnerName.trim().toLowerCase() === normalizedName &&
          t.subjectTitle.trim().toLowerCase() === normalizedSubject)),
  );

  if (existing) {
    return existing;
  }

  const nowIso = new Date().toISOString();
  const newThread: PartnerChatThread = {
    id: `chat-${input.partnerRole}-${Date.now()}`,
    partnerId: input.partnerId,
    partnerName: input.partnerName,
    partnerRole: input.partnerRole,
    partnerLocation: input.partnerLocation || 'Indonesia',
    subjectTitle: input.subjectTitle,
    subjectId: input.subjectId,
    unreadByMember: 0,
    unreadByPartner: 0,
    updatedAt: nowIso,
    messages: [
      {
        id: `msg-welcome-${Date.now()}`,
        senderRole: 'partner',
        senderName: input.partnerName,
        text:
          input.partnerRole === 'service_provider'
            ? `Halo! Silakan tanyakan detail ruang lingkup pekerjaan, jadwal survei, revisi, atau rincian milestone untuk "${input.subjectTitle}".`
            : input.partnerRole === 'distributor'
              ? `Halo! Ada yang ingin ditanyakan terkait stok grosir, armada pengiriman, atau alamat gudang untuk "${input.subjectTitle}"?`
              : `Halo! Silakan tanyakan detail produk, kondisi stok, kemasan, atau pengiriman untuk "${input.subjectTitle}".`,
        createdAt: nowIso,
      },
    ],
  };

  const next = [newThread, ...threads];
  savePartnerChatThreads(next);
  return newThread;
}

function buildPartnerAutoReply(thread: PartnerChatThread, memberText: string): string {
  const lower = memberText.toLowerCase();
  if (thread.partnerRole === 'service_provider') {
    if (lower.includes('jadwal') || lower.includes('kapan') || lower.includes('survei') || lower.includes('lokasi')) {
      return `Terima kasih pertanyaannya. Untuk jadwal pekerjaan "${thread.subjectTitle}", kami siap menyesuaikan kunjungan atau konsultasi dalam 1-2 hari kerja setelah detail lokasi disepakati. Pembayaran tetap aman bertahap lewat Milestone Escrow.`;
    }
    if (lower.includes('harga') || lower.includes('biaya') || lower.includes('tarif') || lower.includes('milestone')) {
      return `Rincian biaya pekerjaan dibagi per tahapan milestone (Survei/Analisa -> Pengerjaan Utama -> Laporan Final). Jika ada kebutuhan khusus di lapangan, bisa kami sesuaikan sebelum kontrak disetujui.`;
    }
    return `Pesan diterima untuk pekerjaan "${thread.subjectTitle}". Tim kami mencatat detail pertanyaan Anda dan siap memaparkan langkah teknis, deliverables, serta estimasi durasi pengerjaan secara transparan.`;
  }

  if (thread.partnerRole === 'distributor') {
    if (lower.includes('kirim') || lower.includes('armada') || lower.includes('ongkir') || lower.includes('wilayah')) {
      return `Untuk distribusi "${thread.subjectTitle}", kami memiliki armada reguler & rute antarwilayah dengan pelacakan nomor resi / surat jalan resmi. Beri tahu kecamatan tujuan agar kami hitungkan estimasi tiba.`;
    }
    return `Terima kasih telah menghubungi ${thread.partnerName}. Stok pasokan gudang untuk "${thread.subjectTitle}" siap diproses sesuai kuota pesanan Anda, lengkap dengan jaminan Escrow platform.`;
  }

  if (lower.includes('stok') || lower.includes('ready') || lower.includes('kirim')) {
    return `Halo Kak! Stok "${thread.subjectTitle}" di toko ${thread.partnerName} saat ini tersedia dan siap diproses pengemasannya di hari kerja yang sama. Nomor resi otomatis diperbarui setelah paket dikirim.`;
  }
  return `Terima kasih sudah menghubungi ${thread.partnerName}. Pertanyaan mengenai "${thread.subjectTitle}" sudah kami terima — silakan beri tahu jumlah atau varian yang Anda butuhkan ya Kak!`;
}

export function sendPartnerChatMessage(input: {
  threadId: string;
  senderRole: 'member' | 'partner';
  senderName: string;
  text: string;
  triggerDemoAutoReply?: boolean;
}): void {
  const cleanText = input.text.trim();
  if (!cleanText) return;

  const threads = getPartnerChatThreads();
  const target = threads.find((t) => t.id === input.threadId);
  if (!target) return;

  const nowIso = new Date().toISOString();
  const newMessage: PartnerChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    senderRole: input.senderRole,
    senderName: input.senderName,
    text: cleanText,
    createdAt: nowIso,
  };

  const updatedThread: PartnerChatThread = {
    ...target,
    updatedAt: nowIso,
    unreadByMember: input.senderRole === 'partner' ? target.unreadByMember + 1 : 0,
    unreadByPartner: input.senderRole === 'member' ? target.unreadByPartner + 1 : 0,
    messages: [...target.messages, newMessage],
  };

  const remaining = threads.filter((t) => t.id !== input.threadId);
  savePartnerChatThreads([updatedThread, ...remaining]);

  if (input.senderRole === 'member' && input.triggerDemoAutoReply !== false && typeof window !== 'undefined') {
    window.setTimeout(() => {
      const latestThreads = getPartnerChatThreads();
      const latestTarget = latestThreads.find((t) => t.id === input.threadId);
      if (!latestTarget) return;
      const replyIso = new Date().toISOString();
      const autoReply: PartnerChatMessage = {
        id: `msg-auto-${Date.now()}`,
        senderRole: 'partner',
        senderName: latestTarget.partnerName,
        text: buildPartnerAutoReply(latestTarget, cleanText),
        createdAt: replyIso,
        isAutoReply: true,
      };
      const withReply: PartnerChatThread = {
        ...latestTarget,
        updatedAt: replyIso,
        unreadByMember: latestTarget.unreadByMember + 1,
        messages: [...latestTarget.messages, autoReply],
      };
      savePartnerChatThreads([
        withReply,
        ...latestThreads.filter((t) => t.id !== input.threadId),
      ]);
    }, 850);
  }
}

export function markPartnerChatThreadRead(
  threadId: string,
  reader: 'member' | 'partner',
): void {
  const threads = getPartnerChatThreads();
  const target = threads.find((t) => t.id === threadId);
  if (!target) return;

  if (reader === 'member' && target.unreadByMember === 0) return;
  if (reader === 'partner' && target.unreadByPartner === 0) return;

  const updated = threads.map((t) =>
    t.id === threadId
      ? {
          ...t,
          unreadByMember: reader === 'member' ? 0 : t.unreadByMember,
          unreadByPartner: reader === 'partner' ? 0 : t.unreadByPartner,
        }
      : t,
  );
  savePartnerChatThreads(updated);
}

export function usePartnerChats() {
  const [threads, setThreads] = useState<PartnerChatThread[]>([]);

  useEffect(() => {
    const sync = () => setThreads(getPartnerChatThreads());
    sync();
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    threads,
    openOrCreateThread: openOrCreatePartnerChatThread,
    sendMessage: sendPartnerChatMessage,
    markRead: markPartnerChatThreadRead,
  };
}

