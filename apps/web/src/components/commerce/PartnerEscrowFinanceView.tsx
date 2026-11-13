'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownToLine,
  ArrowRight,
  Building2,
  CheckCircle2,
  Landmark,
  Lock,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { formatRelativeTime, formatRupiah } from '@/lib/utils';
import { type OrderPartnerRole } from '@/lib/orders-store';
import {
  calculatePlatformFee,
  getPartnerRoleMeta,
  getPaymentStatusLabel,
  PARTNER_BANK_OPTIONS,
  usePartnerEscrowFinance,
} from '@/lib/partner-escrow-store';
import { useSavedBankAccounts } from '@/lib/partner-bank-accounts-store';

interface PartnerEscrowFinanceViewProps {
  partnerRole: OrderPartnerRole;
}

export function PartnerEscrowFinanceView({ partnerRole }: PartnerEscrowFinanceViewProps) {
  const meta = getPartnerRoleMeta(partnerRole);
  const {
    summary,
    roleWithdrawals,
    requestWithdrawal,
    resetWithdrawals,
  } = usePartnerEscrowFinance(partnerRole);
  const { accounts: savedBankAccounts, defaultAccount: defaultBankAccount } = useSavedBankAccounts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [bankName, setBankName] = useState(PARTNER_BANK_OPTIONS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  function openWithdrawModal() {
    setAmountInput(summary.availableBalance > 0 ? String(summary.availableBalance) : '');
    if (defaultBankAccount) {
      setBankName(defaultBankAccount.bankName);
      setAccountNumber(defaultBankAccount.accountNumber);
      setAccountHolder(defaultBankAccount.accountHolder);
    }
    setModalError(null);
    setIsModalOpen(true);
  }

  function handleSubmitWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amountInput.replace(/[^0-9]/g, ''));
    const res = requestWithdrawal({
      amount: numericAmount,
      bankName,
      accountNumber,
      accountHolder,
      note: noteInput,
    });

    if (!res.ok) {
      setModalError(res.error);
      return;
    }

    setIsModalOpen(false);
    setModalError(null);
    setNoteInput('');
    setSuccessBanner(
      `Penarikan dana ${formatRupiah(res.record.amount)} ke ${res.record.bankName} (${res.record.accountNumber}) berhasil diproses dengan Ref #${res.record.id}.`,
    );
    window.setTimeout(() => setSuccessBanner(null), 6000);
  }

  const numericDraft = Number(amountInput.replace(/[^0-9]/g, '')) || 0;
  const activeOrdersForLedger = [
    ...summary.toShipOrders,
    ...summary.shippingOrders,
    ...summary.completedOrders,
  ];

  const heroTheme =
    partnerRole === 'distributor'
      ? {
          border: 'border-cyan-300/60',
          orbA: 'bg-cyan-400/30',
          orbB: 'bg-emerald-400/30',
          sparkle: 'text-cyan-300',
        }
      : partnerRole === 'service_provider'
        ? {
            border: 'border-sky-300/60',
            orbA: 'bg-sky-400/30',
            orbB: 'bg-emerald-400/30',
            sparkle: 'text-sky-300',
          }
        : {
            border: 'border-amber-300/60',
            orbA: 'bg-amber-400/30',
            orbB: 'bg-emerald-400/30',
            sparkle: 'text-amber-300',
          };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Keuangan / Saldo — Tema & Animasi Hero Seragam dengan Dashboard Utama */}
      <div
        className={`dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border p-6 sm:p-7 text-white shadow-xl ${heroTheme.border}`}
      >
        <div
          aria-hidden="true"
          className={`dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full blur-3xl ${heroTheme.orbA}`}
        />
        <div
          aria-hidden="true"
          className={`dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full blur-3xl ${heroTheme.orbB}`}
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2.5 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight drop-shadow-sm">
              Keuangan / Saldo ({meta.roleLabel})
            </h1>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Pantau secara transparan dana pembeli yang masih tertahan di Rekening Bersama platform dan dana bersih yang siap ditarik ke rekening bank Anda setelah potongan biaya layanan platform 5%.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`${meta.basePath}/orders`}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition hover:bg-slate-50"
            >
              <Package className="h-4 w-4 text-amber-600" />
              <span>Kelola Pesanan Toko</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
            </Link>
            {roleWithdrawals.length > 0 && (
              <button
                type="button"
                onClick={() => resetWithdrawals()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-slate-950/40 hover:bg-slate-950/60 px-3 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Penarikan
              </button>
            )}
          </div>
        </div>
      </div>

      {successBanner && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* ── DUA KARTU RINGKASAN SALDO UTAMA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Kartu 1: Saldo Tertahan (Pending/Escrow Balance) */}
        <div className="rounded-2xl border-2 border-amber-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Lock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                    Kartu 1 • Pending / Escrow Balance
                  </p>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Saldo Tertahan (Rekber)
                  </h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-900">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                Aman di Platform
              </span>
            </div>

            <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-4">
              <p className="text-xs font-semibold text-amber-900">
                Total Dana Pembeli Sedang Diproses
              </p>
              <p className="mt-1 text-3xl sm:text-4xl font-black text-slate-900">
                {formatRupiah(summary.pendingEscrowBalance)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-500">
                  Tab Perlu Dikirim ({summary.toShipOrders.length})
                </p>
                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  {formatRupiah(summary.toShipAmount)}
                </p>
                <p className="mt-0.5 text-[10px] text-amber-700 font-semibold">
                  Aman di Rekber Platform
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-500">
                  Tab Sedang Dikirim ({summary.shippingOrders.length})
                </p>
                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  {formatRupiah(summary.shippingAmount)}
                </p>
                <p className="mt-0.5 text-[10px] text-blue-700 font-semibold">
                  Tertahan / Locked s.d. diterima
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/40 px-3.5 py-2.5 text-[11px] text-slate-600 flex items-center justify-between gap-2">
            <span>
              Dana di kartu ini sudah lunas dibayar pembeli dan otomatis dilepas begitu pesanan berstatus <strong>Selesai</strong>.
            </span>
            <Link
              href={`${meta.basePath}/orders`}
              className="shrink-0 font-extrabold text-amber-700 hover:underline"
            >
              Proses Order →
            </Link>
          </div>
        </div>

        {/* Kartu 2: Saldo Siap Dicairkan (Available Balance) */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                    Kartu 2 • Available Balance
                  </p>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Saldo Siap Dicairkan
                  </h2>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                Potongan Platform 5%
              </span>
            </div>

            <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-emerald-900">
                  Saldo Bersih Siap Ditarik
                </p>
                <p className="mt-1 text-3xl sm:text-4xl font-black text-emerald-800">
                  {formatRupiah(summary.availableBalance)}
                </p>
              </div>
              <button
                type="button"
                onClick={openWithdrawModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md transition shrink-0"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Tarik Dana
              </button>
            </div>

            {/* Rincian Angka Transparan */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Bruto Pesanan Selesai ({summary.completedOrders.length} transaksi)</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(summary.completedGrossTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-rose-700">
                <span>Biaya Layanan Platform (Otomatis 5%)</span>
                <span className="font-bold">− {formatRupiah(summary.platformFeeTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-800">
                <span>Total Dana Bersih Masuk Saldo (95%)</span>
                <span className="font-bold">{formatRupiah(summary.netReleasedTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 border-t border-slate-200 pt-1.5">
                <span>Sudah Ditarik ke Rekening</span>
                <span className="font-bold text-slate-900">
                  − {formatRupiah(summary.withdrawnTotal)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Dana dari tab <strong>Selesai</strong> otomatis dipotong biaya platform 5% oleh sistem dan langsung siap dicairkan kapan saja.
          </p>
        </div>
      </div>

      {/* ── TRANSPARANSI ALUR STATUS PEMBAYARAN PER TRANSAKSI ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Rincian Transparansi Posisi Dana per Pesanan
            </h3>
            <p className="text-xs text-slate-500">
              Memetakan posisi dana tiap transaksi (<code>pending_escrow</code> vs <code>released_to_seller</code>) hingga penarikan bank.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
            {activeOrdersForLedger.length} Transaksi Escrow Aktif/Selesai
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 pr-3">Pesanan</th>
                <th className="py-2.5 px-3">Tahap Pesanan</th>
                <th className="py-2.5 px-3">Status Pembayaran (Escrow)</th>
                <th className="py-2.5 px-3 text-right">Bruto</th>
                <th className="py-2.5 px-3 text-right">Fee Platform (5%)</th>
                <th className="py-2.5 pl-3 text-right">Hak Bersih {meta.roleLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeOrdersForLedger.map((order) => {
                const split = calculatePlatformFee(order.gross_amount);
                const stageLabel =
                  order.status === 'escrow_held'
                    ? 'Perlu Dikirim'
                    : order.status === 'in_fulfillment'
                      ? 'Sedang Dikirim'
                      : 'Selesai';
                const payStatus = getPaymentStatusLabel(
                  order,
                  summary.availableBalance === 0 && summary.withdrawnTotal > 0,
                );

                return (
                  <tr key={order.id} className="hover:bg-slate-50/70">
                    <td className="py-3 pr-3 font-mono font-bold text-slate-900">
                      #{order.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{stageLabel}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${payStatus.cls}`}
                      >
                        {payStatus.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">
                      {formatRupiah(split.grossAmount)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-700">
                      {order.status === 'completed'
                        ? `− ${formatRupiah(split.platformFee)}`
                        : `Est. ${formatRupiah(split.platformFee)}`}
                    </td>
                    <td className="py-3 pl-3 text-right font-extrabold text-emerald-700">
                      {formatRupiah(split.netAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RIWAYAT PENARIKAN DANA KE REKENING BANK ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-600" />
              Riwayat Penarikan Dana ({meta.roleLabel})
            </h3>
            <p className="text-xs text-slate-500">
              Catatan pencairan dari Saldo Siap Dicairkan ke rekening bank tujuan Anda.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800">
            Total Ditarik: {formatRupiah(summary.withdrawnTotal)}
          </span>
        </div>

        {roleWithdrawals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
            Belum ada riwayat penarikan dana. Klik tombol <strong>&quot;Tarik Dana&quot;</strong> pada Kartu Saldo Siap Dicairkan untuk mencairkan dana ke rekening bank Anda.
          </div>
        ) : (
          <div className="space-y-2.5">
            {roleWithdrawals.map((wd) => (
              <div
                key={wd.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-extrabold text-slate-900">#{wd.id}</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Berhasil Dicairkan (withdrawn)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatRelativeTime(wd.createdAt)}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {wd.bankName} • <span className="font-mono">{wd.accountNumber}</span> a.n.{' '}
                    <strong>{wd.accountHolder}</strong>
                  </p>
                  {wd.note && <p className="text-[11px] text-slate-500">Catatan: {wd.note}</p>}
                </div>
                <p className="text-sm font-black text-emerald-700 shrink-0">
                  {formatRupiah(wd.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── POP-UP MODAL: TARIK DANA ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-emerald-700 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="h-5 w-5 text-emerald-200" />
                <div>
                  <h2 id="withdraw-modal-title" className="text-base font-extrabold">
                    Tarik Dana ke Rekening Bank
                  </h2>
                  <p className="text-[11px] text-emerald-100">
                    Role {meta.roleLabel} • Pencairan Saldo Siap Dicairkan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/15 hover:text-white"
                aria-label="Tutup pop-up Tarik Dana"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="p-5 space-y-4 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 flex items-center justify-between">
                <span className="font-semibold text-emerald-900">Saldo Siap Dicairkan:</span>
                <span className="text-sm font-black text-emerald-800">
                  {formatRupiah(summary.availableBalance)}
                </span>
              </div>

              {modalError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-bold text-rose-800">
                  {modalError}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Nominal Penarikan (Rp) *</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setAmountInput(String(Math.floor(summary.availableBalance * 0.5)))
                      }
                      className="rounded bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountInput(String(summary.availableBalance))}
                      className="rounded bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
                    >
                      Tarik Semua
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Minimal Rp 10.000"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm font-extrabold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                {numericDraft > 0 && (
                  <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                    Nilai ditarik: {formatRupiah(numericDraft)}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Rekening Tersimpan (Profil Saya)</label>
                  <Link
                    href="/profile#rekening-bank"
                    onClick={() => setIsModalOpen(false)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Kelola di Profil Saya
                  </Link>
                </div>
                {savedBankAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5 mb-3">
                    {savedBankAccounts.map((acc) => {
                      const selected =
                        bankName === acc.bankName && accountNumber === acc.accountNumber;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setBankName(acc.bankName);
                            setAccountNumber(acc.accountNumber);
                            setAccountHolder(acc.accountHolder);
                          }}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                            selected
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-bold truncate">
                              {acc.bankName} • <span className="font-mono">{acc.accountNumber}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              a.n. {acc.accountHolder}
                              {acc.label ? ` • ${acc.label}` : ''}
                            </p>
                          </div>
                          {acc.isDefault && (
                            <span className="ml-2 shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Utama
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mb-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                    Belum ada rekening tersimpan. Tambahkan di menu <strong>Profil Saya</strong> agar pengisian otomatis saat tarik dana.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank Tujuan *</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  {PARTNER_BANK_OPTIONS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Rekening *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9-]/g, ''))}
                    placeholder="Contoh: 1234567890"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pemilik Rekening *</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Sesuai buku tabungan"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan (Opsional)</label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Contoh: Pencairan hasil panen minggu ini"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={summary.availableBalance < 10000}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-2.5 font-extrabold text-white shadow-sm transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Konfirmasi Tarik Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

