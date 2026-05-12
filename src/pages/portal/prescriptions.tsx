import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/format';
import { Pill } from 'lucide-react';
import { usePortalPrescriptions } from '@/hooks/use-portal';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PortalPrescriptionsPage() {
  const { t } = useTranslation('portal');
  const { data, isLoading } = usePortalPrescriptions();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('prescriptions.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('prescriptions.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : data?.data.length ? (
        <ul className="space-y-3">
          {data.data.map((rx) => (
            <li key={rx.id}>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {formatDate(rx.createdAt, 'PPP')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {rx.hospital.name}
                      </Badge>
                    </div>
                    <Badge>{rx.status}</Badge>
                  </div>
                  {rx.doctor && (
                    <div className="text-xs text-muted-foreground">
                      Dr. {rx.doctor.user.firstName} {rx.doctor.user.lastName}
                    </div>
                  )}
                  <ul className="space-y-1.5 text-sm">
                    {rx.items.map((it) => (
                      <li key={it.id} className="rounded bg-muted/40 p-2">
                        <div className="font-medium">{it.medicationName}</div>
                        <div className="text-xs text-muted-foreground">
                          {it.dosage} · {it.frequency} · {it.duration}
                        </div>
                        {it.instructions && (
                          <div className="mt-1 text-xs italic text-muted-foreground">
                            {it.instructions}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t('prescriptions.empty')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
