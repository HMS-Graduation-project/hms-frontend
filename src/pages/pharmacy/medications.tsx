import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Pencil, AlertTriangle, Pill } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import { useMedications, type Medication } from '@/hooks/use-pharmacy';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicationForm } from './medication-form';

const CATEGORIES = [
  'Analgesic',
  'Antibiotic',
  'Antiviral',
  'Antifungal',
  'Cardiovascular',
  'Dermatological',
  'Gastrointestinal',
  'Neurological',
  'Respiratory',
  'Vitamins',
  'Other',
];

const DOSAGE_FORM_KEYS: Record<string, string> = {
  Tablet: 'tablet',
  Capsule: 'capsule',
  Syrup: 'syrup',
  Injection: 'injection',
  Cream: 'cream',
  Drops: 'drops',
};

export default function MedicationsPage() {
  const { t } = useTranslation('pharmacy');
  const { t: tCommon } = useTranslation('common');

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] =
    useState<Medication | null>(null);

  const table = useDataTable({
    initialSortBy: 'name',
    initialSortOrder: 'asc',
  });

  const { data, isLoading } = useMedications({
    page: table.page,
    limit: table.limit,
    search: table.debouncedSearch,
    category: categoryFilter === 'ALL' ? undefined : categoryFilter,
  });

  const handleOpenCreate = () => {
    setEditingMedication(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingMedication(null);
  };

  const columns = useMemo<DataTableColumn<Medication>[]>(
    () => [
      {
        key: 'name',
        label: t('name'),
        sortable: true,
        render: (row) => (
          <div>
            <span className="font-medium">{row.name}</span>
            {row.genericName && (
              <p className="text-xs text-muted-foreground">
                {row.genericName}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'category',
        label: t('category'),
        sortable: false,
        render: (row) => (
          <span className="text-muted-foreground">
            {row.category || '--'}
          </span>
        ),
      },
      {
        key: 'dosageForm',
        label: t('dosageForm'),
        sortable: false,
        render: (row) => {
          if (!row.dosageForm) return <span className="text-muted-foreground">--</span>;
          const key = DOSAGE_FORM_KEYS[row.dosageForm];
          return (
            <Badge variant="secondary">
              {key ? t(key) : row.dosageForm}
            </Badge>
          );
        },
      },
      {
        key: 'price',
        label: t('price'),
        sortable: true,
        render: (row) => (
          <span className="font-medium">
            ${row.price.toFixed(2)}
          </span>
        ),
      },
      {
        key: 'stock',
        label: t('stock'),
        sortable: true,
        render: (row) => {
          if (row.stock === 0) {
            return (
              <Badge variant="destructive">
                {t('outOfStock')}
              </Badge>
            );
          }
          if (row.stock <= row.reorderLevel) {
            return (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {row.stock}
              </Badge>
            );
          }
          return (
            <Badge variant="success">
              {row.stock}
            </Badge>
          );
        },
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
                handleOpenEdit(row);
              }}
              aria-label={t('editMedication')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [t, tCommon]
  );

  const categoryFilterSlot = (
    <Select
      value={categoryFilter}
      onValueChange={(val) => setCategoryFilter(val)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('filterByCategory')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{t('allCategories')}</SelectItem>
        {CATEGORIES.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat}
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
          <h1 className="text-2xl font-bold tracking-tight">
            <Pill className="mr-2 inline-block h-6 w-6" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild>
            <Link to="/pharmacy/dispensing">{t('dispensing')}</Link>
          </Button>
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t('addMedication')}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value="medications">
        <TabsList>
          <TabsTrigger value="medications" asChild>
            <Link to="/pharmacy">{t('medications')}</Link>
          </TabsTrigger>
          <TabsTrigger value="dispensing" asChild>
            <Link to="/pharmacy/dispensing">{t('dispensing')}</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Data Table */}
      <DataTable<Medication>
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
        filterSlot={categoryFilterSlot}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMedication ? t('editMedication') : t('addMedication')}
            </DialogTitle>
            <DialogDescription>
              {editingMedication ? t('editMedication') : t('addMedication')}
            </DialogDescription>
          </DialogHeader>
          <MedicationForm
            medication={editingMedication}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
