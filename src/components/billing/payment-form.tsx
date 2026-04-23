import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecordPayment, type PaymentMethod } from '@/hooks/use-billing';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const PAYMENT_METHODS: PaymentMethod[] = [
  'CASH',
  'CREDIT_CARD',
  'INSURANCE',
  'BANK_TRANSFER',
];

interface PaymentFormProps {
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentForm({
  invoiceId,
  open,
  onOpenChange,
}: PaymentFormProps) {
  const { t } = useTranslation('billing');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const recordPayment = useRecordPayment();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [reference, setReference] = useState('');

  const resetForm = () => {
    setAmount('');
    setMethod('');
    setReference('');
  };

  const handleSubmit = async () => {
    if (!amount || !method) return;

    try {
      await recordPayment.mutateAsync({
        invoiceId,
        data: {
          amount: parseFloat(amount),
          method,
          reference: reference || undefined,
        },
      });

      toast({ title: t('paymentRecorded'), variant: 'success' });
      resetForm();
      onOpenChange(false);
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  const canSubmit =
    !!amount && parseFloat(amount) > 0 && !!method && !recordPayment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('recordPayment')}</DialogTitle>
          <DialogDescription>{t('recordPayment')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="payment-amount">{t('amount')}</Label>
            <Input
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Method */}
          <div className="space-y-2">
            <Label>{t('method')}</Label>
            <Select
              value={method}
              onValueChange={(val) => setMethod(val as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectMethod')} />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {t(`methods.${m}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="payment-reference">
              {t('reference')}{' '}
              <span className="text-muted-foreground text-xs">
                ({tCommon('optional') || 'optional'})
              </span>
            </Label>
            <Input
              id="payment-reference"
              placeholder={t('reference')}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {recordPayment.isPending ? tCommon('loading') : tCommon('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
