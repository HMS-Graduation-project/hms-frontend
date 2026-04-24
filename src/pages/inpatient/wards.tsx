import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BedDouble, Building2, Plus, Loader2, LayoutGrid } from 'lucide-react';
import {
  useWards,
  useCreateWard,
  useCreateBed,
  type WardType,
} from '@/hooks/use-inpatient';
import { useAuth } from '@/providers/auth-provider';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

const WARD_TYPES: WardType[] = [
  'GENERAL',
  'ICU',
  'NICU',
  'POST_OP',
  'ISOLATION',
  'MATERNITY',
  'PEDIATRIC',
];

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN'];

export default function WardsPage() {
  const { t } = useTranslation('inpatient');
  const { user } = useAuth();
  const { data: wards, isLoading } = useWards();

  const [createOpen, setCreateOpen] = useState(false);
  const [bedDialogWardId, setBedDialogWardId] = useState<string | null>(null);

  const canAdmin = !!user && ADMIN_ROLES.includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('wards.title')}
            </h1>
            <p className="text-muted-foreground">{t('wards.subtitle')}</p>
          </div>
        </div>
        {canAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('wards.newWard')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : !wards || wards.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('wards.emptyTitle')}
          description={t('wards.emptyDescription')}
          action={
            canAdmin ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('wards.newWard')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wards.map((ward) => (
            <Card key={ward.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{ward.name}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">
                        {t(`wardType.${ward.type}`)}
                      </Badge>
                      {ward.floor && (
                        <span className="text-xs text-muted-foreground">
                          {t('wards.floor')}: {ward.floor}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <div className="space-y-2 text-sm">
                  {ward.department && (
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {t('wards.department')}:{' '}
                      </span>
                      {ward.department.name}
                    </p>
                  )}
                  {ward.description && (
                    <p className="text-muted-foreground">{ward.description}</p>
                  )}
                  <p className="flex items-center gap-1.5 text-sm">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    {t('wards.bedCount', { count: ward._count.beds })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/inpatient/bed-board?wardId=${ward.id}`}>
                      <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                      {t('wards.viewBedBoard')}
                    </Link>
                  </Button>
                  {canAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setBedDialogWardId(ward.id)}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      {t('wards.addBed')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {createOpen && (
        <CreateWardDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      )}
      {bedDialogWardId && (
        <CreateBedDialog
          wardId={bedDialogWardId}
          wardName={
            wards?.find((w) => w.id === bedDialogWardId)?.name ?? ''
          }
          onClose={() => setBedDialogWardId(null)}
        />
      )}
    </div>
  );
}

function CreateWardDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('inpatient');
  const { toast } = useToast();
  const create = useCreateWard();

  const [name, setName] = useState('');
  const [type, setType] = useState<WardType>('GENERAL');
  const [floor, setFloor] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        name,
        type,
        floor: floor || undefined,
        description: description || undefined,
      });
      toast({ title: t('wards.createSuccess') });
      onClose();
    } catch (err) {
      toast({
        title: t('wards.createError'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('wards.newWard')}</DialogTitle>
            <DialogDescription>{t('wards.newWardDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ward-name">{t('wards.fields.name')}</Label>
              <Input
                id="ward-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ward-type">{t('wards.fields.type')}</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as WardType)}
              >
                <SelectTrigger id="ward-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WARD_TYPES.map((wt) => (
                    <SelectItem key={wt} value={wt}>
                      {t(`wardType.${wt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ward-floor">{t('wards.fields.floor')}</Label>
              <Input
                id="ward-floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ward-desc">{t('wards.fields.description')}</Label>
              <Textarea
                id="ward-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" disabled={create.isPending || !name}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save', { ns: 'common' })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateBedDialog({
  wardId,
  wardName,
  onClose,
}: {
  wardId: string;
  wardName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation('inpatient');
  const { toast } = useToast();
  const create = useCreateBed();

  const [number, setNumber] = useState('');
  const [notes, setNotes] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        wardId,
        number,
        notes: notes || undefined,
      });
      toast({ title: t('beds.createSuccess') });
      onClose();
    } catch (err) {
      toast({
        title: t('beds.createError'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('beds.newBed')}</DialogTitle>
            <DialogDescription>
              {t('beds.newBedDescription', { ward: wardName })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bed-number">{t('beds.fields.number')}</Label>
              <Input
                id="bed-number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                maxLength={30}
                placeholder="A-01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bed-notes">{t('beds.fields.notes')}</Label>
              <Textarea
                id="bed-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" disabled={create.isPending || !number}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save', { ns: 'common' })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
