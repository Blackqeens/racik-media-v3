'use client';

import { useEffect, useState } from 'react';

export type HelpdeskTicketCategory =
  | 'escrow_payment'
  | 'account_verification'
  | 'shipping_complaint'
  | 'general_policy';

export interface HelpdeskChatMessage {
  id: string;
  senderRole: 'member' | 'admin';
  senderName: string;
  text: string;
  createdAt: string;
}

export interface HelpdeskTicket {
  id: string;
  memberId: string;
  memberName: string;
  category: HelpdeskTicketCategory;
  categoryLabel: string;
  subjectTitle: string;
  status: 'open' | 'in_progress' | 'resolved';
  updatedAt: string;
  unreadByAdmin: number;
  unreadByMember: number;
  messages: HelpdeskChatMessage[];
}

const STORAGE_KEY = 'racik-helpdesk-tickets-v1';
const EVENT_NAME = 'racik-helpdesk-tickets-updated';

function makeMinutesAgoIso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

export const HELPDESK_CATEGORIES: {
  id: HelpdeskTicketCategory;
  label: string;
  icon: string;
}[] = [
  {
    id: 'escrow_payment',
    label: 'Bantuan Transaksi Escrow & Pembayaran',
    icon: '🛡️',
  },
  {
    id: 'account_verification',
    label: 'Kendala Verifikasi Akun & Toko Mitra',
    icon: '👤',
  },
  {
    id: 'shipping_complaint',
    label: 'Komplain Pengiriman & Mutu Barang/Jasa',
    icon: '📦',
  },
  {
    id: 'general_policy',
    label: 'Panduan Kebijakan & Sistem Platform',
    icon: '💡',
  },
];

const DEFAULT_TICKETS: HelpdeskTicket[] = [
  {
    id: 'hdesk-escrow-8821',
    memberId: 'usr-member-01',
    memberName: 'Budi Setiawan',
    category: 'escrow_payment',
    categoryLabel: 'Bantuan Transaksi Escrow & Pembayaran',
    subjectTitle: 'Konfirmasi Pelepasan Escrow Pesanan #RCK-8821',
    status: 'in_progress',
    updatedAt: makeMinutesAgoIso(12),
    unreadByAdmin: 0,
    unreadByMember: 1,
    messages: [
      {
        id: 'hd-m-1',
        senderRole: 'member',
        senderName: 'Budi Setiawan',
        text: 'Halo Tim Pusat Bantuan Racik Media, saya ada pesanan Kopi Gayo no. #RCK-8821 yang paketnya sudah saya terima dalam kondisi baik. Ingin konfirmasi apakah dana escrow-nya sudah otomatis diteruskan ke penjual?',
        createdAt: makeMinutesAgoIso(25),
      },
      {
        id: 'hd-m-2',
        senderRole: 'admin',
        senderName: 'Admin Operasional Racik Media',
        text: 'Halo Kak Budi, terima kasih telah menghubungi Pusat Bantuan Racik Media Nusantara. Kami telah memverifikasi resi dan konfirmasi Anda. Dana escrow sebesar Rp 85.000 telah aman dialokasikan dan siap dicairkan ke dompet mitra seller. Terima kasih atas kerja samanya!',
        createdAt: makeMinutesAgoIso(12),
      },
    ],
  },
  {
    id: 'hdesk-verif-siti',
    memberId: 'usr-member-02',
    memberName: 'Siti Rahmawati (UMKM Batik)',
    category: 'account_verification',
    categoryLabel: 'Kendala Verifikasi Akun & Toko Mitra',
    subjectTitle: 'Verifikasi NIB & Pengajuan Etalase Seller',
    status: 'open',
    updatedAt: makeMinutesAgoIso(35),
    unreadByAdmin: 1,
    unreadByMember: 0,
    messages: [
      {
        id: 'hd-m-3',
        senderRole: 'member',
        senderName: 'Siti Rahmawati',
        text: 'Selamat pagi admin, kami sudah mengunggah berkas NIB dan NPWP UMKM untuk pembukaan toko seller tenun. Mohon info perkiraan waktu verifikasinya ya min.',
        createdAt: makeMinutesAgoIso(35),
      },
      {
        id: 'hd-m-4',
        senderRole: 'admin',
        senderName: 'Admin Operasional Racik Media',
        text: 'Selamat pagi Kak Siti, berkas Anda sudah masuk ke antrean verifikasi legalitas mitra hari ini. Tim Admin sedang meninjau kelengkapan dokumen sesuai standar retensi 2 tahun. Estimasi verifikasi selesai dalam 1x24 jam kerja.',
        createdAt: makeMinutesAgoIso(30),
      },
    ],
  },
  {
    id: 'hdesk-dist-surabaya',
    memberId: 'usr-member-03',
    memberName: 'Hendra Wijaya',
    category: 'shipping_complaint',
    categoryLabel: 'Komplain Pengiriman & Mutu Barang/Jasa',
    subjectTitle: 'Penyesuaian Jadwal Armada Logistik Grosir',
    status: 'resolved',
    updatedAt: makeMinutesAgoIso(120),
    unreadByAdmin: 0,
    unreadByMember: 0,
    messages: [
      {
        id: 'hd-m-5',
        senderRole: 'member',
        senderName: 'Hendra Wijaya',
        text: 'Siang admin, pengiriman pupuk hayati pesanan distributor kami perlu penyesuaian jam bongkar muat gudang, bagaimana prosedurnya?',
        createdAt: makeMinutesAgoIso(150),
      },
      {
        id: 'hd-m-6',
        senderRole: 'admin',
        senderName: 'Admin Operasional Racik Media',
        text: 'Halo Kak Hendra, kami telah mengoordinasikan penyesuaian jam operasional gudang dengan mitra distributor. Surat jalan baru telah diperbarui di sistem logistik.',
        createdAt: makeMinutesAgoIso(120),
      },
    ],
  },
  {
    id: 'hdesk-policy-jasa',
    memberId: 'usr-member-04',
    memberName: 'Kolektif Media Kreatif',
    category: 'general_policy',
    categoryLabel: 'Panduan Kebijakan & Sistem Platform',
    subjectTitle: 'Ketentuan Kontrak Milestone Layanan Jasa Desain',
    status: 'in_progress',
    updatedAt: makeMinutesAgoIso(8),
    unreadByAdmin: 0,
    unreadByMember: 1,
    messages: [
      {
        id: 'hd-m-7',
        senderRole: 'member',
        senderName: 'Kolektif Media Kreatif',
        text: 'Halo admin, apakah termin kontrak jasa revisi desain wajib melalui sistem milestone di dashboard jasa?',
        createdAt: makeMinutesAgoIso(18),
      },
      {
        id: 'hd-m-8',
        senderRole: 'admin',
        senderName: 'Admin Operasional Racik Media',
        text: 'Halo Kak! Betul sekali, seluruh proyek jasa di Racik Media menggunakan sistem Milestone bergaransi escrow agar hak pembayaran penyedia jasa dan kepuasan klien sama-sama terlindungi.',
        createdAt: makeMinutesAgoIso(8),
      },
    ],
  },
];

function cloneDefaults(): HelpdeskTicket[] {
  return JSON.parse(JSON.stringify(DEFAULT_TICKETS)) as HelpdeskTicket[];
}

export function getHelpdeskTickets(): HelpdeskTicket[] {
  if (typeof window === 'undefined') return cloneDefaults();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = cloneDefaults();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as HelpdeskTicket[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

function saveHelpdeskTickets(tickets: HelpdeskTicket[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // Abaikan kuota storage
  }
}

export function sendHelpdeskMessage(input: {
  ticketId: string;
  senderRole: 'member' | 'admin';
  senderName: string;
  text: string;
}): void {
  const tickets = getHelpdeskTickets();
  const target = tickets.find((t) => t.id === input.ticketId);
  if (!target) return;

  const newMsg: HelpdeskChatMessage = {
    id: `hd-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    senderRole: input.senderRole,
    senderName: input.senderName,
    text: input.text,
    createdAt: new Date().toISOString(),
  };

  target.messages.push(newMsg);
  target.updatedAt = newMsg.createdAt;

  if (input.senderRole === 'member') {
    target.unreadByAdmin += 1;
    target.status = 'in_progress';
  } else {
    target.unreadByMember += 1;
  }

  saveHelpdeskTickets(tickets);
}

export function createHelpdeskTicket(input: {
  memberName: string;
  category: HelpdeskTicketCategory;
  subjectTitle: string;
  initialMessage: string;
}): HelpdeskTicket {
  const tickets = getHelpdeskTickets();
  const categoryMeta = HELPDESK_CATEGORIES.find((c) => c.id === input.category);
  const now = new Date().toISOString();

  const newTicket: HelpdeskTicket = {
    id: `hdesk-${Date.now()}`,
    memberId: `usr-${Date.now().toString(36)}`,
    memberName: input.memberName || 'Member Racik Media',
    category: input.category,
    categoryLabel: categoryMeta?.label ?? 'Bantuan Umum',
    subjectTitle: input.subjectTitle,
    status: 'open',
    updatedAt: now,
    unreadByAdmin: 1,
    unreadByMember: 0,
    messages: [
      {
        id: `hd-msg-${Date.now()}`,
        senderRole: 'member',
        senderName: input.memberName || 'Member Racik Media',
        text: input.initialMessage,
        createdAt: now,
      },
    ],
  };

  tickets.unshift(newTicket);
  saveHelpdeskTickets(tickets);
  return newTicket;
}

export function updateHelpdeskTicketStatus(
  ticketId: string,
  status: 'open' | 'in_progress' | 'resolved',
): void {
  const tickets = getHelpdeskTickets();
  const target = tickets.find((t) => t.id === ticketId);
  if (!target) return;
  target.status = status;
  target.updatedAt = new Date().toISOString();
  saveHelpdeskTickets(tickets);
}

export function markHelpdeskTicketRead(
  ticketId: string,
  readerRole: 'member' | 'admin',
): void {
  const tickets = getHelpdeskTickets();
  const target = tickets.find((t) => t.id === ticketId);
  if (!target) return;
  if (readerRole === 'member' && target.unreadByMember > 0) {
    target.unreadByMember = 0;
    saveHelpdeskTickets(tickets);
  } else if (readerRole === 'admin' && target.unreadByAdmin > 0) {
    target.unreadByAdmin = 0;
    saveHelpdeskTickets(tickets);
  }
}

export function useHelpdeskTickets() {
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);

  useEffect(() => {
    setTickets(getHelpdeskTickets());
    function handleChange() {
      setTickets(getHelpdeskTickets());
    }
    window.addEventListener(EVENT_NAME, handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  return {
    tickets,
    sendMessage: sendHelpdeskMessage,
    createTicket: createHelpdeskTicket,
    updateStatus: updateHelpdeskTicketStatus,
    markRead: markHelpdeskTicketRead,
  };
}

