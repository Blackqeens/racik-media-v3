'use client';

import { useEffect, useState } from 'react';

const COOKIE_CONSENT_KEY = 'racik-cookie-consent';

type ConsentChoice = 'essential' | 'all';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!choice) setVisible(true);
  }, []);

  function saveChoice(choice: ConsentChoice) {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    document.cookie = `racik_cookie_consent=${choice}; path=/; max-age=31536000; SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:left-auto sm:right-4 sm:max-w-md"
      role="dialog"
      aria-label="Persetujuan cookie"
    >
      <h2 className="text-sm font-bold text-gray-900">Pengaturan Cookie</h2>
      <p className="mt-1 text-xs leading-5 text-gray-600">
        Situs ini menggunakan cookie penting untuk menyimpan sesi login dan menjaga keamanan akun.
        Anda dapat memilih hanya cookie penting atau menerima cookie tambahan.
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => saveChoice('essential')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Hanya penting
        </button>
        <button
          type="button"
          onClick={() => saveChoice('all')}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          Terima semua
        </button>
      </div>
    </div>
  );
}
