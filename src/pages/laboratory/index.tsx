import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, FlaskConical } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import {
  useLabOrders,
  type LabOrder,
  type LabOrderStatus,
  type LabOrderPriority,
} from '@/hooks/use-laboratory';
import { useAuth } from '@/providers/auth-provider';
import { LabResultForm } from '@/components/laboratory/lab-result-form';
import { DataTable } from '@/components/data-table/data-table';
import { GovernorateHospitalFilter } from '@/components/scope/governorate-hospital-filter';
import { NoPortalAccountBadge } from '@/components/patients/no-portal-account-badge';
import { getPatientDisplayName } from '@/lib/patient-name';
import type { DataTableColumn } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_BADGE_MAP: Record<
  LabOrderStatus,
  'secondary' | 'success' | 'warning' | 'destructive' | 'default'
> = {
  ORDERED: 'secondary',
  SAMPLE_COLLECTED: 'default',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

const PRIORITY_BADGE_MAP: Record<
  LabOrderPriority,
  'secondary' | 'warning' | 'destructive'
> = {
  NORMAL: 'secondary',
  URGENT: 'warning',
  STAT: 'destructive',
};

export default function LaboratoryPage() {
  const { t, i18n } = useTranslation('laboratory');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isArabic = (i18n.language || 'en').split('-')[0] === 'ar';

  // National / regional scope (no single hospital): show Governorate +
  // Hospital columns and the Governorate → Hospital filters.
  const isNational = !user?.hospitalId;

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [governorate, setGovernorate] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [resultFormOpen, setResultFormOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const table = useDataTable({
    initialSortBy: 'orderedAt',
    initialSortOrder: 'desc',
  });

  const { data, isLoading } = useLabOrders({
    page: table.page,
    limit: table.limit,
    status: statusFilter === 'ALL' ? '' : statusFilter,
    priority: priorityFilter === 'ALL' ? '' : priorityFilter,
    search: table.debouncedSearch,
    governorate: isNational ? governorate || undefined : undefined,
    hospitalId: isNational ? hospitalId || undefined : undefined,
  });

  const handleEnterResults = (order: LabOrder) => {
    setSelectedOrderId(order.id);
    setResultFormOpen(true);
  };

  const handleRowClick = (order: LabOrder) => {
    navigate(`/laboratory/${order.id}`);
  };

  const columns = useMemo<DataTableColumn<LabOrder>[]>(
    () => [
      {
        key: 'testName',
        label: t('testName'),
        sortable: false,
        render: (row) => (
          <span className="font-medium">{row.testName}</span>
        ),
      },
      {
        key: 'patient',
        label: t('patient'),
        sortable: false,
        render: (row) => {
          if (!row.patient) return '--';
          return (
            <span className="flex items-center gap-2 text-muted-foreground">
              {getPatientDisplayName(row.patient)}
              <NoPortalAccountBadge patient={row.patient} />
            </span>
          );
        },
      },
      {
        key: 'doctor',
        label: t('doctor'),
        sortable: false,
        render: (row) => {
          if (!row.doctor) return '--';
          const name = [
            row.doctor.user.firstName,
            row.doctor.user.lastName,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <span className="text-muted-foreground">
              {name || row.doctor.user.email}
            </span>
          );
        },
      },
      ...(isNational
        ? [
            {
              key: 'governorate',
              label: tCommon('governorate'),
              sortable: false,
              render: (row: LabOrder) => (
                <span className="text-muted-foreground">
                  {row.hospital?.city?.governorate || '-'}
                </span>
              ),
            } as DataTableColumn<LabOrder>,
            {
              key: 'hospital',
              label: tCommon('hospital'),
              sortable: false,
              render: (row: LabOrder) => {
                const h = row.hospital;
                if (!h) return <span className="text-muted-foreground">-</span>;
                const name = isArabic && h.nameAr ? h.nameAr : h.name;
                const cityName =
                  isArabic && h.city?.nameAr ? h.city.nameAr : h.city?.name;
                return (
                  <div>
                    <span className="font-medium">{name}</span>
                    {cityName && (
                      <p className="text-xs text-muted-foreground">{cityName}</p>
                    )}
                  </div>
                );
              },
            } as DataTableColumn<LabOrder>,
          ]
        : []),
      {
        key: 'priority',
        label: t('priority'),
        sortable: false,
        render: (row) => (
          <Badge variant={PRIORITY_BADGE_MAP[row.priority]}>
            {t(`priorities.${row.priority}`)}
          </Badge>
        ),
      },
      {
        key: 'status',
        label: t('status'),
        sortable: false,
        render: (row) => (
          <Badge variant={STATUS_BADGE_MAP[row.status]}>
            {t(`statuses.${row.status}`)}
          </Badge>
        ),
      },
      {
        key: 'orderedAt',
        label: t('orderedAt'),
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">
            {new Date(row.orderedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        label: tCommon('actions'),
        className: 'w-[120px]',
        render: (row) => (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/laboratory/${row.id}`);
                  }}
                  aria-label={t('orderDetail')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('orderDetail')}</TooltipContent>
            </Tooltip>
            {row.status !== 'COMPLETED' && row.status !== 'CANCELLED' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnterResults(row);
                    }}
                    aria-label={t('enterResults')}
                  >
                    <FlaskConical className="h-4 w-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('enterResults')}</TooltipContent>
              </Tooltip>
            )}
          </div>
        ),
      },
    ],
    [t, tCommon, navigate, isNational, isArabic]
  );

  const filterSlot = (
    <div className="flex flex-wrap gap-2">
      <GovernorateHospitalFilter
        governorate={governorate}
        hospitalId={hospitalId}
        onGovernorateChange={(v) => {
          setGovernorate(v);
          setHospitalId('');
          table.onPageChange(1);
        }}
        onHospitalChange={(v) => {
          setHospitalId(v);
          table.onPageChange(1);
        }}
        enabled={isNational}
      />
      <Select
        value={statusFilter}
        onValueChange={(val) => setStatusFilter(val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filterByStatus')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t('allStatuses')}</SelectItem>
          <SelectItem value="ORDERED">{t('statuses.ORDERED')}</SelectItem>
          <SelectItem value="SAMPLE_COLLECTED">
            {t('statuses.SAMPLE_COLLECTED')}
          </SelectItem>
          <SelectItem value="IN_PROGRESS">
            {t('statuses.IN_PROGRESS')}
          </SelectItem>
          <SelectItem value="COMPLETED">{t('statuses.COMPLETED')}</SelectItem>
          <SelectItem value="CANCELLED">{t('statuses.CANCELLED')}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={priorityFilter}
        onValueChange={(val) => setPriorityFilter(val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filterByPriority')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t('allPriorities')}</SelectItem>
          <SelectItem value="NORMAL">{t('priorities.NORMAL')}</SelectItem>
          <SelectItem value="URGENT">{t('priorities.URGENT')}</SelectItem>
          <SelectItem value="STAT">{t('priorities.STAT')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable<LabOrder>
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

      {/* Enter Results Dialog */}
      {selectedOrderId && (
        <LabResultForm
          labOrderId={selectedOrderId}
          open={resultFormOpen}
          onOpenChange={setResultFormOpen}
        />
      )}
    </div>
  );
}
