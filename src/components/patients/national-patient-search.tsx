import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, User, Calendar, Hospital, IdCard } from 'lucide-react';
import {
  useNationalPatientSearch,
  type NationalPatient,
} from '@/hooks/use-national-registry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export type NationalPatientSearchResult =
  | { mode: 'existing'; nhid: string; nationalPatient: NationalPatient }
  | { mode: 'new' };

interface NationalPatientSearchProps {
  onSelect: (result: NationalPatientSearchResult) => void;
  onCancel?: () => void;
}

/**
 * Simple debounce hook — delays the value update until the user stops typing.
 */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function NationalPatientSearch({
  onSelect,
  onCancel,
}: NationalPatientSearchProps) {
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation('common');

  // --- By-ID tab state -------------------------------------------------------
  const [nationalIdInput, setNationalIdInput] = useState('');
  const [nationalIdQuery, setNationalIdQuery] = useState('');

  // --- By-name tab state -----------------------------------------------------
  const [nameInput, setNameInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const debouncedName = useDebouncedValue(nameInput.trim(), 400);
  const debouncedDob = useDebouncedValue(dobInput, 400);

  const idSearch = useNationalPatientSearch({ syrianNationalId: nationalIdQuery });
  const nameSearch = useNationalPatientSearch({
    q: debouncedName,
    dateOfBirth: debouncedDob || undefined,
  });

  const handleSubmitIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setNationalIdQuery(nationalIdInput.trim());
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="by-id">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="by-id">{t('searchByNationalId')}</TabsTrigger>
          <TabsTrigger value="by-name">{t('searchByName')}</TabsTrigger>
        </TabsList>

        {/* By National ID tab ---------------------------------------------- */}
        <TabsContent value="by-id" className="space-y-4">
          <form onSubmit={handleSubmitIdSearch} className="space-y-2">
            <Label htmlFor="national-id-input">{t('syrianNationalId')}</Label>
            <div className="flex gap-2">
              <Input
                id="national-id-input"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                value={nationalIdInput}
                onChange={(e) =>
                  setNationalIdInput(e.target.value.replace(/\D/g, ''))
                }
                placeholder={t('nationalIdPlaceholder')}
                aria-describedby="national-id-help"
              />
              <Button
                type="submit"
                disabled={
                  nationalIdInput.length === 0 || idSearch.isFetching
                }
              >
                {idSearch.isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">{tCommon('search')}</span>
              </Button>
            </div>
            <p
              id="national-id-help"
              className="text-xs text-muted-foreground"
            >
              {t('nationalIdHelp')}
            </p>
          </form>

          <SearchResultsArea
            isFetching={idSearch.isFetching}
            isError={idSearch.isError}
            results={nationalIdQuery ? idSearch.data : undefined}
            hasSearched={!!nationalIdQuery && !idSearch.isFetching}
            onSelect={(p) =>
              onSelect({ mode: 'existing', nhid: p.id, nationalPatient: p })
            }
            onRegisterNew={() => onSelect({ mode: 'new' })}
            emptyMessage={t('noNationalIdMatch')}
          />
        </TabsContent>

        {/* By name + DOB tab ----------------------------------------------- */}
        <TabsContent value="by-name" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name-input">
                {t('firstName')} / {t('lastName')}
              </Label>
              <Input
                id="name-input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t('nameSearchPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob-input">{t('dateOfBirth')}</Label>
              <Input
                id="dob-input"
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
              />
            </div>
          </div>

          <SearchResultsArea
            isFetching={nameSearch.isFetching}
            isError={nameSearch.isError}
            results={
              debouncedName || debouncedDob ? nameSearch.data : undefined
            }
            hasSearched={
              (!!debouncedName || !!debouncedDob) && !nameSearch.isFetching
            }
            onSelect={(p) =>
              onSelect({ mode: 'existing', nhid: p.id, nationalPatient: p })
            }
            onRegisterNew={() => onSelect({ mode: 'new' })}
            emptyMessage={t('noNameMatch')}
          />
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Escape hatch + cancel */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSelect({ mode: 'new' })}
        >
          {t('registerNewNational')}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {tCommon('cancel')}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  Helpers                                                                  */
/* ------------------------------------------------------------------------- */

interface SearchResultsAreaProps {
  isFetching: boolean;
  isError: boolean;
  results: NationalPatient[] | undefined;
  hasSearched: boolean;
  onSelect: (p: NationalPatient) => void;
  onRegisterNew: () => void;
  emptyMessage: string;
}

function SearchResultsArea({
  isFetching,
  isError,
  results,
  hasSearched,
  onSelect,
  onRegisterNew,
  emptyMessage,
}: SearchResultsAreaProps) {
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation('common');

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {tCommon('loading')}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {tCommon('error')}
      </div>
    );
  }

  if (!hasSearched || !results) {
    return null;
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          <Button type="button" variant="default" onClick={onRegisterNew}>
            {t('registerNewNational')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {t('resultsCount', { count: results.length })}
      </p>
      {results.map((patient) => (
        <NationalPatientRow
          key={patient.id}
          patient={patient}
          onSelect={() => onSelect(patient)}
        />
      ))}
    </div>
  );
}

function NationalPatientRow({
  patient,
  onSelect,
}: {
  patient: NationalPatient;
  onSelect: () => void;
}) {
  const { t } = useTranslation('patients');
  const fullName = [patient.firstName, patient.lastName]
    .filter(Boolean)
    .join(' ');
  const fullNameAr = [patient.firstNameAr, patient.lastNameAr]
    .filter(Boolean)
    .join(' ');

  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="font-medium">{fullName}</p>
            {fullNameAr && (
              <span className="text-sm text-muted-foreground" dir="rtl">
                {fullNameAr}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {patient.syrianNationalId && (
              <span className="flex items-center gap-1">
                <IdCard className="h-3 w-3" />
                {patient.syrianNationalId}
              </span>
            )}
            {patient.dateOfBirth && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(patient.dateOfBirth).toLocaleDateString()}
              </span>
            )}
            {patient.gender && <span>{patient.gender}</span>}
            <span className="flex items-center gap-1">
              <Hospital className="h-3 w-3" />
              {t('nhid')}: {patient.id.slice(0, 8)}
            </span>
          </div>
          {patient.criticalAlerts && (
            <Badge variant="destructive" className="mt-1 text-[10px]">
              {patient.criticalAlerts}
            </Badge>
          )}
        </div>
        <Button type="button" size="sm" onClick={onSelect}>
          {t('linkExisting')}
        </Button>
      </CardContent>
    </Card>
  );
}
