import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3, Activity, Brain, CheckCircle2, XCircle, Clock,
  AlertTriangle, Layers, ShieldCheck, Eye, Stethoscope,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table, TableBody, TableCell as TCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAiAnalytics } from '@/hooks/use-pneumonia';

const pctStr = (v: number | null) => v != null ? `${(v * 100).toFixed(1)}%` : '---';

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e', MODERATE: '#eab308', ELEVATED: '#f97316', HIGH: '#ef4444',
};
const PRED_COLORS: Record<string, string> = {
  NORMAL: '#22c55e', PNEUMONIA: '#ef4444',
};
const MODE_COLORS: Record<string, string> = {
  SINGLE_MODEL: '#6366f1', ENSEMBLE: '#8b5cf6',
};
const AGREE_COLORS: Record<string, string> = {
  STRONG: '#22c55e', MODERATE: '#eab308', LOW: '#ef4444',
};

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
  const dist = data?.distribution;
  const cp = data?.clinicalPerformance;
  const mp = data?.modelPerformance ?? [];

  const total = ov?.totalAnalyses ?? 0;

  const predData = dist?.prediction
    ? Object.entries(dist.prediction).map(([name, value]) => ({ name, value, pct: total > 0 ? `${((value / total) * 100).toFixed(0)}%` : '0%' }))
    : [];

  const riskData = dist?.riskLevel
    ? Object.entries(dist.riskLevel)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const modeData = dist?.analysisMode
    ? Object.entries(dist.analysisMode)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  // Ensemble agreement from model performance
  const ensembleModel = mp.find((m) => m.modelName === 'Ensemble');
  const agreementData = ensembleModel?.strongAgreement != null
    ? [
        { name: 'STRONG', value: Math.round((ensembleModel.strongAgreement ?? 0) * (ensembleModel.totalRuns ?? 0)) },
        { name: 'MODERATE', value: Math.round((ensembleModel.moderateAgreement ?? 0) * (ensembleModel.totalRuns ?? 0)) },
        { name: 'LOW', value: Math.round((ensembleModel.lowAgreement ?? 0) * (ensembleModel.totalRuns ?? 0)) },
      ].filter((d) => d.value > 0)
    : [];

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : isError ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mb-3" />
          <p className="text-sm">{t('analytics_error')}</p>
        </CardContent></Card>
      ) : !data || total === 0 ? (
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

        {/* ── KPI Cards ──────────────────────────────────────── */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
          <KpiCard icon={<BarChart3 className="h-4 w-4" />} label={t('analytics_totalAnalyses')} value={ov!.totalAnalyses} />
          <KpiCard icon={<XCircle className="h-4 w-4 text-destructive" />} label={t('analytics_positive')} value={ov!.positiveResults} variant="destructive" />
          <KpiCard icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} label={t('analytics_negative')} value={ov!.negativeResults} variant="success" />
          <KpiCard icon={<Clock className="h-4 w-4 text-yellow-600" />} label={t('analytics_pending')} value={ov!.pendingReview} />
          <KpiCard icon={<ShieldCheck className="h-4 w-4 text-green-600" />} label={t('analytics_approved')} value={ov!.approved} variant="success" />
          <KpiCard icon={<XCircle className="h-4 w-4 text-destructive" />} label={t('analytics_rejected')} value={ov!.rejected} variant="destructive" />
          <KpiCard icon={<Activity className="h-4 w-4" />} label={t('singleModelBadge')} value={ov!.singleModelAnalyses} />
          <KpiCard icon={<Layers className="h-4 w-4" />} label={t('ensembleBadge')} value={ov!.ensembleAnalyses} />
        </div>

        {/* ── Clinical Outcome + Risk Severity ───────────────── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Clinical Outcome Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />{t('analytics_clinicalOutcome')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {predData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="h-[160px] w-[160px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={predData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                          innerRadius={45} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                          {predData.map((e) => (
                            <Cell key={e.name} fill={PRED_COLORS[e.name] || '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 flex-1">
                    {predData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PRED_COLORS[d.name] }} />
                          <span className="text-sm">{d.name}</span>
                        </div>
                        <div className="text-end">
                          <span className="text-sm font-bold tabular-nums">{d.value}</span>
                          <span className="text-xs text-muted-foreground ms-1">({d.pct})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyChart text={t('analytics_notEnoughChartData')} />
              )}
            </CardContent>
          </Card>

          {/* Risk Severity Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />{t('analytics_riskSeverity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskData.length > 0 ? (
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData} layout="vertical" margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {riskData.map((e) => (
                          <Cell key={e.name} fill={RISK_COLORS[e.name] || '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart text={t('analytics_notEnoughChartData')} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Analysis Type + Ensemble Agreement ─────────────── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Single vs Ensemble */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4" />{t('analytics_analysisType')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modeData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="h-[140px] w-[140px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={modeData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                          innerRadius={40} outerRadius={60} paddingAngle={3} strokeWidth={0}>
                          {modeData.map((e) => (
                            <Cell key={e.name} fill={MODE_COLORS[e.name] || '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 flex-1">
                    {modeData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: MODE_COLORS[d.name] }} />
                          <span className="text-sm">{d.name === 'ENSEMBLE' ? t('ensembleBadge') : t('singleModelBadge')}</span>
                        </div>
                        <span className="text-sm font-bold tabular-nums">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyChart text={t('analytics_notEnoughChartData')} />
              )}
            </CardContent>
          </Card>

          {/* Ensemble Agreement */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" />{t('analytics_ensembleAgreement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agreementData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="h-[140px] w-[140px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={agreementData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                          innerRadius={40} outerRadius={60} paddingAngle={3} strokeWidth={0}>
                          {agreementData.map((e) => (
                            <Cell key={e.name} fill={AGREE_COLORS[e.name] || '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 flex-1">
                    {agreementData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: AGREE_COLORS[d.name] }} />
                          <span className="text-sm">{t(`agreement_${d.name}`)}</span>
                        </div>
                        <span className="text-sm font-bold tabular-nums">{d.value}</span>
                      </div>
                    ))}
                    {ensembleModel?.averageAgreementScore != null && (
                      <div className="pt-1 border-t text-xs text-muted-foreground">
                        {t('analytics_avgAgreement')}: <span className="font-semibold">{(ensembleModel.averageAgreementScore * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyChart text={t('analytics_notEnoughEnsembleData')} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Model Performance Comparison ────────────────────── */}
        {mp.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />{t('analytics_modelPerf')}
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
                      <TableRow key={m.modelName} className={m.modelName === 'Ensemble' ? 'bg-primary/5' : ''}>
                        <TCell className="text-xs font-medium">
                          {m.modelName}
                          {m.modelName === 'Ensemble' && (
                            <Badge variant="default" className="ms-1.5 text-[8px] px-1 py-0">{t('ensembleBadge')}</Badge>
                          )}
                        </TCell>
                        <TCell className="text-xs text-end tabular-nums">{m.totalRuns}</TCell>
                        <TCell className="text-xs text-end tabular-nums text-destructive">{m.positive}</TCell>
                        <TCell className="text-xs text-end tabular-nums text-green-600">{m.negative}</TCell>
                        <TCell className="text-xs text-end tabular-nums">{(m.averageProbability * 100).toFixed(1)}%</TCell>
                        <TCell className="text-xs text-end tabular-nums">{(m.averageConfidence * 100).toFixed(1)}%</TCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Physician-Reviewed Performance Estimate ─────────── */}
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
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="text-center rounded-md border bg-muted/20 p-2">
                    <p className="text-muted-foreground">TP</p><p className="font-bold text-green-600">{cp.truePositive}</p>
                  </div>
                  <div className="text-center rounded-md border bg-muted/20 p-2">
                    <p className="text-muted-foreground">FP</p><p className="font-bold text-destructive">{cp.falsePositive}</p>
                  </div>
                  <div className="text-center rounded-md border bg-muted/20 p-2">
                    <p className="text-muted-foreground">TN</p><p className="font-bold text-green-600">{cp.trueNegative}</p>
                  </div>
                  <div className="text-center rounded-md border bg-muted/20 p-2">
                    <p className="text-muted-foreground">FN</p><p className="font-bold text-destructive">{cp.falseNegative}</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t('analytics_reviewedRecords')}: {cp.reviewedRecords}
                </p>
              </>
            ) : (
              <EmptyChart text={t('analytics_insufficientData')} />
            )}
            <Alert variant="default">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-[11px]">{t('analytics_clinicalPerfNote')}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* ── Clinical Disclaimer ─────────────────────────────── */}
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
  icon: React.ReactNode; label: string; value: number;
  variant?: 'destructive' | 'success';
}) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2.5">
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground leading-tight truncate">{label}</p>
          <p className={`text-lg font-bold tabular-nums ${variant === 'destructive' ? 'text-destructive' : variant === 'success' ? 'text-green-600' : ''}`}>
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

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-muted-foreground">
      <p className="text-sm text-center">{text}</p>
    </div>
  );
}
