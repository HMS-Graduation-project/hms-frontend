import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
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
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            {t('noReferralFlows')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fromCity')}</TableHead>
                <TableHead />
                <TableHead>{t('toCity')}</TableHead>
                <TableHead className="text-right">{t('referrals')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.flows.map((f, idx) => (
                <TableRow key={`${f.fromCity.id}-${f.toCity.id}-${idx}`}>
                  <TableCell className="font-medium">{f.fromCity.name}</TableCell>
                  <TableCell className="w-10 p-0 text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </TableCell>
                  <TableCell className="font-medium">{f.toCity.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
