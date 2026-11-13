'use client';

import React from 'react';

export type DividerTone = 'amber' | 'cyan' | 'sky' | 'emerald';

interface DashboardSectionDividerProps {
  tone?: DividerTone;
}

const TONE_CLASSES: Record<
  DividerTone,
  { border: string; orbA: string; orbB: string }
> = {
  amber: {
    border: 'border-amber-300/60',
    orbA: 'bg-amber-400/35',
    orbB: 'bg-emerald-400/35',
  },
  cyan: {
    border: 'border-cyan-300/60',
    orbA: 'bg-cyan-400/35',
    orbB: 'bg-emerald-400/35',
  },
  sky: {
    border: 'border-sky-300/60',
    orbA: 'bg-sky-400/35',
    orbB: 'bg-emerald-400/35',
  },
  emerald: {
    border: 'border-emerald-300/60',
    orbA: 'bg-emerald-400/35',
    orbB: 'bg-teal-400/35',
  },
};

export function DashboardSectionDivider({
  tone = 'emerald',
}: DashboardSectionDividerProps) {
  const styles = TONE_CLASSES[tone];

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`dashboard-hero-slow relative isolate h-4 sm:h-5 w-full overflow-hidden rounded-xl border shadow-md ${styles.border}`}
    >
      <div
        aria-hidden="true"
        className={`dashboard-hero-orb-a pointer-events-none absolute -left-10 -top-12 -z-10 h-32 w-40 rounded-full blur-2xl ${styles.orbA}`}
      />
      <div
        aria-hidden="true"
        className={`dashboard-hero-orb-b pointer-events-none absolute -bottom-14 right-6 -z-10 h-36 w-44 rounded-full blur-2xl ${styles.orbB}`}
      />
      <div
        aria-hidden="true"
        className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-25"
      />
    </div>
  );
}
