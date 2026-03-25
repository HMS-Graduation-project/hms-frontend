import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { AppointmentStatus } from '@/hooks/use-appointments';

const statusVariantMap: Record<
  AppointmentStatus,
  'warning' | 'info' | 'default' | 'success' | 'destructive' | 'secondary'
> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  NO_SHOW: 'secondary',
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation('appointments');

  return (
    <Badge variant={statusVariantMap[status]} className={className}>
      {t(`statuses.${status}`)}
    </Badge>
  );
}
