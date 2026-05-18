import React, { useEffect, useState } from 'react';
import {
  IconPackage, IconTruck, IconUsers, IconReceipt,
  IconUserCog, IconShield, IconLoader2,
} from '@tabler/icons-react';
import { apiClient } from '../../../../lib/api-client';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useToast } from '../../../../hooks/use-toast';
import type { CompanyModule } from '../../../../types/models';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  orders:  <IconPackage  size={18} />,
  drivers: <IconTruck    size={18} />,
  hr:      <IconUsers    size={18} />,
  erp:     <IconReceipt  size={18} />,
  users:   <IconUserCog  size={18} />,
  roles:   <IconShield   size={18} />,
};

interface Props {
  companyId:   string;
  companyName: string;
  isOpen:      boolean;
  onClose:     () => void;
}

const Toggle: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={[
      'relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer shrink-0 focus:outline-none',
      enabled ? 'bg-[#C0392B]' : 'bg-gray-200',
    ].join(' ')}
  >
    <span className={[
      'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
      enabled ? 'left-5' : 'left-0.5',
    ].join(' ')} />
  </button>
);

const CompanyModulesModal: React.FC<Props> = ({ companyId, companyName, isOpen, onClose }) => {
  const [modules, setModules] = useState<CompanyModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [dirty, setDirty]     = useState(false);
  const toast                 = useToast();

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setDirty(false);
    apiClient.getCompanyModules(companyId)
      .then(setModules)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen, companyId]);

  const toggle = (key: string) => {
    setModules(prev => prev.map(m => m.key === key ? { ...m, isEnabled: !m.isEnabled } : m));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiClient.updateCompanyModules(
        companyId,
        modules.map(m => ({ key: m.key, isEnabled: m.isEnabled })),
      );
      const enabledCount = updated.filter(m => m.isEnabled).length;
      setDirty(false);
      toast.success(`${companyName}: ${enabledCount} módulo${enabledCount !== 1 ? 's' : ''} activo${enabledCount !== 1 ? 's' : ''}.`);
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? 'Error al guardar los módulos.');
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = modules.filter(m => m.isEnabled).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Módulos — ${companyName}`}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-gray-400">
            {enabledCount} de {modules.length} módulos activos
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" loading={saving} disabled={!dirty} onClick={handleSave}>
              Guardar cambios
            </Button>
          </div>
        </div>
      }
    >
      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400 text-[12px]">
          <IconLoader2 size={16} className="animate-spin" />
          Cargando módulos...
        </div>
      )}

      {error && (
        <div className="bg-r3 border border-[#F1948A] rounded-[var(--border-radius-md)] px-3 py-2 text-[12px] text-r4 mb-3">
          {error}
        </div>
      )}

      {!loading && modules.length > 0 && (
        <div className="flex flex-col gap-2">
          {modules.map(mod => (
            <div
              key={mod.key}
              className={[
                'flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] border transition-colors',
                mod.isEnabled ? 'border-r/30 bg-r3/60' : 'border-gray-100 bg-gray-50/50',
              ].join(' ')}
            >
              <div className={[
                'w-9 h-9 rounded-[var(--border-radius-md)] flex items-center justify-center shrink-0',
                mod.isEnabled ? 'bg-r/10 text-r' : 'bg-gray-100 text-gray-400',
              ].join(' ')}>
                {MODULE_ICONS[mod.key] ?? <IconPackage size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] font-medium ${mod.isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                  {mod.label}
                </div>
                <div className="text-[11px] text-gray-400 truncate">{mod.description}</div>
              </div>
              <Toggle enabled={mod.isEnabled} onChange={() => toggle(mod.key)} />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default CompanyModulesModal;
