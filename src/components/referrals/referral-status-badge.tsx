import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { ReferralStatus } from '@/hooks/use-referrals';

const variantMap: Record<
  ReferralStatus,
  'warning' | 'success' | 'destructive' | 'secondary' | 'default'
> = {
  PENDING: 'warning',
  ACCEPTED: 'default',
  REJECTED: 'destructive',
  COMPLETED: 'success',
  CANCELLED: 'secondary',
};

interface Props {
  status: ReferralStatus;
  className?: string;
}

export function ReferralStatusBadge({ status, className }: Props) {
  const { t } = useTranslation('referrals');
  return (
    <Badge variant={variantMap[status]} className={className}>
      {t(`status.${status}`)}
    </Badge>
  );
}
