import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3, Activity, Brain, CheckCircle2, XCircle, Clock,
  AlertTriangle, Layers, TrendingUp, ShieldCheck, Eye,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAiAnalytics } from '@/hooks/use-pneumonia';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const pctStr = (v: number | null) => v != null ? `${(v * 100).toFixed(1)}%` : '---';

export default function AiAnalyticsPage() {
  const { t } = useTranslation('ai');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const hasFilters = !!(fromDate || toDate);
  const { data, isLoading, isError } = useAiAnalytics({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const ov = data?.overview;
  const usage = data?.usage;
  const dist = data?.distribution;
  const cp = data?.clinicalPerformance;
  const mp = data?.modelPerformance ?? [];

  const riskData = dist?.riskLevel
    ? Object.entries(dist.riskLevel).map(([name, value]) => ({ name, value }))
    : [];

  const predData = dist?.prediction
    ? Object.entries(dist.prediction).map(([name, value]) => ({ name, value }))
    : [];

  const statusData = dist?.status
    ? Object.entries(dist.status).map(([name, value]) => ({ name, value }))
    : [];

  const RISK_COLORS: Record<string, string> = {
    LOW: '#22c55e', MODERATE: '#eab308', ELEVATED: '#f97316', HIGH: '#ef4444',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('analytics_title')}</h1>
        <p className="text-muted-foreground">{t('analytics_subtitle')}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('filterFrom')}</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-[160px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('filterTo')}</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-[160px]" />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setFromDate(''); setToDate(''); }}>
                {t('clearFilters')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : isError ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mb-3" />
          <p className="text-sm">{t('analytics_error')}</p>
        </CardContent></Card>
      ) : !data || ov?.totalAnalyses === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Brain className="h-12 w-12 mb-3" />
          <p className="text-sm">{hasFilters ? t('analytics_noFilteredData') : t('analytics_noData')}</p>
          {hasFilters && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => { setFromDate(''); setToDate(''); }}>
              {t('clearFilters')}
            </Button>
          )}
        </CardContent></Card>
      ) : (<>

        {/* ── Overview KPIs ──────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard icon={<BarChart3 className="h-4 w-4" />} label={t('analytics_totalAnalyses')} value={ov!.totalAnalyses} />
          <KpiCard icon={<XCircle className="h-4 w-4 text-destructive" />} label={t('analytics_positive')} value={ov!.positiveResults} variant="destructive" />
          <KpiCard icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} label={t('analytics_negative')} value={ov!.negativeResults} variant="success" />
          <KpiCard icon={<Clock className="h-4 w-4 text-yellow-600" />} label={t('analytics_pending')} value={ov!.pendingReview} />
          <KpiCard icon={<ShieldCheck className="h-4 w-4 text-green-600" />} label={t('analytics_approved')} value={ov!.approved} variant="success" />
          <KpiCard icon={<XCircle className="h-4 w-4 text-destructive" />} label={t('analytics_rejected')} value={ov!.rejected} variant="destructive" />
        </div>

        {/* Mode split */}
        <div className="grid gap-4 sm:grid-cols-2">
          <KpiCard icon={<Activity className="h-4 w-4" />} label={t('singleModelBadge')} value={ov!.singleModelAnalyses} />
          <KpiCard icon={<Layers className="h-4 w-4" />} label={t('ensembleBadge')} value={ov!.ensembleAnalyses} />
        </div>

        {/* ── Usage Trend ────────────────────────────────────── */}
        {usage && usage.dailyTrend.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />{t('analytics_usageTrend')}
                <Badge variant="outline" className="ms-auto text-[10px]">
                  {t('analytics_avgPerDay')}: {usage.averagePerDay}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usage.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Distributions ──────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Prediction */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t('analytics_predictionDist')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Level */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t('analytics_riskDist')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {riskData.map((entry) => (
                        <rect key={entry.name} fill={RISK_COLORS[entry.name] || 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review status distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t('analytics_reviewWorkflow')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statusData.map(({ name, value }) => (
                <div key={name} className="rounded-md border bg-muted/20 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">{t(`status_${name}`)}</p>
                  <p className="text-lg font-bold tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Physician-Reviewed Performance ──────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />{t('analytics_clinicalPerf')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cp && cp.reviewedRecords > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard label={t('analytics_sensitivity')} value={pctStr(cp.sensitivityEstimate)} />
                  <MetricCard label={t('analytics_specificity')} value={pctStr(cp.specificityEstimate)} />
                  <MetricCard label={t('analytics_precision')} value={pctStr(cp.precisionEstimate)} />
                  <MetricCard label={t('analytics_accuracy')} value={pctStr(cp.accuracyEstimate)} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="text-center"><p className="text-muted-foreground">TP</p><p className="font-bold">{cp.truePositive}</p></div>
                  <div className="text-center"><p className="text-muted-foreground">FP</p><p className="font-bold">{cp.falsePositive}</p></div>
                  <div className="text-center"><p className="text-muted-foreground">TN</p><p className="font-bold">{cp.trueNegative}</p></div>
                  <div className="text-center"><p className="text-muted-foreground">FN</p><p className="font-bold">{cp.falseNegative}</p></div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t('analytics_reviewedRecords')}: {cp.reviewedRecords}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">{t('analytics_insufficientData')}</p>
            )}
            <Alert variant="default">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-[11px]">{t('analytics_clinicalPerfNote')}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* ── Model Performance ───────────────────────────────── */}
        {mp.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" />{t('analytics_modelPerf')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('pneumoniaModel')}</TableHead>
                      <TableHead className="text-xs text-end">{t('analytics_totalRuns')}</TableHead>
                      <TableHead className="text-xs text-end">{t('analytics_positive')}</TableHead>
                      <TableHead className="text-xs text-end">{t('analytics_negative')}</TableHead>
                      <TableHead className="text-xs text-end">{t('analytics_avgProb')}</TableHead>
                      <TableHead className="text-xs text-end">{t('analytics_avgConf')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mp.map((m) => (
                      <TableRow key={m.modelName}>
                        <TableCell className="text-xs font-medium">
                          {m.modelName}
                          {m.modelName === 'Ensemble' && m.strongAgreement != null && (
                            <span className="text-[10px] text-muted-foreground ms-1">
                              ({t('agreement_STRONG')}: {(m.strongAgreement * 100).toFixed(0)}%)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-end tabular-nums">{m.totalRuns}</TableCell>
                        <TableCell className="text-xs text-end tabular-nums">{m.positive}</TableCell>
                        <TableCell className="text-xs text-end tabular-nums">{m.negative}</TableCell>
                        <TableCell className="text-xs text-end tabular-nums">{(m.averageProbability * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-xs text-end tabular-nums">{(m.averageConfidence * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Disclaimer ─────────────────────────────────────── */}
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">{t('analytics_disclaimer')}</AlertDescription>
        </Alert>

      </>)}
    </div>
  );
}

// ── Helper components ───────────────────────────────────────────────

function KpiCard({ icon, label, value, variant }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant?: 'destructive' | 'success';
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-xl font-bold tabular-nums ${variant === 'destructive' ? 'text-destructive' : variant === 'success' ? 'text-green-600' : ''}`}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-2.5 text-center">
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
      <p className="text-lg font-bold tabular-nums mt-1">{value}</p>
    </div>
  );
}
