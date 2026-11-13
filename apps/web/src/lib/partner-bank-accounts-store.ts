'use client';

import { useEffect, useMemo, useState } from 'react';

export interface SavedBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  label?: string;
  isDefault: boolean;
  updatedAt: string;
}

const BANK_ACCOUNTS_STORAGE_KEY = 'racik-saved-bank-accounts-v1';
const BANK_ACCOUNTS_UPDATE_EVENT = 'racik-saved-bank-accounts-updated';

export function getSavedBankAccounts(): SavedBankAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BANK_ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedBankAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedBankAccounts(accounts: SavedBankAccount[]): SavedBankAccount[] {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(BANK_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new Event(BANK_ACCOUNTS_UPDATE_EVENT));
  }
  return accounts;
}

export function useSavedBankAccounts() {
  const [accounts, setAccounts] = useState<SavedBankAccount[]>([]);

  useEffect(() => {
    const sync = () => setAccounts(getSavedBankAccounts());
    sync();
    window.addEventListener(BANK_ACCOUNTS_UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(BANK_ACCOUNTS_UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const defaultAccount = useMemo(
    () => accounts.find((acc) => acc.isDefault) ?? accounts[0] ?? null,
    [accounts],
  );

  function addBankAccount(payload: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    label?: string;
    isDefault?: boolean;
  }): { ok: true; account: SavedBankAccount } | { ok: false; error: string } {
    const bankName = payload.bankName.trim();
    const accountNumber = payload.accountNumber.replace(/[^0-9]/g, '');
    const accountHolder = payload.accountHolder.trim();
    const label = payload.label?.trim() || undefined;

    if (!bankName) {
      return { ok: false, error: 'Silakan pilih nama bank terlebih dahulu.' };
    }
    if (accountNumber.length < 6 || accountNumber.length > 24) {
      return { ok: false, error: 'Nomor rekening harus berupa angka minimal 6 digit (maks. 24 digit).' };
    }
    if (accountHolder.length < 3) {
      return { ok: false, error: 'Nama pemilik rekening minimal 3 karakter sesuai buku tabungan.' };
    }

    const current = getSavedBankAccounts();
    const duplicate = current.some(
      (item) =>
        item.bankName === bankName &&
        item.accountNumber.replace(/[^0-9]/g, '') === accountNumber,
    );
    if (duplicate) {
      return { ok: false, error: 'Rekening dengan bank dan nomor rekening ini sudah tersimpan.' };
    }

    const shouldBeDefault = Boolean(payload.isDefault) || current.length === 0;
    const newRecord: SavedBankAccount = {
      id: `BNK-${Date.now().toString().slice(-6)}`,
      bankName,
      accountNumber,
      accountHolder,
      label,
      isDefault: shouldBeDefault,
      updatedAt: new Date().toISOString(),
    };

    const nextList = shouldBeDefault
      ? [newRecord, ...current.map((item) => ({ ...item, isDefault: false }))]
      : [...current, newRecord];

    persistSavedBankAccounts(nextList);
    return { ok: true, account: newRecord };
  }

  function setDefaultBankAccount(id: string) {
    const current = getSavedBankAccounts();
    const nextList = current.map((item) => ({
      ...item,
      isDefault: item.id === id,
      updatedAt: item.id === id ? new Date().toISOString() : item.updatedAt,
    }));
    persistSavedBankAccounts(nextList);
  }

  function removeBankAccount(id: string) {
    const current = getSavedBankAccounts();
    const filtered = current.filter((item) => item.id !== id);
    if (filtered.length > 0 && !filtered.some((item) => item.isDefault)) {
      filtered[0] = { ...filtered[0], isDefault: true };
    }
    persistSavedBankAccounts(filtered);
  }

  return {
    accounts,
    defaultAccount,
    addBankAccount,
    setDefaultBankAccount,
    removeBankAccount,
  };
}

