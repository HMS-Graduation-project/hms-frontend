import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import {
  useCreateInvoice,
  type InvoiceItemCategory,
} from '@/hooks/use-billing';
import { usePatients, type PatientProfile } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

const CATEGORIES: InvoiceItemCategory[] = [
  'CONSULTATION',
  'LAB_TEST',
  'MEDICATION',
  'PROCEDURE',
];

interface LineItem {
  id: string;
  description: string;
  category: InvoiceItemCategory | '';
  quantity: string;
  unitPrice: string;
}

function createEmptyItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    category: '',
    quantity: '1',
    unitPrice: '',
  };
}

function getPatientName(patient: PatientProfile): string {
  return (
    [patient.user.firstName, patient.user.lastName].filter(Boolean).join(' ') ||
    patient.user.email
  );
}

export default function CreateInvoicePage() {
  const { t } = useTranslation('billing');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();
  const createInvoice = useCreateInvoice();

  // Patient search
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const { data: patientsData, isLoading: patientsLoading } = usePatients({
    limit: 100,
    search: patientSearch,
  });

  // Line items
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);

  // Tax and discount
  const [tax, setTax] = useState('');
  const [discount, setDiscount] = useState('');

  const updateItem = (id: string, field: keyof LineItem, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const taxAmount = parseFloat(tax) || 0;
  const discountAmount = parseFloat(discount) || 0;
  const total = subtotal + taxAmount - discountAmount;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const canSubmit =
    !!selectedPatientId &&
    items.length > 0 &&
    items.every(
      (item) =>
        item.description.trim() &&
        item.category &&
        parseFloat(item.quantity) > 0 &&
        parseFloat(item.unitPrice) > 0
    ) &&
    !createInvoice.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      const invoice = await createInvoice.mutateAsync({
        patientId: selectedPatientId,
        items: items.map((item) => ({
          description: item.description.trim(),
          category: item.category as InvoiceItemCategory,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
        })),
        tax: taxAmount || undefined,
        discount: discountAmount || undefined,
      });

      toast({ title: t('invoiceCreated'), variant: 'success' });
      navigate(`/billing/${invoice.id}`);
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/billing')}
          aria-label={t('backToList')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('createInvoice')}
          </h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('patient')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="patient-search">{t('searchPatients')}</Label>
            <Input
              id="patient-search"
              placeholder={t('searchPatients')}
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="mt-1"
            />
          </div>

          {patientsLoading ? (
            <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
          ) : (
            <Select
              value={selectedPatientId}
              onValueChange={setSelectedPatientId}
            >
              <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">{t('items')}</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addItem')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Header row - visible on larger screens */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_150px_80px_100px_100px_40px] sm:gap-2 sm:text-sm sm:font-medium sm:text-muted-foreground">
            <span>{t('description')}</span>
            <span>{t('category')}</span>
            <span>{t('quantity')}</span>
            <span>{t('unitPrice')}</span>
            <span>{t('itemTotal')}</span>
            <span />
          </div>

          {items.map((item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            const lineTotal = qty * price;

            return (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_150px_80px_100px_100px_40px] sm:items-center rounded-md border p-3 sm:border-0 sm:p-0"
              >
                {/* Description */}
                <div>
                  <Label className="sm:hidden">{t('description')}</Label>
                  <Input
                    placeholder={t('description')}
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, 'description', e.target.value)
                    }
                  />
                </div>

                {/* Category */}
                <div>
                  <Label className="sm:hidden">{t('category')}</Label>
                  <Select
                    value={item.category}
                    onValueChange={(val) =>
                      updateItem(item.id, 'category', val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {t(`categories.${cat}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div>
                  <Label className="sm:hidden">{t('quantity')}</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', e.target.value)
                    }
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <Label className="sm:hidden">{t('unitPrice')}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(item.id, 'unitPrice', e.target.value)
                    }
                  />
                </div>

                {/* Line Total */}
                <div className="flex items-center">
                  <span className="sm:hidden mr-2 text-sm font-medium text-muted-foreground">
                    {t('itemTotal')}:
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>

                {/* Remove */}
                <div className="flex items-center justify-end sm:justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    aria-label={t('removeItem')}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tax, Discount & Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Tax */}
            <div className="space-y-2">
              <Label htmlFor="tax">{t('tax')}</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
              />
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount">{t('discount')}</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tax')}</span>
                  <span className="font-medium">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('discount')}</span>
                  <span className="font-medium">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>{t('total')}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => navigate('/billing')}>
          {tCommon('cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {createInvoice.isPending ? tCommon('loading') : t('createInvoice')}
        </Button>
      </div>
    </div>
  );
}
