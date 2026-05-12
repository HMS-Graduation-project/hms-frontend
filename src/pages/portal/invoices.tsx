import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/format';
import { Receipt } from 'lucide-react';
import { usePortalInvoices } from '@/hooks/use-portal';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PortalInvoicesPage() {
  const { t } = useTranslation('portal');
  const { data, isLoading } = usePortalInvoices();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('invoices.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('invoices.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : data?.data.length ? (
        <ul className="space-y-3">
          {data.data.map((inv) => {
            const total = Number(inv.total);
            const paid = Number(inv.paidAmount);
            const due = total - paid;
            return (
              <li key={inv.id}>
                <Card>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        <span className="font-semibold">
                          #{inv.invoiceNumber}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {inv.hospital.name}
                        </Badge>
                      </div>
                      <Badge variant={paid >= total ? 'secondary' : 'default'}>
                        {inv.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(inv.createdAt, 'PPP')}
                    </div>
                    <div className="grid gap-1 text-sm sm:grid-cols-3">
                      <div>
                        <div className="text-xs uppercase text-muted-foreground">
                          {t('invoices.total')}
                        </div>
                        <div className="font-semibold">{total.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-muted-foreground">
                          {t('invoices.paid')}
                        </div>
                        <div className="font-semibold">{paid.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-muted-foreground">
                          {t('invoices.due')}
                        </div>
                        <div className="font-semibold text-destructive">
                          {due.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t('invoices.empty')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
