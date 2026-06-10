import i18n from '@/lib/i18n';

/**
 * Minimal shape needed to derive a patient's display name.
 *
 * `nationalPatient` is the demographics source-of-truth and is always present
 * on a PatientProfile. `user` is the optional login/portal account — it is
 * `null` for staff-created patients who have no self-service access, so it must
 * never be the only source for a name.
 */
export interface PatientNameSource {
  nationalPatient?: {
    firstName?: string | null;
    lastName?: string | null;
    firstNameAr?: string | null;
    lastNameAr?: string | null;
  } | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}

function joinName(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(' ').trim();
}

/**
 * Resolve a patient's display name, preferring the demographics
 * source-of-truth (NationalPatient) over the optional login account.
 *
 * Resolution order:
 *   1. NationalPatient name (Arabic variant when the UI language is Arabic)
 *   2. Linked User account name
 *   3. User email
 *   4. `fallback`
 *
 * Because NationalPatient is required on every PatientProfile, this normally
 * returns a real name even for staff-created patients with no login account.
 */
export function getPatientDisplayName(
  patient: PatientNameSource | null | undefined,
  fallback = '—',
): string {
  if (!patient) return fallback;

  const np = patient.nationalPatient;
  if (np) {
    const isArabic = (i18n.language || 'en').split('-')[0] === 'ar';
    if (isArabic) {
      const ar = joinName([np.firstNameAr, np.lastNameAr]);
      if (ar) return ar;
    }
    const latin = joinName([np.firstName, np.lastName]);
    if (latin) return latin;
  }

  const fromUser = joinName([patient.user?.firstName, patient.user?.lastName]);
  if (fromUser) return fromUser;

  return patient.user?.email || fallback;
}

/**
 * Whether the patient has a linked login / portal account. Staff-created
 * patients have none — surface that via a badge rather than letting the
 * absence bleed into the displayed name.
 */
export function hasPortalAccount(
  patient: { user?: unknown | null } | null | undefined,
): boolean {
  return Boolean(patient && patient.user);
}
