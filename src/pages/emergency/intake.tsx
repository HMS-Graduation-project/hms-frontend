import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Siren, UserX } from 'lucide-react';
import {
  NationalPatientSearch,
  type NationalPatientSearchResult,
} from '@/components/patients/national-patient-search';
import { useCreateEmergencyVisit } from '@/hooks/use-emergency';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const intakeSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Required')
    .max(120, 'Too long'),
  chiefComplaint: z
    .string()
    .trim()
    .min(1, 'Required')
    .max(500, 'Too long'),
});

type IntakeFormValues = z.infer<typeof intakeSchema>;

type Step = 'search' | 'form';

type SelectedPatient =
  | { mode: 'existing'; nhid: string; label: string }
  | { mode: 'new' }
  | { mode: 'anonymous' };

export default function EmergencyIntakePage() {
  const { t } = useTranslation('emergency');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('search');
  const [selected, setSelected] = useState<SelectedPatient | null>(null);

  const createVisit = useCreateEmergencyVisit();

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      displayName: '',
      chiefComplaint: '',
    },
  });

  const handlePatientSelect = (result: NationalPatientSearchResult) => {
    if (result.mode === 'existing') {
      const label = [
        result.nationalPatient.firstName,
        result.nationalPatient.lastName,
      ]
        .filter(Boolean)
        .join(' ');
      setSelected({ mode: 'existing', nhid: result.nhid, label });
      form.setValue('displayName', label);
    } else {
      setSelected({ mode: 'new' });
      form.setValue('displayName', '');
    }
    setStep('form');
  };

  const handleAnonymous = () => {
    setSelected({ mode: 'anonymous' });
    form.setValue('displayName', '');
    setStep('form');
  };

  const handleBackToSearch = () => {
    setSelected(null);
    form.reset();
    setStep('search');
  };

  const onSubmit = async (values: IntakeFormValues) => {
    try {
      const visit = await createVisit.mutateAsync({
        displayName: values.displayName,
        chiefComplaint: values.chiefComplaint,
        nationalPatientId:
          selected?.mode === 'existing' ? selected.nhid : undefined,
      });
      toast({ title: t('intakeSuccess'), variant: 'success' });
      navigate(`/emergency/${visit.id}`);
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/emergency')}
          aria-label={t('backToQueue')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/10 text-red-600 dark:bg-red-500/20">
            <Siren className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('newIntake')}
            </h1>
            <p className="text-muted-foreground">{t('intakeSubtitle')}</p>
          </div>
        </div>
      </div>

      {step === 'search' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{t('intakeStep1')}</CardTitle>
                <CardDescription>{t('identifyPatient')}</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAnonymous}
              >
                <UserX className="mr-2 h-4 w-4" />
                {t('unidentifiedIntake')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <NationalPatientSearch
              onSelect={handlePatientSelect}
              onCancel={() => navigate('/emergency')}
            />
          </CardContent>
        </Card>
      )}

      {step === 'form' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t('intakeStep2')}</CardTitle>
                <CardDescription>
                  {selected?.mode === 'existing' && (
                    <span className="flex items-center gap-2">
                      <Badge variant="info">{t('identified')}</Badge>
                      <span>{selected.label}</span>
                    </span>
                  )}
                  {selected?.mode === 'new' && (
                    <Badge variant="secondary">{t('unidentified')}</Badge>
                  )}
                  {selected?.mode === 'anonymous' && (
                    <Badge variant="destructive">{t('unidentified')}</Badge>
                  )}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToSearch}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {tCommon('back')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  {t('displayName')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="displayName"
                  autoFocus={!form.getValues('displayName')}
                  placeholder={t('displayNamePlaceholder')}
                  {...form.register('displayName')}
                />
                {form.formState.errors.displayName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.displayName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="chiefComplaint">
                  {t('chiefComplaint')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="chiefComplaint"
                  rows={4}
                  placeholder={t('chiefComplaintPlaceholder')}
                  {...form.register('chiefComplaint')}
                />
                {form.formState.errors.chiefComplaint && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.chiefComplaint.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/emergency')}
                >
                  {tCommon('cancel')}
                </Button>
                <Button type="submit" disabled={createVisit.isPending}>
                  {createVisit.isPending
                    ? tCommon('loading')
                    : t('submitIntake')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
