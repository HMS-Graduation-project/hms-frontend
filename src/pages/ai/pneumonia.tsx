import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  Scan,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  usePneumoniaPredict,
  usePneumoniaExplain,
  type PneumoniaPrediction,
  type PneumoniaExplanation,
} from '@/hooks/use-pneumonia';

const MAX_SIZE_MB = 10;
const ACCEPTED = '.jpg,.jpeg,.png';

// UI-only risk levels derived from probability (does not change model logic)
function getRiskLevel(probability: number): 'low' | 'moderate' | 'elevated' | 'high' {
  if (probability >= 0.94) return 'high';
  if (probability >= 0.70) return 'elevated';
  if (probability >= 0.30) return 'moderate';
  return 'low';
}

const RISK_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-300',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  elevated: 'bg-orange-100 text-orange-800 border-orange-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

const RISK_BAR_COLORS = {
  low: 'bg-green-500',
  moderate: 'bg-yellow-500',
  elevated: 'bg-orange-500',
  high: 'bg-red-500',
};

export default function PneumoniaPage() {
  const { t } = useTranslation('ai');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PneumoniaPrediction | PneumoniaExplanation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const predict = usePneumoniaPredict();
  const explain = usePneumoniaExplain();
  const isPending = predict.isPending || explain.isPending;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({ title: t('pneumoniaFileTooLarge'), variant: 'destructive' });
      return;
    }
    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      toast({ title: t('pneumoniaInvalidType'), variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setShowDetails(false);
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setShowDetails(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePredict = async () => {
    if (!selectedFile) return;
    try {
      setResult(await predict.mutateAsync(selectedFile));
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : t('pneumoniaError'), variant: 'destructive' });
    }
  };

  const handleExplain = async () => {
    if (!selectedFile) return;
    try {
      setResult(await explain.mutateAsync(selectedFile));
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : t('pneumoniaError'), variant: 'destructive' });
    }
  };

  const hasExplanation = result && 'explainability' in result;
  const risk = result ? getRiskLevel(result.probability) : null;
  const probPct = result ? (result.probability * 100).toFixed(1) : '0';
  const threshPct = result ? (result.threshold * 100).toFixed(0) : '94';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('pneumoniaTitle')}</h1>
        <p className="text-muted-foreground">{t('pneumoniaSubtitle')}</p>
      </div>

      {/* Clinical disclaimer */}
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('pneumoniaDisclaimerTitle')}</AlertTitle>
        <AlertDescription>{t('finalClinicalDisclaimer')}</AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t('pneumoniaUpload')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED}
              onChange={handleFileSelect}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">{t('pneumoniaFileHelp')}</p>

            {preview && (
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                <img src={preview} alt="Chest X-ray preview" className="w-full h-auto max-h-[300px] object-contain" />
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button onClick={handlePredict} disabled={!selectedFile || isPending} className="gap-2">
                {predict.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                {t('pneumoniaAnalyze')}
              </Button>
              <Button onClick={handleExplain} disabled={!selectedFile || isPending} variant="outline" className="gap-2">
                {explain.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                {t('pneumoniaExplain')}
              </Button>
              <Button onClick={handleClear} disabled={isPending} variant="ghost" className="gap-2">
                <Trash2 className="h-4 w-4" />
                {t('pneumoniaClear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('pneumoniaResult')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* 1. Screening Status */}
                <div className={`rounded-lg border p-4 ${result.isPositive ? 'border-destructive/50 bg-destructive/5' : 'border-green-500/50 bg-green-50 dark:bg-green-950/20'}`}>
                  <div className="flex items-start gap-3">
                    {result.isPositive ? (
                      <XCircle className="h-8 w-8 text-destructive shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-bold text-lg">
                        {result.isPositive ? t('aiScreeningPositive') : t('aiScreeningNegative')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.isPositive ? t('positiveExplanation') : t('negativeExplanation')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Risk Level */}
                {risk && (
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t('riskLevel')}:</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RISK_COLORS[risk]}`}>
                      {t(`risk_${risk}`)}
                    </span>
                  </div>
                )}

                {/* 3. Probability with threshold marker */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('pneumoniaProbability')}</span>
                    <span className="font-semibold">{probPct}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-4 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${risk ? RISK_BAR_COLORS[risk] : 'bg-green-500'}`}
                        style={{ width: `${result.probability * 100}%` }}
                      />
                    </div>
                    {/* Threshold marker */}
                    <div
                      className="absolute top-0 h-4 w-0.5 bg-foreground/70"
                      style={{ left: `${result.threshold * 100}%` }}
                      title={`${t('pneumoniaThreshold')}: ${threshPct}%`}
                    />
                    <div
                      className="absolute -top-5 text-[10px] text-muted-foreground font-medium"
                      style={{ left: `${result.threshold * 100}%`, transform: 'translateX(-50%)' }}
                    >
                      {threshPct}%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.isPositive
                      ? t('probabilityAboveThreshold', { prob: probPct, threshold: threshPct })
                      : t('probabilityBelowThreshold', { prob: probPct, threshold: threshPct })}
                  </p>
                </div>

                <Separator />

                {/* 4. Clinical Recommendation */}
                <div className="rounded-md border bg-muted/30 p-3">
                  <div className="flex items-start gap-2">
                    <Stethoscope className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{t('clinicalRecommendation')}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.isPositive
                          ? t('recommendationPositive')
                          : risk === 'elevated'
                            ? t('recommendationElevated')
                            : t('recommendationNegative')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Grad-CAM */}
                {hasExplanation && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {t('pneumoniaGradCAM')}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {(result as PneumoniaExplanation).explainability.clinicalNote}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('pneumoniaOverlay')}</p>
                          <img
                            src={`data:image/png;base64,${(result as PneumoniaExplanation).explainability.overlayImageBase64}`}
                            alt="Grad-CAM overlay"
                            className="w-full rounded-lg border"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('pneumoniaHeatmap')}</p>
                          <img
                            src={`data:image/png;base64,${(result as PneumoniaExplanation).explainability.heatmapImageBase64}`}
                            alt="Grad-CAM heatmap"
                            className="w-full rounded-lg border"
                          />
                        </div>
                      </div>
                      <Alert variant="default">
                        <Info className="h-3 w-3" />
                        <AlertDescription className="text-[11px]">
                          {t('gradcamInterpretationWarning')}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </>
                )}

                <Separator />

                {/* 6. Technical Details (collapsible) */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                >
                  {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {t('modelDetails')}
                </button>
                {showDetails && (
                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 rounded-md p-3">
                    <div>
                      <p className="text-muted-foreground">{t('rawProbability')}</p>
                      <p className="font-mono">{result.probability}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('rawConfidence')}</p>
                      <p className="font-mono">{result.confidence}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('pneumoniaModel')}</p>
                      <p className="font-mono">{result.modelVersion}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('pneumoniaDevice')}</p>
                      <p className="font-mono">{result.device}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">{t('confidenceNote')}</p>
                    </div>
                  </div>
                )}

                {/* 7. Final disclaimer */}
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {t('finalClinicalDisclaimer')}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Scan className="h-12 w-12 mb-3" />
                <p className="text-sm">{t('pneumoniaEmpty')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
