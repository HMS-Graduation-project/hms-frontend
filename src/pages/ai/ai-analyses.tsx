import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search, Filter, Eye, Clock, CheckCircle2, XCircle, ShieldCheck,
  ChevronLeft, ChevronRight, Brain, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAiAnalyses, type AiAnalysisRecord } from '@/hooks/use-pneumonia';

const STATUS_BADGE: Record<string, 'warning' | 'secondary' | 'success' | 'destructive'> = {
  PENDING_REVIEW: 'warning',
  REVIEWED: 'secondary',
  APPROVED: 'success',
  REJECTED: 'destructive',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING_REVIEW: <Clock className="h-3 w-3" />,
  REVIEWED: <Eye className="h-3 w-3" />,
  APPROVED: <CheckCircle2 className="h-3 w-3" />,
  REJECTED: <XCircle className="h-3 w-3" />,
};

function getPatientName(r: AiAnalysisRecord): string {
  const np = r.patientProfile?.nationalPatient;
  if (np) return [np.firstName, np.lastName].filter(Boolean).join(' ');
  return '---';
}

function getRequestedByName(r: AiAnalysisRecord): string {
  const u = r.requestedBy;
  return [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email || '---';
}

export default function AiAnalysesPage() {
  const { t } = useTranslation('ai');
  const { t: tCommon } = useTranslation('common');

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading } = useAiAnalyses({
    page,
    limit: 10,
    status: statusFilter || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const analyses = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('analysesTitle')}</h1>
        <p className="text-muted-foreground">{t('analysesSubtitle')}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('filterStatus')}</label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('allStatuses')}</SelectItem>
                  <SelectItem value="PENDING_REVIEW">{t('status_PENDING_REVIEW')}</SelectItem>
                  <SelectItem value="REVIEWED">{t('status_REVIEWED')}</SelectItem>
                  <SelectItem value="APPROVED">{t('status_APPROVED')}</SelectItem>
                  <SelectItem value="REJECTED">{t('status_REJECTED')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('filterFrom')}</label>
              <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-[160px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('filterTo')}</label>
              <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="w-[160px]" />
            </div>
            {(statusFilter || fromDate || toDate) && (
              <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(''); setFromDate(''); setToDate(''); setPage(1); }}>
                {t('clearFilters')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Brain className="h-12 w-12 mb-3" />
              <p className="text-sm">{t('noAnalyses')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('colPatient')}</TableHead>
                    <TableHead className="text-xs">{t('colPrediction')}</TableHead>
                    <TableHead className="text-xs text-end">{t('pneumoniaProbability')}</TableHead>
                    <TableHead className="text-xs">{t('riskLevel')}</TableHead>
                    <TableHead className="text-xs">{t('colStatus')}</TableHead>
                    <TableHead className="text-xs">{t('colRequestedBy')}</TableHead>
                    <TableHead className="text-xs">{t('colDate')}</TableHead>
                    <TableHead className="text-xs w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm font-medium">{getPatientName(a)}</TableCell>
                      <TableCell>
                        <Badge variant={a.prediction === 'PNEUMONIA' ? 'destructive' : 'success'} className="text-xs">
                          {a.prediction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-end tabular-nums">
                        {(a.probability * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{a.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[a.status] || 'secondary'} className="text-xs gap-1">
                          {STATUS_ICON[a.status]}
                          {t(`status_${a.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{getRequestedByName(a)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/ai/analyses/${a.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t('pageInfo', { page: meta.page, total: meta.totalPages, count: meta.total })}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
