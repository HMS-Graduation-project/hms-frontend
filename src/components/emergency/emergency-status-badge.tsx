import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { EmergencyStatus } from '@/hooks/use-emergency';

const variantMap: Record<
  EmergencyStatus,
  'warning' | 'info' | 'default' | 'success' | 'destructive' | 'secondary'
> = {
  ARRIVED: 'warning',
  IN_TRIAGE: 'info',
  IN_TREATMENT: 'default',
  DISCHARGED: 'success',
  ADMITTED: 'info',
  TRANSFERRED: 'secondary',
  LEFT_WITHOUT_BEING_SEEN: 'destructive',
};

interface EmergencyStatusBadgeProps {
  status: EmergencyStatus;
  className?: string;
}

export function EmergencyStatusBadge({
  status,
  className,
}: EmergencyStatusBadgeProps) {
  const { t } = useTranslation('emergency');

  return (
    <Badge variant={variantMap[status]} className={className}>
      {t(`statuses.${status}`)}
    </Badge>
  );
}
