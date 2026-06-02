import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BedDouble } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { CityRollupRow } from '@/hooks/use-reporting';

interface BedOccupancyCardProps {
  cities: CityRollupRow[];
  isLoading?: boolean;
}

export function BedOccupancyCard({ cities, isLoading }: BedOccupancyCardProps) {
  const { t } = useTranslation('reporting');

  const { totals, chartData } = useMemo(() => {
    const totalBeds = cities.reduce((s, c) => s + c.totalBeds, 0);
    const occupiedBeds = cities.reduce((s, c) => s + c.occupiedBeds, 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0
      ? Math.round((occupiedBeds / totalBeds) * 1000) / 10
      : 0;

    const chart = cities
      .filter((c) => c.totalBeds > 0)
      .map((c) => ({
        city: c.city.name,
        occupied: c.occupiedBeds,
        available: c.totalBeds - c.occupiedBeds,
      }))
      .sort((a, b) => (b.occupied + b.available) - (a.occupied + a.available));

    return {
      totals: { totalBeds, occupiedBeds, availableBeds, occupancyRate },
      chartData: chart,
    };
  }, [cities]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('bedOccupancy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : cities.length === 0 || totals.totalBeds === 0 ? (
          <div className="flex h-[260px] flex-col items-center justify-center text-muted-foreground">
            <BedDouble className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('noBedData')}</p>
          </div>
        ) : (
          <>
            {/* National summary badges */}
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{totals.totalBeds}</p>
                <p className="text-xs text-muted-foreground">{t('totalBeds')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{totals.occupiedBeds}</p>
                <p className="text-xs text-muted-foreground">{t('occupiedBeds')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{totals.availableBeds}</p>
                <p className="text-xs text-muted-foreground">{t('availableBeds')}</p>
              </div>
              <div className="text-center">
                <Badge
                  variant={totals.occupancyRate > 85 ? 'destructive' : totals.occupancyRate > 65 ? 'warning' : 'success'}
                  className="text-lg px-3 py-1"
                >
                  {totals.occupancyRate}%
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{t('occupancyRate')}</p>
              </div>
            </div>

            {/* Per-city stacked bar */}
            <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  type="category"
                  dataKey="city"
                  width={100}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
                <Legend />
                <Bar
                  dataKey="occupied"
                  name={t('occupiedBeds')}
                  stackId="beds"
                  fill="hsl(var(--destructive, 0 84% 60%))"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="available"
                  name={t('availableBeds')}
                  stackId="beds"
                  fill="hsl(var(--chart-3, 150 60% 50%))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
