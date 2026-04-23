import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnterLabResult } from '@/hooks/use-laboratory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface LabResultFormProps {
  labOrderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LabResultForm({
  labOrderId,
  open,
  onOpenChange,
}: LabResultFormProps) {
  const { t } = useTranslation('laboratory');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const enterResult = useEnterLabResult();

  const [result, setResult] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [unit, setUnit] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setResult('');
    setNormalRange('');
    setUnit('');
    setIsAbnormal(false);
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result.trim()) return;

    try {
      await enterResult.mutateAsync({
        id: labOrderId,
        result: result.trim(),
        normalRange: normalRange.trim() || undefined,
        unit: unit.trim() || undefined,
        isAbnormal: isAbnormal || undefined,
        notes: notes.trim() || undefined,
      });
      toast({ title: t('resultEntered'), variant: 'success' });
      resetForm();
      onOpenChange(false);
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('enterResults')}</DialogTitle>
            <DialogDescription>{t('testName')}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Result (required) */}
            <div className="space-y-2">
              <Label htmlFor="lab-result">{t('result')} *</Label>
              <Textarea
                id="lab-result"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder={t('result')}
                required
                rows={3}
              />
            </div>

            {/* Normal Range + Unit row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lab-normal-range">{t('normalRange')}</Label>
                <Input
                  id="lab-normal-range"
                  value={normalRange}
                  onChange={(e) => setNormalRange(e.target.value)}
                  placeholder="e.g. 70-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lab-unit">{t('unit')}</Label>
                <Input
                  id="lab-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. mg/dL"
                />
              </div>
            </div>

            {/* Is Abnormal */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lab-abnormal"
                checked={isAbnormal}
                onCheckedChange={(checked) =>
                  setIsAbnormal(checked === true)
                }
              />
              <Label
                htmlFor="lab-abnormal"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('abnormal')}
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="lab-notes">{t('notes')}</Label>
              <Textarea
                id="lab-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notes')}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={enterResult.isPending || !result.trim()}
            >
              {enterResult.isPending ? tCommon('loading') : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
