import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, ChevronRight, ChevronLeft, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useCreateAppointment, useAvailableSlots, type AvailableSlot } from '@/hooks/use-appointments';
import { useDoctors, type DoctorProfile } from '@/hooks/use-doctors';
import { usePatients, type PatientProfile } from '@/hooks/use-patients';
import { TimeSlotPicker } from '@/components/appointments/time-slot-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const STEPS = [1, 2, 3, 4] as const;

function getDoctorName(doctor: DoctorProfile): string {
  return [doctor.user.firstName, doctor.user.lastName].filter(Boolean).join(' ') || doctor.user.email;
}

function getPatientName(patient: PatientProfile): string {
  return [patient.user.firstName, patient.user.lastName].filter(Boolean).join(' ') || patient.user.email;
}

export default function BookAppointmentPage() {
  const { t } = useTranslation('appointments');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const isPatient = user?.role === 'PATIENT';

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [reason, setReason] = useState('');

  // Doctor search
  const [doctorSearch, setDoctorSearch] = useState('');

  // Fetch doctors list
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors({
    limit: 100,
    search: doctorSearch,
  });

  // Fetch patients list (only for non-patient roles)
  const { data: patientsData, isLoading: patientsLoading } = usePatients({
    limit: 100,
  });

  // Fetch available slots
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(
    selectedDoctorId || undefined,
    selectedDate || undefined,
  );

  const createAppointment = useCreateAppointment();

  // Get the selected doctor and patient objects for the review step
  const selectedDoctor = useMemo(
    () => doctorsData?.data?.find((d) => d.id === selectedDoctorId),
    [doctorsData, selectedDoctorId],
  );

  const selectedPatient = useMemo(
    () => patientsData?.data?.find((p) => p.id === selectedPatientId),
    [patientsData, selectedPatientId],
  );

  // Validation per step
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!selectedDoctorId;
      case 2:
        return !!selectedDate && !!selectedSlot;
      case 3:
        return isPatient || !!selectedPatientId;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, selectedDoctorId, selectedDate, selectedSlot, selectedPatientId, isPatient]);

  const handleNext = () => {
    if (currentStep < 4 && canProceed) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;

    try {
      await createAppointment.mutateAsync({
        doctorId: selectedDoctorId,
        ...(isPatient ? {} : { patientId: selectedPatientId }),
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        departmentId: selectedDoctor?.departmentId || undefined,
        type: appointmentType || undefined,
        reason: reason || undefined,
      });

      toast({
        title: t('appointmentCreated'),
        variant: 'success',
      });

      navigate('/appointments');
    } catch {
      toast({
        title: tCommon('error'),
        variant: 'destructive',
      });
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    // Reset downstream selections when doctor changes
    setSelectedDate('');
    setSelectedSlot(null);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  // Today's date for min attribute on date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/appointments')}
          aria-label={t('backToList')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('bookAppointment')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step === currentStep
                    ? 'bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {step < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                step
              )}
            </div>
            {step < 4 && (
              <div
                className={`hidden h-0.5 w-8 sm:block ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {t('step')} {currentStep} {t('of')} 4
      </p>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Select Doctor */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="h-5 w-5" />
                {t('doctor')}
              </div>
              <Separator />

              <div>
                <Label htmlFor="doctor-search">{t('selectDoctor')}</Label>
                <Input
                  id="doctor-search"
                  placeholder={t('selectDoctor')}
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="mt-1"
                />
              </div>

              {doctorsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {doctorsData?.data?.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => handleDoctorSelect(doctor.id)}
                      className={`flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                        selectedDoctorId === doctor.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'border-border'
                      }`}
                    >
                      <span className="font-medium">{getDoctorName(doctor)}</span>
                      <span className="text-sm text-muted-foreground">
                        {doctor.specialization}
                      </span>
                      {doctor.department && (
                        <span className="text-xs text-muted-foreground">
                          {doctor.department.name}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5" />
                {t('date')} & {t('time')}
              </div>
              <Separator />

              <div>
                <Label htmlFor="appointment-date">{t('selectDate')}</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="mt-1 max-w-xs"
                />
              </div>

              {selectedDate && (
                <div>
                  <Label>{t('selectTimeSlot')}</Label>
                  <div className="mt-2">
                    <TimeSlotPicker
                      slots={slots}
                      isLoading={slotsLoading}
                      selectedSlot={selectedSlot}
                      onSelect={setSelectedSlot}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Patient & Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                {t('patient')} & {t('type')}
              </div>
              <Separator />

              {!isPatient && (
                <div>
                  <Label>{t('selectPatient')}</Label>
                  {patientsLoading ? (
                    <Skeleton className="mt-1 h-10 w-full" />
                  ) : (
                    <Select
                      value={selectedPatientId}
                      onValueChange={setSelectedPatientId}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t('selectPatient')} />
                      </SelectTrigger>
                      <SelectContent>
                        {patientsData?.data?.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {getPatientName(patient)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <div>
                <Label>{t('selectType')}</Label>
                <Select
                  value={appointmentType}
                  onValueChange={setAppointmentType}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSULTATION">{t('consultation')}</SelectItem>
                    <SelectItem value="FOLLOW_UP">{t('followUp')}</SelectItem>
                    <SelectItem value="EMERGENCY">{t('emergency')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">{t('reason')}</Label>
                <Textarea
                  id="reason"
                  placeholder={t('reason')}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Check className="h-5 w-5" />
                {t('confirmBooking')}
              </div>
              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Stethoscope className="h-4 w-4" />
                      {t('doctor')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDoctor ? (
                      <div>
                        <p className="font-medium">{getDoctorName(selectedDoctor)}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDoctor.specialization}
                        </p>
                        {selectedDoctor.department && (
                          <p className="text-sm text-muted-foreground">
                            {selectedDoctor.department.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">-</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4" />
                      {t('date')} & {t('time')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedDate}</p>
                    {selectedSlot && (
                      <p className="text-sm text-muted-foreground">
                        {selectedSlot.startTime.slice(0, 5)} - {selectedSlot.endTime.slice(0, 5)}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {!isPatient && selectedPatient && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4" />
                        {t('patient')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{getPatientName(selectedPatient)}</p>
                    </CardContent>
                  </Card>
                )}

                {(appointmentType || reason) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4" />
                        {t('type')} & {t('reason')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {appointmentType && (
                        <p className="font-medium">
                          {appointmentType === 'CONSULTATION'
                            ? t('consultation')
                            : appointmentType === 'FOLLOW_UP'
                              ? t('followUp')
                              : t('emergency')}
                        </p>
                      )}
                      {reason && (
                        <p className="text-sm text-muted-foreground">{reason}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t('previous')}
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext} disabled={!canProceed}>
            {t('next')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createAppointment.isPending}
          >
            {createAppointment.isPending ? tCommon('loading') : t('confirmBooking')}
          </Button>
        )}
      </div>
    </div>
  );
}
