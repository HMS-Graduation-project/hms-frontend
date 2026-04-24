import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DiseaseTrendsResponse } from '@/hooks/use-reporting';

interface DiseaseTrendsChartProps {
  data?: DiseaseTrendsResponse;
  isLoading?: boolean;
}

const LINE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 173 58% 39%))',
  'hsl(var(--chart-3, 197 37% 24%))',
  'hsl(var(--chart-4, 43 74% 66%))',
  'hsl(var(--chart-5, 27 87% 67%))',
  'hsl(var(--destructive))',
];

export function DiseaseTrendsChart({ data, isLoading }: DiseaseTrendsChartProps) {
  const { t } = useTranslation('reporting');

  const { pivoted, topNames } = useMemo(() => {
    if (!data) return { pivoted: [], topNames: [] as string[] };
    const names = data.diagnoses.slice(0, 6).map((d) => d.diagnosis);
    const byBucket = new Map<string, Record<string, number>>();
    for (const row of data.series) {
      const b = byBucket.get(row.bucket) ?? { bucket: 0 } as unknown as Record<string, number>;
      (b as unknown as { bucket: string }).bucket = row.bucket;
      b[row.diagnosis] = row.count;
      byBucket.set(row.bucket, b);
    }
    const pivot = Array.from(byBucket.values())
      .map((r) => {
        const full: Record<string, unknown> = { ...(r as Record<string, unknown>) };
        for (const n of names) if (full[n] == null) full[n] = 0;
        return full;
      })
      .sort((a, b) => String(a.bucket).localeCompare(String(b.bucket)));
    return { pivoted: pivot, topNames: names };
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('diseaseTrends')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : pivoted.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            {t('noData')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pivoted}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="bucket"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                allowDecimals={false}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {topNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
