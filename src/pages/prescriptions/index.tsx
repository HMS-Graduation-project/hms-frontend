import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import {
  usePrescriptions,
  useUpdatePrescriptionStatus,
  type Prescription,
  type PrescriptionStatus,
} from '@/hooks/use-prescriptions';
import { useAuth } from '@/providers/auth-provider';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const STATUS_BADGE_MAP: Record<
  PrescriptionStatus,
  'secondary' | 'success' | 'warning' | 'destructive'
> = {
  PENDING: 'secondary',
  DISPENSED: 'success',
  PARTIALLY_DISPENSED: 'warning',
  CANCELLED: 'destructive',
};

export default function PrescriptionsPage() {
  const { t, i18n } = useTranslation('prescriptions');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isArabic = (i18n.language || 'en').split('-')[0] === 'ar';

  // National / regional scope (no single hospital): show Governorate +
  // Hospital columns and the Governorate → Hospital filters.
  const isNational = !user?.hospitalId;

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [governorate, setGovernorate] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [targetStatus, setTargetStatus] = useState<PrescriptionStatus | null>(
    null
  );

  const table = useDataTable({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
  });

  const { data, isLoading } = usePrescriptions({
    page: table.page,
    limit: table.limit,
    status: (statusFilter === 'ALL' ? '' : statusFilter) as any,
    search: table.debouncedSearch,
    governorate: isNational ? governorate || undefined : undefined,
    hospitalId: isNational ? hospitalId || undefined : undefined,
  });

  const updateStatus = useUpdatePrescriptionStatus();

  const handleDispense = (rx: Prescription) => {
    setSelectedPrescription(rx);
    setTargetStatus('DISPENSED');
    setStatusDialogOpen(true);
  };

  const handleCancel = (rx: Prescription) => {
    setSelectedPrescription(rx);
    setTargetStatus('CANCELLED');
    setStatusDialogOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedPrescription || !targetStatus) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedPrescription.id,
        status: targetStatus,
      });
      toast({ title: t('statusUpdated'), variant: 'success' });
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    } finally {
      setStatusDialogOpen(false);
      setSelectedPrescription(null);
      setTargetStatus(null);
    }
  };

  const handleRowClick = (rx: Prescription) => {
    navigate(`/prescriptions/${rx.id}`);
  };

  const columns = useMemo<DataTableColumn<Prescription>[]>(
    () => [
      {
        key: 'patient',
        label: t('patient'),
        sortable: false,
        render: (row) => {
          if (!row.patient) return '--';
          return (
            <span className="flex items-center gap-2 font-medium">
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
              render: (row: Prescription) => (
                <span className="text-muted-foreground">
                  {row.hospital?.city?.governorate || '-'}
                </span>
              ),
            } as DataTableColumn<Prescription>,
            {
              key: 'hospital',
              label: tCommon('hospital'),
              sortable: false,
              render: (row: Prescription) => {
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
            } as DataTableColumn<Prescription>,
          ]
        : []),
      {
        key: 'createdAt',
        label: t('date'),
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
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
        key: 'items',
        label: t('medications'),
        sortable: false,
        render: (row) => (
          <Badge variant="secondary">{row._count?.items ?? 0}</Badge>
        ),
      },
      {
        key: 'actions',
        label: tCommon('actions'),
        className: 'w-[150px]',
        render: (row) => (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/prescriptions/${row.id}`);
                  }}
                  aria-label={t('prescriptionDetail')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('prescriptionDetail')}</TooltipContent>
            </Tooltip>
            {(row.status === 'PENDING' ||
              row.status === 'PARTIALLY_DISPENSED') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDispense(row);
                    }}
                    aria-label={t('actions.dispense')}
                  >
                    <CheckCircle className="h-4 w-4 text-success" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('actions.dispense')}</TooltipContent>
              </Tooltip>
            )}
            {row.status === 'PENDING' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(row);
                    }}
                    aria-label={t('actions.cancel')}
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('actions.cancel')}</TooltipContent>
              </Tooltip>
            )}
          </div>
        ),
      },
    ],
    [t, tCommon, navigate, isNational, isArabic]
  );

  const statusFilterSlot = (
    <>
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
          <SelectItem value="PENDING">{t('statuses.PENDING')}</SelectItem>
          <SelectItem value="DISPENSED">{t('statuses.DISPENSED')}</SelectItem>
          <SelectItem value="PARTIALLY_DISPENSED">
            {t('statuses.PARTIALLY_DISPENSED')}
          </SelectItem>
          <SelectItem value="CANCELLED">{t('statuses.CANCELLED')}</SelectItem>
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
      </div>

      {/* Data Table */}
      <DataTable<Prescription>
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
        filterSlot={statusFilterSlot}
        onRowClick={handleRowClick}
      />

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {targetStatus === 'DISPENSED'
                ? t('actions.dispense')
                : t('actions.cancel')}
            </DialogTitle>
            <DialogDescription>
              {targetStatus === 'DISPENSED'
                ? t('actions.dispense')
                : t('actions.cancel')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant={
                targetStatus === 'CANCELLED' ? 'destructive' : 'default'
              }
              onClick={handleConfirmStatus}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending
                ? tCommon('loading')
                : tCommon('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
