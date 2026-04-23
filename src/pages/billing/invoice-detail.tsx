import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Printer,
  User,
  Calendar,
  CreditCard,
  FileText,
  Plus,
} from 'lucide-react';
import {
  useInvoice,
  type InvoiceStatus,
} from '@/hooks/use-billing';
import { PaymentForm } from '@/components/billing/payment-form';
import { PrintInvoice } from '@/components/billing/print-invoice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_BADGE_MAP: Record<
  InvoiceStatus,
  'secondary' | 'success' | 'warning' | 'destructive' | 'default' | 'outline'
> = {
  DRAFT: 'secondary',
  ISSUED: 'default',
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  CANCELLED: 'destructive',
  OVERDUE: 'destructive',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('billing');
  const { t: tCommon } = useTranslation('common');
  const printRef = useRef<HTMLDivElement>(null);

  const { data: invoice, isLoading } = useInvoice(id);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <InvoiceDetailSkeleton />;
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{tCommon('noResults')}</p>
      </div>
    );
  }

  const patientName = invoice.patient
    ? [invoice.patient.user.firstName, invoice.patient.user.lastName]
        .filter(Boolean)
        .join(' ') || invoice.patient.user.email
    : '--';

  const invoiceDate = invoice.issuedAt
    ? new Date(invoice.issuedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(invoice.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const dueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '--';

  const balance = invoice.total - invoice.paidAmount;
  const canRecordPayment =
    invoice.status !== 'PAID' && invoice.status !== 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/billing')}
            aria-label={t('backToList')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('invoiceDetail')}
            </h1>
            <p className="text-muted-foreground">
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex-1 sm:flex-none"
          >
            <Printer className="mr-2 h-4 w-4" />
            {t('print')}
          </Button>
          {canRecordPayment && (
            <Button
              onClick={() => setPaymentOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('recordPayment')}
            </Button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t('status')}:</span>
        <Badge variant={STATUS_BADGE_MAP[invoice.status]}>
          {t(`statuses.${invoice.status}`)}
        </Badge>
      </div>

      {/* Meta Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Patient */}
        {invoice.patient && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t('patient')}</p>
                <Link
                  to={`/patients/${invoice.patientId}`}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {patientName}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issued At */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('issuedAt')}</p>
              <p className="text-sm font-medium">{invoiceDate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Due Date */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('dueDate')}</p>
              <p className="text-sm font-medium">{dueDate}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            {t('items')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.items && invoice.items.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead className="text-right">
                      {t('quantity')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('unitPrice')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('itemTotal')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        {t(`categories.${item.category}`)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noItems')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Totals Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="font-medium">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tax')}</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.tax)}
                  </span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('discount')}
                  </span>
                  <span className="font-medium">
                    -{formatCurrency(invoice.discount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>{t('total')}</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('paidAmount')}
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>{t('balance')}</span>
                <span
                  className={
                    balance > 0
                      ? 'text-destructive'
                      : 'text-green-600 dark:text-green-400'
                  }
                >
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            {t('payments')}
          </CardTitle>
          {canRecordPayment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaymentOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('recordPayment')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {invoice.payments && invoice.payments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead className="text-right">{t('amount')}</TableHead>
                    <TableHead>{t('method')}</TableHead>
                    <TableHead>{t('reference')}</TableHead>
                    <TableHead>{t('paidAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.payments.map((payment, index) => (
                    <TableRow key={payment.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {t(`methods.${payment.method}`)}
                      </TableCell>
                      <TableCell>{payment.reference || '--'}</TableCell>
                      <TableCell>
                        {new Date(payment.paidAt).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noPayments')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Print component (hidden on screen) */}
      <PrintInvoice ref={printRef} invoice={invoice} />

      {/* Payment Dialog */}
      <PaymentForm
        invoiceId={invoice.id}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
      />
    </div>
  );
}

function InvoiceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
