'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  deriveOrderPaymentStatus,
  useLocalOrders,
  type LocalOrderRecord,
  type OrderPartnerRole,
} from '@/lib/orders-store';

export const PLATFORM_FEE_RATE = 0.05; // Biaya layanan platform 5%

export type WithdrawalStatus = 'processing' | 'completed';

export interface PartnerWithdrawalRecord {
  id: string;
  partnerRole: OrderPartnerRole;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  note?: string;
  status: WithdrawalStatus;
  createdAt: string;
}

export interface PartnerEscrowSummary {
  roleOrders: LocalOrderRecord[];
  unpaidOrders: LocalOrderRecord[];
  toShipOrders: LocalOrderRecord[];
  shippingOrders: LocalOrderRecord[];
  completedOrders: LocalOrderRecord[];
  toShipAmount: number;
  shippingAmount: number;
  pendingEscrowBalance: number;
  completedGrossTotal: number;
  platformFeeTotal: number;
  netReleasedTotal: number;
  withdrawnTotal: number;
  availableBalance: number;
}

const WITHDRAWAL_STORAGE_KEY = 'racik-partner-withdrawals-v1';
const WITHDRAWAL_UPDATE_EVENT = 'racik-partner-withdrawals-updated';

export const PARTNER_BANK_OPTIONS = [
  'Bank BCA',
  'Bank Mandiri',
  'Bank BRI',
  'Bank BNI',
  'Bank Syariah Indonesia (BSI)',
  'Bank CIMB Niaga',
  'Bank BJB / BPD Daerah',
];

export function filterOrdersByPartnerRole(
  orders: LocalOrderRecord[],
  partnerRole: OrderPartnerRole,
): LocalOrderRecord[] {
  return orders.filter((ord) => {
    if (ord.target_partner_role) {
      return ord.target_partner_role === partnerRole;
    }
    return partnerRole === 'seller';
  });
}

export function getPartnerWithdrawals(): PartnerWithdrawalRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(WITHDRAWAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PartnerWithdrawalRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePartnerWithdrawal(
  record: PartnerWithdrawalRecord,
): PartnerWithdrawalRecord[] {
  if (typeof window === 'undefined') return [record];
  const current = getPartnerWithdrawals();
  const next = [record, ...current];
  window.localStorage.setItem(WITHDRAWAL_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(WITHDRAWAL_UPDATE_EVENT));
  return next;
}

export function clearPartnerWithdrawals(partnerRole?: OrderPartnerRole): PartnerWithdrawalRecord[] {
  if (typeof window === 'undefined') return [];
  const next = partnerRole
    ? getPartnerWithdrawals().filter((item) => item.partnerRole !== partnerRole)
    : [];
  window.localStorage.setItem(WITHDRAWAL_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(WITHDRAWAL_UPDATE_EVENT));
  return next;
}

export function calculatePlatformFee(grossAmount: number): {
  grossAmount: number;
  platformFee: number;
  netAmount: number;
} {
  const safeGross = Math.max(0, Math.round(grossAmount || 0));
  const platformFee = Math.round(safeGross * PLATFORM_FEE_RATE);
  return {
    grossAmount: safeGross,
    platformFee,
    netAmount: Math.max(0, safeGross - platformFee),
  };
}

export function calculatePartnerEscrowSummary(
  orders: LocalOrderRecord[],
  withdrawals: PartnerWithdrawalRecord[],
  partnerRole: OrderPartnerRole,
): PartnerEscrowSummary {
  const roleOrders = filterOrdersByPartnerRole(orders, partnerRole);
  const unpaidOrders = roleOrders.filter((o) => o.status === 'pending_payment');
  const toShipOrders = roleOrders.filter((o) => o.status === 'escrow_held');
  const shippingOrders = roleOrders.filter((o) => o.status === 'in_fulfillment');
  const completedOrders = roleOrders.filter((o) => o.status === 'completed');

  const toShipAmount = toShipOrders.reduce((acc, o) => acc + (o.gross_amount || 0), 0);
  const shippingAmount = shippingOrders.reduce((acc, o) => acc + (o.gross_amount || 0), 0);
  const pendingEscrowBalance = toShipAmount + shippingAmount;

  const completedGrossTotal = completedOrders.reduce(
    (acc, o) => acc + (o.gross_amount || 0),
    0,
  );
  const { platformFee: platformFeeTotal, netAmount: netReleasedTotal } =
    calculatePlatformFee(completedGrossTotal);

  const roleWithdrawals = withdrawals.filter((w) => w.partnerRole === partnerRole);
  const withdrawnTotal = roleWithdrawals.reduce((acc, w) => acc + (w.amount || 0), 0);
  const availableBalance = Math.max(0, netReleasedTotal - withdrawnTotal);

  return {
    roleOrders,
    unpaidOrders,
    toShipOrders,
    shippingOrders,
    completedOrders,
    toShipAmount,
    shippingAmount,
    pendingEscrowBalance,
    completedGrossTotal,
    platformFeeTotal,
    netReleasedTotal,
    withdrawnTotal,
    availableBalance,
  };
}

export function getPartnerRoleMeta(partnerRole: OrderPartnerRole) {
  if (partnerRole === 'distributor') {
    return {
      roleLabel: 'Distributor',
      basePath: '/distributor',
      badgeTone: 'bg-cyan-50 text-cyan-900 border-cyan-200',
      headerGradient: 'from-cyan-800 via-teal-800 to-emerald-900 border-cyan-300/60',
      primaryBtn: 'bg-cyan-600 hover:bg-cyan-700',
      softAccent: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      trackingHint: 'Nomor Resi Kargo / Kontak Armada Pickup',
      confirmButtonLabel: 'Konfirmasi Pengiriman',
    };
  }
  if (partnerRole === 'service_provider') {
    return {
      roleLabel: 'Penyedia Jasa',
      basePath: '/service-provider',
      badgeTone: 'bg-sky-50 text-sky-900 border-sky-200',
      headerGradient: 'from-sky-800 via-indigo-800 to-slate-900 border-sky-300/60',
      primaryBtn: 'bg-sky-600 hover:bg-sky-700',
      softAccent: 'bg-sky-50 text-sky-800 border-sky-200',
      trackingHint: 'Kode Laporan / Resi Sampel / Kontak Tim Lapangan',
      confirmButtonLabel: 'Konfirmasi Pengiriman',
    };
  }
  return {
    roleLabel: 'Seller',
    basePath: '/seller',
    badgeTone: 'bg-amber-50 text-amber-900 border-amber-200',
    headerGradient: 'from-amber-700 via-orange-700 to-emerald-900 border-amber-300/60',
    primaryBtn: 'bg-amber-600 hover:bg-amber-700',
    softAccent: 'bg-amber-50 text-amber-900 border-amber-200',
    trackingHint: 'Nomor Resi Kurir / Kontak Armada Pickup',
    confirmButtonLabel: 'Konfirmasi Pengiriman',
  };
}

export function getPaymentStatusLabel(order: LocalOrderRecord, availableZero: boolean) {
  const paymentStatus = deriveOrderPaymentStatus(order);
  if (paymentStatus === 'released_to_seller') {
    return availableZero
      ? {
          code: 'withdrawn' as const,
          label: 'Dilepas & Sudah Ditarik',
          cls: 'bg-slate-100 text-slate-700 border-slate-300',
        }
      : {
          code: 'released_to_seller' as const,
          label: 'Dilepas ke Saldo Siap Cair',
          cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
  }
  if (paymentStatus === 'pending_escrow') {
    return {
      code: 'pending_escrow' as const,
      label:
        order.status === 'in_fulfillment'
          ? 'Tertahan / Locked di Rekber'
          : 'Aman di Rekber Platform',
      cls:
        order.status === 'in_fulfillment'
          ? 'bg-blue-100 text-blue-800 border-blue-300'
          : 'bg-amber-100 text-amber-900 border-amber-300',
    };
  }
  if (paymentStatus === 'withdrawn') {
    return {
      code: 'withdrawn' as const,
      label: 'Sudah Dicairkan',
      cls: 'bg-slate-100 text-slate-700 border-slate-300',
    };
  }
  return {
    code: 'unpaid' as const,
    label: 'Menunggu Pembayaran Pembeli',
    cls: 'bg-gray-100 text-gray-600 border-gray-200',
  };
}

export function usePartnerEscrowFinance(partnerRole: OrderPartnerRole) {
  const {
    orders,
    markPaid,
    updateTracking,
    updateServiceProgress,
    markCompleted,
    resetDemoOrders,
  } = useLocalOrders();

  const [withdrawals, setWithdrawals] = useState<PartnerWithdrawalRecord[]>([]);

  useEffect(() => {
    const sync = () => setWithdrawals(getPartnerWithdrawals());
    sync();
    window.addEventListener(WITHDRAWAL_UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(WITHDRAWAL_UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const summary = useMemo(
    () => calculatePartnerEscrowSummary(orders, withdrawals, partnerRole),
    [orders, withdrawals, partnerRole],
  );

  const roleWithdrawals = useMemo(
    () => withdrawals.filter((w) => w.partnerRole === partnerRole),
    [withdrawals, partnerRole],
  );

  function requestWithdrawal(payload: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    note?: string;
  }): { ok: true; record: PartnerWithdrawalRecord } | { ok: false; error: string } {
    const cleanAmount = Math.round(payload.amount || 0);
    if (!Number.isFinite(cleanAmount) || cleanAmount < 10000) {
      return { ok: false, error: 'Nominal penarikan minimal Rp 10.000.' };
    }
    if (cleanAmount > summary.availableBalance) {
      return { ok: false, error: 'Nominal penarikan melebihi Saldo Siap Dicairkan.' };
    }
    if (!payload.bankName.trim()) {
      return { ok: false, error: 'Silakan pilih bank tujuan penarikan.' };
    }
    if (!payload.accountNumber.trim() || payload.accountNumber.trim().length < 6) {
      return { ok: false, error: 'Nomor rekening tujuan minimal 6 digit.' };
    }
    if (!payload.accountHolder.trim()) {
      return { ok: false, error: 'Nama pemilik rekening wajib diisi.' };
    }

    const prefix =
      partnerRole === 'distributor'
        ? 'WD-DST'
        : partnerRole === 'service_provider'
          ? 'WD-SRV'
          : 'WD-SLR';
    const record: PartnerWithdrawalRecord = {
      id: `${prefix}-${Date.now().toString().slice(-6)}`,
      partnerRole,
      amount: cleanAmount,
      bankName: payload.bankName.trim(),
      accountNumber: payload.accountNumber.trim(),
      accountHolder: payload.accountHolder.trim(),
      note: payload.note?.trim() || undefined,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    savePartnerWithdrawal(record);
    return { ok: true, record };
  }

  return {
    summary,
    roleWithdrawals,
    markPaid,
    updateTracking,
    updateServiceProgress,
    markCompleted,
    resetDemoOrders,
    requestWithdrawal,
    resetWithdrawals: () => clearPartnerWithdrawals(partnerRole),
  };
}

