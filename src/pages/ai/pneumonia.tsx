import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload, Scan, Eye, Trash2, AlertTriangle, CheckCircle2, XCircle,
  Loader2, Info, ChevronDown, ChevronUp, ShieldAlert, Stethoscope,
  Activity, BarChart3, FileText, Brain, Save, Search, User, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  usePneumoniaPredict, usePneumoniaExplain, usePneumoniaEnsemble,
  useCreatePneumoniaAnalysis,
  type PneumoniaPrediction, type PneumoniaExplanation,
  type PneumoniaEnsembleResult,
} from '@/hooks/use-pneumonia';
import { usePatients, type PatientProfile } from '@/hooks/use-patients';

const MAX_SIZE_MB = 10;
const ACCEPTED = '.jpg,.jpeg,.png';

// ── Helpers (UI-only, no model logic) ───────────────────────────────

type Risk = 'low' | 'moderate' | 'elevated' | 'high';

function getRiskLevel(prob: number): Risk {
  if (prob >= 0.94) return 'high';
  if (prob >= 0.70) return 'elevated';
  if (prob >= 0.30) return 'moderate';
  return 'low';
}

const RISK_COLORS: Record<Risk, string> = {
  low: 'bg-green-100 text-green-800 border-green-300',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  elevated: 'bg-orange-100 text-orange-800 border-orange-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

const RISK_BAR: Record<Risk, string> = {
  low: 'bg-green-500', moderate: 'bg-yellow-500',
  elevated: 'bg-orange-500', high: 'bg-red-500',
};

const pct = (v: number) => (v * 100).toFixed(1);

function getPatientName(patient: PatientProfile): string {
  const fromNational = [
    patient.nationalPatient?.firstName,
    patient.nationalPatient?.lastName,
  ].filter(Boolean).join(' ');
  if (fromNational) return fromNational;
  const fromUser = [patient.user?.firstName, patient.user?.lastName]
    .filter(Boolean).join(' ');
  return fromUser || patient.user?.email || '---';
}

// ── Static benchmark data (from model comparison study) ─────────────

const BENCHMARK = {
  densenet121: { recall: '97.9%', specificity: '87.0%', f1: '95.2%', auc: '97.75%', size: '80.5 MB', speed: '1.7 ms', fn: '8', fp: '30', role: 'liveDefault', verdict: 'cds_verdictDense' },
  efficientnet_b0: { recall: '96.9%', specificity: '84.4%', f1: '94.0%', auc: '94.57%', size: '46.4 MB', speed: '0.9 ms', fn: '12', fp: '36', role: 'benchmarkResearch', verdict: 'cds_verdictEff' },
  resnet50: { recall: '96.9%', specificity: '82.7%', f1: '93.5%', auc: '94.70%', size: '269.5 MB', speed: '0.5 ms', fn: '12', fp: '40', role: 'benchmarkResearch', verdict: 'cds_verdictRes' },
};

// ═════════════════════════════════════════════════════════════════════

export default function PneumoniaPage() {
  const { t } = useTranslation('ai');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Patient selection
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const { data: patientsData, isLoading: patientsLoading } = usePatients({
    limit: 100,
    search: patientSearch || undefined,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PneumoniaPrediction | PneumoniaExplanation | PneumoniaEnsembleResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'SINGLE_MODEL' | 'ENSEMBLE'>('ENSEMBLE');

  const predict = usePneumoniaPredict();
  const explain = usePneumoniaExplain();
  const ensemble = usePneumoniaEnsemble();
  const saveAnalysis = useCreatePneumoniaAnalysis();
  const isPending = predict.isPending || explain.isPending || ensemble.isPending;

  const selectedPatient = patientsData?.data?.find((p) => p.id === selectedPatientId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { toast({ title: t('pneumoniaFileTooLarge'), variant: 'destructive' }); return; }
    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) { toast({ title: t('pneumoniaInvalidType'), variant: 'destructive' }); return; }
    setSelectedFile(file); setPreview(URL.createObjectURL(file)); setResult(null); setShowDetails(false); setSavedRecordId(null);
  };

  const handleClear = () => {
    setSelectedFile(null); if (preview) URL.revokeObjectURL(preview);
    setPreview(null); setResult(null); setShowDetails(false); setSavedRecordId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePredict = async () => {
    if (!selectedFile) return;
    setSavedRecordId(null);
    try {
      if (analysisMode === 'ENSEMBLE') {
        setResult(await ensemble.mutateAsync(selectedFile));
      } else {
        setResult(await predict.mutateAsync(selectedFile));
      }
    } catch (err) { toast({ title: err instanceof Error ? err.message : t('pneumoniaError'), variant: 'destructive' }); }
  };

  const handleExplain = async () => {
    if (!selectedFile) return;
    setSavedRecordId(null);
    try {
      if (analysisMode === 'ENSEMBLE') {
        // Ensemble endpoint always includes Grad-CAM from DenseNet121
        setResult(await ensemble.mutateAsync(selectedFile));
      } else {
        setResult(await explain.mutateAsync(selectedFile));
      }
    } catch (err) { toast({ title: err instanceof Error ? err.message : t('pneumoniaError'), variant: 'destructive' }); }
  };

  const handleSaveToRecord = async () => {
    if (!selectedFile || !selectedPatientId) return;
    try {
      const record = await saveAnalysis.mutateAsync({
        file: selectedFile,
        patientProfileId: selectedPatientId,
        includeGradcam: true,
        analysisMode,
      });
      setSavedRecordId(record.id);
      toast({ title: t('saveSuccess'), description: t('saveSuccessDesc') });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : t('pneumoniaError'),
        variant: 'destructive',
      });
    }
  };

  const hasExplanation = result && 'explainability' in result;
  const isEnsembleResult = result && 'ensemble' in result;
  const ensembleData = isEnsembleResult ? (result as PneumoniaEnsembleResult).ensemble : null;
  const risk = result ? getRiskLevel(result.probability) : null;
  const probStr = result ? pct(result.probability) : '0';
  const threshStr = result ? pct(result.threshold) : '94';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('pneumoniaTitle')}</h1>
        <p className="text-muted-foreground">{t('pneumoniaSubtitle')}</p>
      </div>

      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('pneumoniaDisclaimerTitle')}</AlertTitle>
        <AlertDescription>{t('finalClinicalDisclaimer')}</AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Upload + Patient ──────────────────────────────────── */}
        <div className="space-y-4">
          {/* Patient selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />{t('selectPatient')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPatient')}
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="ps-9"
                />
              </div>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectPatientPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">{tCommon('loading')}</div>
                  ) : patientsData?.data?.length ? (
                    patientsData.data.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {getPatientName(p)}
                        {p.nationalPatient?.syrianNationalId && (
                          <span className="text-muted-foreground ms-2 text-xs">
                            ({p.nationalPatient.syrianNationalId})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">{t('noPatients')}</div>
                  )}
                </SelectContent>
              </Select>
              {selectedPatient && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {getPatientName(selectedPatient)}
                  {selectedPatient.nationalPatient?.syrianNationalId && (
                    <span> - {selectedPatient.nationalPatient.syrianNationalId}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" />{t('pneumoniaUpload')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input ref={fileInputRef} type="file" accept={ACCEPTED} onChange={handleFileSelect}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
              <p className="text-xs text-muted-foreground">{t('pneumoniaFileHelp')}</p>
              {preview && (
                <div className="relative rounded-lg overflow-hidden border bg-muted">
                  <img src={preview} alt="X-ray" className="w-full h-auto max-h-[300px] object-contain" />
                </div>
              )}
              {/* Analysis mode selector */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('analysisMode')}</Label>
                <div className="flex gap-2">
                  <Button
                    variant={analysisMode === 'ENSEMBLE' ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 flex-1"
                    onClick={() => setAnalysisMode('ENSEMBLE')}
                  >
                    <Layers className="h-3.5 w-3.5" />{t('ensembleMode')}
                  </Button>
                  <Button
                    variant={analysisMode === 'SINGLE_MODEL' ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 flex-1"
                    onClick={() => setAnalysisMode('SINGLE_MODEL')}
                  >
                    <Activity className="h-3.5 w-3.5" />{t('singleModelMode')}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {analysisMode === 'ENSEMBLE' ? t('ensembleModeDesc') : t('singleModelModeDesc')}
                </p>
              </div>

              <Separator />

              <div className="flex gap-2 flex-wrap">
                <Button onClick={handlePredict} disabled={!selectedFile || isPending} className="gap-2">
                  {predict.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}{t('pneumoniaAnalyze')}
                </Button>
                <Button onClick={handleExplain} disabled={!selectedFile || isPending} variant="outline" className="gap-2">
                  {explain.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}{t('pneumoniaExplain')}
                </Button>
                <Button onClick={handleClear} disabled={isPending} variant="ghost" className="gap-2">
                  <Trash2 className="h-4 w-4" />{t('pneumoniaClear')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Results ────────────────────────────────────────────── */}
        <div className="space-y-4">
          {isPending ? (
            <Card><CardContent className="p-6 space-y-3">
              <Skeleton className="h-16 w-full" /><Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/2" /><Skeleton className="h-[200px] w-full" />
            </CardContent></Card>
          ) : result ? (<>

            {/* ── Save to Patient Record ─────────────────────── */}
            {selectedPatientId && !savedRecordId && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-sm">
                      <p className="font-medium">{t('saveToRecord')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('saveToRecordDesc', { patient: selectedPatient ? getPatientName(selectedPatient) : '' })}
                      </p>
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {analysisMode === 'ENSEMBLE' ? t('ensembleMode') : t('singleModelMode')}
                      </Badge>
                    </div>
                    <Button
                      onClick={handleSaveToRecord}
                      disabled={saveAnalysis.isPending}
                      className="gap-2"
                    >
                      {saveAnalysis.isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Save className="h-4 w-4" />}
                      {analysisMode === 'ENSEMBLE' ? t('saveEnsembleAnalysis') : t('saveAnalysis')}
                    </Button>
                  </div>
                  {saveAnalysis.isPending && analysisMode === 'ENSEMBLE' && (
                    <p className="text-[10px] text-muted-foreground mt-2">{t('ensembleRunning')}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {savedRecordId && (
              <Alert variant="default" className="border-green-300 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">{t('saveSuccess')}</AlertTitle>
                <AlertDescription className="text-green-700 text-xs">
                  {t('saveSuccessDesc')}
                </AlertDescription>
              </Alert>
            )}

            {!selectedPatientId && (
              <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {t('selectPatientToSave')}
                </AlertDescription>
              </Alert>
            )}

            {/* ── Live Model Result Card ──────────────────────── */}
            <Card className={`border-2 ${result.isPositive ? 'border-destructive/40' : 'border-green-500/40'}`}>
              <CardContent className="p-4 space-y-4">
                {/* Header: model name + role + decision */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {isEnsembleResult ? (
                      <>
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">{t('finalConsensus')}</span>
                        <Badge variant="default" className="text-[9px]">{t('ensembleBadge')}</Badge>
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">DenseNet121</span>
                        <Badge variant="success" className="text-[9px]">{t('cds_liveDefault')}</Badge>
                      </>
                    )}
                  </div>
                  <Badge variant={result.isPositive ? 'destructive' : 'success'} className="text-sm px-3 py-1 gap-1.5">
                    {result.isPositive ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    {result.isPositive ? t('aiScreeningPositive') : t('aiScreeningNegative')}
                  </Badge>
                </div>

                {/* Decision explanation */}
                <p className="text-xs text-muted-foreground">
                  {result.isPositive
                    ? t('probabilityAboveThreshold', { prob: probStr, threshold: threshStr })
                    : t('probabilityBelowThreshold', { prob: probStr, threshold: threshStr })}
                </p>

                {/* KPI row: 4 metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground leading-tight">{t('pneumoniaProbability')}</p>
                    <p className={`text-lg font-bold tabular-nums ${result.isPositive ? 'text-destructive' : ''}`}>{probStr}%</p>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground leading-tight">{t('pneumoniaThreshold')}</p>
                    <p className="text-lg font-bold tabular-nums text-muted-foreground">{threshStr}%</p>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground leading-tight">{t('riskLevel')}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border inline-block mt-1 ${risk ? RISK_COLORS[risk] : ''}`}>{t(`risk_${risk}`)}</span>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground leading-tight">{t('pneumoniaConfidence')}</p>
                    <p className="text-lg font-bold tabular-nums">{pct(result.confidence)}%</p>
                  </div>
                </div>

                {/* Probability bar with threshold tick */}
                <div className="space-y-1">
                  <div className="relative h-3">
                    <div className="absolute inset-0 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${risk ? RISK_BAR[risk] : 'bg-green-500'}`}
                        style={{ width: `${result.probability * 100}%` }} />
                    </div>
                    <div className="absolute top-0 h-3 w-0.5 bg-foreground/80 rounded-full"
                      style={{ insetInlineStart: `${result.threshold * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground tabular-nums">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>

                {/* Medical interpretation */}
                <div className="rounded-md bg-muted/30 p-2.5">
                  <p className="text-xs text-muted-foreground">{t(`cds_interp_${risk}`)}</p>
                </div>
              </CardContent>
            </Card>

            {/* ── Ensemble Model Breakdown ──────────────────────── */}
            {isEnsembleResult && ensembleData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />{t('modelBreakdown')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Agreement & Method KPIs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground leading-tight">{t('modelAgreement')}</p>
                      <p className="text-sm font-semibold mt-1">{t(`agreement_${ensembleData.modelAgreement}`)}</p>
                    </div>
                    <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground leading-tight">{t('agreementScore')}</p>
                      <p className="text-sm font-semibold mt-1 tabular-nums">{(ensembleData.agreementScore * 100).toFixed(0)}%</p>
                    </div>
                    <div className="rounded-md border bg-muted/20 p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground leading-tight">{t('ensembleMethodLabel')}</p>
                      <p className="text-sm font-semibold mt-1">{t('weightedAverage')}</p>
                    </div>
                  </div>

                  {/* Individual model results */}
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
                        {ensembleData.models.map((m) => (
                          <TableRow key={m.modelName}>
                            <TableCell className="text-xs font-medium">{m.modelName}</TableCell>
                            <TableCell className="text-xs text-end tabular-nums">{(m.probability * 100).toFixed(1)}%</TableCell>
                            <TableCell>
                              <Badge variant={m.prediction === 'PNEUMONIA' ? 'destructive' : 'success'} className="text-[10px]">
                                {m.prediction}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-end tabular-nums">
                              {ensembleData.weights[m.modelName] != null
                                ? `${(ensembleData.weights[m.modelName] * 100).toFixed(0)}%`
                                : '---'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Final consensus line */}
                  <div className="rounded-md bg-muted/30 p-2.5 text-xs text-muted-foreground">
                    <span className="font-medium">{t('finalConsensus')}:</span>{' '}
                    {probStr}% ({t('weightedAverage')})
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── S5: Radiology Summary ─────────────────────────── */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />{t('cds_radiologySummary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-xs text-muted-foreground">{t('cds_findings')}</p>
                  <p className="text-muted-foreground">{result.isPositive ? t('cds_findingsPositive') : t('cds_findingsNegative')}</p>
                </div>
                <div>
                  <p className="font-medium text-xs text-muted-foreground">{t('cds_impression')}</p>
                  <p className="text-muted-foreground">{result.isPositive ? t('cds_impressionPositive') : t('cds_impressionNegative')}</p>
                </div>
                <div>
                  <p className="font-medium text-xs text-muted-foreground">{t('cds_significance')}</p>
                  <p className="text-muted-foreground">{result.isPositive ? t('cds_significancePositive') : t('cds_significanceNegative')}</p>
                </div>
              </CardContent>
            </Card>

            {/* ── S7: Clinical Recommendation ───────────────────── */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />{t('clinicalRecommendation')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {result.isPositive ? t('cds_rec_high') : risk === 'elevated' ? t('cds_rec_elevated') : risk === 'moderate' ? t('cds_rec_moderate') : t('cds_rec_low')}
                </p>
              </CardContent>
            </Card>

            {/* ── S6: Grad-CAM ──────────────────────────────────── */}
            {hasExplanation && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" />{t('cds_gradcamTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="outline" className="text-[10px]">DenseNet121 Grad-CAM</Badge>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('pneumoniaOverlay')}</p>
                      <img src={`data:image/png;base64,${(result as PneumoniaExplanation).explainability.overlayImageBase64}`} alt="Overlay" className="w-full rounded-lg border" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('pneumoniaHeatmap')}</p>
                      <img src={`data:image/png;base64,${(result as PneumoniaExplanation).explainability.heatmapImageBase64}`} alt="Heatmap" className="w-full rounded-lg border" />
                    </div>
                  </div>
                  <Alert variant="default">
                    <Info className="h-3 w-3" />
                    <AlertDescription className="text-[11px]">{t('gradcamInterpretationWarning')}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* ── S2: Multi-Model Benchmark ─────────────────────── */}
            <Card>
              <CardHeader className="pb-2">
                <button onClick={() => setShowBenchmark(!showBenchmark)}
                  className="flex items-center gap-2 text-sm font-semibold w-full">
                  <BarChart3 className="h-4 w-4" />
                  {t('cds_modelComparison')}
                  {showBenchmark ? <ChevronUp className="h-3 w-3 ms-auto" /> : <ChevronDown className="h-3 w-3 ms-auto" />}
                </button>
              </CardHeader>
              {showBenchmark && (
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{t('cds_benchmarkNote')}</p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{t('pneumoniaModel')}</TableHead>
                          <TableHead className="text-xs">{t('cds_role')}</TableHead>
                          <TableHead className="text-xs text-end">{t('cds_recall')}</TableHead>
                          <TableHead className="text-xs text-end">{t('cds_spec')}</TableHead>
                          <TableHead className="text-xs text-end">F1</TableHead>
                          <TableHead className="text-xs text-end">AUC</TableHead>
                          <TableHead className="text-xs text-end">FN</TableHead>
                          <TableHead className="text-xs text-end">FP</TableHead>
                          <TableHead className="text-xs">{t('cds_clinicalVerdict')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(BENCHMARK).map(([key, b]) => (
                          <TableRow key={key} className={b.role === 'liveDefault' ? 'bg-primary/5' : ''}>
                            <TableCell className="text-xs font-medium">{key === 'densenet121' ? 'DenseNet121' : key === 'efficientnet_b0' ? 'EfficientNet-B0' : 'ResNet50'}</TableCell>
                            <TableCell>
                              <Badge variant={b.role === 'liveDefault' ? 'success' : 'secondary'} className="text-[9px]">
                                {t(b.role === 'liveDefault' ? 'cds_liveDefault' : 'cds_benchmark')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-end">{b.recall}</TableCell>
                            <TableCell className="text-xs text-end">{b.specificity}</TableCell>
                            <TableCell className="text-xs text-end">{b.f1}</TableCell>
                            <TableCell className="text-xs text-end">{b.auc}</TableCell>
                            <TableCell className="text-xs text-end font-medium">{b.fn}</TableCell>
                            <TableCell className="text-xs text-end">{b.fp}</TableCell>
                            <TableCell className="text-[10px] text-muted-foreground">{t(b.verdict)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t('cds_benchmarkConclusion')}</p>
                </CardContent>
              )}
            </Card>

            {/* ── Technical Details ──────────────────────────────── */}
            <button onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-1">
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {t('modelDetails')}
            </button>
            {showDetails && (
              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 rounded-md p-3">
                <div><p className="text-muted-foreground">{t('rawProbability')}</p><p className="font-mono">{result.probability}</p></div>
                <div><p className="text-muted-foreground">{t('rawConfidence')}</p><p className="font-mono">{result.confidence}</p></div>
                <div><p className="text-muted-foreground">{t('pneumoniaModel')}</p><p className="font-mono">{result.modelVersion}</p></div>
                <div><p className="text-muted-foreground">{t('pneumoniaDevice')}</p><p className="font-mono">{result.device}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">{t('confidenceNote')}</p></div>
              </div>
            )}

            {/* ── Final Disclaimer ──────────────────────────────── */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">{t('finalClinicalDisclaimer')}</AlertDescription>
            </Alert>

          </>) : (
            <Card><CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Scan className="h-12 w-12 mb-3" />
                <p className="text-sm">{t('pneumoniaEmpty')}</p>
              </div>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
