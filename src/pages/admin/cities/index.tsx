import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Power } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCities, useUpdateCity, type City } from '@/hooks/use-cities';
import { CityForm } from './city-form';

export default function CitiesPage() {
  const { t } = useTranslation('cities');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const { data: cities, isLoading } = useCities();
  const updateCity = useUpdateCity();

  const [search, setSearch] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const filtered = useMemo(() => {
    if (!cities) return [];
    if (!search) return cities;
    const q = search.toLowerCase();
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nameAr && c.nameAr.includes(q)) ||
        (c.governorate && c.governorate.toLowerCase().includes(q)),
    );
  }, [cities, search]);

  const handleOpenCreate = () => {
    setEditingCity(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (city: City) => {
    setEditingCity(city);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingCity(null);
  };

  const handleToggleActive = async (city: City) => {
    try {
      await updateCity.mutateAsync({
        id: city.id,
        data: { isActive: !city.isActive },
      });
      toast({
        title: city.isActive ? t('cityDeactivated') : t('cityActivated'),
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : tCommon('error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="me-2 h-4 w-4" />
          {t('addCity')}
        </Button>
      </div>

      <Input
        placeholder={t('searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('nameEn')}</TableHead>
              <TableHead>{t('nameAr')}</TableHead>
              <TableHead>{t('governorate')}</TableHead>
              <TableHead className="text-end">{t('hospitals')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="w-[100px]">{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {t('noCities')}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell dir="rtl">{city.nameAr ?? '—'}</TableCell>
                  <TableCell>{city.governorate ?? '—'}</TableCell>
                  <TableCell className="text-end tabular-nums">
                    {city._count?.hospitals ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={city.isActive ? 'success' : 'secondary'}>
                      {city.isActive ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(city)}
                        aria-label={t('editCity')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(city)}
                        aria-label={city.isActive ? t('deactivate') : t('activate')}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCity ? t('editCity') : t('addCity')}
            </DialogTitle>
            <DialogDescription>
              {editingCity ? t('editCityDesc') : t('addCityDesc')}
            </DialogDescription>
          </DialogHeader>
          <CityForm city={editingCity} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
