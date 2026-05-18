import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useRoles } from '../_hooks/useRoles';
import { usePermissions } from '../_hooks/usePermissions';
import RolesTable from '../_components/tables/RolesTable';
import CreateRoleModal from '../_components/modals/CreateRoleModal';
import RolePermissionsModal from '../_components/modals/RolePermissionsModal';
import FilterBar from '../../../components/ui/FilterBar';
import Button from '../../../components/ui/Button';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useToast } from '../../../hooks/use-toast';
import { apiClient } from '../../../lib/api-client';
import type { Role } from '../../../types/models';

export default function RolesPage() {
  const { roles, loading, refetch } = useRoles();
  const { permissionGroups }        = usePermissions();
  const toast                       = useToast();

  const [search, setSearch]           = useState('');
  const [showCreate, setShowCreate]   = useState(false);
  const [permTarget, setPermTarget]   = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting]       = useState(false);

  const filtered = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.deleteRole(deleteTarget.id);
      toast.success(`Rol "${deleteTarget.name}" eliminado.`);
      setDeleteTarget(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar el rol.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">Roles</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
            Configura los roles y sus permisos
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <IconPlus size={15} />
          Nuevo rol
        </Button>
      </div>

      <FilterBar search={search} onSearch={setSearch} placeholder="Buscar rol…" />

      <RolesTable
        roles={filtered}
        loading={loading}
        onManagePermissions={setPermTarget}
        onDelete={setDeleteTarget}
      />

      <CreateRoleModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); refetch(); toast.success('Rol creado correctamente.'); }}
      />

      <RolePermissionsModal
        isOpen={permTarget !== null}
        onClose={() => setPermTarget(null)}
        role={permTarget}
        permissionGroups={permissionGroups}
        onSaved={() => { setPermTarget(null); refetch(); toast.success('Permisos guardados correctamente.'); }}
      />

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title={`¿Eliminar "${deleteTarget?.name}"?`}
        description="Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        variant="danger"
      />
    </div>
  );
}
