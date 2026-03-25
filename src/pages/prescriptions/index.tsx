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
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const { t } = useTranslation('prescriptions');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
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
    status: statusFilter === 'ALL' ? '' : statusFilter,
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
          const name = [
            row.patient.user.firstName,
            row.patient.user.lastName,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <span className="font-medium">
              {name || row.patient.user.email}
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
            {(row.status === 'PENDING' ||
              row.status === 'PARTIALLY_DISPENSED') && (
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
            )}
            {row.status === 'PENDING' && (
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
            )}
          </div>
        ),
      },
    ],
    [t, tCommon, navigate]
  );

  const statusFilterSlot = (
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
