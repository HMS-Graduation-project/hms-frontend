import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/format';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { usePortalReferrals } from '@/hooks/use-portal';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PortalReferralsPage() {
  const { t } = useTranslation('portal');
  const { data, isLoading } = usePortalReferrals();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('referrals.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('referrals.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowLeftRight className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {r.fromHospital.name}
                      </span>
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                      <span className="font-semibold">{r.toHospital.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(r.status)}>
                        {r.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          r.urgency === 'EMERGENT'
                            ? 'border-destructive text-destructive'
                            : ''
                        }
                      >
                        {r.urgency}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {t('referrals.reason')}:
                    </span>{' '}
                    {r.reason}
                  </div>
                  {r.clinicalSummary && (
                    <div className="text-xs italic text-muted-foreground">
                      {r.clinicalSummary}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt, 'PPP')}
                    {r.completedAt &&
                      ` · ${t('referrals.completedAt')}: ${formatDate(r.completedAt, 'PPP')}`}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t('referrals.empty')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACCEPTED':
      return 'default';
    case 'COMPLETED':
      return 'secondary';
    case 'REJECTED':
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
}
