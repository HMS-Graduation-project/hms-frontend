import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { BedStatus } from '@/hooks/use-inpatient';

const variantMap: Record<
  BedStatus,
  'success' | 'destructive' | 'warning' | 'info'
> = {
  AVAILABLE: 'success',
  OCCUPIED: 'destructive',
  MAINTENANCE: 'warning',
  RESERVED: 'info',
};

interface BedStatusBadgeProps {
  status: BedStatus;
  className?: string;
}

export function BedStatusBadge({ status, className }: BedStatusBadgeProps) {
  const { t } = useTranslation('inpatient');
  return (
    <Badge variant={variantMap[status]} className={className}>
      {t(`bedStatus.${status}`)}
    </Badge>
  );
}
