import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save } from 'lucide-react';
import {
  useMedicalRecord,
  useCreateMedicalRecord,
  useUpdateMedicalRecord,
} from '@/hooks/use-medical-records';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface RecordFormData {
  chiefComplaint: string;
  presentIllness: string;
  examination: string;
  diagnosis: string;
  icdCodes: string;
  treatmentPlan: string;
  notes: string;
}

const initialFormData: RecordFormData = {
  chiefComplaint: '',
  presentIllness: '',
  examination: '',
  diagnosis: '',
  icdCodes: '',
  treatmentPlan: '',
  notes: '',
};

export default function RecordFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation('medical-records');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const isEditing = !!id;
  const appointmentId = searchParams.get('appointmentId') || '';

  const { data: existingRecord, isLoading } = useMedicalRecord(
    isEditing ? id : undefined
  );
  const createRecord = useCreateMedicalRecord();
  const updateRecord = useUpdateMedicalRecord();

  const [formData, setFormData] = useState<RecordFormData>(initialFormData);

  useEffect(() => {
    if (existingRecord) {
      setFormData({
        chiefComplaint: existingRecord.chiefComplaint || '',
        presentIllness: existingRecord.presentIllness || '',
        examination: existingRecord.examination || '',
        diagnosis: existingRecord.diagnosis || '',
        icdCodes: existingRecord.icdCodes || '',
        treatmentPlan: existingRecord.treatmentPlan || '',
        notes: existingRecord.notes || '',
      });
    }
  }, [existingRecord]);

  const handleChange = (
    field: keyof RecordFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateRecord.mutateAsync({
          id: id!,
          data: {
            chiefComplaint: formData.chiefComplaint || undefined,
            presentIllness: formData.presentIllness || undefined,
            examination: formData.examination || undefined,
            diagnosis: formData.diagnosis || undefined,
            icdCodes: formData.icdCodes || undefined,
            treatmentPlan: formData.treatmentPlan || undefined,
            notes: formData.notes || undefined,
          },
        });
        toast({ title: t('recordUpdated'), variant: 'success' });
        navigate(`/medical-records/${id}`);
      } else {
        const result = await createRecord.mutateAsync({
          appointmentId,
          chiefComplaint: formData.chiefComplaint || undefined,
          presentIllness: formData.presentIllness || undefined,
          examination: formData.examination || undefined,
          diagnosis: formData.diagnosis || undefined,
          icdCodes: formData.icdCodes || undefined,
          treatmentPlan: formData.treatmentPlan || undefined,
          notes: formData.notes || undefined,
        });
        toast({ title: t('recordCreated'), variant: 'success' });
        navigate(`/medical-records/${result.id}`);
      }
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  const isPending = createRecord.isPending || updateRecord.isPending;

  if (isEditing && isLoading) {
    return <RecordFormSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label={t('backToList')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? t('editRecord') : t('createRecord')}
          </h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Clinical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('chiefComplaint')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">{t('chiefComplaint')}</Label>
              <Textarea
                id="chiefComplaint"
                rows={3}
                value={formData.chiefComplaint}
                onChange={(e) =>
                  handleChange('chiefComplaint', e.target.value)
                }
                placeholder={t('chiefComplaint')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentIllness">{t('presentIllness')}</Label>
              <Textarea
                id="presentIllness"
                rows={4}
                value={formData.presentIllness}
                onChange={(e) =>
                  handleChange('presentIllness', e.target.value)
                }
                placeholder={t('presentIllness')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examination">{t('examination')}</Label>
              <Textarea
                id="examination"
                rows={4}
                value={formData.examination}
                onChange={(e) => handleChange('examination', e.target.value)}
                placeholder={t('examination')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('diagnosis')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">{t('diagnosis')}</Label>
              <Textarea
                id="diagnosis"
                rows={3}
                value={formData.diagnosis}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
                placeholder={t('diagnosis')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icdCodes">{t('icdCodes')}</Label>
              <Input
                id="icdCodes"
                value={formData.icdCodes}
                onChange={(e) => handleChange('icdCodes', e.target.value)}
                placeholder="e.g. J06.9, R50.9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Treatment Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('treatmentPlan')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="treatmentPlan">{t('treatmentPlan')}</Label>
              <Textarea
                id="treatmentPlan"
                rows={4}
                value={formData.treatmentPlan}
                onChange={(e) =>
                  handleChange('treatmentPlan', e.target.value)
                }
                placeholder={t('treatmentPlan')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('notes')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? tCommon('loading') : tCommon('save')}
          </Button>
        </div>
      </form>
    </div>
  );
}

function RecordFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
