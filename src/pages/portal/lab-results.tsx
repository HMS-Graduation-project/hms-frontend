import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/format';
import { FlaskConical, AlertCircle } from 'lucide-react';
import { usePortalLabResults } from '@/hooks/use-portal';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PortalLabResultsPage() {
  const { t } = useTranslation('portal');
  const { data, isLoading } = usePortalLabResults();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('labResults.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('labResults.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : data?.data.length ? (
        <ul className="space-y-3">
          {data.data.map((o) => (
            <li key={o.id}>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{o.testName}</span>
                      {o.testCategory && (
                        <span className="text-xs text-muted-foreground">
                          ({o.testCategory})
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {o.hospital.name}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {t('labResults.ordered')}:{' '}
                      {formatDate(o.orderedAt, 'PPP')}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {o.status}
                    </Badge>
                  </div>
                  {o.result ? (
                    <div className="rounded bg-muted/40 p-3 text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        {o.result.isAbnormal && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span>{o.result.result}</span>
                        {o.result.unit && (
                          <span className="text-xs text-muted-foreground">
                            {o.result.unit}
                          </span>
                        )}
                      </div>
                      {o.result.normalRange && (
                        <div className="text-xs text-muted-foreground">
                          {t('labResults.normalRange')}: {o.result.normalRange}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t('labResults.reported')}:{' '}
                        {formatDate(o.result.reportedAt, 'PPP')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs italic text-muted-foreground">
                      {t('labResults.pending')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t('labResults.empty')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
