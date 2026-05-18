import React, { useMemo, useState, useRef } from 'react';
import {
  IconChevronUp, IconChevronDown, IconSelector,
  IconColumns, IconCheck, IconGripVertical
} from '@tabler/icons-react';

/* ── Tipos públicos ─────────────────────────────────────── */

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  /** px — ancho mínimo de la columna */
  minWidth?: number;
  /** Render personalizado. Si no se provee, se muestra row[key] */
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  /** Comportamiento en la vista de cards (mobile) */
  mobileCard?: {
    /** Ocultar esta columna en la vista de cards */
    hidden?: boolean;
    /** Renderizar sin etiqueta, a ancho completo (columna "título" de la card) */
    fullWidth?: boolean;
    /** Renderizar en el pie de la card (botones de acción) */
    isActions?: boolean;
  };
}

interface DataTableProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  /** Devuelve la key única de cada fila */
  keyExtractor?: (row: T) => string;
  /** Callback opcional al hacer clic en una fila */
  onRowClick?: (row: T) => void;
}

/* ── Helpers internos ───────────────────────────────────── */

type SortDir = 'asc' | 'desc';

const SortIcon: React.FC<{ active: boolean; dir: SortDir }> = ({ active, dir }) => {
  if (!active) return <IconSelector size={12} className="text-gray-300 ml-1 shrink-0" />;
  return dir === 'asc'
    ? <IconChevronUp  size={12} className="text-r ml-1 shrink-0" />
    : <IconChevronDown size={12} className="text-r ml-1 shrink-0" />;
};

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 rounded shimmer" style={{ width: `${55 + (i * 17) % 40}%` }} />
      </td>
    ))}
  </tr>
);

/* ── Componente ─────────────────────────────────────────── */

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'No hay datos para mostrar.',
  emptyIcon,
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) {

  /* Estado: orden de columnas */
  const [colOrder, setColOrder] = useState<string[]>(columns.map(c => c.key));

  /* Estado: columnas ocultas */
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  /* Estado: columna manager abierto */
  const [mgr, setMgr] = useState(false);
  const mgrRef = useRef<HTMLDivElement>(null);

  /* Estado: ordenamiento */
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(null);

  /* Estado: drag & drop de columnas */
  const dragKey = useRef<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  /* Columnas visibles en el orden actual */
  const visibleCols = useMemo(
    () => colOrder
      .map(k => columns.find(c => c.key === k)!)
      .filter(c => c && !hidden.has(c.key)),
    [colOrder, columns, hidden],
  );

  /* Datos ordenados */
  const sortedData = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => {
      const av = a[sort.key] ?? '';
      const bv = b[sort.key] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'es', { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data, sort]);

  /* ----- Handlers de sort ----- */
  const handleSort = (key: string) =>
    setSort(prev =>
      prev?.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    );

  /* ----- Handlers de drag & drop de columnas ----- */
  const handleDragStart = (key: string) => { dragKey.current = key; };
  const handleDragOver  = (e: React.DragEvent, key: string) => { e.preventDefault(); setDragOverKey(key); };
  const handleDrop      = (targetKey: string) => {
    const from = dragKey.current;
    if (!from || from === targetKey) { setDragOverKey(null); return; }
    setColOrder(prev => {
      const arr  = [...prev];
      const fi   = arr.indexOf(from);
      const ti   = arr.indexOf(targetKey);
      arr.splice(fi, 1);
      arr.splice(ti, 0, from);
      return arr;
    });
    dragKey.current = null;
    setDragOverKey(null);
  };
  const handleDragEnd = () => { dragKey.current = null; setDragOverKey(null); };

  /* ----- Toggle visibilidad de columna ----- */
  const toggleHidden = (key: string) =>
    setHidden(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  /* ----- Cerrar manager al hacer clic fuera ----- */
  React.useEffect(() => {
    if (!mgr) return;
    const onOut = (e: MouseEvent) => {
      if (!mgrRef.current?.contains(e.target as Node)) setMgr(false);
    };
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [mgr]);

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-2">

      {/* Barra de herramientas — oculta en mobile */}
      <div className="hidden md:flex justify-end">
        <div className="relative" ref={mgrRef}>
          <button
            onClick={() => setMgr(v => !v)}
            className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] border border-[var(--color-border-secondary)] hover:bg-gray-50 px-2.5 py-1.5 rounded-[var(--border-radius-md)] transition-colors cursor-pointer"
          >
            <IconColumns size={13} />
            Columnas
            {hidden.size > 0 && (
              <span className="bg-r text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {hidden.size}
              </span>
            )}
          </button>

          {/* Dropdown de gestión de columnas */}
          {mgr && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--color-border-secondary)] rounded-[var(--border-radius-lg)] shadow-lg z-20 py-1.5 min-w-[160px] animate-modal-panel">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider px-3 py-1">
                Mostrar columnas
              </p>
              {columns.map(col => (
                <button
                  key={col.key}
                  onClick={() => toggleHidden(col.key)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[var(--color-text-primary)] hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${hidden.has(col.key) ? 'border-gray-300 bg-white' : 'border-r bg-r'}`}>
                    {!hidden.has(col.key) && <IconCheck size={10} className="text-white" />}
                  </span>
                  {col.header}
                </button>
              ))}
              {hidden.size > 0 && (
                <button
                  onClick={() => setHidden(new Set())}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-r hover:bg-r3 transition-colors cursor-pointer border-t border-[var(--color-border-tertiary)] mt-1"
                >
                  Mostrar todas
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Vista de cards — solo mobile ── */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Skeleton */}
        {loading && Array.from({ length: skeletonRows }).map((_, i) => (
          <div key={i} className="bg-white border border-[var(--color-border-secondary)] rounded-[var(--border-radius-lg)] p-4 flex flex-col gap-3">
            <div className="h-4 rounded shimmer w-2/3" />
            <div className="h-3 rounded shimmer w-1/2" />
            <div className="h-3 rounded shimmer w-3/4" />
          </div>
        ))}

        {/* Sin datos */}
        {!loading && sortedData.length === 0 && (
          <div className="py-14 text-center text-[13px] text-gray-400">
            <div className="flex flex-col items-center gap-2">
              {emptyIcon && <span className="opacity-30">{emptyIcon}</span>}
              {emptyMessage}
            </div>
          </div>
        )}

        {/* Cards */}
        {!loading && sortedData.map((row, i) => {
          const key = keyExtractor ? keyExtractor(row) : String(i);
          const fullWidthCols = visibleCols.filter(c => c.mobileCard?.fullWidth && !c.mobileCard?.hidden);
          const regularCols   = visibleCols.filter(c => !c.mobileCard?.fullWidth && !c.mobileCard?.isActions && !c.mobileCard?.hidden);
          const actionsCols   = visibleCols.filter(c => c.mobileCard?.isActions && !c.mobileCard?.hidden);
          /* Fallback: si no hay configuración mobileCard, mostrar todo como filas */
          const hasConfig = visibleCols.some(c => c.mobileCard);
          const fallbackCols = hasConfig ? [] : visibleCols;

          return (
            <div
              key={key}
              className={[
                'bg-white border border-[var(--color-border-secondary)] rounded-[var(--border-radius-lg)] overflow-hidden animate-row',
                onRowClick ? 'cursor-pointer active:bg-gray-50' : '',
              ].join(' ')}
              style={{ animationDelay: `${i * 30}ms` }}
              onClick={() => onRowClick?.(row)}
            >
              {/* Columna título (fullWidth) */}
              {fullWidthCols.length > 0 && (
                <div className="px-4 py-3 border-b border-[var(--color-border-tertiary)]">
                  {fullWidthCols.map(col => (
                    <div key={col.key}>
                      {col.render ? col.render(row, i) : (row[col.key] ?? '—')}
                    </div>
                  ))}
                </div>
              )}

              {/* Columnas regulares: etiqueta + valor */}
              {(regularCols.length > 0 || fallbackCols.length > 0) && (
                <div className="px-4 py-3 flex flex-col gap-2">
                  {(hasConfig ? regularCols : fallbackCols).map(col => (
                    <div key={col.key} className="flex items-start justify-between gap-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider shrink-0 pt-0.5">
                        {col.header}
                      </span>
                      <div className="text-[12px] text-right min-w-0">
                        {col.render ? col.render(row, i) : (row[col.key] ?? '—')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pie de acciones */}
              {actionsCols.length > 0 && (
                <div className="px-4 py-2.5 border-t border-[var(--color-border-tertiary)] bg-gray-50/50 flex items-center gap-4">
                  {actionsCols.map(col => (
                    <div key={col.key}>
                      {col.render ? col.render(row, i) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Tabla — solo desktop ── */}
      <div className="hidden md:block border border-[var(--color-border-secondary)] rounded-[var(--border-radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">

            {/* Cabeceras — arrastrables */}
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--color-border-secondary)]">
                {visibleCols.map(col => (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={() => handleDragStart(col.key)}
                    onDragOver={e  => handleDragOver(e, col.key)}
                    onDrop={()     => handleDrop(col.key)}
                    onDragEnd={handleDragEnd}
                    style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                    className={[
                      'text-left px-4 py-2.5 select-none',
                      col.sortable ? 'cursor-pointer hover:bg-gray-100' : 'cursor-grab',
                      dragOverKey === col.key ? 'col-drag-over' : '',
                      dragKey.current === col.key ? 'col-dragging' : '',
                      col.className ?? '',
                    ].join(' ')}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      <IconGripVertical size={11} className="text-gray-300 shrink-0 -ml-1" />
                      {col.header}
                      {col.sortable && (
                        <SortIcon active={sort?.key === col.key} dir={sort?.dir ?? 'asc'} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Skeleton de carga */}
              {loading && Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow key={i} cols={visibleCols.length} />
              ))}

              {/* Sin datos */}
              {!loading && sortedData.length === 0 && (
                <tr>
                  <td colSpan={visibleCols.length} className="py-14 text-center text-[13px] text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      {emptyIcon && <span className="opacity-30">{emptyIcon}</span>}
                      {emptyMessage}
                    </div>
                  </td>
                </tr>
              )}

              {/* Filas con animación escalonada */}
              {!loading && sortedData.map((row, i) => {
                const key = keyExtractor ? keyExtractor(row) : String(i);
                return (
                  <tr
                    key={key}
                    className={[
                      'border-b border-[var(--color-border-tertiary)] last:border-0 animate-row',
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40',
                      onRowClick ? 'hover:bg-blue-50/30 cursor-pointer' : '',
                    ].join(' ')}
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {visibleCols.map(col => (
                      <td key={col.key} className={`px-4 py-2.5 ${col.className ?? ''}`}>
                        {col.render ? col.render(row, i) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
