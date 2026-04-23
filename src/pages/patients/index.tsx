import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import { usePatients, type PatientProfile } from '@/hooks/use-patients';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PatientForm } from './patient-form';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export default function PatientsPage() {
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientProfile | null>(null);

  const table = useDataTable({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
  });

  const { data, isLoading } = usePatients({
    page: table.page,
    limit: table.limit,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.debouncedSearch,
    bloodType: bloodTypeFilter || undefined,
  });

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (patient: PatientProfile) => {
    setEditingPatient(patient);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingPatient(null);
  };

  const handleRowClick = (patient: PatientProfile) => {
    navigate(`/patients/${patient.id}`);
  };

  const columns = useMemo<DataTableColumn<PatientProfile>[]>(
    () => [
      {
        key: 'firstName',
        label: t('name'),
        sortable: true,
        render: (row) => {
          const name = [
            row.nationalPatient?.firstName,
            row.nationalPatient?.lastName,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <span className="font-medium">
              {name || (
                <span className="text-muted-foreground">
                  {row.user?.email ?? '--'}
                </span>
              )}
            </span>
          );
        },
      },
      {
        key: 'phone',
        label: t('phone'),
        sortable: false,
        render: (row) => (
          <span className="text-muted-foreground">
            {row.nationalPatient?.phone || row.user?.phone || '--'}
          </span>
        ),
      },
      {
        key: 'bloodType',
        label: t('bloodType'),
        sortable: false,
        render: (row) => {
          const bt = row.bloodType ?? row.nationalPatient?.bloodType;
          return bt ? (
            <Badge variant="secondary">{bt}</Badge>
          ) : (
            <span className="text-muted-foreground">--</span>
          );
        },
      },
      {
        key: 'gender',
        label: t('gender'),
        sortable: false,
        render: (row) => {
          const gender = row.nationalPatient?.gender ?? row.user?.gender;
          return (
            <span className="text-muted-foreground">
              {gender
                ? t(gender.toLowerCase() as 'male' | 'female' | 'other', {
                    defaultValue: gender,
                  })
                : '--'}
            </span>
          );
        },
      },
      {
        key: 'insuranceProvider',
        label: t('insurance'),
        sortable: false,
        render: (row) => (
          <span className="text-muted-foreground">
            {row.insuranceProvider || '--'}
          </span>
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
                handleOpenEdit(row);
              }}
              aria-label={t('editPatient')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [t, tCommon]
  );

  const bloodTypeFilterSlot = (
    <Select
      value={bloodTypeFilter}
      onValueChange={(value) => {
        setBloodTypeFilter(value === 'ALL' ? '' : value);
        table.onPageChange(1);
      }}
    >
      <SelectTrigger className="w-[180px]" aria-label={t('filterByBloodType')}>
        <SelectValue placeholder={t('allBloodTypes')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{t('allBloodTypes')}</SelectItem>
        {BLOOD_TYPES.map((bt) => (
          <SelectItem key={bt} value={bt}>
            {bt}
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
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('addPatient')}
        </Button>
      </div>

      {/* Data Table */}
      <DataTable<PatientProfile>
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
        onRowClick={handleRowClick}
        filterSlot={bloodTypeFilterSlot}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? t('editPatient') : t('addPatient')}
            </DialogTitle>
            <DialogDescription>
              {editingPatient ? t('editPatient') : t('createPatient')}
            </DialogDescription>
          </DialogHeader>
          <PatientForm patient={editingPatient} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
