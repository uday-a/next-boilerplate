import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * WHY: money/numbers were formatted ad hoc in three places (forms billing
 * math, locations headcount, data-table money) with diverging zero handling.
 * One helper keeps "$0 vs em-dash" decisions in a single spot.
 * Zero renders as $0 (a real zero, muted at the call site, never an
 * em-dash that reads as "no data").
 * Locale-aware via `Intl` — pass the active locale (from `useLocale()`)
 * so grouping follows the UI language (`1,284` vs `1284`).
 */
export function formatMoney(n: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}

/**
 * WHY: same centralization as formatMoney for plain counts (headcount,
 * seats). toLocaleString keeps grouping consistent across pages.
 * Locale-aware via `Intl` — pass the active locale (from `useLocale()`).
 */
export function formatNumber(n: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale).format(n)
}
