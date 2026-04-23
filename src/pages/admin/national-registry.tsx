import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Search,
  Merge,
  AlertTriangle,
  User,
  Calendar,
  IdCard,
  Hospital,
} from 'lucide-react';
import {
  useNationalPatient,
  useMergeNationalPatient,
  type NationalPatient,
  type NationalPatientWithProfiles,
} from '@/hooks/use-national-registry';
import {
  NationalPatientSearch,
  type NationalPatientSearchResult,
} from '@/components/patients/national-patient-search';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function NationalRegistryPage() {
  const { t } = useTranslation('patients');
  const [searchParams] = useSearchParams();
  const [detailNhid, setDetailNhid] = useState<string | null>(null);

  // Allow ?nhid=<id> to open the detail dialog directly (used by the
  // "Edit in National Registry" link from patient-form).
  useEffect(() => {
    const nhid = searchParams.get('nhid');
    if (nhid) setDetailNhid(nhid);
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('nationalRegistryTitle')}
          </h1>
          <p className="text-muted-foreground">
            {t('nationalRegistrySubtitle')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4" />
            {t('searchRegistry')}
          </TabsTrigger>
          <TabsTrigger value="merge">
            <Merge className="mr-2 h-4 w-4" />
            {t('mergeDuplicates')}
          </TabsTrigger>
        </TabsList>

        {/* Search tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('searchRegistryHeading')}
              </CardTitle>
              <CardDescription>
                {t('searchRegistrySubheading')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NationalPatientSearch
                onSelect={(result: NationalPatientSearchResult) => {
                  if (result.mode === 'existing') {
                    setDetailNhid(result.nhid);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Merge tab */}
        <TabsContent value="merge" className="space-y-4">
          <MergeDuplicatesPanel />
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog
        open={!!detailNhid}
        onOpenChange={(open) => {
          if (!open) setDetailNhid(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('nationalPatientDetails')}</DialogTitle>
            <DialogDescription>
              {t('nationalPatientDetailsDesc')}
            </DialogDescription>
          </DialogHeader>
          {detailNhid && <NationalPatientDetail nhid={detailNhid} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  Detail view (shown in dialog)                                            */
/* ------------------------------------------------------------------------- */

function NationalPatientDetail({ nhid }: { nhid: string }) {
  const { t } = useTranslation('patients');
  const { data, isLoading, isError } = useNationalPatient(nhid);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {t('registryLoadError')}
      </div>
    );
  }

  return <NationalPatientDetailCard patient={data} />;
}

function NationalPatientDetailCard({
  patient,
}: {
  patient: NationalPatientWithProfiles;
}) {
  const { t } = useTranslation('patients');

  const fullName = [patient.firstName, patient.lastName]
    .filter(Boolean)
    .join(' ');
  const fullNameAr = [patient.firstNameAr, patient.lastNameAr]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-muted p-2">
          <User className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-lg font-semibold">{fullName}</p>
          {fullNameAr && (
            <p className="text-sm text-muted-foreground" dir="rtl">
              {fullNameAr}
            </p>
          )}
          <p className="text-xs text-muted-foreground font-mono">
            {t('nhid')}: {patient.id}
          </p>
        </div>
      </div>

      {patient.criticalAlerts && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">{t('criticalAlerts')}</p>
            <p>{patient.criticalAlerts}</p>
          </div>
        </div>
      )}

      <Separator />

      {/* Demographics grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailField label={t('syrianNationalId')} value={patient.syrianNationalId} />
        <DetailField
          label={t('dateOfBirth')}
          value={
            patient.dateOfBirth
              ? new Date(patient.dateOfBirth).toLocaleDateString()
              : null
          }
        />
        <DetailField label={t('gender')} value={patient.gender} />
        <DetailField label={t('bloodType')} value={patient.bloodType} />
        <DetailField label={t('phone')} value={patient.phone} />
        <DetailField label={t('address')} value={patient.address} />
        <DetailField
          label={t('allergies')}
          value={patient.allergies}
          span2
        />
        <DetailField
          label={t('chronicConditions')}
          value={patient.chronicConditions}
          span2
        />
      </div>

      <Separator />

      {/* Profiles */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Hospital className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            {t('hospitalsRegisteredAt')}
          </h3>
          <Badge variant="secondary">{patient.profiles.length}</Badge>
        </div>
        {patient.profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('noHospitalsRegistered')}
          </p>
        ) : (
          <div className="space-y-2">
            {patient.profiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{p.hospital.name}</p>
                  {p.hospital.nameAr && (
                    <p
                      className="text-xs text-muted-foreground"
                      dir="rtl"
                    >
                      {p.hospital.nameAr}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {p.hospital.code}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  span2,
}: {
  label: string;
  value: string | null | undefined;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? 'sm:col-span-2' : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  Merge duplicates panel                                                   */
/* ------------------------------------------------------------------------- */

function MergeDuplicatesPanel() {
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const [winner, setWinner] = useState<NationalPatient | null>(null);
  const [loser, setLoser] = useState<NationalPatient | null>(null);

  // Modal state for picker
  const [pickerOpen, setPickerOpen] = useState<null | 'winner' | 'loser'>(null);

  const merge = useMergeNationalPatient();

  const handleMerge = async () => {
    if (!winner || !loser) return;
    if (winner.id === loser.id) {
      toast({
        title: t('mergeSameIdError'),
        variant: 'destructive',
      });
      return;
    }
    try {
      const res = await merge.mutateAsync({
        winnerId: winner.id,
        loserId: loser.id,
      });
      toast({
        title: t('mergeSuccess'),
        description: t('mergeSuccessDesc', {
          reassigned: res.reassignedProfiles,
          merged: res.mergedProfiles,
        }),
        variant: 'success',
      });
      setWinner(null);
      setLoser(null);
    } catch {
      toast({
        title: tCommon('error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('mergeDuplicates')}</CardTitle>
          <CardDescription>{t('mergeDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-warning-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm">{t('mergeWarning')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MergeSide
              title={t('winnerNhid')}
              description={t('winnerDescription')}
              selected={winner}
              onOpen={() => setPickerOpen('winner')}
              onClear={() => setWinner(null)}
              tone="success"
            />
            <MergeSide
              title={t('loserNhid')}
              description={t('loserDescription')}
              selected={loser}
              onOpen={() => setPickerOpen('loser')}
              onClear={() => setLoser(null)}
              tone="destructive"
            />
          </div>

          {/* Loser profile preview */}
          {loser && <LoserProfilePreview nhid={loser.id} />}

          {/* Merge button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={handleMerge}
              disabled={!winner || !loser || merge.isPending}
            >
              {merge.isPending ? tCommon('loading') : t('merge')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Picker dialog */}
      <Dialog
        open={!!pickerOpen}
        onOpenChange={(open) => {
          if (!open) setPickerOpen(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {pickerOpen === 'winner' ? t('selectWinner') : t('selectLoser')}
            </DialogTitle>
            <DialogDescription>
              {pickerOpen === 'winner'
                ? t('selectWinnerDesc')
                : t('selectLoserDesc')}
            </DialogDescription>
          </DialogHeader>
          <NationalPatientSearch
            onSelect={(result) => {
              if (result.mode === 'existing') {
                if (pickerOpen === 'winner') setWinner(result.nationalPatient);
                else if (pickerOpen === 'loser') setLoser(result.nationalPatient);
                setPickerOpen(null);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface MergeSideProps {
  title: string;
  description: string;
  selected: NationalPatient | null;
  onOpen: () => void;
  onClear: () => void;
  tone: 'success' | 'destructive';
}

function MergeSide({
  title,
  description,
  selected,
  onOpen,
  onClear,
  tone,
}: MergeSideProps) {
  const { t } = useTranslation('patients');
  const fullName = selected
    ? [selected.firstName, selected.lastName].filter(Boolean).join(' ')
    : '';

  const toneClass =
    tone === 'success'
      ? 'border-success/40 bg-success/5'
      : 'border-destructive/40 bg-destructive/5';

  return (
    <div className={`rounded-md border p-4 space-y-3 ${toneClass}`}>
      <div>
        <Label className="text-sm font-semibold">{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {selected ? (
        <div className="space-y-1">
          <p className="text-sm font-medium">{fullName}</p>
          {selected.syrianNationalId && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IdCard className="h-3 w-3" />
              {selected.syrianNationalId}
            </p>
          )}
          {selected.dateOfBirth && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(selected.dateOfBirth).toLocaleDateString()}
            </p>
          )}
          <p className="text-xs font-mono text-muted-foreground">
            {t('nhid')}: {selected.id.slice(0, 12)}…
          </p>
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={onOpen}>
              {t('changeSelection')}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClear}>
              {t('clear')}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" onClick={onOpen}>
          <Search className="mr-2 h-4 w-4" />
          {t('selectPatient')}
        </Button>
      )}
    </div>
  );
}

function LoserProfilePreview({ nhid }: { nhid: string }) {
  const { t } = useTranslation('patients');
  const { data, isLoading } = useNationalPatient(nhid);

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }
  if (!data) return null;

  return (
    <div className="rounded-md border p-3">
      <p className="text-sm font-semibold mb-2">{t('loserPreviewHeading')}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {t('loserPreviewDesc', { count: data.profiles.length })}
      </p>
      {data.profiles.length > 0 ? (
        <div className="space-y-1">
          {data.profiles.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded border px-2 py-1 text-xs"
            >
              <span>{p.hospital.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {p.hospital.code}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('noHospitalsRegistered')}
        </p>
      )}
    </div>
  );
}
