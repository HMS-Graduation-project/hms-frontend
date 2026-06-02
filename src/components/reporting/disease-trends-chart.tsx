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
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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

  const { pivoted, topNames, growthMap } = useMemo(() => {
    if (!data) return { pivoted: [], topNames: [] as string[], growthMap: new Map<string, number | null>() };
    const names = data.diagnoses.slice(0, 6).map((d) => d.diagnosis);

    // Pivot series into recharts-friendly format
    const byBucket = new Map<string, Record<string, unknown>>();
    for (const row of data.series) {
      const b = byBucket.get(row.bucket) ?? { bucket: row.bucket };
      b[row.diagnosis] = row.count;
      byBucket.set(row.bucket, b);
    }
    const pivot = Array.from(byBucket.values())
      .map((r) => {
        for (const n of names) if (r[n] == null) r[n] = 0;
        return r;
      })
      .sort((a, b) => String(a.bucket).localeCompare(String(b.bucket)));

    // Calculate growth: compare first half vs second half of the time window
    const gm = new Map<string, number | null>();
    if (pivot.length >= 2) {
      const mid = Math.floor(pivot.length / 2);
      const firstHalf = pivot.slice(0, mid);
      const secondHalf = pivot.slice(mid);
      for (const name of names) {
        const prev = firstHalf.reduce((s, r) => s + (Number(r[name]) || 0), 0);
        const curr = secondHalf.reduce((s, r) => s + (Number(r[name]) || 0), 0);
        if (prev > 0) {
          gm.set(name, Math.round(((curr - prev) / prev) * 1000) / 10);
        } else if (curr > 0) {
          gm.set(name, null); // new diagnosis, no baseline
        } else {
          gm.set(name, 0);
        }
      }
    }

    return { pivoted: pivot, topNames: names, growthMap: gm };
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
          <div className="flex h-[260px] flex-col items-center justify-center text-muted-foreground">
            <Activity className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('noData')}</p>
          </div>
        ) : (
          <>
            {/* Growth/decline badges */}
            {growthMap.size > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {topNames.map((name) => {
                  const g = growthMap.get(name);
                  if (g == null) return null;
                  const isUp = g > 0;
                  const isDown = g < 0;
                  return (
                    <Badge
                      key={name}
                      variant={isUp ? 'destructive' : isDown ? 'success' : 'secondary'}
                      className="gap-1 text-xs capitalize"
                    >
                      {isUp ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : isDown ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {name}: {isUp ? '+' : ''}{g}%
                    </Badge>
                  );
                })}
              </div>
            )}

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
          </>
        )}
      </CardContent>
    </Card>
  );
}
