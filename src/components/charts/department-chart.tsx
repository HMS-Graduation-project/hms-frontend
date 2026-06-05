import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { AlertCircle, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useDepartmentStats, type DepartmentStat } from '@/hooks/use-analytics';

type SortField = 'patients' | 'appointments' | 'revenue' | 'doctors';

const SORT_KEY_MAP: Record<SortField, keyof DepartmentStat> = {
  patients: 'patientCount',
  appointments: 'appointmentCount',
  revenue: 'revenue',
  doctors: 'doctorCount',
};

export function DepartmentChart() {
  const { t } = useTranslation('analytics');
  const { data, isLoading, isError, refetch } = useDepartmentStats();
  const [sortBy, setSortBy] = useState<SortField>('appointments');

  const sorted = useMemo(() => {
    if (!data || data.length === 0) return [];
    const key = SORT_KEY_MAP[sortBy];
    return [...data].sort(
      (a, b) => (b[key] as number) - (a[key] as number),
    );
  }, [data, sortBy]);

  const topId = sorted.length > 0 ? sorted[0].id : null;

  // Dynamic chart height: 50px per department, minimum 300px
  const chartHeight = Math.max(300, sorted.length * 50);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">
          {t('departmentPerformance')}
        </CardTitle>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortField)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appointments">{t('appointments')}</SelectItem>
            <SelectItem value="patients">{t('patients')}</SelectItem>
            <SelectItem value="revenue">{t('revenue')}</SelectItem>
            <SelectItem value="doctors">{t('doctors')}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{t('chartError')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                {t('retry')}
              </Button>
            </AlertDescription>
          </Alert>
        ) : sorted.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
            <Building2 className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('noDepartmentData')}</p>
          </div>
        ) : (
          <div>
            {/* Top department badge */}
            {topId && (
              <div className="mb-3">
                <Badge variant="success" className="gap-1">
                  {t('topDepartment')}: {sorted[0].name}
                </Badge>
              </div>
            )}

            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={sorted} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  className="text-xs"
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
                  formatter={(value: any, dataKey: any) => {
                    if (dataKey === 'revenue') {
                      return [`$${Number(value).toLocaleString()}`, t('revenue')];
                    }
                    return [value, t(dataKey as 'patients' | 'appointments' | 'doctors')];
                  }}
                />
                <Legend />
                <Bar
                  dataKey="patientCount"
                  name={t('patients')}
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                >
                  {sorted.map((entry) => (
                    <Cell
                      key={entry.id}
                      fillOpacity={entry.id === topId ? 1 : 0.7}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="appointmentCount"
                  name={t('appointments')}
                  fill="hsl(var(--chart-2, 220 70% 50%))"
                  radius={[0, 4, 4, 0]}
                >
                  {sorted.map((entry) => (
                    <Cell
                      key={entry.id}
                      fillOpacity={entry.id === topId ? 1 : 0.7}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="doctorCount"
                  name={t('doctors')}
                  fill="hsl(var(--chart-3, 150 60% 50%))"
                  radius={[0, 4, 4, 0]}
                >
                  {sorted.map((entry) => (
                    <Cell
                      key={entry.id}
                      fillOpacity={entry.id === topId ? 1 : 0.7}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="revenue"
                  name={t('revenue')}
                  fill="hsl(var(--chart-4, 40 80% 55%))"
                  radius={[0, 4, 4, 0]}
                >
                  {sorted.map((entry) => (
                    <Cell
                      key={entry.id}
                      fillOpacity={entry.id === topId ? 1 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
