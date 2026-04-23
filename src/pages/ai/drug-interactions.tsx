import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, AlertTriangle, Search, X, ShieldAlert } from 'lucide-react';
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
  MEDICATIONS_LIST,
  useCheckInteractions,
  type DrugInteraction,
} from '@/hooks/use-ai';

function getSeverityVariant(severity: string): 'destructive' | 'warning' | 'info' {
  switch (severity) {
    case 'HIGH':
      return 'destructive';
    case 'MODERATE':
      return 'warning';
    case 'LOW':
      return 'info';
    default:
      return 'info';
  }
}

export default function DrugInteractionsPage() {
  const { t } = useTranslation('ai');
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const checkInteractions = useCheckInteractions();

  const filteredMedications = useMemo(() => {
    if (!search.trim()) return MEDICATIONS_LIST;
    const lower = search.toLowerCase();
    return MEDICATIONS_LIST.filter((m) => m.toLowerCase().includes(lower));
  }, [search]);

  const toggleMedication = (medication: string) => {
    setSelectedMedications((prev) =>
      prev.includes(medication)
        ? prev.filter((m) => m !== medication)
        : [...prev, medication],
    );
  };

  const removeMedication = (medication: string) => {
    setSelectedMedications((prev) => prev.filter((m) => m !== medication));
  };

  const handleCheck = () => {
    if (selectedMedications.length < 2) return;
    checkInteractions.mutate({ medications: selectedMedications });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('drugInteractions')}
        </h1>
        <p className="text-muted-foreground">{t('drugInteractionsDesc')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Medication selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('selectMedications')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected medications tags */}
            {selectedMedications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMedications.map((medication) => (
                  <Badge
                    key={medication}
                    variant="secondary"
                    className="cursor-pointer gap-1 pr-1"
                  >
                    {medication}
                    <button
                      onClick={() => removeMedication(medication)}
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
                placeholder={t('searchMedications')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Medications checklist */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {filteredMedications.map((medication) => (
                  <label
                    key={medication}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent"
                  >
                    <Checkbox
                      checked={selectedMedications.includes(medication)}
                      onCheckedChange={() => toggleMedication(medication)}
                    />
                    <span className="text-sm">{medication}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Check button */}
            <Button
              onClick={handleCheck}
              disabled={
                selectedMedications.length < 2 || checkInteractions.isPending
              }
              className="w-full"
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              {checkInteractions.isPending
                ? t('checking')
                : t('checkInteractions')}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('results')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkInteractions.isPending ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : checkInteractions.data ? (
              checkInteractions.data.interactions.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('interactionsFound', {
                      count: checkInteractions.data.interactions.length,
                    })}
                  </p>
                  {checkInteractions.data.interactions.map(
                    (interaction: DrugInteraction, index: number) => (
                      <div
                        key={index}
                        className={cn(
                          'rounded-lg border p-4 space-y-3',
                          interaction.severity === 'HIGH' &&
                            'border-destructive/30 bg-destructive/5',
                          interaction.severity === 'MODERATE' &&
                            'border-warning/30 bg-warning/5',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-sm">
                            {interaction.drug1} + {interaction.drug2}
                          </h4>
                          <Badge variant={getSeverityVariant(interaction.severity)}>
                            {t(interaction.severity.toLowerCase() as 'high' | 'moderate' | 'low')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {interaction.description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Pill className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">{t('noInteractions')}</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Pill className="mb-3 h-10 w-10 opacity-50" />
                <p className="text-sm">{t('selectMedications')}</p>
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
