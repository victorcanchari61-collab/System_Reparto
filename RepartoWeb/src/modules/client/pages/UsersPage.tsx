import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useUsers } from '../_hooks/useUsers';
import { useRoles } from '../_hooks/useRoles';
import UsersTable from '../_components/tables/UsersTable';
import CreateUserModal from '../_components/modals/CreateUserModal';
import EditUserModal from '../_components/modals/EditUserModal';
import FilterBar from '../../../components/ui/FilterBar';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../hooks/use-toast';
import { apiClient } from '../../../lib/api-client';
import type { UserRecord } from '../../../types/models';

export default function UsersPage() {
  const { users, loading, refetch } = useUsers();
  const { roles }                   = useRoles();
  const toast                       = useToast();

  const [search, setSearch]         = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggle = async (user: UserRecord) => {
    try {
      await apiClient.toggleUserStatus(user.id);
      toast.success(`Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente.`);
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? 'Error al cambiar el estado del usuario.');
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">Usuarios</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
            Gestiona los usuarios de tu empresa
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <IconPlus size={15} />
          Nuevo usuario
        </Button>
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Buscar por nombre o correo…"
      />

      <UsersTable
        users={filtered}
        loading={loading}
        onEdit={setEditTarget}
        onToggle={handleToggle}
      />

      <CreateUserModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        roles={roles}
        onCreated={() => { setShowCreate(false); refetch(); toast.success('Usuario creado correctamente.'); }}
      />

      <EditUserModal
        isOpen={editTarget !== null}
        onClose={() => setEditTarget(null)}
        user={editTarget}
        roles={roles}
        onUpdated={() => { setEditTarget(null); refetch(); toast.success('Usuario actualizado correctamente.'); }}
      />
    </div>
  );
}
