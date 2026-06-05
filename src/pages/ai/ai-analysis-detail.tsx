import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Eye, CheckCircle2, XCircle, Clock, ShieldCheck,
  User, Activity, FileText, Stethoscope, AlertTriangle, Info,
  Loader2, Layers, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useAiAnalysis, useReviewAiAnalysis, type ModelResult } from '@/hooks/use-pneumonia';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const STATUS_BADGE: Record<string, 'warning' | 'secondary' | 'success' | 'destructive'> = {
  PENDING_REVIEW: 'warning',
  REVIEWED: 'secondary',
  APPROVED: 'success',
  REJECTED: 'destructive',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING_REVIEW: <Clock className="h-3.5 w-3.5" />,
  REVIEWED: <Eye className="h-3.5 w-3.5" />,
  APPROVED: <CheckCircle2 className="h-3.5 w-3.5" />,
  REJECTED: <XCircle className="h-3.5 w-3.5" />,
};

type Risk = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
const RISK_COLORS: Record<Risk, string> = {
  LOW: 'bg-green-100 text-green-800 border-green-300',
  MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ELEVATED: 'bg-orange-100 text-orange-800 border-orange-300',
  HIGH: 'bg-red-100 text-red-800 border-red-300',
};

const RISK_BAR: Record<Risk, string> = {
  LOW: 'bg-green-500', MODERATE: 'bg-yellow-500',
  ELEVATED: 'bg-orange-500', HIGH: 'bg-red-500',
};

function imageUrl(path: string | null): string | null {
  if (!path) return null;
  // path is like /uploads/ai/pneumonia/...
  // The backend serves static files at /uploads/ prefix (no /api)
  const base = API_BASE.replace(/\/api\/?$/, '');
  return `${base}${path}`;
}

export default function AiAnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('ai');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const { data: record, isLoading } = useAiAnalysis(id);
  const reviewMutation = useReviewAiAnalysis();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string>('');
  const [doctorComment, setDoctorComment] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p>{t('analysisNotFound')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/ai/analyses')}>
          <ArrowLeft className="h-4 w-4 me-2" />{t('backToList')}
        </Button>
      </div>
    );
  }

  const isPositive = record.prediction === 'PNEUMONIA';
  const risk = record.riskLevel as Risk;
  const prob = (record.probability * 100).toFixed(1);
  const thresh = (record.threshold * 100).toFixed(1);
  const conf = (record.confidence * 100).toFixed(1);
  const np = record.patientProfile?.nationalPatient;
  const patientName = np ? [np.firstName, np.lastName].filter(Boolean).join(' ') : '---';
  const requestedBy = [record.requestedBy?.firstName, record.requestedBy?.lastName].filter(Boolean).join(' ') || record.requestedBy?.email;
  const reviewedBy = record.reviewedBy
    ? [record.reviewedBy.firstName, record.reviewedBy.lastName].filter(Boolean).join(' ') || record.reviewedBy.email
    : null;

  const isEnsemble = record.analysisMode === 'ENSEMBLE';
  const modelResults = (record.modelResultsJson as ModelResult[] | null) ?? [];
  const ensembleWeights = (record.ensembleWeightsJson as Record<string, number> | null) ?? {};

  const canReview = record.status === 'PENDING_REVIEW' || record.status === 'REVIEWED';

  const allowedTransitions: Record<string, string[]> = {
    PENDING_REVIEW: ['REVIEWED', 'APPROVED', 'REJECTED'],
    REVIEWED: ['APPROVED', 'REJECTED'],
  };
  const possibleStatuses = allowedTransitions[record.status] || [];

  const handleReview = async () => {
    if (!reviewStatus || !id) return;
    if (reviewStatus === 'REJECTED' && !doctorComment.trim()) {
      toast({ title: t('rejectRequiresComment'), variant: 'destructive' });
      return;
    }
    try {
      await reviewMutation.mutateAsync({
        id,
        status: reviewStatus,
        doctorComment: doctorComment || undefined,
      });
      setReviewOpen(false);
      toast({ title: t('reviewSuccess') });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : t('pneumoniaError'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate('/ai/analyses')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight">{t('analysisDetail')}</h1>
          <p className="text-sm text-muted-foreground truncate">ID: {record.id}</p>
        </div>
        {record.analysisMode === 'ENSEMBLE' ? (
          <Badge variant="default" className="text-xs gap-1">
            <Layers className="h-3 w-3" />{t('ensembleBadge')}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs gap-1">
            <Activity className="h-3 w-3" />{t('singleModelBadge')}
          </Badge>
        )}
        <Badge variant={STATUS_BADGE[record.status] || 'secondary'} className="text-sm gap-1.5 px-3 py-1">
          {STATUS_ICON[record.status]}
          {t(`status_${record.status}`)}
        </Badge>
        {canReview && (
          <Button onClick={() => { setReviewOpen(true); setReviewStatus(''); setDoctorComment(''); }}>
            <ShieldCheck className="h-4 w-4 me-2" />{t('reviewAction')}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Images */}
        <div className="space-y-4">
          {/* Original image */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t('originalImage')}</CardTitle>
            </CardHeader>
            <CardContent>
              {record.originalImageUrl ? (
                <img
                  src={imageUrl(record.originalImageUrl)!}
                  alt="Original X-ray"
                  className="w-full rounded-lg border bg-muted object-contain max-h-[400px]"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm bg-muted rounded-lg">
                  {t('noImage')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grad-CAM images */}
          {(record.heatmapImageUrl || record.overlayImageUrl) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4" />{t('cds_gradcamTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEnsemble && (
                  <Badge variant="outline" className="text-[10px]">
                    {t('gradcamSourceModel')}: DenseNet121
                  </Badge>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {record.overlayImageUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('pneumoniaOverlay')}</p>
                      <img src={imageUrl(record.overlayImageUrl)!} alt="Overlay" className="w-full rounded-lg border" />
                    </div>
                  )}
                  {record.heatmapImageUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('pneumoniaHeatmap')}</p>
                      <img src={imageUrl(record.heatmapImageUrl)!} alt="Heatmap" className="w-full rounded-lg border" />
                    </div>
                  )}
                </div>
                <Alert variant="default">
                  <Info className="h-3 w-3" />
                  <AlertDescription className="text-[11px]">{t('gradcamInterpretationWarning')}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-4">
          {/* Patient info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />{t('patientInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('colPatient')}</span>
                <span className="font-medium">{patientName}</span>
              </div>
              {np?.syrianNationalId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('nationalId')}</span>
                  <span className="font-mono text-xs">{np.syrianNationalId}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('colRequestedBy')}</span>
                <span>{requestedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('colDate')}</span>
                <span>{new Date(record.createdAt).toLocaleString()}</span>
              </div>
              {reviewedBy && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('reviewedBy')}</span>
                    <span>{reviewedBy}</span>
                  </div>
                  {record.reviewedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('reviewedAt')}</span>
                      <span>{new Date(record.reviewedAt).toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* AI Result */}
          <Card className={`border-2 ${isPositive ? 'border-destructive/40' : 'border-green-500/40'}`}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{record.modelVersion}</span>
                </div>
                <Badge variant={isPositive ? 'destructive' : 'success'} className="text-sm px-3 py-1 gap-1.5">
                  {isPositive ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  {isPositive ? t('aiScreeningPositive') : t('aiScreeningNegative')}
                </Badge>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground leading-tight">{t('pneumoniaProbability')}</p>
                  <p className={`text-lg font-bold tabular-nums ${isPositive ? 'text-destructive' : ''}`}>{prob}%</p>
                </div>
                <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground leading-tight">{t('pneumoniaThreshold')}</p>
                  <p className="text-lg font-bold tabular-nums text-muted-foreground">{thresh}%</p>
                </div>
                <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground leading-tight">{t('riskLevel')}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border inline-block mt-1 ${RISK_COLORS[risk] || ''}`}>
                    {t(`risk_${risk.toLowerCase()}`)}
                  </span>
                </div>
                <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground leading-tight">{t('pneumoniaConfidence')}</p>
                  <p className="text-lg font-bold tabular-nums">{conf}%</p>
                </div>
              </div>

              {/* Probability bar */}
              <div className="space-y-1">
                <div className="relative h-3">
                  <div className="absolute inset-0 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${RISK_BAR[risk] || 'bg-green-500'}`}
                      style={{ width: `${record.probability * 100}%` }} />
                  </div>
                  <div className="absolute top-0 h-3 w-0.5 bg-foreground/80 rounded-full"
                    style={{ insetInlineStart: `${record.threshold * 100}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground tabular-nums">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              {/* Interpretation */}
              <div className="rounded-md bg-muted/30 p-2.5">
                <p className="text-xs text-muted-foreground">{t(`cds_interp_${risk.toLowerCase()}`)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ensemble Breakdown (only for ensemble records) */}
          {isEnsemble && modelResults.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />{t('modelBreakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agreement & Method */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground leading-tight">{t('modelAgreement')}</p>
                    <p className="text-sm font-semibold mt-1">
                      {record.modelAgreement ? t(`agreement_${record.modelAgreement}`) : '---'}
                    </p>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground leading-tight">{t('agreementScore')}</p>
                    <p className="text-sm font-semibold mt-1 tabular-nums">
                      {record.agreementScore != null ? `${(record.agreementScore * 100).toFixed(0)}%` : '---'}
                    </p>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground leading-tight">{t('ensembleMethodLabel')}</p>
                    <p className="text-sm font-semibold mt-1">{t('weightedAverage')}</p>
                  </div>
                </div>

                {/* Individual model results table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('pneumoniaModel')}</TableHead>
                        <TableHead className="text-xs text-end">{t('pneumoniaProbability')}</TableHead>
                        <TableHead className="text-xs">{t('colPrediction')}</TableHead>
                        <TableHead className="text-xs text-end">{t('ensembleWeights')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modelResults.map((m) => (
                        <TableRow key={m.modelName}>
                          <TableCell className="text-xs font-medium">{m.modelName}</TableCell>
                          <TableCell className="text-xs text-end tabular-nums">
                            {(m.probability * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={m.prediction === 'PNEUMONIA' ? 'destructive' : 'success'}
                              className="text-[10px]"
                            >
                              {m.prediction}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-end tabular-nums">
                            {ensembleWeights[m.modelName] != null
                              ? `${(ensembleWeights[m.modelName] * 100).toFixed(0)}%`
                              : '---'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Final consensus summary */}
                <div className="rounded-md bg-muted/30 p-2.5 text-xs text-muted-foreground">
                  <span className="font-medium">{t('finalConsensus')}:</span>{' '}
                  {prob}% ({t('weightedAverage')})
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clinical Recommendation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />{t('clinicalRecommendation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t(`cds_rec_${risk.toLowerCase()}`)}
              </p>
            </CardContent>
          </Card>

          {/* Doctor comment */}
          {record.doctorComment && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />{t('doctorComment')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{record.doctorComment}</p>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{t('finalClinicalDisclaimer')}</AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reviewDialogTitle')}</DialogTitle>
            <DialogDescription>{t('reviewDialogDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('reviewStatusLabel')}</Label>
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {possibleStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`status_${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('doctorCommentLabel')}</Label>
              <Textarea
                placeholder={t('doctorCommentPlaceholder')}
                value={doctorComment}
                onChange={(e) => setDoctorComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>{tCommon('cancel')}</Button>
            <Button onClick={handleReview} disabled={!reviewStatus || reviewMutation.isPending} className="gap-2">
              {reviewMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('submitReview')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
