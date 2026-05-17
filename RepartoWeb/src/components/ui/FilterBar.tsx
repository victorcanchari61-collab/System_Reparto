import React, { useEffect, useState } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';

export interface ActiveFilter {
  key: string;
  label: string;
}

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (key: string) => void;
  onReset?: () => void;
  /** Elementos adicionales (selects, date pickers, etc.) */
  children?: React.ReactNode;
  /** ms de debounce para el input de búsqueda (default 300) */
  debounceMs?: number;
}

/**
 * Barra de filtros reutilizable.
 * - Input de búsqueda con debounce interno
 * - Chips de filtros activos con botón de eliminar
 * - Slot `children` para filtros extra
 * - Botón de reset general
 */
const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearch,
  placeholder = 'Buscar...',
  activeFilters = [],
  onRemoveFilter,
  onReset,
  children,
  debounceMs = 300,
}) => {
  const [local, setLocal] = useState(search);

  /* Debounce: propaga hacia el padre después de N ms de inactividad */
  useEffect(() => {
    const timer = setTimeout(() => onSearch(local), debounceMs);
    return () => clearTimeout(timer);
  }, [local, debounceMs, onSearch]);

  /* Sincroniza si el padre limpia el estado externamente */
  useEffect(() => { setLocal(search); }, [search]);

  const hasActive = activeFilters.length > 0 || search.length > 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Fila principal */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Input búsqueda */}
        <div className="relative flex items-center">
          <IconSearch size={13} className="absolute left-2.5 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={local}
            onChange={e => setLocal(e.target.value)}
            placeholder={placeholder}
            className="pl-8 pr-3 py-2 text-[12px] border border-[var(--color-border-secondary)] rounded-[var(--border-radius-md)] bg-white focus:outline-none focus:border-r transition-colors w-52 sm:w-64"
          />
          {local && (
            <button
              onClick={() => { setLocal(''); onSearch(''); }}
              className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <IconX size={12} />
            </button>
          )}
        </div>

        {/* Filtros adicionales (slot) */}
        {children}

        {/* Botón reset */}
        {hasActive && onReset && (
          <button
            onClick={() => { setLocal(''); onReset(); }}
            className="text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Chips de filtros activos */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilters.map(f => (
            <span
              key={f.key}
              className="flex items-center gap-1 bg-r/10 text-r text-[11px] font-medium px-2 py-0.5 rounded-full"
            >
              {f.label}
              {onRemoveFilter && (
                <button
                  onClick={() => onRemoveFilter(f.key)}
                  className="hover:text-r4 cursor-pointer"
                  aria-label={`Quitar filtro ${f.label}`}
                >
                  <IconX size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
