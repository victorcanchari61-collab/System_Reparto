import { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { apiClient } from '../../../../lib/api-client';
import type { UserRecord, Role } from '../../../../types/models';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
  roles: Role[];
  onUpdated: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, roles, onUpdated }: Props) {
  const [form, setForm]     = useState({ fullName: '', phone: '', roleId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        phone:    user.phone,
        roleId:   user.roleId ?? '',
      });
      setError('');
    }
  }, [user]);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.fullName.trim()) { setError('El nombre es obligatorio.'); return; }
    setLoading(true);
    setError('');
    try {
      await apiClient.updateUser(user.id, {
        fullName: form.fullName.trim(),
        phone:    form.phone.trim(),
      });

      /* Change role only if different */
      if (form.roleId && form.roleId !== user.roleId) {
        await apiClient.assignUserRole(user.id, form.roleId);
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Error al actualizar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar usuario"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={loading}>Guardar cambios</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[var(--border-radius-md)] px-3 py-2 text-[12px] text-red-600">
            {error}
          </div>
        )}

        <Input
          label="Nombre completo"
          value={form.fullName}
          onChange={set('fullName')}
          required
        />
        <Input
          label="Teléfono"
          value={form.phone}
          onChange={set('phone')}
        />

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">Rol</label>
          <select
            value={form.roleId}
            onChange={set('roleId')}
            className="w-full border border-[var(--color-border-secondary)] rounded-[var(--border-radius-md)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-r/30 focus:border-r"
          >
            <option value="">Sin rol</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
