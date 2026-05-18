import { IconShield, IconKey, IconTrash } from '@tabler/icons-react';
import DataTable, { type ColumnDef } from '../../../../components/tables/DataTable';
import Badge from '../../../../components/ui/Badge';
import type { Role } from '../../../../types/models';

interface Props {
  roles: Role[];
  loading: boolean;
  onManagePermissions: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const columns = (
  onManagePermissions: Props['onManagePermissions'],
  onDelete: Props['onDelete'],
): ColumnDef<Role>[] => [
  {
    key: 'name',
    header: 'Rol',
    sortable: true,
    minWidth: 160,
    mobileCard: { fullWidth: true },
    render: (row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-[var(--border-radius-md)] bg-r3 flex items-center justify-center shrink-0">
          <IconShield size={13} className="text-r" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{row.name}</p>
          {row.description && (
            <p className="text-[11px] text-[var(--color-text-secondary)] truncate">{row.description}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'isSystem',
    header: 'Tipo',
    render: (row) => (
      <Badge variant={row.isSystem ? 'amber' : 'gray'}>
        {row.isSystem ? 'Sistema' : 'Personalizado'}
      </Badge>
    ),
  },
  {
    key: 'permissionCount',
    header: 'Permisos',
    sortable: true,
    render: (row) => (
      <span className="text-[12px] text-[var(--color-text-secondary)]">
        {row.permissionCount} permiso{row.permissionCount !== 1 ? 's' : ''}
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
          onClick={e => { e.stopPropagation(); onManagePermissions(row); }}
          className="p-1.5 rounded-[var(--border-radius-md)] text-gray-400 hover:text-r hover:bg-r3 transition-colors cursor-pointer"
          title="Gestionar permisos"
        >
          <IconKey size={14} />
        </button>
        {!row.isSystem && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(row); }}
            className="p-1.5 rounded-[var(--border-radius-md)] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Eliminar rol"
          >
            <IconTrash size={14} />
          </button>
        )}
      </div>
    ),
  },
];

export default function RolesTable({ roles, loading, onManagePermissions, onDelete }: Props) {
  return (
    <DataTable
      data={roles}
      columns={columns(onManagePermissions, onDelete)}
      loading={loading}
      keyExtractor={r => r.id}
      emptyMessage="No hay roles configurados."
      emptyIcon={<IconShield size={32} />}
    />
  );
}
