import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';
import { useAddVitalSigns } from '@/hooks/use-medical-records';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface VitalsFormProps {
  medicalRecordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface VitalsData {
  temperature: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
}

const initialData: VitalsData = {
  temperature: '',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  heartRate: '',
  respiratoryRate: '',
  oxygenSaturation: '',
  weight: '',
  height: '',
};

export function VitalsForm({
  medicalRecordId,
  open,
  onOpenChange,
  onSuccess,
}: VitalsFormProps) {
  const { t } = useTranslation('medical-records');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const addVitals = useAddVitalSigns();

  const [formData, setFormData] = useState<VitalsData>(initialData);

  const handleChange = (field: keyof VitalsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Record<string, number> = {};

    if (formData.temperature) payload.temperature = parseFloat(formData.temperature);
    if (formData.bloodPressureSystolic)
      payload.bloodPressureSystolic = parseInt(formData.bloodPressureSystolic);
    if (formData.bloodPressureDiastolic)
      payload.bloodPressureDiastolic = parseInt(formData.bloodPressureDiastolic);
    if (formData.heartRate) payload.heartRate = parseInt(formData.heartRate);
    if (formData.respiratoryRate)
      payload.respiratoryRate = parseInt(formData.respiratoryRate);
    if (formData.oxygenSaturation)
      payload.oxygenSaturation = parseFloat(formData.oxygenSaturation);
    if (formData.weight) payload.weight = parseFloat(formData.weight);
    if (formData.height) payload.height = parseFloat(formData.height);

    try {
      await addVitals.mutateAsync({
        medicalRecordId,
        data: payload,
      });
      toast({ title: t('vitalsRecorded'), variant: 'success' });
      setFormData(initialData);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('addVitals')}
          </DialogTitle>
          <DialogDescription>{t('vitalSigns')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Temperature */}
            <div className="space-y-2">
              <Label htmlFor="temperature">{t('temperature')}</Label>
              <div className="relative">
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="30"
                  max="45"
                  placeholder="36.6"
                  value={formData.temperature}
                  onChange={(e) => handleChange('temperature', e.target.value)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {t('celsius')}
                </span>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="space-y-2">
              <Label htmlFor="heartRate">{t('heartRate')}</Label>
              <div className="relative">
                <Input
                  id="heartRate"
                  type="number"
                  min="30"
                  max="250"
                  placeholder="72"
                  value={formData.heartRate}
                  onChange={(e) => handleChange('heartRate', e.target.value)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {t('bpm')}
                </span>
              </div>
            </div>

            {/* Blood Pressure Systolic */}
            <div className="space-y-2">
              <Label htmlFor="systolic">
                {t('bloodPressure')} ({t('systolic')})
              </Label>
              <div className="relative">
                <Input
                  id="systolic"
                  type="number"
                  min="60"
                  max="300"
                  placeholder="120"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) =>
                    handleChange('bloodPressureSystolic', e.target.value)
                  }
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {t('mmHg')}
                </span>
              </div>
            </div>

            {/* Blood Pressure Diastolic */}
            <div className="space-y-2">
              <Label htmlFor="diastolic">
                {t('bloodPressure')} ({t('diastolic')})
              </Label>
              <div className="relative">
                <Input
                  id="diastolic"
                  type="number"
                  min="30"
                  max="200"
                  placeholder="80"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) =>
                    handleChange('bloodPressureDiastolic', e.target.value)
                  }
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {t('mmHg')}
                </span>
              </div>
            </div>

            {/* Respiratory Rate */}
            <div className="space-y-2">
              <Label htmlFor="respiratoryRate">{t('respiratoryRate')}</Label>
              <div className="relative">
                <Input
                  id="respiratoryRate"
                  type="number"
                  min="5"
                  max="60"
                  placeholder="16"
                  value={formData.respiratoryRate}
                  onChange={(e) =>
                    handleChange('respiratoryRate', e.target.value)
                  }
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {t('breaths')}
                </span>
              </div>
            </div>

            {/* O2 Saturation */}
            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation">{t('oxygenSaturation')}</Label>
              <div className="relative">
                <Input
                  id="oxygenSaturation"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="98"
                  value={formData.oxygenSaturation}
                  onChange={(e) =>
                    handleChange('oxygenSaturation', e.target.value)
                  }
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {t('percent')}
                </span>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">{t('weight')}</Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  max="500"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {t('kg')}
                </span>
              </div>
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height">{t('height')}</Label>
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="0"
                  max="300"
                  placeholder="170"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {t('cm')}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={addVitals.isPending}>
              {addVitals.isPending ? tCommon('loading') : t('addVitals')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
