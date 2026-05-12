import { format as dfFormat, formatDistanceToNowStrict as dfDistance, type FormatDistanceStrictOptions } from 'date-fns';
import { ar as arLocale } from 'date-fns/locale/ar';
import { tr as trLocale } from 'date-fns/locale/tr';
import { enUS as enLocale } from 'date-fns/locale/en-US';
import i18n from '@/lib/i18n';

/** date-fns locale matching the active i18n language. Falls back to en-US. */
export function dateLocale() {
  const base = (i18n.language || 'en').split('-')[0];
  if (base === 'ar') return arLocale;
  if (base === 'tr') return trLocale;
  return enLocale;
}

/**
 * Wrapper around date-fns format that automatically threads the active
 * locale. Use everywhere we want dates to appear in the current language.
 *
 * Example: `formatDate(d, 'PPP')` → "8 May 2026" (en) / "٨ أيار ٢٠٢٦" (ar) /
 * "8 Mayıs 2026" (tr).
 */
export function formatDate(date: Date | string | number, fmt = 'PPP') {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return dfFormat(d, fmt, { locale: dateLocale() });
}

export function formatDistanceToNow(
  date: Date | string | number,
  opts?: Omit<FormatDistanceStrictOptions, 'locale'>,
) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return dfDistance(d, { ...opts, locale: dateLocale() });
}
