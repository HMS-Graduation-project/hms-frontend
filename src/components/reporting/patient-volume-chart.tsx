import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PatientVolumeChartProps {
  data: Array<{ day: string; visits: number }>;
  isLoading?: boolean;
}

/** Fill gaps so every day between min and max appears on the chart. */
function fillDateGaps(data: Array<{ day: string; visits: number }>) {
  if (data.length <= 1) return data;
  const map = new Map(data.map((d) => [d.day, d.visits]));
  const sorted = [...data].sort((a, b) => a.day.localeCompare(b.day));
  const start = new Date(sorted[0].day);
  const end = new Date(sorted[sorted.length - 1].day);
  const filled: Array<{ day: string; visits: number }> = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    filled.push({ day: key, visits: map.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return filled;
}

export function PatientVolumeChart({ data, isLoading }: PatientVolumeChartProps) {
  const { t } = useTranslation('reporting');
  const filled = useMemo(() => fillDateGaps(data), [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('dailyPatientVolume')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : filled.length === 0 ? (
          <div className="flex h-[260px] flex-col items-center justify-center text-muted-foreground">
            <Users className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('noPatientVolume')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={filled}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="day"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                className="text-xs"
                allowDecimals={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Area
                type="monotone"
                dataKey="visits"
                name={t('visits')}
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
