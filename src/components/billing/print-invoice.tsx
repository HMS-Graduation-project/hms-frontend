import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Invoice } from '@/hooks/use-billing';

interface PrintInvoiceProps {
  invoice: Invoice;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export const PrintInvoice = forwardRef<HTMLDivElement, PrintInvoiceProps>(
  function PrintInvoice({ invoice }, ref) {
    const { t } = useTranslation('billing');

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

    return (
      <>
        {/* Print-only styles */}
        <style>{`
          @media print {
            /* Hide everything except the print container */
            body * {
              visibility: hidden;
            }
            #print-invoice,
            #print-invoice * {
              visibility: visible;
            }
            #print-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Force light theme for printing */
            #print-invoice .print-card {
              background: white !important;
              color: black !important;
              border-color: #e5e7eb !important;
            }
            #print-invoice .print-text-muted {
              color: #6b7280 !important;
            }
            #print-invoice table {
              border-collapse: collapse;
              width: 100%;
            }
            #print-invoice th,
            #print-invoice td {
              border: 1px solid #d1d5db;
              padding: 8px 12px;
              text-align: left;
            }
            #print-invoice th {
              background-color: #f3f4f6 !important;
              font-weight: 600;
            }
            #print-invoice .text-right {
              text-align: right;
            }
          }
        `}</style>

        {/* Print container - hidden on screen, visible only when printing */}
        <div
          ref={ref}
          id="print-invoice"
          className="hidden print:block p-8 font-sans"
        >
          {/* Hospital Header */}
          <div className="print-card mb-6 text-center border-b border-gray-300 pb-4">
            <h1 className="text-2xl font-bold">
              HMS - Hospital Management System
            </h1>
            <p className="print-text-muted text-sm mt-1">
              {t('invoiceDetail')}
            </p>
          </div>

          {/* Invoice Info Section */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="print-text-muted">{t('invoiceNumber')}:</p>
              <p className="font-semibold">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="print-text-muted">{t('status')}:</p>
              <p className="font-semibold">
                {t(`statuses.${invoice.status}`)}
              </p>
            </div>
            <div>
              <p className="print-text-muted">{t('patient')}:</p>
              <p className="font-semibold">{patientName}</p>
            </div>
            <div className="text-right">
              <p className="print-text-muted">{t('issuedAt')}:</p>
              <p className="font-semibold">{invoiceDate}</p>
            </div>
            {invoice.patient?.user.email && (
              <div>
                <p className="print-text-muted">Email:</p>
                <p className="font-semibold">{invoice.patient.user.email}</p>
              </div>
            )}
            <div className="text-right">
              <p className="print-text-muted">{t('dueDate')}:</p>
              <p className="font-semibold">{dueDate}</p>
            </div>
          </div>

          {/* Items Table */}
          <h2 className="text-lg font-semibold mb-2">{t('items')}</h2>
          <table className="mb-6">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('description')}</th>
                <th>{t('category')}</th>
                <th className="text-right">{t('quantity')}</th>
                <th className="text-right">{t('unitPrice')}</th>
                <th className="text-right">{t('itemTotal')}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td className="font-medium">{item.description}</td>
                  <td>{t(`categories.${item.category}`)}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mb-6 flex justify-end">
            <div className="w-64 text-sm">
              <div className="flex justify-between py-1">
                <span className="print-text-muted">{t('subtotal')}:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between py-1">
                  <span className="print-text-muted">{t('tax')}:</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.tax)}
                  </span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between py-1">
                  <span className="print-text-muted">{t('discount')}:</span>
                  <span className="font-medium">
                    -{formatCurrency(invoice.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-300 pt-1 mt-1 font-bold">
                <span>{t('total')}:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="print-text-muted">{t('paidAmount')}:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-1 mt-1 font-bold">
                <span>{t('balance')}:</span>
                <span>{formatCurrency(balance)}</span>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          {invoice.payments && invoice.payments.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mb-2">{t('payments')}</h2>
              <table className="mb-6">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('amount')}</th>
                    <th>{t('method')}</th>
                    <th>{t('reference')}</th>
                    <th>{t('paidAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment, index) => (
                    <tr key={payment.id}>
                      <td>{index + 1}</td>
                      <td className="font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td>{t(`methods.${payment.method}`)}</td>
                      <td>{payment.reference || '--'}</td>
                      <td>
                        {new Date(payment.paidAt).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Footer */}
          <div className="mt-12 border-t border-gray-300 pt-4 text-center text-xs print-text-muted">
            <p>HMS - Hospital Management System</p>
            <p>
              {t('invoiceNumber')}: {invoice.invoiceNumber} | Printed:{' '}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </>
    );
  }
);
