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
import { useGroupedDepartments } from '@/hooks/use-departments';
import { useAuth } from '@/providers/auth-provider';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/appointments/status-badge';
import { NoPortalAccountBadge } from '@/components/patients/no-portal-account-badge';
import { getPatientDisplayName } from '@/lib/patient-name';
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
  const { t, i18n } = useTranslation('appointments');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isArabic = (i18n.language || 'en').split('-')[0] === 'ar';

  // National / regional scope (no single hospital): show the
  // Governorate → Hospital → Department drill-down filters + context columns.
  const isNational = !user?.hospitalId;

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [governorate, setGovernorate] = useState<string>('');
  const [hospitalId, setHospitalId] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');

  const table = useDataTable({
    initialSortBy: 'date',
    initialSortOrder: 'desc',
  });

  // Reuse the grouped-departments tree to drive the cascading filters.
  const { data: grouped } = useGroupedDepartments(isNational);
  const govOptions = grouped?.governorates ?? [];
  const selectedGov = govOptions.find((g) => g.governorate === governorate);
  const hospitalOptions = selectedGov
    ? selectedGov.hospitals
    : govOptions.flatMap((g) => g.hospitals);
  const selectedHospital = hospitalOptions.find((h) => h.id === hospitalId);
  const departmentOptions = selectedHospital?.departments ?? [];

  const { data, isLoading } = useAppointments({
    page: table.page,
    limit: table.limit,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.debouncedSearch,
    status: statusFilter || undefined,
    governorate: isNational ? governorate || undefined : undefined,
    hospitalId: isNational ? hospitalId || undefined : undefined,
    departmentId: isNational ? departmentId || undefined : undefined,
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
          <span className="flex items-center gap-2 font-medium">
            {getPatientDisplayName(row.patient)}
            <NoPortalAccountBadge patient={row.patient} />
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
      ...(isNational
        ? [
            {
              key: 'hospital',
              label: t('hospital'),
              sortable: false,
              render: (row: Appointment) => {
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
                    {sub && (
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    )}
                  </div>
                );
              },
            },
            {
              key: 'department',
              label: t('department'),
              sortable: false,
              render: (row: Appointment) => (
                <span className="text-muted-foreground">
                  {row.department?.name || '-'}
                </span>
              ),
            },
          ]
        : []),
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
    [t, tCommon, navigate, isNational, isArabic],
  );

  const filterSlot = (
    <>
      {isNational && (
        <>
          {/* Governorate */}
          <Select
            value={governorate}
            onValueChange={(value) => {
              setGovernorate(value === 'ALL' ? '' : value);
              setHospitalId('');
              setDepartmentId('');
              table.onPageChange(1);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder={t('filterByGovernorate')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('allGovernorates')}</SelectItem>
              {govOptions.map((g) => (
                <SelectItem key={g.governorate} value={g.governorate}>
                  {g.governorate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Hospital */}
          <Select
            value={hospitalId}
            onValueChange={(value) => {
              setHospitalId(value === 'ALL' ? '' : value);
              setDepartmentId('');
              table.onPageChange(1);
            }}
          >
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder={t('filterByHospital')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('allHospitals')}</SelectItem>
              {hospitalOptions.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {isArabic && h.nameAr ? h.nameAr : h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Department (requires a hospital) */}
          <Select
            value={departmentId}
            disabled={!selectedHospital}
            onValueChange={(value) => {
              setDepartmentId(value === 'ALL' ? '' : value);
              table.onPageChange(1);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder={t('filterByDepartment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('allDepartments')}</SelectItem>
              {departmentOptions.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {/* Status */}
      <Select
        value={statusFilter}
        onValueChange={(value) => {
          setStatusFilter(value === 'ALL' ? '' : value);
          table.onPageChange(1);
        }}
      >
        <SelectTrigger className="w-[170px]">
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
    </>
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
          <Plus className="me-2 h-4 w-4" />
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
