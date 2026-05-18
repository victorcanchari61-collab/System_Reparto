import { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { apiClient } from '../../../../lib/api-client';
import type { Role } from '../../../../types/models';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  onCreated: () => void;
}

export default function CreateUserModal({ isOpen, onClose, roles, onCreated }: Props) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Nombre, correo y contraseña son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiClient.createClientUser({
        fullName: form.fullName.trim(),
        email:    form.email.trim(),
        phone:    form.phone.trim() || '000000000',
        password: form.password,
        roleId:   form.roleId || null,
      });
      onCreated();
      setForm({ fullName: '', email: '', phone: '', password: '', roleId: '' });
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Error al crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo usuario"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={loading}>Crear usuario</Button>
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
          placeholder="Ej. Juan Pérez"
          value={form.fullName}
          onChange={set('fullName')}
          required
        />
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="correo@empresa.com"
          value={form.email}
          onChange={set('email')}
          required
        />
        <Input
          label="Teléfono"
          placeholder="999 999 999"
          value={form.phone}
          onChange={set('phone')}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={set('password')}
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            Rol <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
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
