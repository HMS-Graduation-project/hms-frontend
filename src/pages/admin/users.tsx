import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, UserX } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useDataTable } from '@/hooks/use-data-table';
import { useUsers, useDeactivateUser, type User } from '@/hooks/use-users';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { UserForm } from './user-form';

const ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'PATIENT',
  'PHARMACIST',
  'LAB_TECHNICIAN',
] as const;

export default function UsersPage() {
  const { t } = useTranslation('users');
  const { t: tCommon } = useTranslation('common');
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [roleFilter, setRoleFilter] = useState<string>('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);

  const table = useDataTable({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
  });

  const { data, isLoading } = useUsers({
    page: table.page,
    limit: table.limit,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    search: table.debouncedSearch,
    role: roleFilter || undefined,
  });

  const deactivateUser = useDeactivateUser();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingUser(null);
  };

  const handleOpenDeactivate = (user: User) => {
    setDeactivatingUser(user);
    setDeactivateDialogOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingUser) return;
    try {
      await deactivateUser.mutateAsync(deactivatingUser.id);
      toast({
        title: t('userDeactivated'),
        variant: 'success',
      });
    } catch {
      toast({
        title: tCommon('error'),
        variant: 'destructive',
      });
    } finally {
      setDeactivateDialogOpen(false);
      setDeactivatingUser(null);
    }
  };

  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      {
        key: 'firstName',
        label: t('name'),
        sortable: true,
        render: (row) => {
          const name = [row.firstName, row.lastName].filter(Boolean).join(' ');
          return (
            <span className="font-medium">
              {name || <span className="text-muted-foreground">{t('noName')}</span>}
            </span>
          );
        },
      },
      {
        key: 'email',
        label: t('email'),
        sortable: true,
        render: (row) => <span className="text-muted-foreground">{row.email}</span>,
      },
      {
        key: 'role',
        label: t('role'),
        sortable: true,
        render: (row) => (
          <Badge variant="secondary">
            {tCommon(`roles.${row.role}`, { defaultValue: row.role })}
          </Badge>
        ),
      },
      {
        key: 'isActive',
        label: t('status'),
        sortable: false,
        render: (row) => (
          <Badge variant={row.isActive ? 'success' : 'destructive'}>
            {row.isActive ? tCommon('active') : tCommon('inactive')}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        label: t('joinedAt'),
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
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
              aria-label={t('editUser')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {isSuperAdmin && row.isActive && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeactivate(row);
                }}
                aria-label={t('deactivateUser')}
              >
                <UserX className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [t, tCommon, isSuperAdmin]
  );

  const roleFilterSlot = (
    <Select
      value={roleFilter}
      onValueChange={(value) => {
        setRoleFilter(value === 'ALL' ? '' : value);
        table.onPageChange(1);
      }}
    >
      <SelectTrigger className="w-[180px]" aria-label={t('filterByRole')}>
        <SelectValue placeholder={t('allRoles')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{t('allRoles')}</SelectItem>
        {ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {tCommon(`roles.${role}`, { defaultValue: role })}
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
          {t('addUser')}
        </Button>
      </div>

      {/* Data Table */}
      <DataTable<User>
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
        filterSlot={roleFilterSlot}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? t('editUser') : t('addUser')}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? t('editUser') : t('createUser')}
            </DialogDescription>
          </DialogHeader>
          <UserForm user={editingUser} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('deactivateUser')}</DialogTitle>
            <DialogDescription>{t('deactivateConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeactivateDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivate}
              disabled={deactivateUser.isPending}
            >
              {deactivateUser.isPending ? tCommon('loading') : tCommon('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
