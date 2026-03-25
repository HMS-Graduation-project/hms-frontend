import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Eye } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import {
  useAppointments,
  type Appointment,
  type AppointmentStatus,
} from '@/hooks/use-appointments';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/appointments/status-badge';
import type { DataTableColumn } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_STATUSES: AppointmentStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

function formatName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  return [firstName, lastName].filter(Boolean).join(' ') || '-';
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export default function AppointmentsPage() {
  const { t } = useTranslation('appointments');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('');

  const table = useDataTable({
    initialSortBy: 'date',
    initialSortOrder: 'desc',
  });

  const { data, isLoading } = useAppointments({
    page: table.page,
    limit: table.limit,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.debouncedSearch,
    status: statusFilter || undefined,
  });

  const handleRowClick = (appointment: Appointment) => {
    navigate(`/appointments/${appointment.id}`);
  };

  const columns = useMemo<DataTableColumn<Appointment>[]>(
    () => [
      {
        key: 'patient',
        label: t('patient'),
        sortable: false,
        render: (row) => (
          <span className="font-medium">
            {formatName(row.patient?.user?.firstName, row.patient?.user?.lastName)}
          </span>
        ),
      },
      {
        key: 'doctor',
        label: t('doctor'),
        sortable: false,
        render: (row) => (
          <div>
            <span className="font-medium">
              {formatName(row.doctor?.user?.firstName, row.doctor?.user?.lastName)}
            </span>
            <p className="text-xs text-muted-foreground">
              {row.doctor?.specialization}
            </p>
          </div>
        ),
      },
      {
        key: 'date',
        label: t('date'),
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">{row.date}</span>
        ),
      },
      {
        key: 'startTime',
        label: t('time'),
        sortable: false,
        render: (row) => (
          <span className="text-muted-foreground">
            {formatTime(row.startTime)} - {formatTime(row.endTime)}
          </span>
        ),
      },
      {
        key: 'status',
        label: t('status'),
        sortable: false,
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'actions',
        label: tCommon('actions'),
        className: 'w-[80px]',
        render: (row) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/appointments/${row.id}`);
            }}
            aria-label={t('appointmentDetail')}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [t, tCommon, navigate],
  );

  const filterSlot = (
    <Select
      value={statusFilter}
      onValueChange={(value) => {
        setStatusFilter(value === 'ALL' ? '' : value);
        table.onPageChange(1);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('filterByStatus')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{t('allStatuses')}</SelectItem>
        {ALL_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {t(`statuses.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button
          onClick={() => navigate('/appointments/book')}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('bookAppointment')}
        </Button>
      </div>

      {/* Data Table */}
      <DataTable<Appointment>
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        page={table.page}
        limit={table.limit}
        sortBy={table.sortBy}
        sortOrder={table.sortOrder}
        search={table.search}
        onPageChange={table.onPageChange}
        onLimitChange={table.onLimitChange}
        onSortChange={table.onSortChange}
        onSearchChange={table.onSearchChange}
        filterSlot={filterSlot}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
