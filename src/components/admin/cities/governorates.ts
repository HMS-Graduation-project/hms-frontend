/**
 * Canonical list of the 14 Syrian governorates.
 *
 * Each entry ties three identities together:
 *  - `slug`  — the `id` used in `public/syria-governorates.geojson`.
 *  - `en`    — the English name stored on `City.governorate` (matches the
 *              `GOVERNORATES` options in the city form).
 *  - index   — position in the `marketing:governorates` localized array, so a
 *              slug can resolve to a translated label without a second source.
 *
 * The order MUST stay aligned with `marketing:governorates` (en/ar/tr).
 */
export const GOVERNORATES = [
  { slug: 'damascus', en: 'Damascus' },
  { slug: 'rural-damascus', en: 'Rural Damascus' },
  { slug: 'aleppo', en: 'Aleppo' },
  { slug: 'homs', en: 'Homs' },
  { slug: 'hama', en: 'Hama' },
  { slug: 'latakia', en: 'Latakia' },
  { slug: 'tartus', en: 'Tartus' },
  { slug: 'idlib', en: 'Idlib' },
  { slug: 'daraa', en: 'Daraa' },
  { slug: 'as-suwayda', en: 'As-Suwayda' },
  { slug: 'quneitra', en: 'Quneitra' },
  { slug: 'deir-ez-zor', en: 'Deir ez-Zor' },
  { slug: 'al-hasakah', en: 'Al-Hasakah' },
  { slug: 'raqqa', en: 'Raqqa' },
] as const;

export type GovernorateSlug = (typeof GOVERNORATES)[number]['slug'];

const slugToEn = new Map(GOVERNORATES.map((g) => [g.slug, g.en]));
const slugToIndex = new Map(GOVERNORATES.map((g, i) => [g.slug, i]));

/** Loose key used to match a free-text governorate string to a canonical slug. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z-]/g, '');
}

const normalizedEnToSlug = new Map(
  GOVERNORATES.flatMap((g) => [
    [normalize(g.en), g.slug],
    [g.slug, g.slug],
  ]),
);

/** Resolve a stored `City.governorate` value to a geojson slug, or null. */
export function governorateToSlug(value: string | null | undefined): GovernorateSlug | null {
  if (!value) return null;
  return (normalizedEnToSlug.get(normalize(value)) as GovernorateSlug) ?? null;
}

/** English label for a slug (used as the table-filter key). */
export function slugToEnglish(slug: string): string {
  return slugToEn.get(slug as GovernorateSlug) ?? slug;
}

/** Index into the `marketing:governorates` localized array for a slug. */
export function slugToGovIndex(slug: string): number {
  return slugToIndex.get(slug as GovernorateSlug) ?? -1;
}
