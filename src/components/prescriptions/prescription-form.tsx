import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Pill } from 'lucide-react';
import { useCreatePrescription } from '@/hooks/use-prescriptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface MedicationItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
  instructions: string;
}

const emptyItem: MedicationItem = {
  medicationName: '',
  dosage: '',
  frequency: '',
  duration: '',
  quantity: '',
  instructions: '',
};

interface PrescriptionFormProps {
  medicalRecordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PrescriptionForm({
  medicalRecordId,
  open,
  onOpenChange,
  onSuccess,
}: PrescriptionFormProps) {
  const { t } = useTranslation('prescriptions');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const createPrescription = useCreatePrescription();

  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<MedicationItem[]>([{ ...emptyItem }]);

  const handleItemChange = (
    index: number,
    field: keyof MedicationItem,
    value: string
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out incomplete items
    const validItems = items
      .filter(
        (item) =>
          item.medicationName.trim() &&
          item.dosage.trim() &&
          item.frequency.trim() &&
          item.duration.trim()
      )
      .map((item) => ({
        medicationName: item.medicationName.trim(),
        dosage: item.dosage.trim(),
        frequency: item.frequency.trim(),
        duration: item.duration.trim(),
        quantity: item.quantity ? parseInt(item.quantity) : undefined,
        instructions: item.instructions.trim() || undefined,
      }));

    if (validItems.length === 0) return;

    try {
      await createPrescription.mutateAsync({
        medicalRecordId,
        notes: notes.trim() || undefined,
        items: validItems,
      });
      toast({ title: t('prescriptionCreated'), variant: 'success' });
      setNotes('');
      setItems([{ ...emptyItem }]);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            {t('createPrescription')}
          </DialogTitle>
          <DialogDescription>{t('subtitle')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="rx-notes">{t('notes')}</Label>
            <Textarea
              id="rx-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notes')}
            />
          </div>

          <Separator />

          {/* Medication items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {t('medications')}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t('addMedication')}
              </Button>
            </div>

            {items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noMedications')}
              </p>
            )}

            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('medication')} #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="mr-1 h-4 w-4 text-destructive" />
                      {t('removeMedication')}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label>{t('medication')}</Label>
                    <Input
                      value={item.medicationName}
                      onChange={(e) =>
                        handleItemChange(index, 'medicationName', e.target.value)
                      }
                      placeholder={t('medication')}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('dosage')}</Label>
                    <Input
                      value={item.dosage}
                      onChange={(e) =>
                        handleItemChange(index, 'dosage', e.target.value)
                      }
                      placeholder="e.g. 500mg"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('frequency')}</Label>
                    <Input
                      value={item.frequency}
                      onChange={(e) =>
                        handleItemChange(index, 'frequency', e.target.value)
                      }
                      placeholder="e.g. 3x daily"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('duration')}</Label>
                    <Input
                      value={item.duration}
                      onChange={(e) =>
                        handleItemChange(index, 'duration', e.target.value)
                      }
                      placeholder="e.g. 7 days"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('quantity')}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      placeholder="e.g. 21"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>{t('instructions')}</Label>
                    <Input
                      value={item.instructions}
                      onChange={(e) =>
                        handleItemChange(index, 'instructions', e.target.value)
                      }
                      placeholder={t('instructions')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                createPrescription.isPending ||
                items.every((i) => !i.medicationName.trim())
              }
            >
              {createPrescription.isPending
                ? tCommon('loading')
                : t('createPrescription')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
