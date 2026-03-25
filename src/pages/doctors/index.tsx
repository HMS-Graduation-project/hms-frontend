import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Eye } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import { useDoctors, useDepartmentsList, type DoctorProfile } from '@/hooks/use-doctors';
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
import { DoctorForm } from './doctor-form';

export default function DoctorsPage() {
  const { t } = useTranslation('doctors');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);

  const table = useDataTable({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
  });

  const { data, isLoading } = useDoctors({
    page: table.page,
    limit: table.limit,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.debouncedSearch,
    departmentId: departmentFilter || undefined,
  });

  const { data: departmentsData } = useDepartmentsList();
  const departments = departmentsData?.data ?? [];

  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (doctor: DoctorProfile) => {
    setEditingDoctor(doctor);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingDoctor(null);
  };

  const handleRowClick = (doctor: DoctorProfile) => {
    navigate(`/doctors/${doctor.id}`);
  };

  const columns = useMemo<DataTableColumn<DoctorProfile>[]>(
    () => [
      {
        key: 'user.firstName',
        label: t('name'),
        sortable: true,
        render: (row) => {
          const name = [row.user.firstName, row.user.lastName].filter(Boolean).join(' ');
          return (
            <span className="font-medium">
              {name || <span className="text-muted-foreground">{row.user.email}</span>}
            </span>
          );
        },
      },
      {
        key: 'specialization',
        label: t('specialization'),
        sortable: true,
        render: (row) => <span>{row.specialization}</span>,
      },
      {
        key: 'department',
        label: t('department'),
        sortable: false,
        render: (row) => (
          <span className="text-muted-foreground">
            {row.department?.name || t('noDepartment')}
          </span>
        ),
      },
      {
        key: 'isAvailable',
        label: t('availability'),
        sortable: false,
        render: (row) => (
          <Badge variant={row.isAvailable ? 'success' : 'destructive'}>
            {row.isAvailable ? t('available') : t('unavailable')}
          </Badge>
        ),
      },
      {
        key: 'actions',
        label: tCommon('actions'),
        className: 'w-[100px]',
        render: (row) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/doctors/${row.id}`);
              }}
              aria-label={t('details')}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row);
              }}
              aria-label={t('editDoctor')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [t, tCommon, navigate]
  );

  const departmentFilterSlot = (
    <Select
      value={departmentFilter}
      onValueChange={(value) => {
        setDepartmentFilter(value === 'ALL' ? '' : value);
        table.onPageChange(1);
      }}
    >
      <SelectTrigger className="w-[200px]" aria-label={t('filterByDepartment')}>
        <SelectValue placeholder={t('allDepartments')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{t('allDepartments')}</SelectItem>
        {departments.map((dept) => (
          <SelectItem key={dept.id} value={dept.id}>
            {dept.name}
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
          {t('addDoctor')}
        </Button>
      </div>

      {/* Data Table */}
      <DataTable<DoctorProfile>
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
        filterSlot={departmentFilterSlot}
        onRowClick={handleRowClick}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDoctor ? t('editDoctor') : t('addDoctor')}
            </DialogTitle>
            <DialogDescription>
              {editingDoctor ? t('editDoctor') : t('createDoctor')}
            </DialogDescription>
          </DialogHeader>
          <DoctorForm doctor={editingDoctor} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
