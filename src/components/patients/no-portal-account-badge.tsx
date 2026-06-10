import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { hasPortalAccount } from '@/lib/patient-name';

interface NoPortalAccountBadgeProps {
  /** Patient object whose `user` relation indicates portal access. */
  patient: { user?: unknown | null } | null | undefined;
  className?: string;
}

/**
 * Muted badge shown for staff-created patients that have no login / portal
 * account. Renders nothing when the patient does have an account.
 */
export function NoPortalAccountBadge({
  patient,
  className,
}: NoPortalAccountBadgeProps) {
  const { t } = useTranslation('common');

  if (hasPortalAccount(patient)) return null;

  return (
    <Badge variant="outline" className={className}>
      {t('noPortalAccount')}
    </Badge>
  );
}
