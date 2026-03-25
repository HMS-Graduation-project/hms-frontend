import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { useMedicalRecords } from '@/hooks/use-medical-records';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn } from '@/lib/types';

export default function MedicalRecordsPage() {
  const { t } = useTranslation('medical-records');
  const navigate = useNavigate();
  const table = useDataTable();

  const { data, isLoading } = useMedicalRecords({
    page: table.page,
    limit: table.limit,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.debouncedSearch,
  });

  const columns: DataTableColumn<any>[] = [
    {
      key: 'patient',
      label: t('patient'),
      render: (row) => {
        const u = row.patient?.user;
        return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email : '-';
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
        onRowClick={(row) => navigate(`/medical-records/${row.id}`)}
      />
    </div>
  );
}
