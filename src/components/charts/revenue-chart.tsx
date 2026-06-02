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
} from 'recharts';
import { AlertCircle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
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
import { useRevenueStats } from '@/hooks/use-analytics';

interface RevenueChartProps {
  period: string;
  onPeriodChange?: (period: string) => void;
}

export function RevenueChart({ period, onPeriodChange }: RevenueChartProps) {
  const { t } = useTranslation('analytics');
  const { data, isLoading, isError } = useRevenueStats(period);

  const categories = data?.categories ?? [];
  const totalRevenue = data?.totalRevenue ?? 0;
  const growth = data?.growthPercentage;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            {t('revenueBreakdown')}
          </CardTitle>
          {!isLoading && !isError && (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">
                ${totalRevenue.toLocaleString()}
              </span>
              {growth != null && (
                <Badge
                  variant={growth >= 0 ? 'success' : 'destructive'}
                  className="gap-1"
                >
                  {growth >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {growth >= 0 ? '+' : ''}
                  {growth}%
                </Badge>
              )}
            </div>
          )}
        </div>
        {onPeriodChange && (
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t('period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('month')}</SelectItem>
              <SelectItem value="quarter">{t('quarter')}</SelectItem>
              <SelectItem value="year">{t('year')}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('chartError')}</AlertDescription>
          </Alert>
        ) : categories.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
            <DollarSign className="mb-2 h-10 w-10" />
            <p className="text-sm">{t('noRevenueData')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categories}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="category"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
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
                formatter={(value) =>
                  [`$${Number(value).toLocaleString()}`, t('revenue')]
                }
              />
              <Legend />
              <Bar
                dataKey="amount"
                name={t('revenue')}
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
