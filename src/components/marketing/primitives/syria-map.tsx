import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * Canonical governorate order — MUST match the order of the
 * `marketing:governorates` array so an id resolves to its localized name.
 */
const GOV_IDS = [
  'damascus',
  'rural-damascus',
  'aleppo',
  'homs',
  'hama',
  'latakia',
  'tartus',
  'idlib',
  'daraa',
  'as-suwayda',
  'quneitra',
  'deir-ez-zor',
  'al-hasakah',
  'raqqa',
] as const;

// Damascus is the network hub for the hub-and-spoke connector lines.
const HUB_ID = 'damascus';

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

interface Projected {
  id: string;
  d: string;
  cx: number;
  cy: number;
}

/** Build an equirectangular projector that fits the country bbox into the viewBox. */
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

interface SyriaMapProps {
  className?: string;
}

export function SyriaMap({ className }: SyriaMapProps) {
  const { t } = useTranslation('marketing');
  const reduce = useReducedMotion();
  const [data, setData] = useState<GeoData | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const governorates = t('governorates', { returnObjects: true }) as string[];
  const nameFor = (id: string) => {
    const idx = GOV_IDS.indexOf(id as (typeof GOV_IDS)[number]);
    return idx >= 0 ? governorates[idx] : id;
  };

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

  const { shapes, nodes, hub, links } = useMemo(() => {
    if (!data) return { shapes: [] as Projected[], nodes: [] as Projected[], hub: null as Projected | null, links: [] as Projected[] };
    const project = makeProjector(data.bbox);
    const shapes: Projected[] = data.features.map((f) => {
      const [cx, cy] = project(f.properties.center[0], f.properties.center[1]);
      return { id: f.properties.id, d: featureToPath(f, project), cx, cy };
    });
    const hub = shapes.find((s) => s.id === HUB_ID) ?? shapes[0] ?? null;
    const links = hub ? shapes.filter((s) => s.id !== hub.id) : [];
    return { shapes, nodes: shapes, hub, links };
  }, [data]);

  if (failed) {
    // Graceful fallback: a simple chip cloud of governorate names.
    return (
      <div className={cn('flex flex-wrap justify-center gap-2', className)}>
        {governorates.map((g) => (
          <span
            key={g}
            className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-foreground"
          >
            {g}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full overflow-visible"
        role="group"
        aria-label={t('network.title')}
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id="gov-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.10" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id="gov-fill-active" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Connector lines (hub-and-spoke from Damascus). */}
        {hub &&
          links.map((s, i) => (
            <motion.line
              key={`link-${s.id}`}
              x1={hub.cx}
              y1={hub.cy}
              x2={s.cx}
              y2={s.cy}
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              strokeOpacity={active === s.id || active === hub.id ? 0.6 : 0.18}
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              whileInView={reduce ? undefined : { pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
            />
          ))}

        {/* Governorate shapes. */}
        {shapes.map((s, i) => {
          const isActive = active === s.id;
          const label = nameFor(s.id);
          return (
            <motion.path
              key={s.id}
              d={s.d}
              tabIndex={0}
              role="button"
              aria-label={label}
              aria-pressed={isActive}
              fill={isActive ? 'url(#gov-fill-active)' : 'url(#gov-fill)'}
              stroke="hsl(var(--primary))"
              strokeWidth={isActive ? 1.6 : 0.8}
              strokeOpacity={isActive ? 1 : 0.5}
              className="cursor-pointer outline-none transition-colors focus-visible:stroke-[2.4] [stroke-linejoin:round]"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={reduce ? undefined : { opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              onMouseEnter={() => setActive(s.id)}
              onFocus={() => setActive(s.id)}
              onBlur={() => setActive(null)}
            />
          );
        })}

        {/* Pulsing network nodes at each governorate centroid. */}
        {nodes.map((s) => {
          const isHub = hub?.id === s.id;
          const isActive = active === s.id;
          return (
            <g key={`node-${s.id}`} pointerEvents="none">
              {!reduce && (
                <motion.circle
                  cx={s.cx}
                  cy={s.cy}
                  r={isHub ? 5 : 3.5}
                  fill="hsl(var(--primary))"
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: [0.5, 0, 0.5], scale: [1, 2.6, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: isHub ? 0 : 0.6 }}
                  style={{ transformOrigin: `${s.cx}px ${s.cy}px` }}
                />
              )}
              <circle
                cx={s.cx}
                cy={s.cy}
                r={isHub ? 4 : isActive ? 3.5 : 2.6}
                fill={isHub ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
                stroke="hsl(var(--background))"
                strokeWidth={1}
              />
            </g>
          );
        })}
      </svg>

      {/* Active governorate caption (also a polite live region for SR users). */}
      <p
        ref={liveRef}
        aria-live="polite"
        className="mt-4 h-6 text-center text-sm font-medium text-foreground"
      >
        {active ? (
          <span>
            <span className="text-muted-foreground">{t('network.label')}: </span>
            {nameFor(active)}
          </span>
        ) : (
          <span className="text-muted-foreground">{t('network.hint')}</span>
        )}
      </p>
    </div>
  );
}
