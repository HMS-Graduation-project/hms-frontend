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
  useSymptomCatalog,
  usePredictDisease,
  type PredictionResult,
} from '@/hooks/use-ai';

/** Maps an AI disease name (e.g. "Tension Headache") to its i18n key slug. */
function diseaseSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export default function SymptomCheckerPage() {
  const { t, i18n } = useTranslation('ai');
  // selectedSymptoms holds canonical symptom IDs (the values the AI expects).
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const predictDisease = usePredictDisease();

  const {
    data: catalog,
    isLoading: catalogLoading,
    isError: catalogError,
  } = useSymptomCatalog();

  // Localize each catalog symptom by its canonical id, falling back to the
  // AI's English label when no translation exists. Re-runs on language change.
  const symptoms = useMemo(
    () =>
      (catalog?.symptoms ?? []).map((s) => ({
        id: s.id,
        label: t(`symptomNames.${s.id}`, { defaultValue: s.label }),
      })),
    [catalog, t, i18n.language],
  );

  // id → localized label for rendering the selected-symptom chips.
  const labelById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of symptoms) map[s.id] = s.label;
    return map;
  }, [symptoms]);

  const filteredSymptoms = useMemo(() => {
    if (!search.trim()) return symptoms;
    const lower = search.toLowerCase();
    return symptoms.filter(
      (s) =>
        s.label.toLowerCase().includes(lower) ||
        s.id.toLowerCase().includes(lower),
    );
  }, [search, symptoms]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const removeSymptom = (id: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== id));
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) return;
    // Submit canonical IDs, not display labels.
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
                {selectedSymptoms.map((id) => (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="cursor-pointer gap-1 pe-1"
                  >
                    {labelById[id] ?? id}
                    <button
                      onClick={() => removeSymptom(id)}
                      className="ms-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchSymptoms')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9"
              />
            </div>

            {/* Symptoms checklist */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pe-4">
                {catalogLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full rounded-md" />
                  ))
                ) : catalogError ? (
                  <p className="px-3 py-2 text-sm text-destructive">
                    {t('symptomsLoadError')}
                  </p>
                ) : filteredSymptoms.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    {t('noSymptomsFound')}
                  </p>
                ) : (
                  filteredSymptoms.map((symptom) => (
                    <label
                      key={symptom.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent"
                    >
                      <Checkbox
                        checked={selectedSymptoms.includes(symptom.id)}
                        onCheckedChange={() => toggleSymptom(symptom.id)}
                      />
                      <span className="text-sm">{symptom.label}</span>
                    </label>
                  ))
                )}
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
              <Brain className="me-2 h-4 w-4" />
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
                    (result: PredictionResult, index: number) => {
                      const slug = diseaseSlug(result.disease);
                      const diseaseName = t(`diseaseNames.${slug}`, {
                        defaultValue: result.disease,
                      });
                      const diseaseDesc = t(`diseaseDescriptions.${slug}`, {
                        defaultValue: result.description ?? '',
                      });
                      return (
                      <div
                        key={index}
                        className="rounded-lg border p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{diseaseName}</h4>
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
                        {diseaseDesc && (
                          <p className="text-sm text-muted-foreground">
                            {diseaseDesc}
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
                      );
                    },
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
