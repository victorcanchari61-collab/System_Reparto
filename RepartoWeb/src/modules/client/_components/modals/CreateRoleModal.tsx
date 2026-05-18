import { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { apiClient } from '../../../../lib/api-client';
import type { Role } from '../../../../types/models';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (role: Role) => void;
}

export default function CreateRoleModal({ isOpen, onClose, onCreated }: Props) {
  const [form, setForm]       = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('El nombre del rol es obligatorio.'); return; }
    setLoading(true);
    setError('');
    try {
      const role = await apiClient.createRole({
        name:        form.name.trim(),
        description: form.description.trim(),
      });
      onCreated(role);
      setForm({ name: '', description: '' });
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Error al crear el rol.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo rol"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={loading}>Crear rol</Button>
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
          label="Nombre del rol"
          placeholder="Ej. Supervisor"
          value={form.name}
          onChange={set('name')}
          required
        />
        <Input
          label="Descripción"
          placeholder="Descripción breve del rol"
          value={form.description}
          onChange={set('description')}
        />
      </div>
    </Modal>
  );
}
