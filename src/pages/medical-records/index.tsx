import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { useMedicalRecords } from '@/hooks/use-medical-records';
import { useDataTable } from '@/hooks/use-data-table';
import { useAuth } from '@/providers/auth-provider';
import { DataTable } from '@/components/data-table';
import { GovernorateHospitalFilter } from '@/components/scope/governorate-hospital-filter';
import { NoPortalAccountBadge } from '@/components/patients/no-portal-account-badge';
import { getPatientDisplayName } from '@/lib/patient-name';
import type { DataTableColumn } from '@/lib/types';

export default function MedicalRecordsPage() {
  const { t, i18n } = useTranslation('medical-records');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isArabic = (i18n.language || 'en').split('-')[0] === 'ar';

  // National / regional scope (no single hospital): show the Governorate →
  // Hospital filters and a Hospital context column.
  const isNational = !user?.hospitalId;

  const [governorate, setGovernorate] = useState('');
  const [hospitalId, setHospitalId] = useState('');

  const table = useDataTable();

  const { data, isLoading } = useMedicalRecords({
    page: table.page,
    limit: table.limit,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.debouncedSearch,
    governorate: isNational ? governorate || undefined : undefined,
    hospitalId: isNational ? hospitalId || undefined : undefined,
  });

  const columns: DataTableColumn<any>[] = [
    {
      key: 'patient',
      label: t('patient'),
      render: (row) => {
        if (!row.patient) return '-';
        return (
          <span className="flex items-center gap-2">
            {getPatientDisplayName(row.patient, '-')}
            <NoPortalAccountBadge patient={row.patient} />
          </span>
        );
      },
    },
    {
      key: 'doctor',
      label: t('doctor'),
      render: (row) => {
        const u = row.doctor?.user;
        return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email : '-';
      },
    },
    ...(isNational
      ? [
          {
            key: 'hospital',
            label: tCommon('hospital'),
            render: (row: any) => {
              const h = row.hospital;
              if (!h) return <span className="text-muted-foreground">-</span>;
              const name = isArabic && h.nameAr ? h.nameAr : h.name;
              const cityName =
                isArabic && h.city?.nameAr ? h.city.nameAr : h.city?.name;
              const sub = [h.city?.governorate, cityName]
                .filter(Boolean)
                .join(' · ');
              return (
                <div>
                  <span className="font-medium">{name}</span>
                  {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                </div>
              );
            },
          } as DataTableColumn<any>,
        ]
      : []),
    {
      key: 'diagnosis',
      label: t('diagnosis'),
      render: (row) => row.diagnosis || '-',
    },
    {
      key: 'date',
      label: t('date'),
      sortable: true,
      render: (row) => row.appointment?.date
        ? new Date(row.appointment.date).toLocaleDateString()
        : new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const filterSlot = isNational ? (
    <GovernorateHospitalFilter
      governorate={governorate}
      hospitalId={hospitalId}
      onGovernorateChange={(v) => {
        setGovernorate(v);
        setHospitalId('');
        table.setPage(1);
      }}
      onHospitalChange={(v) => {
        setHospitalId(v);
        table.setPage(1);
      }}
      enabled={isNational}
    />
  ) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        page={table.page}
        limit={table.limit}
        sortBy={table.sortBy}
        sortOrder={table.sortOrder}
        search={table.search}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        onSortChange={table.onSortChange}
        onSearchChange={table.setSearch}
        filterSlot={filterSlot}
        onRowClick={(row) => navigate(`/medical-records/${row.id}`)}
      />
    </div>
  );
}
