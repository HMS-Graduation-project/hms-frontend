import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Prescription } from '@/hooks/use-prescriptions';

interface PrintPrescriptionProps {
  prescription: Prescription;
}

export const PrintPrescription = forwardRef<
  HTMLDivElement,
  PrintPrescriptionProps
>(function PrintPrescription({ prescription }, ref) {
  const { t } = useTranslation('prescriptions');

  const patientName = prescription.patient
    ? [
        prescription.patient.user.firstName,
        prescription.patient.user.lastName,
      ]
        .filter(Boolean)
        .join(' ') || prescription.patient.user.email
    : '--';

  const doctorName = prescription.doctor
    ? [
        prescription.doctor.user.firstName,
        prescription.doctor.user.lastName,
      ]
        .filter(Boolean)
        .join(' ') || prescription.doctor.user.email
    : '--';

  const prescriptionDate = new Date(
    prescription.createdAt
  ).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          /* Hide everything except the print container */
          body * {
            visibility: hidden;
          }
          #print-prescription,
          #print-prescription * {
            visibility: visible;
          }
          #print-prescription {
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
          #print-prescription .print-card {
            background: white !important;
            color: black !important;
            border-color: #e5e7eb !important;
          }
          #print-prescription .print-text-muted {
            color: #6b7280 !important;
          }
          #print-prescription table {
            border-collapse: collapse;
            width: 100%;
          }
          #print-prescription th,
          #print-prescription td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
          }
          #print-prescription th {
            background-color: #f3f4f6 !important;
            font-weight: 600;
          }
        }
      `}</style>

      {/* Print container - hidden on screen, visible only when printing */}
      <div
        ref={ref}
        id="print-prescription"
        className="hidden print:block p-8 font-sans"
      >
        {/* Header */}
        <div className="print-card mb-6 text-center border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold">HMS - Hospital Management System</h1>
          <p className="print-text-muted text-sm mt-1">
            {t('prescriptionDetail')}
          </p>
        </div>

        {/* Info Section */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="print-text-muted">{t('prescribedFor')}:</p>
            <p className="font-semibold">{patientName}</p>
          </div>
          <div className="text-right">
            <p className="print-text-muted">{t('prescriptionDate')}:</p>
            <p className="font-semibold">{prescriptionDate}</p>
          </div>
          <div>
            <p className="print-text-muted">{t('prescribedBy')}:</p>
            <p className="font-semibold">{doctorName}</p>
          </div>
          <div className="text-right">
            <p className="print-text-muted">{t('status')}:</p>
            <p className="font-semibold">
              {t(`statuses.${prescription.status}`)}
            </p>
          </div>
        </div>

        {/* Medications Table */}
        <table className="mb-6">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('medication')}</th>
              <th>{t('dosage')}</th>
              <th>{t('frequency')}</th>
              <th>{t('duration')}</th>
              <th>{t('quantity')}</th>
              <th>{t('instructions')}</th>
            </tr>
          </thead>
          <tbody>
            {prescription.items?.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td className="font-medium">{item.medicationName}</td>
                <td>{item.dosage}</td>
                <td>{item.frequency}</td>
                <td>{item.duration}</td>
                <td>{item.quantity ?? '--'}</td>
                <td>{item.instructions || '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes */}
        {prescription.notes && (
          <div className="mb-8 text-sm">
            <p className="print-text-muted font-semibold mb-1">
              {t('notes')}:
            </p>
            <p className="whitespace-pre-wrap">{prescription.notes}</p>
          </div>
        )}

        {/* Signature area */}
        <div className="mt-16 flex justify-between text-sm">
          <div />
          <div className="text-center">
            <div className="mb-2 w-48 border-b border-gray-400" />
            <p className="print-text-muted">{t('prescribedBy')}</p>
            <p className="font-semibold">{doctorName}</p>
          </div>
        </div>
      </div>
    </>
  );
});
