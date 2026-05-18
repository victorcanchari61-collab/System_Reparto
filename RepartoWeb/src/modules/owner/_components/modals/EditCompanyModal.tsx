import React, { useEffect, useState } from 'react';
import { IconCheck, IconLoader2, IconAlertCircle, IconPhoto } from '@tabler/icons-react';
import { apiClient } from '../../../../lib/api-client';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import type { Company } from '../../../../types/models';

interface Props {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY = {
  businessName: '', tradeName: '', address: '',
  phone: '', companyEmail: '', logo: '',
  sunatSolUser: '', sunatSolPassword: '',
};

const EditCompanyModal: React.FC<Props> = ({ company, isOpen, onClose, onSuccess }) => {
  const [form, setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Cargar datos reales al abrir */
  useEffect(() => {
    if (!isOpen || !company) return;
    setError(null);
    setLoading(true);
    apiClient.getCompany(company.id)
      .then((d: any) => setForm({
        businessName:    d.businessName    ?? '',
        tradeName:       d.tradeName       ?? '',
        address:         d.address         ?? '',
        phone:           d.phone           ?? '',
        companyEmail:    d.email           ?? '',
        logo:            d.logo            ?? '',
        sunatSolUser:    d.sunatSolUser    ?? '',
        sunatSolPassword: '',
      }))
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen, company]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.updateCompany(company.id, {
        businessName:    form.businessName,
        tradeName:       form.tradeName || undefined,
        address:         form.address,
        phone:           form.phone,
        companyEmail:    form.companyEmail,
        logo:            form.logo        || undefined,
        sunatSolUser:    form.sunatSolUser || undefined,
        sunatSolPassword: form.sunatSolPassword || undefined,
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar — ${company?.businessName ?? ''}`}
      size="md"
      persistent
      footer={
        <div className="flex items-center justify-between w-full">
          {error
            ? <div className="flex items-center gap-1.5 text-[11px] text-r4 flex-1 mr-3">
                <IconAlertCircle size={13} className="shrink-0" /> {error}
              </div>
            : <span />
          }
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" form="edit-company-form" size="sm"
              loading={saving} icon={<IconCheck size={13} />}>
              Guardar
            </Button>
          </div>
        </div>
      }
    >
      {loading
        ? (
          <div className="flex items-center justify-center py-10 gap-2 text-gray-400 text-[12px]">
            <IconLoader2 size={16} className="animate-spin" /> Cargando datos...
          </div>
        )
        : (
          <form id="edit-company-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Razón Social" value={form.businessName}
                onChange={set('businessName')} required />
              <Input label="Nombre Comercial" value={form.tradeName}
                onChange={set('tradeName')} />
            </div>
            <Input label="Dirección Fiscal" value={form.address}
              onChange={set('address')} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Teléfono" value={form.phone}
                onChange={set('phone')} required />
              <Input label="Correo Corporativo" type="email" value={form.companyEmail}
                onChange={set('companyEmail')} required />
            </div>
            <Input label="Logo (URL)" type="url" value={form.logo}
              onChange={set('logo')}
              rightElement={<IconPhoto size={13} className="text-gray-400" />} />

            <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SUNAT (opcional)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Usuario SOL" value={form.sunatSolUser}
                  onChange={set('sunatSolUser')} />
                <Input label="Nueva Clave SOL" type="password"
                  placeholder="Dejar vacío para no cambiar"
                  value={form.sunatSolPassword} onChange={set('sunatSolPassword')} />
              </div>
            </div>
          </form>
        )
      }
    </Modal>
  );
};

export default EditCompanyModal;
