import React, { useState } from 'react';
import { IconBuilding, IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import DataTable, { type ColumnDef } from '../../../../components/tables/DataTable';
import FilterBar from '../../../../components/ui/FilterBar';
import { Badge } from '../../../../components/ui/Badge';
import { formatDate } from '../../../../utils/formatters';
import type { Company } from '../../../../types/models';

interface Props {
  companies: Company[];
  loading?: boolean;
}

const columns: ColumnDef<Company>[] = [
  {
    key: 'businessName',
    header: 'Empresa',
    sortable: true,
    minWidth: 200,
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
    render: row => <span className="text-[var(--color-text-secondary)]">{formatDate(row.createdAtUtc)}</span>,
  },
];

const CompaniesTable: React.FC<Props> = ({ companies, loading }) => {
  const [search, setSearch] = useState('');

  const filtered = companies.filter(c =>
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.ruc.includes(search),
  );

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
