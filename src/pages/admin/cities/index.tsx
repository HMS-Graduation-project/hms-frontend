import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Pencil,
  Power,
  PowerOff,
  MapPin,
  Building2,
  Map as MapIcon,
  CheckCircle2,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/stat-card';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useCities, useUpdateCity, type City } from '@/hooks/use-cities';
import { CityForm } from './city-form';
import { SyriaCitiesMap } from '@/components/admin/cities/syria-cities-map';
import { CityStatusDialog } from '@/components/admin/cities/city-status-dialog';
import { GOVERNORATES } from '@/components/admin/cities/governorates';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function CitiesPage() {
  const { t } = useTranslation('cities');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const { data: cities, isLoading } = useCities();
  const updateCity = useUpdateCity();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [highlightedCityId, setHighlightedCityId] = useState<string | null>(null);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [statusCity, setStatusCity] = useState<City | null>(null);

  const highlightRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    if (highlightedCityId) {
      highlightRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedCityId]);

  // ---- Derived statistics -------------------------------------------------
  const stats = useMemo(() => {
    const list = cities ?? [];
    const active = list.filter((c) => c.isActive).length;
    const hospitals = list.reduce((sum, c) => sum + (c._count?.hospitals ?? 0), 0);
    const govs = new Set(
      list.map((c) => c.governorate).filter((g): g is string => !!g),
    );
    return {
      total: list.length,
      active,
      inactive: list.length - active,
      hospitals,
      governorates: govs.size,
    };
  }, [cities]);

  // ---- Filtering ----------------------------------------------------------
  const filtered = useMemo(() => {
    let list = cities ?? [];
    if (selectedGovernorate) {
      list = list.filter((c) => c.governorate === selectedGovernorate);
    }
    if (statusFilter !== 'all') {
      list = list.filter((c) =>
        statusFilter === 'active' ? c.isActive : !c.isActive,
      );
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.nameAr && c.nameAr.includes(q)) ||
          (c.governorate && c.governorate.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [cities, selectedGovernorate, statusFilter, search]);

  const hasFilters = !!selectedGovernorate || statusFilter !== 'all' || !!search;

  // ---- Handlers -----------------------------------------------------------
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

  const handleConfirmToggle = async () => {
    if (!statusCity) return;
    const city = statusCity;
    try {
      await updateCity.mutateAsync({
        id: city.id,
        data: { isActive: !city.isActive },
      });
      toast({
        title: city.isActive ? t('cityDeactivated') : t('cityActivated'),
        variant: 'success',
      });
      setStatusCity(null);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : tCommon('error'),
        variant: 'destructive',
      });
    }
  };

  const handleSelectCityOnMap = (city: City) => {
    // Make sure the city is visible in the table, then highlight its row.
    setStatusFilter('all');
    setSelectedGovernorate(city.governorate ?? null);
    setHighlightedCityId(city.id);
  };

  const clearFilters = () => {
    setSelectedGovernorate(null);
    setStatusFilter('all');
    setSearch('');
    setHighlightedCityId(null);
  };

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: tCommon('all') },
    { value: 'active', label: t('active') },
    { value: 'inactive', label: t('inactive') },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus className="me-2 h-4 w-4" />
            {t('addCity')}
          </Button>
        </div>

        {/* Statistics */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[110px]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t('stats.totalCities')}
              value={stats.total}
              icon={MapPin}
              description={t('stats.totalCitiesDesc', { count: stats.governorates })}
            />
            <StatCard
              title={t('stats.activeCities')}
              value={stats.active}
              icon={CheckCircle2}
              description={t('stats.inactiveCount', { count: stats.inactive })}
            />
            <StatCard
              title={t('stats.totalHospitals')}
              value={stats.hospitals}
              icon={Building2}
              description={t('stats.totalHospitalsDesc')}
            />
            <StatCard
              title={t('stats.governorates')}
              value={`${stats.governorates} / ${GOVERNORATES.length}`}
              icon={MapIcon}
              description={t('stats.governoratesDesc')}
            />
          </div>
        )}

        {/* Map + table */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,440px)_1fr]">
          {/* Map */}
          <Card className="xl:order-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapIcon className="h-5 w-5 text-primary" />
                {t('map.title')}
              </CardTitle>
              <CardDescription>{t('map.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="aspect-square w-full" />
              ) : (
                <SyriaCitiesMap
                  cities={cities ?? []}
                  selectedGovernorate={selectedGovernorate}
                  onSelectGovernorate={(g) => {
                    setSelectedGovernorate(g);
                    setHighlightedCityId(null);
                  }}
                  highlightedCityId={highlightedCityId}
                  onSelectCity={handleSelectCityOnMap}
                />
              )}
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="xl:order-2">
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ps-9"
                  />
                </div>
                {/* Status segmented filter */}
                <div className="inline-flex rounded-md border p-0.5">
                  {statusFilters.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setStatusFilter(f.value)}
                      className={cn(
                        'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                        statusFilter === f.value
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active-filter summary */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {t('showingCount', { shown: filtered.length, total: stats.total })}
                </span>
                {selectedGovernorate && (
                  <Badge variant="secondary" className="gap-1 ps-2">
                    <MapIcon className="h-3 w-3" />
                    {selectedGovernorate}
                    <button
                      type="button"
                      onClick={() => setSelectedGovernorate(null)}
                      className="ms-1 rounded-full p-0.5 hover:bg-background/60"
                      aria-label={t('clearGovernorate')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-primary hover:underline"
                  >
                    {t('clearFilters')}
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[420px] w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('cityColumn')}</TableHead>
                        <TableHead>{t('governorate')}</TableHead>
                        <TableHead className="text-end">{t('hospitals')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead className="text-end">{tCommon('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-12 text-center text-muted-foreground"
                          >
                            <MapPin className="mx-auto mb-2 h-8 w-8 opacity-40" />
                            <p>{t('noCities')}</p>
                            {hasFilters && (
                              <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-2 text-sm text-primary hover:underline"
                              >
                                {t('clearFilters')}
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((city) => {
                          const isHighlighted = highlightedCityId === city.id;
                          return (
                            <TableRow
                              key={city.id}
                              ref={isHighlighted ? highlightRef : undefined}
                              className={cn(
                                'transition-colors',
                                isHighlighted && 'bg-accent/60',
                              )}
                            >
                              <TableCell>
                                <div className="font-medium">{city.name}</div>
                                {city.nameAr && (
                                  <div
                                    dir="rtl"
                                    className="text-sm text-muted-foreground"
                                  >
                                    {city.nameAr}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {city.governorate ? (
                                  <Badge variant="outline" className="font-normal">
                                    {city.governorate}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-end">
                                <span className="inline-flex items-center justify-end gap-1.5 tabular-nums">
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  {city._count?.hospitals ?? 0}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-2">
                                  <span
                                    className={cn(
                                      'h-2 w-2 rounded-full',
                                      city.isActive
                                        ? 'bg-success'
                                        : 'bg-muted-foreground',
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      'text-sm font-medium',
                                      !city.isActive && 'text-muted-foreground',
                                    )}
                                  >
                                    {city.isActive ? t('active') : t('inactive')}
                                  </span>
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleOpenEdit(city)}
                                        aria-label={t('editCity')}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{t('editCity')}</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                          'h-8 gap-1.5',
                                          city.isActive
                                            ? 'hover:border-destructive/40 hover:text-destructive'
                                            : 'hover:border-success/40 hover:text-success',
                                        )}
                                        onClick={() => setStatusCity(city)}
                                      >
                                        {city.isActive ? (
                                          <PowerOff className="h-3.5 w-3.5" />
                                        ) : (
                                          <Power className="h-3.5 w-3.5" />
                                        )}
                                        {city.isActive
                                          ? t('deactivate')
                                          : t('activate')}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[16rem]">
                                      {city.isActive
                                        ? t('tooltip.deactivate')
                                        : t('tooltip.activate')}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create / edit dialog */}
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCity ? t('editCity') : t('addCity')}</DialogTitle>
              <DialogDescription>
                {editingCity ? t('editCityDesc') : t('addCityDesc')}
              </DialogDescription>
            </DialogHeader>
            <CityForm city={editingCity} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>

        {/* Activate / deactivate confirmation */}
        <CityStatusDialog
          city={statusCity}
          open={!!statusCity}
          onOpenChange={(open) => {
            if (!open) setStatusCity(null);
          }}
          onConfirm={handleConfirmToggle}
          isPending={updateCity.isPending}
        />
      </div>
    </TooltipProvider>
  );
}
