import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import {
  useCreateReferral,
  type ReferralUrgency,
} from '@/hooks/use-referrals';
import { useReferralTargets } from '@/hooks/use-hospitals';
import {
  NationalPatientSearch,
  type NationalPatientSearchResult,
} from '@/components/patients/national-patient-search';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const URGENCY_OPTIONS: ReferralUrgency[] = ['ROUTINE', 'URGENT', 'EMERGENT'];

export default function NewReferralPage() {
  const { t } = useTranslation('referrals');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const [nationalPatientId, setNationalPatientId] = useState<string | null>(
    search.get('nhid'),
  );
  const [patientName, setPatientName] = useState<string>(
    search.get('name') ?? '',
  );
  const [toHospitalId, setToHospitalId] = useState('');
  const [urgency, setUrgency] = useState<ReferralUrgency>('ROUTINE');
  const [reason, setReason] = useState('');
  const [clinicalSummary, setClinicalSummary] = useState('');

  const { data: hospitals, isLoading: hospitalsLoading } = useReferralTargets();
  const create = useCreateReferral();

  function handlePatientSelect(result: NationalPatientSearchResult) {
    if (result.mode === 'existing') {
      setNationalPatientId(result.nhid);
      setPatientName(
        `${result.nationalPatient.firstName} ${result.nationalPatient.lastName}`,
      );
    } else {
      toast({
        title: t('newPage.mustBeRegistered'),
        description: t('newPage.registerFirst'),
        variant: 'destructive',
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nationalPatientId || !toHospitalId || !reason) return;
    try {
      const created = await create.mutateAsync({
        nationalPatientId,
        toHospitalId,
        reason,
        clinicalSummary: clinicalSummary || undefined,
        urgency,
      });
      toast({ title: t('newPage.createSuccess') });
      navigate(`/referrals/${created.id}`);
    } catch (err) {
      toast({
        title: t('newPage.createError'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  }

  const canSubmit =
    !!nationalPatientId && !!toHospitalId && reason.length > 0 && !create.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/referrals/outgoing')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('newPage.title')}
          </h1>
          <p className="text-muted-foreground">{t('newPage.subtitle')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('newPage.step1')}</CardTitle>
        </CardHeader>
        <CardContent>
          {nationalPatientId ? (
            <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
              <div>
                <p className="font-medium">{patientName}</p>
                <p className="text-xs text-muted-foreground">
                  NHID: {nationalPatientId.slice(0, 8)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNationalPatientId(null);
                  setPatientName('');
                }}
              >
                {t('newPage.changePatient')}
              </Button>
            </div>
          ) : (
            <NationalPatientSearch onSelect={handlePatientSelect} />
          )}
        </CardContent>
      </Card>

      {nationalPatientId && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('newPage.step2')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('newPage.fields.toHospital')}</Label>
                  <Select
                    value={toHospitalId}
                    onValueChange={setToHospitalId}
                    disabled={hospitalsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('newPage.fields.toHospitalPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {hospitals?.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name} · {h.city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('newPage.fields.urgency')}</Label>
                  <Select
                    value={urgency}
                    onValueChange={(v) => setUrgency(v as ReferralUrgency)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_OPTIONS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {t(`urgency.${u}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('newPage.fields.reason')}</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder={t('newPage.fields.reasonPlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('newPage.fields.clinicalSummary')}</Label>
                <Textarea
                  value={clinicalSummary}
                  onChange={(e) => setClinicalSummary(e.target.value)}
                  rows={8}
                  maxLength={5000}
                  placeholder={t('newPage.fields.clinicalSummaryPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('newPage.fields.clinicalSummaryHelper')}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/referrals/outgoing')}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {create.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Send className="mr-2 h-4 w-4" />
              {t('newPage.submit')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
