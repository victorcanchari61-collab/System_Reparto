import { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import type { Role, RoleDetail, PermissionGroup } from '../../../../types/models';
import { IconCheck } from '@tabler/icons-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  permissionGroups: PermissionGroup[];
  onSaved: (roleId: string, permissions: string[]) => void;
}

export default function RolePermissionsModal({
  isOpen, onClose, role, permissionGroups, onSaved,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  /* Load current permissions when role changes */
  useEffect(() => {
    if (!role || !isOpen) return;
    setError('');
    setLoading(true);
    apiClient.getRoleById(role.id)
      .then((detail: RoleDetail) => setSelected(new Set(detail.permissions)))
      .catch(() => setError('No se pudieron cargar los permisos actuales.'))
      .finally(() => setLoading(false));
  }, [role, isOpen]);

  const toggle = (key: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleGroup = (group: PermissionGroup) => {
    const keys    = group.permissions.map(p => p.key);
    const allOn   = keys.every(k => selected.has(k));
    setSelected(prev => {
      const next = new Set(prev);
      if (allOn) keys.forEach(k => next.delete(k));
      else       keys.forEach(k => next.add(k));
      return next;
    });
  };

  const handleSave = async () => {
    if (!role) return;
    setLoading(true);
    setError('');
    try {
      await apiClient.setRolePermissions(role.id, Array.from(selected));
      onSaved(role.id, Array.from(selected));
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar los permisos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? `Permisos — ${role.name}` : 'Permisos'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading} disabled={role?.isSystem}>
            Guardar permisos
          </Button>
        </>
      }
    >
      {role?.isSystem && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-[var(--border-radius-md)] px-3 py-2 text-[12px] text-amber-700">
          Los roles del sistema tienen permisos fijos y no pueden modificarse.
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-[var(--border-radius-md)] px-3 py-2 text-[12px] text-red-600">
          {error}
        </div>
      )}

      {loading && !permissionGroups.length ? (
        <div className="py-8 text-center text-[13px] text-gray-400">Cargando permisos…</div>
      ) : (
        <div className="flex flex-col gap-4">
          {permissionGroups.map(group => {
            const keys  = group.permissions.map(p => p.key);
            const allOn = keys.every(k => selected.has(k));
            const anyOn = keys.some(k => selected.has(k));

            return (
              <div key={group.module} className="border border-[var(--color-border-secondary)] rounded-[var(--border-radius-lg)] overflow-hidden">
                {/* Group header */}
                <button
                  disabled={role?.isSystem}
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 disabled:cursor-default transition-colors cursor-pointer"
                >
                  <span className="text-[12px] font-semibold text-[var(--color-text-primary)] uppercase tracking-wide">
                    {group.label}
                  </span>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    allOn
                      ? 'border-r bg-r'
                      : anyOn
                        ? 'border-r bg-r/30'
                        : 'border-gray-300 bg-white'
                  }`}>
                    {(allOn || anyOn) && <IconCheck size={9} className="text-white" />}
                  </span>
                </button>

                {/* Permission items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0 px-4 py-3">
                  {group.permissions.map(perm => (
                    <label
                      key={perm.key}
                      className={`flex items-center gap-2.5 py-1.5 ${role?.isSystem ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span
                        onClick={() => !role?.isSystem && toggle(perm.key)}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          selected.has(perm.key)
                            ? 'border-r bg-r'
                            : 'border-gray-300 bg-white hover:border-r'
                        }`}
                      >
                        {selected.has(perm.key) && <IconCheck size={9} className="text-white" />}
                      </span>
                      <span className="text-[12px] text-[var(--color-text-primary)]">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
