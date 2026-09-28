import React from 'react';

const ACCENTS = {
  primary: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
  indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
  green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  red: 'bg-red-50 text-red-600 ring-red-100',
  purple: 'bg-purple-50 text-purple-600 ring-purple-100',
};

/**
 * Props:
 *  - label:  what the number means (e.g. "Open jobs")
 *  - value:  the number or text to show
 *  - icon:   emoji, text, or an SVG element
 *  - accent: primary | indigo | green | amber | red | purple
 *  - hint:   optional small line under the label (e.g. "+3 this week")
 *  - loading: show a placeholder while data loads
 */
export default function StatCard({ label, value, icon, accent = 'primary', hint, loading = false }) {
  const tone = ACCENTS[accent] || ACCENTS.primary;
  const hasValue = value !== undefined && value !== null && value !== '';

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ring-1 ring-inset sm:h-12 sm:w-12 sm:text-xl ${tone}`}
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className="min-w-0">
        {loading ? (
          <div className="h-7 w-16 animate-pulse rounded-md bg-slate-100 sm:h-8" aria-label="Loading" />
        ) : (
          <p className="truncate text-xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-2xl">
            {hasValue ? value : '\u2014'}
          </p>
        )}
        <p className="truncate text-sm text-slate-500">{label}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}