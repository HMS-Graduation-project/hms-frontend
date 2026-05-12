import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Building2, Stethoscope, CalendarDays, Check } from 'lucide-react';
import {
  usePortalHospitals,
  usePortalDoctorsAtHospital,
  useBookPortalAppointment,
  type PortalHospital,
  type PortalBookingDoctor,
} from '@/hooks/use-portal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

type Step = 'hospital' | 'doctor' | 'when' | 'review';

export default function PortalBookAppointmentPage() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('hospital');
  const [hospital, setHospital] = useState<PortalHospital | null>(null);
  const [doctor, setDoctor] = useState<PortalBookingDoctor | null>(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [reason, setReason] = useState('');
  const [type, setType] = useState('CONSULTATION');

  const { data: hospitals, isLoading: hLoading } = usePortalHospitals();
  const { data: doctors, isLoading: dLoading } = usePortalDoctorsAtHospital(
    hospital?.id,
  );
  const bookMutation = useBookPortalAppointment();

  const submit = async () => {
    if (!hospital || !doctor || !date || !startTime || !endTime) return;
    try {
      await bookMutation.mutateAsync({
        hospitalId: hospital.id,
        doctorId: doctor.id,
        departmentId: doctor.department?.id,
        date,
        startTime,
        endTime,
        type,
        reason: reason || undefined,
      });
      toast({
        title: t('book.success'),
        description: `${hospital.name} · ${date}`,
      });
      navigate('/portal/appointments');
    } catch (err: unknown) {
      toast({
        title: t('book.failed'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/portal/appointments')}
        >
          <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" />
          {t('book.back')}
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('book.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('book.subtitle')}</p>
      </div>

      <Stepper step={step} />

      {step === 'hospital' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" /> {t('book.pickHospital')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {hospitals?.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setHospital(h);
                        setDoctor(null);
                        setStep('doctor');
                      }}
                      className={cn(
                        'flex w-full flex-col items-start gap-1 rounded-lg border p-3 text-start transition-colors hover:bg-muted',
                        hospital?.id === h.id && 'border-primary bg-primary/5',
                      )}
                    >
                      <div className="font-medium">{h.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {h.city?.name && `${h.city.name} · `}
                        {h.code}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'doctor' && hospital && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4" /> {t('book.pickDoctor')}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {t('book.atHospital')}: <strong>{hospital.name}</strong>
            </p>
          </CardHeader>
          <CardContent>
            {dLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : doctors && doctors.length > 0 ? (
              <ul className="space-y-2">
                {doctors.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setDoctor(d);
                        setStep('when');
                      }}
                      className={cn(
                        'flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-start transition-colors hover:bg-muted',
                        doctor?.id === d.id && 'border-primary bg-primary/5',
                      )}
                    >
                      <div>
                        <div className="font-medium">
                          Dr. {d.user.firstName} {d.user.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {d.specialization}
                          {d.department?.name && ` · ${d.department.name}`}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('book.noDoctors')}
              </p>
            )}
            <div className="mt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep('hospital')}>
                {t('book.back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'when' && doctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> {t('book.pickWhen')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="date">{t('book.date')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="start">{t('book.startTime')}</Label>
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end">{t('book.endTime')}</Label>
                <Input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t('book.type')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTATION">CONSULTATION</SelectItem>
                  <SelectItem value="FOLLOW_UP">FOLLOW_UP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="reason">{t('book.reason')}</Label>
              <Textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('book.reasonPlaceholder')}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep('doctor')}>
                {t('book.back')}
              </Button>
              <Button
                onClick={() => setStep('review')}
                disabled={!date || !startTime || !endTime}
              >
                {t('book.review')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'review' && hospital && doctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Check className="h-4 w-4" /> {t('book.review')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label={t('book.hospital')} value={hospital.name} />
            <SummaryRow
              label={t('book.doctor')}
              value={`Dr. ${doctor.user.firstName} ${doctor.user.lastName} · ${doctor.specialization}`}
            />
            <SummaryRow
              label={t('book.when')}
              value={`${date} · ${startTime}–${endTime}`}
            />
            <SummaryRow label={t('book.type')} value={type} />
            {reason && <SummaryRow label={t('book.reason')} value={reason} />}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep('when')}>
                {t('book.back')}
              </Button>
              <Button onClick={submit} disabled={bookMutation.isPending}>
                {bookMutation.isPending ? t('book.booking') : t('book.confirm')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const { t } = useTranslation('portal');
  const steps: Step[] = ['hospital', 'doctor', 'when', 'review'];
  const currentIdx = steps.indexOf(step);
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {steps.map((s, i) => (
        <li
          key={s}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1',
            i === currentIdx
              ? 'bg-primary text-primary-foreground'
              : i < currentIdx
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground',
          )}
        >
          <span className="font-mono">{i + 1}</span>
          <span>{t(`book.step.${s}`)}</span>
        </li>
      ))}
    </ol>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-1.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
