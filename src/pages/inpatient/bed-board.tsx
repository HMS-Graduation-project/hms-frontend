import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BedDouble, LayoutGrid } from 'lucide-react';
import { useBeds, useWards, type Bed } from '@/hooks/use-inpatient';
import { BedStatusBadge } from '@/components/inpatient/bed-status-badge';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const BED_CARD_CLASS: Record<string, string> = {
  AVAILABLE:
    'border-emerald-500/40 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-950/30',
  OCCUPIED:
    'border-red-500/40 bg-red-50 dark:border-red-500/30 dark:bg-red-950/30',
  MAINTENANCE:
    'border-amber-500/40 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/30',
  RESERVED:
    'border-blue-500/40 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-950/30',
};

export default function BedBoardPage() {
  const { t } = useTranslation('inpatient');
  const [searchParams, setSearchParams] = useSearchParams();
  const wardId = searchParams.get('wardId') ?? undefined;

  const { data: wards } = useWards();
  const { data: beds, isLoading } = useBeds({ wardId });

  const stats = useMemo(() => {
    const s = { AVAILABLE: 0, OCCUPIED: 0, MAINTENANCE: 0, RESERVED: 0 };
    (beds ?? []).forEach((b) => {
      s[b.status] += 1;
    });
    return s;
  }, [beds]);

  // Group beds by ward for display when no ward is selected.
  const grouped = useMemo(() => {
    if (!beds) return [];
    const byWard = new Map<
      string,
      { ward: Bed['ward']; items: Bed[] }
    >();
    for (const bed of beds) {
      const key = bed.wardId;
      if (!byWard.has(key)) {
        byWard.set(key, { ward: bed.ward, items: [] });
      }
      byWard.get(key)!.items.push(bed);
    }
    return Array.from(byWard.values());
  }, [beds]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('bedBoard.title')}
            </h1>
            <p className="text-muted-foreground">{t('bedBoard.subtitle')}</p>
          </div>
        </div>
        <Select
          value={wardId ?? 'ALL'}
          onValueChange={(v) => {
            if (v === 'ALL') {
              searchParams.delete('wardId');
            } else {
              searchParams.set('wardId', v);
            }
            setSearchParams(searchParams);
          }}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('bedBoard.allWards')}</SelectItem>
            {wards?.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'] as const).map(
          (s) => (
            <div
              key={s}
              className={cn(
                'rounded-lg border p-3 text-sm',
                BED_CARD_CLASS[s],
              )}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t(`bedStatus.${s}`)}
              </p>
              <p className="mt-1 text-2xl font-bold">{stats[s]}</p>
            </div>
          ),
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : !beds || beds.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title={t('bedBoard.emptyTitle')}
          description={t('bedBoard.emptyDescription')}
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ ward, items }) => (
            <section key={ward?.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{ward?.name}</h2>
                {ward && (
                  <span className="text-xs text-muted-foreground">
                    ({t(`wardType.${ward.type}`)})
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {items.map((bed) => (
                  <BedTile key={bed.id} bed={bed} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function BedTile({ bed }: { bed: Bed }) {
  const { t } = useTranslation('inpatient');
  const occupant = bed.admissions?.[0];
  const tile = (
    <div
      className={cn(
        'flex h-full flex-col gap-1 rounded-lg border p-3 text-sm transition-shadow hover:shadow-md',
        BED_CARD_CLASS[bed.status],
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{bed.number}</span>
        <BedStatusBadge status={bed.status} />
      </div>
      {occupant ? (
        <p className="truncate text-xs text-muted-foreground">
          {occupant.patientProfile.nationalPatient.firstName}{' '}
          {occupant.patientProfile.nationalPatient.lastName}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t(`bedStatus.${bed.status}`)}
        </p>
      )}
    </div>
  );

  if (occupant) {
    return (
      <Link
        to={`/inpatient/admissions/${occupant.id}`}
        className="block"
      >
        {tile}
      </Link>
    );
  }
  return tile;
}
