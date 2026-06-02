import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TopDiagnosesChartProps {
  data: Array<{ diagnosis: string; count: number }>;
  isLoading?: boolean;
}

export function TopDiagnosesChart({ data, isLoading }: TopDiagnosesChartProps) {
  const { t } = useTranslation('reporting');

  const enriched = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    return data.map((d) => ({
      ...d,
      percentage: total > 0 ? Math.round((d.count / total) * 1000) / 10 : 0,
    }));
  }, [data]);

  const chartHeight = Math.max(260, enriched.length * 36);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('topDiagnoses')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : enriched.length === 0 ? (
          <div className="flex h-[260px] flex-col items-center justify-center text-muted-foreground">
            <Activity className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('noData')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={enriched} layout="vertical" margin={{ right: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis
                type="number"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                type="category"
                dataKey="diagnosis"
                width={140}
                className="text-xs capitalize"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v: string) => v.length > 20 ? `${v.slice(0, 18)}…` : v}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value: number, _name: string, props: { payload: { percentage: number } }) => [
                  `${value} (${props.payload.percentage}%)`,
                  t('patients'),
                ]}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 11, formatter: (_v: number, entry: { percentage?: number }) => entry?.percentage != null ? `${entry.percentage}%` : '' }}>
                {enriched.map((_, i) => (
                  <Cell key={i} fillOpacity={i === 0 ? 1 : 0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
