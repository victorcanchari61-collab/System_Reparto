import { IconPencil, IconPower, IconUsers } from '@tabler/icons-react';
import DataTable, { type ColumnDef } from '../../../../components/tables/DataTable';
import Badge from '../../../../components/ui/Badge';
import type { UserRecord } from '../../../../types/models';

interface Props {
  users: UserRecord[];
  loading: boolean;
  onEdit: (user: UserRecord) => void;
  onToggle: (user: UserRecord) => void;
}

const columns = (
  onEdit: Props['onEdit'],
  onToggle: Props['onToggle'],
): ColumnDef<UserRecord>[] => [
  {
    key: 'fullName',
    header: 'Usuario',
    sortable: true,
    minWidth: 180,
    mobileCard: { fullWidth: true },
    render: (row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-r3 flex items-center justify-center text-[10px] font-bold text-r shrink-0">
          {row.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{row.fullName}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] truncate">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'roleName',
    header: 'Rol',
    sortable: true,
    render: (row) =>
      row.roleName
        ? <span className="text-[12px] text-[var(--color-text-primary)]">{row.roleName}</span>
        : <span className="text-[12px] text-gray-400 italic">Sin rol</span>,
  },
  {
    key: 'isActive',
    header: 'Estado',
    render: (row) => (
      <Badge variant={row.isActive ? 'green' : 'red'}>
        {row.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
  {
    key: 'createdAtUtc',
    header: 'Creado',
    sortable: true,
    mobileCard: { hidden: true },
    render: (row) => (
      <span className="text-[12px] text-[var(--color-text-secondary)]">
        {new Date(row.createdAtUtc).toLocaleDateString('es-PE')}
      </span>
    ),
  },
  {
    key: '_actions',
    header: '',
    mobileCard: { isActions: true },
    render: (row) => (
      <div className="flex items-center gap-1">
        <button
          onClick={e => { e.stopPropagation(); onEdit(row); }}
          className="p-1.5 rounded-[var(--border-radius-md)] text-gray-400 hover:text-r hover:bg-r3 transition-colors cursor-pointer"
          title="Editar"
        >
          <IconPencil size={14} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onToggle(row); }}
          className={`p-1.5 rounded-[var(--border-radius-md)] transition-colors cursor-pointer ${
            row.isActive
              ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
          }`}
          title={row.isActive ? 'Desactivar' : 'Activar'}
        >
          <IconPower size={14} />
        </button>
      </div>
    ),
  },
];

export default function UsersTable({ users, loading, onEdit, onToggle }: Props) {
  return (
    <DataTable
      data={users}
      columns={columns(onEdit, onToggle)}
      loading={loading}
      keyExtractor={r => r.id}
      emptyMessage="No hay usuarios registrados."
      emptyIcon={<IconUsers size={32} />}
    />
  );
}
