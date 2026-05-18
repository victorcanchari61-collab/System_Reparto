import React, { useState } from 'react';
import {
  IconBuilding, IconCircleCheck, IconCircleX,
  IconPuzzle, IconEye, IconPencil,
  IconPlayerPlay, IconPlayerPause, IconLoader2,
} from '@tabler/icons-react';
import DataTable, { type ColumnDef } from '../../../../components/tables/DataTable';
import FilterBar from '../../../../components/ui/FilterBar';
import { Badge } from '../../../../components/ui/Badge';
import { formatDate } from '../../../../utils/formatters';
import { apiClient } from '../../../../lib/api-client';
import type { Company } from '../../../../types/models';

interface Actions {
  onDetail:  (c: Company) => void;
  onEdit:    (c: Company) => void;
  onModules: (c: Company) => void;
  onToggle:  (c: Company, newActive: boolean) => void;
}

/* Botón de acción icónico reutilizable */
const ActionBtn: React.FC<{
  icon: React.ReactNode; title: string; color: string;
  onClick: () => void; loading?: boolean;
}> = ({ icon, title, color, onClick, loading }) => (
  <button
    type="button"
    title={title}
    disabled={loading}
    onClick={e => { e.stopPropagation(); onClick(); }}
    className={`flex items-center justify-center transition-opacity cursor-pointer ${color} ${loading ? 'opacity-40 cursor-wait' : 'hover:opacity-60'}`}
  >
    {loading ? <IconLoader2 size={14} className="animate-spin" /> : icon}
  </button>
);

/* ── Tabla ───────────────────────────────────────────────── */

interface Props {
  companies: Company[];
  loading?: boolean;
  onManageModules: (c: Company) => void;
  onDetail:        (c: Company) => void;
  onEdit:          (c: Company) => void;
  onRefetch:       () => void;
}

const CompaniesTable: React.FC<Props> = ({
  companies, loading, onManageModules, onDetail, onEdit, onRefetch,
}) => {
  const [search, setSearch]   = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (company: Company) => {
    setToggling(company.id);
    try {
      await apiClient.toggleCompanyStatus(company.id);
      onRefetch();
    } catch { /* silently ignore — refetch will restore correct state */ }
    finally { setToggling(null); }
  };

  const filtered = companies.filter(c =>
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.ruc.includes(search),
  );

  const actions: Actions = {
    onDetail:  onDetail,
    onEdit:    onEdit,
    onModules: onManageModules,
    onToggle:  handleToggle,
  };

  const columns: ColumnDef<Company>[] = [
    {
      key: 'businessName',
      header: 'Empresa',
      sortable: true,
      minWidth: 200,
      mobileCard: { fullWidth: true },
      render: row => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[6px] bg-r/10 flex items-center justify-center shrink-0">
            <IconBuilding size={13} className="text-r" />
          </div>
          <div>
            <div className="font-medium text-[var(--color-text-primary)]">{row.businessName}</div>
            {row.tradeName && row.tradeName !== row.businessName && (
              <div className="text-[10px] text-gray-400">{row.tradeName}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'ruc',
      header: 'RUC',
      sortable: true,
      render: row => <span className="font-mono text-[var(--color-text-secondary)]">{row.ruc}</span>,
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: row => row.isActive
        ? <Badge variant="green"><IconCircleCheck size={11} className="inline mr-0.5" />Activa</Badge>
        : <Badge variant="gray"><IconCircleX size={11} className="inline mr-0.5" />Inactiva</Badge>,
    },
    {
      key: 'createdAtUtc',
      header: 'Registrada',
      sortable: true,
      mobileCard: { hidden: true },
      render: row => <span className="text-[var(--color-text-secondary)]">{formatDate(row.createdAtUtc)}</span>,
    },
    {
      key: '_actions',
      header: 'Acciones',
      mobileCard: { isActions: true },
      render: row => (
        <div className="flex items-center gap-3">
          <ActionBtn icon={<IconEye size={15} />}    title="Ver detalle"        color="text-blue-400"   onClick={() => actions.onDetail(row)} />
          <ActionBtn icon={<IconPencil size={15} />} title="Editar empresa"     color="text-gray-400"   onClick={() => actions.onEdit(row)} />
          <ActionBtn icon={<IconPuzzle size={15} />} title="Gestionar módulos"  color="text-violet-400" onClick={() => actions.onModules(row)} />
          <ActionBtn
            icon={row.isActive ? <IconPlayerPause size={15} /> : <IconPlayerPlay size={15} />}
            title={row.isActive ? 'Desactivar' : 'Activar'}
            color={row.isActive ? 'text-r' : 'text-green-500'}
            onClick={() => actions.onToggle(row, !row.isActive)}
            loading={toggling === row.id}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Buscar por nombre o RUC..."
        onReset={() => setSearch('')}
      />
      <DataTable
        data={filtered}
        columns={columns}
        loading={loading}
        keyExtractor={r => r.id}
        emptyMessage={search ? `Sin resultados para "${search}"` : 'Aún no hay empresas registradas.'}
        emptyIcon={<IconBuilding size={36} />}
      />
    </div>
  );
};

export default CompaniesTable;
