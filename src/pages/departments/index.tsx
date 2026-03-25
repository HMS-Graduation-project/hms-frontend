import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import { useDepartments, useDeleteDepartment, type Department } from '@/hooks/use-departments';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { DepartmentForm } from './department-form';

export default function DepartmentsPage() {
  const { t } = useTranslation('departments');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  const table = useDataTable({
    initialSortBy: 'name',
    initialSortOrder: 'asc',
  });

  const { data, isLoading } = useDepartments({
    page: table.page,
    limit: table.limit,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.debouncedSearch,
  });

  const deleteDepartment = useDeleteDepartment();

  const handleOpenCreate = () => {
    setEditingDepartment(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingDepartment(null);
  };

  const handleOpenDelete = (department: Department) => {
    setDeletingDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDepartment) return;
    try {
      await deleteDepartment.mutateAsync(deletingDepartment.id);
      toast({
        title: t('departmentDeleted'),
        variant: 'success',
      });
    } catch {
      toast({
        title: tCommon('error'),
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingDepartment(null);
    }
  };

  const handleRowClick = (department: Department) => {
    navigate(`/departments/${department.id}`);
  };

  const columns = useMemo<DataTableColumn<Department>[]>(
    () => [
      {
        key: 'name',
        label: t('name'),
        sortable: true,
        render: (row) => (
          <span className="font-medium">{row.name}</span>
        ),
      },
      {
        key: 'floor',
        label: t('floor'),
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">{row.floor || '-'}</span>
        ),
      },
      {
        key: 'headDoctor',
        label: t('headDoctor'),
        sortable: false,
        render: (row) => {
          if (!row.headDoctor) {
            return <span className="text-muted-foreground">{t('noHeadDoctor')}</span>;
          }
          const name = [row.headDoctor.firstName, row.headDoctor.lastName]
            .filter(Boolean)
            .join(' ');
          return <span>{name || '-'}</span>;
        },
      },
      {
        key: '_count.doctors',
        label: t('doctorCount'),
        sortable: false,
        render: (row) => (
          <Badge variant="secondary">{row._count?.doctors ?? 0}</Badge>
        ),
      },
      {
        key: 'isActive',
        label: tCommon('status'),
        sortable: false,
        render: (row) => (
          <Badge variant={row.isActive ? 'success' : 'destructive'}>
            {row.isActive ? tCommon('active') : tCommon('inactive')}
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
                handleOpenEdit(row);
              }}
              aria-label={t('editDepartment')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDelete(row);
              }}
              aria-label={t('deleteDepartment')}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [t, tCommon]
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
          {t('addDepartment')}
        </Button>
      </div>

      {/* Data Table */}
      <DataTable<Department>
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
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? t('editDepartment') : t('addDepartment')}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment ? t('editDepartment') : t('createDepartment')}
            </DialogDescription>
          </DialogHeader>
          <DepartmentForm
            department={editingDepartment}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('deleteDepartment')}</DialogTitle>
            <DialogDescription>{t('deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteDepartment.isPending}
            >
              {deleteDepartment.isPending ? tCommon('loading') : tCommon('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
