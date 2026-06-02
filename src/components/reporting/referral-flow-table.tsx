import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ReferralFlowResponse } from '@/hooks/use-reporting';

interface ReferralFlowTableProps {
  data?: ReferralFlowResponse;
  isLoading?: boolean;
}

export function ReferralFlowTable({ data, isLoading }: ReferralFlowTableProps) {
  const { t } = useTranslation('reporting');

  const maxCount = useMemo(
    () => (data?.flows?.length ? Math.max(...data.flows.map((f) => f.count)) : 1),
    [data],
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('referralFlow')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : !data || data.flows.length === 0 ? (
          <div className="flex h-[180px] flex-col items-center justify-center text-muted-foreground">
            <ArrowRightLeft className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('noReferralFlows')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fromCity')}</TableHead>
                <TableHead />
                <TableHead>{t('toCity')}</TableHead>
                <TableHead className="text-end w-[80px]">{t('referrals')}</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.flows.map((f, idx) => {
                const pct = maxCount > 0 ? (f.count / maxCount) * 100 : 0;
                return (
                  <TableRow key={`${f.fromCity.id}-${f.toCity.id}-${idx}`}>
                    <TableCell className="font-medium">{f.fromCity.name}</TableCell>
                    <TableCell className="w-10 p-0 text-muted-foreground">
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </TableCell>
                    <TableCell className="font-medium">{f.toCity.name}</TableCell>
                    <TableCell className="text-end tabular-nums font-semibold">
                      {f.count}
                    </TableCell>
                    <TableCell className="pe-4">
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
