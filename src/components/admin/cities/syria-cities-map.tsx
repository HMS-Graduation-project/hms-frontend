import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { City } from '@/hooks/use-cities';
import { GOVERNORATES, governorateToSlug, slugToEnglish, slugToGovIndex } from './governorates';

const VIEW_W = 640;
const VIEW_H = 560;
const PAD = 28;

type Ring = [number, number][];
interface Feature {
  properties: { id: string; center: [number, number] };
  geometry:
    | { type: 'Polygon'; coordinates: Ring[] }
    | { type: 'MultiPolygon'; coordinates: Ring[][] };
}
interface GeoData {
  bbox: [number, number, number, number];
  features: Feature[];
}

interface Shape {
  slug: string;
  d: string;
  cx: number;
  cy: number;
}

/** Equirectangular projector fitting the country bbox into the viewBox. */
function makeProjector(bbox: [number, number, number, number]) {
  const [minX, minY, maxX, maxY] = bbox;
  const centerLat = (minY + maxY) / 2;
  const lonScale = Math.cos((centerLat * Math.PI) / 180);
  const geoW = (maxX - minX) * lonScale;
  const geoH = maxY - minY;
  const scale = Math.min((VIEW_W - 2 * PAD) / geoW, (VIEW_H - 2 * PAD) / geoH);
  const offX = (VIEW_W - geoW * scale) / 2;
  const offY = (VIEW_H - geoH * scale) / 2;
  return (lon: number, lat: number): [number, number] => [
    offX + (lon - minX) * lonScale * scale,
    offY + (maxY - lat) * scale,
  ];
}

function ringToPath(ring: Ring, project: (lon: number, lat: number) => [number, number]) {
  return (
    ring
      .map(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join('') + 'Z'
  );
}

function featureToPath(f: Feature, project: (lon: number, lat: number) => [number, number]) {
  if (f.geometry.type === 'Polygon') {
    return f.geometry.coordinates.map((r) => ringToPath(r, project)).join('');
  }
  return f.geometry.coordinates
    .map((poly) => poly.map((r) => ringToPath(r, project)).join(''))
    .join('');
}

/** Deterministic ring of city marker positions around a governorate centroid. */
function cityPositions(cx: number, cy: number, n: number): [number, number][] {
  if (n <= 1) return [[cx, cy]];
  const r = 9 + Math.min(n, 6);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

interface GovStat {
  slug: string;
  cities: City[];
  hospitals: number;
  activeCities: number;
}

type Hover =
  | { kind: 'gov'; slug: string }
  | { kind: 'city'; city: City; slug: string };

interface SyriaCitiesMapProps {
  cities: City[];
  selectedGovernorate: string | null;
  onSelectGovernorate: (governorate: string | null) => void;
  highlightedCityId?: string | null;
  onSelectCity?: (city: City) => void;
  className?: string;
}

export function SyriaCitiesMap({
  cities,
  selectedGovernorate,
  onSelectGovernorate,
  highlightedCityId,
  onSelectCity,
  className,
}: SyriaCitiesMapProps) {
  const { t } = useTranslation('cities');
  const { t: tMarketing } = useTranslation('marketing');
  const [data, setData] = useState<GeoData | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<Hover | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const govNames = tMarketing('governorates', { returnObjects: true }) as string[];
  const nameForSlug = (slug: string) => {
    const idx = slugToGovIndex(slug);
    return idx >= 0 && govNames[idx] ? govNames[idx] : slugToEnglish(slug);
  };

  const selectedSlug = governorateToSlug(selectedGovernorate);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}syria-governorates.geojson`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((json: GeoData) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Aggregate cities per governorate slug.
  const statsBySlug = useMemo(() => {
    const map = new Map<string, GovStat>();
    for (const city of cities) {
      const slug = governorateToSlug(city.governorate);
      if (!slug) continue;
      const entry =
        map.get(slug) ?? { slug, cities: [], hospitals: 0, activeCities: 0 };
      entry.cities.push(city);
      entry.hospitals += city._count?.hospitals ?? 0;
      if (city.isActive) entry.activeCities += 1;
      map.set(slug, entry);
    }
    return map;
  }, [cities]);

  const maxHospitals = useMemo(
    () => Math.max(1, ...Array.from(statsBySlug.values(), (s) => s.hospitals)),
    [statsBySlug],
  );

  const shapes = useMemo<Shape[]>(() => {
    if (!data) return [];
    const project = makeProjector(data.bbox);
    return data.features.map((f) => {
      const [cx, cy] = project(f.properties.center[0], f.properties.center[1]);
      return { slug: f.properties.id, d: featureToPath(f, project), cx, cy };
    });
  }, [data]);

  const activeSlug = hover?.slug ?? selectedSlug;

  const fillFor = (slug: string) => {
    const h = statsBySlug.get(slug)?.hospitals ?? 0;
    const t01 = h === 0 ? 0 : 0.22 + 0.6 * (h / maxHospitals);
    return t01;
  };

  const moveTip = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const toggleGovernorate = (slug: string) => {
    const en = slugToEnglish(slug);
    onSelectGovernorate(selectedGovernorate === en ? null : en);
  };

  // Graceful fallback: clickable chips when the geojson can't be loaded.
  if (failed) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {GOVERNORATES.map((g, idx) => {
          const isSelected = selectedGovernorate === g.en;
          return (
            <button
              key={g.slug}
              type="button"
              onClick={() => onSelectGovernorate(isSelected ? null : g.en)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                isSelected
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10',
              )}
            >
              {govNames[idx] ?? g.en}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full overflow-visible"
        role="group"
        aria-label={t('map.ariaLabel')}
        onMouseLeave={() => {
          setHover(null);
          setTip(null);
        }}
      >
        <defs>
          <linearGradient id="gov-active" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Governorate shapes (choropleth by hospital count). */}
        {shapes.map((s) => {
          const isActive = activeSlug === s.slug;
          const isSelected = selectedSlug === s.slug;
          const stat = statsBySlug.get(s.slug);
          const label = nameForSlug(s.slug);
          return (
            <path
              key={s.slug}
              d={s.d}
              tabIndex={0}
              role="button"
              aria-label={`${label} — ${t('map.govSummary', {
                cities: stat?.cities.length ?? 0,
                hospitals: stat?.hospitals ?? 0,
              })}`}
              aria-pressed={isSelected}
              fill={isActive ? 'url(#gov-active)' : 'hsl(var(--primary))'}
              fillOpacity={isActive ? 1 : fillFor(s.slug) || 0.05}
              stroke={isSelected ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
              strokeWidth={isSelected ? 2 : isActive ? 1.4 : 0.8}
              strokeOpacity={isActive || isSelected ? 1 : 0.45}
              className="cursor-pointer outline-none transition-[fill-opacity,stroke-width] focus-visible:stroke-[2.4] [stroke-linejoin:round]"
              onMouseEnter={(e) => {
                setHover({ kind: 'gov', slug: s.slug });
                moveTip(e);
              }}
              onMouseMove={(e) => {
                if (hover?.kind === 'gov') moveTip(e);
              }}
              onFocus={() => setHover({ kind: 'gov', slug: s.slug })}
              onBlur={() => setHover(null)}
              onClick={() => toggleGovernorate(s.slug)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleGovernorate(s.slug);
                }
              }}
            />
          );
        })}

        {/* City markers, arranged in a ring around each governorate centroid. */}
        {shapes.map((s) => {
          const stat = statsBySlug.get(s.slug);
          if (!stat || stat.cities.length === 0) return null;
          const isActive = activeSlug === s.slug;
          const positions = cityPositions(s.cx, s.cy, stat.cities.length);
          return (
            <g key={`cities-${s.slug}`}>
              {stat.cities.map((city, i) => {
                const [x, y] = positions[i];
                const isHi = highlightedCityId === city.id;
                const r = isHi ? 5 : isActive ? 4 : 3;
                return (
                  <circle
                    key={city.id}
                    cx={x}
                    cy={y}
                    r={r}
                    fill={
                      city.isActive ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'
                    }
                    stroke={isHi ? 'hsl(var(--accent))' : 'hsl(var(--background))'}
                    strokeWidth={isHi ? 2 : 1}
                    className={cn(
                      'transition-all',
                      onSelectCity ? 'cursor-pointer' : 'pointer-events-none',
                    )}
                    onMouseEnter={(e) => {
                      setHover({ kind: 'city', city, slug: s.slug });
                      moveTip(e);
                    }}
                    onMouseMove={moveTip}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCity?.(city);
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip. */}
      {hover && tip && (
        <div
          className="pointer-events-none absolute z-10 max-w-[14rem] rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-md"
          style={{
            left: Math.min(tip.x + 12, (containerRef.current?.clientWidth ?? VIEW_W) - 180),
            top: tip.y + 12,
          }}
        >
          {hover.kind === 'gov' ? (
            <GovTooltip
              name={nameForSlug(hover.slug)}
              stat={statsBySlug.get(hover.slug)}
              cityWord={t('map.citiesCount', {
                count: statsBySlug.get(hover.slug)?.cities.length ?? 0,
              })}
              hospitalWord={t('map.hospitalsCount', {
                count: statsBySlug.get(hover.slug)?.hospitals ?? 0,
              })}
            />
          ) : (
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">{hover.city.name}</p>
              {hover.city.nameAr && (
                <p className="text-xs text-muted-foreground" dir="rtl">
                  {hover.city.nameAr}
                </p>
              )}
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {t('map.hospitalsCount', { count: hover.city._count?.hospitals ?? 0 })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legend. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{t('map.legendLow')}</span>
          <span
            className="h-2.5 w-24 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, hsl(var(--primary)/0.12), hsl(var(--primary)/0.85))',
            }}
          />
          <span>{t('map.legendHigh')}</span>
          <span className="ms-1">{t('map.legendMetric')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 fill-success text-success" />
            {t('active')}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 fill-muted-foreground text-muted-foreground" />
            {t('inactive')}
          </span>
        </div>
      </div>
    </div>
  );
}

function GovTooltip({
  name,
  stat,
  cityWord,
  hospitalWord,
}: {
  name: string;
  stat?: GovStat;
  cityWord: string;
  hospitalWord: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold">{name}</p>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        {cityWord}
      </p>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Building2 className="h-3 w-3" />
        {hospitalWord}
      </p>
      {stat && stat.cities.length > 0 && (
        <p className="pt-0.5 text-[11px] text-muted-foreground/80">
          {stat.cities
            .slice(0, 4)
            .map((c) => c.name)
            .join(' · ')}
          {stat.cities.length > 4 ? ' …' : ''}
        </p>
      )}
    </div>
  );
}
