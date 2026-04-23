import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Plus } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import {
  useInvoices,
  type Invoice,
  type InvoiceStatus,
} from '@/hooks/use-billing';
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

export default function BillingPage() {
  const { t } = useTranslation('billing');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const table = useDataTable({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
  });

  const { data, isLoading } = useInvoices({
    page: table.page,
    limit: table.limit,
    status: statusFilter === 'ALL' ? '' : statusFilter,
    search: table.debouncedSearch || undefined,
  });

  const handleRowClick = (invoice: Invoice) => {
    navigate(`/billing/${invoice.id}`);
  };

  const columns = useMemo<DataTableColumn<Invoice>[]>(
    () => [
      {
        key: 'invoiceNumber',
        label: t('invoiceNumber'),
        sortable: false,
        render: (row) => (
          <span className="font-medium">{row.invoiceNumber}</span>
        ),
      },
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
            <span className="text-muted-foreground">
              {name || row.patient.user.email}
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
        key: 'total',
        label: t('total'),
        sortable: false,
        render: (row) => (
          <span className="font-medium">{formatCurrency(row.total)}</span>
        ),
      },
      {
        key: 'paidAmount',
        label: t('paidAmount'),
        sortable: false,
        render: (row) => (
          <span className="text-green-600 dark:text-green-400">
            {formatCurrency(row.paidAmount)}
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
        key: 'actions',
        label: tCommon('actions'),
        className: 'w-[80px]',
        render: (row) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/billing/${row.id}`);
              }}
              aria-label={t('invoiceDetail')}
            >
              <Eye className="h-4 w-4" />
            </Button>
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
        <SelectItem value="DRAFT">{t('statuses.DRAFT')}</SelectItem>
        <SelectItem value="ISSUED">{t('statuses.ISSUED')}</SelectItem>
        <SelectItem value="PAID">{t('statuses.PAID')}</SelectItem>
        <SelectItem value="PARTIALLY_PAID">
          {t('statuses.PARTIALLY_PAID')}
        </SelectItem>
        <SelectItem value="CANCELLED">{t('statuses.CANCELLED')}</SelectItem>
        <SelectItem value="OVERDUE">{t('statuses.OVERDUE')}</SelectItem>
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
        <Button onClick={() => navigate('/billing/new')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createInvoice')}
        </Button>
      </div>

      {/* Data Table */}
      <DataTable<Invoice>
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
    </div>
  );
}
