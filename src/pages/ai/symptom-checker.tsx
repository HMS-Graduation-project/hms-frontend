import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, AlertTriangle, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  SYMPTOMS_LIST,
  usePredictDisease,
  type PredictionResult,
} from '@/hooks/use-ai';

export default function SymptomCheckerPage() {
  const { t } = useTranslation('ai');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const predictDisease = usePredictDisease();

  const filteredSymptoms = useMemo(() => {
    if (!search.trim()) return SYMPTOMS_LIST;
    const lower = search.toLowerCase();
    return SYMPTOMS_LIST.filter((s) => s.toLowerCase().includes(lower));
  }, [search]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom],
    );
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom));
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) return;
    predictDisease.mutate({ symptoms: selectedSymptoms });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('symptomChecker')}
        </h1>
        <p className="text-muted-foreground">{t('symptomCheckerDesc')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Symptom selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('selectSymptoms')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected symptoms tags */}
            {selectedSymptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant="secondary"
                    className="cursor-pointer gap-1 pr-1"
                  >
                    {symptom}
                    <button
                      onClick={() => removeSymptom(symptom)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchSymptoms')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Symptoms checklist */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {filteredSymptoms.map((symptom) => (
                  <label
                    key={symptom}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent"
                  >
                    <Checkbox
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => toggleSymptom(symptom)}
                    />
                    <span className="text-sm">{symptom}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Analyze button */}
            <Button
              onClick={handleAnalyze}
              disabled={
                selectedSymptoms.length === 0 || predictDisease.isPending
              }
              className="w-full"
            >
              <Brain className="mr-2 h-4 w-4" />
              {predictDisease.isPending ? t('analyzing') : t('checkSymptoms')}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('results')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {predictDisease.isPending ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : predictDisease.data ? (
              predictDisease.data.predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictDisease.data.predictions.map(
                    (result: PredictionResult, index: number) => (
                      <div
                        key={index}
                        className="rounded-lg border p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{result.disease}</h4>
                          <Badge
                            variant={
                              result.confidence >= 0.7
                                ? 'destructive'
                                : result.confidence >= 0.4
                                  ? 'warning'
                                  : 'secondary'
                            }
                          >
                            {Math.round(result.confidence * 100)}%
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                        )}
                        {/* Confidence bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{t('confidence')}</span>
                            <span>{Math.round(result.confidence * 100)}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                result.confidence >= 0.7
                                  ? 'bg-destructive'
                                  : result.confidence >= 0.4
                                    ? 'bg-warning'
                                    : 'bg-primary',
                              )}
                              style={{
                                width: `${Math.round(result.confidence * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Brain className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">{t('noResults')}</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Brain className="mb-3 h-10 w-10 opacity-50" />
                <p className="text-sm">{t('selectSymptoms')}</p>
              </div>
            )}

            {/* Disclaimer */}
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t('disclaimer')}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
