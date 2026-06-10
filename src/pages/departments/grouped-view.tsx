import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Building2,
  MapPin,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react';
import {
  useGroupedDepartments,
  type Department,
  type GroupedGovernorate,
  type GroupedHospital,
} from '@/hooks/use-departments';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface GroupedDepartmentsViewProps {
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export function GroupedDepartmentsView({
  onEdit,
  onDelete,
}: GroupedDepartmentsViewProps) {
  const { t, i18n } = useTranslation('departments');
  const { t: tCommon } = useTranslation('common');
  const isArabic = (i18n.language || 'en').split('-')[0] === 'ar';

  const { data, isLoading } = useGroupedDepartments();

  const [search, setSearch] = useState('');
  const [openGovs, setOpenGovs] = useState<Set<string>>(new Set());
  const [openHospitals, setOpenHospitals] = useState<Set<string>>(new Set());

  const q = search.trim().toLowerCase();

  const filteredGovs = useMemo<GroupedGovernorate[]>(() => {
    const govs = data?.governorates ?? [];
    if (!q) return govs;

    const matches = (s?: string | null) => !!s && s.toLowerCase().includes(q);

    return govs
      .map((gov) => {
        const govMatch = matches(gov.governorate);
        const hospitals = gov.hospitals
          .map((h) => {
            const hMatch =
              govMatch ||
              matches(h.name) ||
              matches(h.nameAr) ||
              matches(h.city?.name) ||
              matches(h.city?.nameAr);
            const departments = hMatch
              ? h.departments
              : h.departments.filter((d) => matches(d.name));
            if (!hMatch && departments.length === 0) return null;
            return { ...h, departments };
          })
          .filter(Boolean) as GroupedHospital[];
        if (hospitals.length === 0) return null;
        return { ...gov, hospitals };
      })
      .filter(Boolean) as GroupedGovernorate[];
  }, [data, q]);

  const toggleGov = (key: string) => {
    setOpenGovs((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleHospital = (id: string) => {
    setOpenHospitals((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const headDoctorName = (department: Department) => {
    if (!department.headDoctor) return null;
    const name = [department.headDoctor.firstName, department.headDoctor.lastName]
      .filter(Boolean)
      .join(' ');
    return name || null;
  };

  return (
    <div className="space-y-4">
      {/* Search + totals summary */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tCommon('search')}
            className="ps-9"
          />
        </div>
        {data?.totals && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">
              {data.totals.governorateCount} {t('governorates')}
            </Badge>
            <Badge variant="outline">
              {data.totals.hospitalCount} {t('hospitals')}
            </Badge>
            <Badge variant="outline">
              {data.totals.departmentCount} {t('title')}
            </Badge>
            <Badge variant="outline">
              {data.totals.doctorCount} {t('doctors')}
            </Badge>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="py-12 text-center text-muted-foreground">
          {tCommon('loading')}
        </div>
      )}

      {!isLoading && filteredGovs.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          {t('noDepartments')}
        </div>
      )}

      {/* Governorate → Hospital → Departments */}
      {filteredGovs.map((gov) => {
        const govOpen = q.length > 0 || openGovs.has(gov.governorate);
        return (
          <Card key={gov.governorate} className="overflow-hidden">
            <button
              type="button"
              onClick={() => toggleGov(gov.governorate)}
              className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50"
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                  govOpen && 'rotate-180'
                )}
              />
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-semibold">{gov.governorate}</span>
              <div className="ms-auto flex items-center gap-2">
                <Badge variant="secondary">
                  {gov.hospitalCount} {t('hospitals')}
                </Badge>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {gov.departmentCount} {t('title')}
                </Badge>
              </div>
            </button>

            {govOpen && (
              <div className="border-t">
                {gov.hospitals.map((hospital) => {
                  const hospitalOpen =
                    q.length > 0 || openHospitals.has(hospital.id);
                  const hName =
                    isArabic && hospital.nameAr
                      ? hospital.nameAr
                      : hospital.name;
                  const cityName =
                    isArabic && hospital.city?.nameAr
                      ? hospital.city.nameAr
                      : hospital.city?.name;
                  return (
                    <div key={hospital.id} className="border-b last:border-b-0">
                      <button
                        type="button"
                        onClick={() => toggleHospital(hospital.id)}
                        className="flex w-full items-center gap-3 bg-muted/30 px-4 py-2.5 ps-8 text-start transition-colors hover:bg-muted/60"
                      >
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                            hospitalOpen && 'rotate-180'
                          )}
                        />
                        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{hName}</span>
                        {cityName && (
                          <span className="text-xs text-muted-foreground">
                            · {cityName}
                          </span>
                        )}
                        <div className="ms-auto flex items-center gap-2">
                          <Badge variant="outline">
                            {hospital.departmentCount} {t('title')}
                          </Badge>
                          <Badge variant="secondary">
                            {hospital.doctorCount} {t('doctors')}
                          </Badge>
                        </div>
                      </button>

                      {hospitalOpen && (
                        <div className="px-4 pb-3 ps-8">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t('name')}</TableHead>
                                <TableHead>{t('floor')}</TableHead>
                                <TableHead>{t('headDoctor')}</TableHead>
                                <TableHead>{t('doctorCount')}</TableHead>
                                <TableHead>{tCommon('status')}</TableHead>
                                <TableHead className="w-[100px] text-end">
                                  {tCommon('actions')}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {hospital.departments.map((dept) => {
                                const head = headDoctorName(dept);
                                return (
                                  <TableRow key={dept.id}>
                                    <TableCell className="font-medium">
                                      {dept.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {dept.floor || '-'}
                                    </TableCell>
                                    <TableCell>
                                      {head || (
                                        <span className="text-muted-foreground">
                                          {t('noHeadDoctor')}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">
                                        {dept._count?.doctors ?? 0}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          dept.isActive
                                            ? 'success'
                                            : 'destructive'
                                        }
                                      >
                                        {dept.isActive
                                          ? tCommon('active')
                                          : tCommon('inactive')}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => onEdit(dept)}
                                          aria-label={t('editDepartment')}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => onDelete(dept)}
                                          aria-label={t('deleteDepartment')}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
