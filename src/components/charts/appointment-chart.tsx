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
import { AlertCircle, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppointmentStats } from '@/hooks/use-analytics';

interface AppointmentChartProps {
  period: string;
  onPeriodChange: (period: string) => void;
}

export function AppointmentChart({ period, onPeriodChange }: AppointmentChartProps) {
  const { t } = useTranslation('analytics');
  const { data, isLoading, isError } = useAppointmentStats(period);

  const chartData = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">
          {t('appointmentTrends')}
        </CardTitle>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t('period')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">{t('daily')}</SelectItem>
            <SelectItem value="week">{t('week')}</SelectItem>
            <SelectItem value="month">{t('month')}</SelectItem>
            <SelectItem value="year">{t('year')}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('chartError')}</AlertDescription>
          </Alert>
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
            <CalendarDays className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('noAppointmentData')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="label"
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
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name={t('totalAppointments')}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="confirmed"
                name={t('confirmed')}
                stroke="hsl(var(--chart-2, 220 70% 50%))"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name={t('completedStatus')}
                stroke="hsl(var(--chart-3, 150 60% 50%))"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                name={t('cancelledStatus')}
                stroke="hsl(var(--destructive, 0 84% 60%))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
