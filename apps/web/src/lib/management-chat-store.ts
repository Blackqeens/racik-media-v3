'use client';

import { useEffect, useState } from 'react';

export type ManagementParticipantRole = 'admin' | 'moderator' | 'master_admin';

export interface ManagementChatMessage {
  id: string;
  senderRole: ManagementParticipantRole;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface ManagementChatThread {
  id: string;
  channelKey: 'admin_to_master' | 'moderator_to_master';
  title: string;
  subtitle: string;
  participantRoles: ManagementParticipantRole[];
  updatedAt: string;
  unreadByMaster: number;
  unreadByAdmin: number;
  unreadByModerator: number;
  messages: ManagementChatMessage[];
}

const STORAGE_KEY = 'racik-management-chats-v1';
const EVENT_NAME = 'racik-management-chats-updated';

function makeMinutesAgoIso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

const DEFAULT_THREADS: ManagementChatThread[] = [
  {
    id: 'mgmt-admin-master',
    channelKey: 'admin_to_master',
    title: 'Koordinasi Admin Operasional & Master Admin',
    subtitle: 'Eskalasi persetujuan sengketa, hold escrow saldo, peninjauan KYB, dan kebijakan operasional platform.',
    participantRoles: ['admin', 'master_admin'],
    updatedAt: makeMinutesAgoIso(5),
    unreadByMaster: 1,
    unreadByAdmin: 0,
    unreadByModerator: 0,
    messages: [
      {
        id: 'mg-msg-1',
        senderRole: 'admin',
        senderName: 'Admin Operasional',
        text: 'Halo Master Admin, izin melaporkan data sengketa keterlambatan pengiriman pada pesanan distributor Jawa Timur telah diverifikasi. Bukti surat jalan dan logistik valid.',
        createdAt: makeMinutesAgoIso(20),
      },
      {
        id: 'mg-msg-2',
        senderRole: 'master_admin',
        senderName: 'Master Admin Racik Media',
        text: 'Terima kasih atas laporannya. Segera terapkan pelepasan dana bertahap sesuai SLA 48 jam dan pastikan log audit trail tercatat permanen di sistem.',
        createdAt: makeMinutesAgoIso(10),
      },
      {
        id: 'mg-msg-3',
        senderRole: 'admin',
        senderName: 'Admin Operasional',
        text: 'Siap laksanakan Master Admin. Kami juga memohon otorisasi tambahan modul Skill AI pendeteksi fraud untuk mempermudah scoring verifikasi seller baru.',
        createdAt: makeMinutesAgoIso(5),
      },
    ],
  },
  {
    id: 'mgmt-moderator-master',
    channelKey: 'moderator_to_master',
    title: 'Koordinasi Moderator Editorial & Master Admin',
    subtitle: 'Konsultasi kurasi artikel, penanganan sengketa hak cipta karya, dan panduan publikasi cerita nusantara.',
    participantRoles: ['moderator', 'master_admin'],
    updatedAt: makeMinutesAgoIso(15),
    unreadByMaster: 0,
    unreadByAdmin: 0,
    unreadByModerator: 1,
    messages: [
      {
        id: 'mg-msg-4',
        senderRole: 'moderator',
        senderName: 'Moderator Editorial',
        text: 'Master Admin, ada 3 artikel kiriman pegiat kopi di Aceh yang memuat foto dokumentasi lokal. Kami telah memeriksa kesesuaian narasi dengan etika publikasi.',
        createdAt: makeMinutesAgoIso(30),
      },
      {
        id: 'mg-msg-5',
        senderRole: 'master_admin',
        senderName: 'Master Admin Racik Media',
        text: 'Sangat baik. Pastikan mencantumkan atribusi petani dan koperasi takengon sebagai narasumber terverifikasi, lalu terbitkan di etalase artikel editorial utama.',
        createdAt: makeMinutesAgoIso(15),
      },
    ],
  },
];

function cloneDefaults(): ManagementChatThread[] {
  return JSON.parse(JSON.stringify(DEFAULT_THREADS)) as ManagementChatThread[];
}

export function getManagementChatThreads(): ManagementChatThread[] {
  if (typeof window === 'undefined') return cloneDefaults();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = cloneDefaults();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as ManagementChatThread[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

function saveManagementChatThreads(threads: ManagementChatThread[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // Abaikan kuota storage
  }
}

export function sendManagementMessage(input: {
  threadId: string;
  senderRole: ManagementParticipantRole;
  senderName: string;
  text: string;
}): void {
  const threads = getManagementChatThreads();
  const target = threads.find((t) => t.id === input.threadId);
  if (!target) return;

  const newMsg: ManagementChatMessage = {
    id: `mg-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    senderRole: input.senderRole,
    senderName: input.senderName,
    text: input.text,
    createdAt: new Date().toISOString(),
  };

  target.messages.push(newMsg);
  target.updatedAt = newMsg.createdAt;

  if (input.senderRole === 'master_admin') {
    if (target.channelKey === 'admin_to_master') target.unreadByAdmin += 1;
    if (target.channelKey === 'moderator_to_master') target.unreadByModerator += 1;
  } else {
    target.unreadByMaster += 1;
  }

  saveManagementChatThreads(threads);
}

export function markManagementThreadRead(
  threadId: string,
  readerRole: ManagementParticipantRole,
): void {
  const threads = getManagementChatThreads();
  const target = threads.find((t) => t.id === threadId);
  if (!target) return;

  if (readerRole === 'master_admin' && target.unreadByMaster > 0) {
    target.unreadByMaster = 0;
    saveManagementChatThreads(threads);
  } else if (readerRole === 'admin' && target.unreadByAdmin > 0) {
    target.unreadByAdmin = 0;
    saveManagementChatThreads(threads);
  } else if (readerRole === 'moderator' && target.unreadByModerator > 0) {
    target.unreadByModerator = 0;
    saveManagementChatThreads(threads);
  }
}

export function useManagementChats(currentRole: ManagementParticipantRole = 'admin') {
  const [threads, setThreads] = useState<ManagementChatThread[]>([]);

  useEffect(() => {
    setThreads(getManagementChatThreads());
    function handleChange() {
      setThreads(getManagementChatThreads());
    }
    window.addEventListener(EVENT_NAME, handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  const visibleThreads = threads.filter((t) => {
    if (currentRole === 'master_admin') return true;
    return t.participantRoles.includes(currentRole);
  });

  return {
    threads: visibleThreads,
    allThreads: threads,
    sendMessage: sendManagementMessage,
    markRead: (threadId: string) => markManagementThreadRead(threadId, currentRole),
  };
}

