import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { ReferralUrgency } from '@/hooks/use-referrals';

const variantMap: Record<
  ReferralUrgency,
  'secondary' | 'warning' | 'destructive'
> = {
  ROUTINE: 'secondary',
  URGENT: 'warning',
  EMERGENT: 'destructive',
};

interface Props {
  urgency: ReferralUrgency;
  className?: string;
}

export function ReferralUrgencyBadge({ urgency, className }: Props) {
  const { t } = useTranslation('referrals');
  return (
    <Badge variant={variantMap[urgency]} className={className}>
      {t(`urgency.${urgency}`)}
    </Badge>
  );
}
