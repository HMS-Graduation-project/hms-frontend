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

export default function PneumoniaPage() {
  const { t } = useTranslation('ai');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PneumoniaPrediction | PneumoniaExplanation | null>(null);

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
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePredict = async () => {
    if (!selectedFile) return;
    try {
      const res = await predict.mutateAsync(selectedFile);
      setResult(res);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : t('pneumoniaError'),
        variant: 'destructive',
      });
    }
  };

  const handleExplain = async () => {
    if (!selectedFile) return;
    try {
      const res = await explain.mutateAsync(selectedFile);
      setResult(res);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : t('pneumoniaError'),
        variant: 'destructive',
      });
    }
  };

  const hasExplanation = result && 'explainability' in result;

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
        <AlertDescription>{t('pneumoniaDisclaimer')}</AlertDescription>
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
            <p className="text-xs text-muted-foreground">
              {t('pneumoniaFileHelp')}
            </p>

            {preview && (
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                <img
                  src={preview}
                  alt="Chest X-ray preview"
                  className="w-full h-auto max-h-[300px] object-contain"
                />
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handlePredict}
                disabled={!selectedFile || isPending}
                className="gap-2"
              >
                {predict.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Scan className="h-4 w-4" />
                )}
                {t('pneumoniaAnalyze')}
              </Button>
              <Button
                onClick={handleExplain}
                disabled={!selectedFile || isPending}
                variant="outline"
                className="gap-2"
              >
                {explain.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {t('pneumoniaExplain')}
              </Button>
              <Button
                onClick={handleClear}
                disabled={isPending}
                variant="ghost"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('pneumoniaClear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t('pneumoniaResult')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Prediction badge */}
                <div className="flex items-center gap-3">
                  {result.isPositive ? (
                    <XCircle className="h-8 w-8 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  )}
                  <div>
                    <Badge
                      variant={result.isPositive ? 'destructive' : 'success'}
                      className="text-lg px-4 py-1"
                    >
                      {result.prediction}
                    </Badge>
                  </div>
                </div>

                {/* Probability bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('pneumoniaProbability')}</span>
                    <span className="font-semibold">{(result.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        result.isPositive ? 'bg-destructive' : 'bg-green-600'
                      }`}
                      style={{ width: `${result.probability * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('pneumoniaThreshold')}: {result.threshold}
                  </p>
                </div>

                <Separator />

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('pneumoniaConfidence')}</p>
                    <p className="font-medium">{(result.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('pneumoniaModel')}</p>
                    <p className="font-medium text-xs">{result.modelVersion}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('pneumoniaDevice')}</p>
                    <p className="font-medium">{result.device}</p>
                  </div>
                </div>

                {/* Clinical note */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {result.clinicalNote}
                  </AlertDescription>
                </Alert>

                {/* Grad-CAM images */}
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
                          <p className="text-xs text-muted-foreground mb-1">{t('pneumoniaHeatmap')}</p>
                          <img
                            src={`data:image/png;base64,${(result as PneumoniaExplanation).explainability.heatmapImageBase64}`}
                            alt="Grad-CAM heatmap"
                            className="w-full rounded-lg border"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('pneumoniaOverlay')}</p>
                          <img
                            src={`data:image/png;base64,${(result as PneumoniaExplanation).explainability.overlayImageBase64}`}
                            alt="Grad-CAM overlay"
                            className="w-full rounded-lg border"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
