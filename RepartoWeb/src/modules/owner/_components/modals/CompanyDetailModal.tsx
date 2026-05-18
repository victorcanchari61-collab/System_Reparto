import React, { useEffect, useState } from 'react';
import {
  IconBuilding, IconLoader2, IconMapPin, IconPhone,
  IconMail, IconReceipt, IconPhoto, IconCircleCheck,
  IconCircleX, IconCalendar, IconHash, IconPuzzle,
} from '@tabler/icons-react';
import { apiClient } from '../../../../lib/api-client';
import Modal from '../../../../components/ui/Modal';
import { formatDate } from '../../../../utils/formatters';

interface Props {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Detail {
  id: string; ruc: string; businessName: string; tradeName: string;
  address: string; phone: string; email: string; logo: string | null;
  sunatSolUser: string | null; isActive: boolean;
  createdAtUtc: string; activeModules: number;
}

const Row: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-[30px] h-[30px] bg-gray-100 rounded-[var(--border-radius-md)] flex items-center justify-center shrink-0 text-gray-400">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-[13px] text-gray-800 mt-0.5 break-words">{value}</div>
    </div>
  </div>
);

const CompanyDetailModal: React.FC<Props> = ({ companyId, isOpen, onClose }) => {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !companyId) return;
    setLoading(true);
    setError(null);
    apiClient.getCompany(companyId)
      .then(setDetail)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen, companyId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de empresa" size="md">
      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400 text-[12px]">
          <IconLoader2 size={16} className="animate-spin" /> Cargando...
        </div>
      )}

      {error && (
        <div className="bg-r3 border border-[#F1948A] rounded-[var(--border-radius-md)] px-3 py-2 text-[12px] text-r4">
          {error}
        </div>
      )}

      {detail && !loading && (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            {detail.logo
              ? <img src={detail.logo} alt="logo" className="w-12 h-12 rounded-[var(--border-radius-md)] object-contain border border-gray-100" />
              : (
                <div className="w-12 h-12 rounded-[var(--border-radius-md)] bg-r/10 flex items-center justify-center">
                  <IconBuilding size={22} className="text-r" />
                </div>
              )
            }
            <div>
              <div className="text-[15px] font-semibold text-gray-900">{detail.businessName}</div>
              {detail.tradeName !== detail.businessName && (
                <div className="text-[12px] text-gray-400">{detail.tradeName}</div>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                {detail.isActive
                  ? <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                      <IconCircleCheck size={10} /> Activa
                    </span>
                  : <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
                      <IconCircleX size={10} /> Inactiva
                    </span>
                }
                <span className="flex items-center gap-1 text-[10px] text-r bg-r3 border border-r/20 px-1.5 py-0.5 rounded-full">
                  <IconPuzzle size={10} /> {detail.activeModules} módulos activos
                </span>
              </div>
            </div>
          </div>

          {/* Campos */}
          <Row icon={<IconHash size={14} />}   label="RUC"              value={<span className="font-mono">{detail.ruc}</span>} />
          <Row icon={<IconMapPin size={14} />}  label="Dirección"        value={detail.address || '—'} />
          <Row icon={<IconPhone size={14} />}   label="Teléfono"         value={detail.phone || '—'} />
          <Row icon={<IconMail size={14} />}    label="Correo"           value={detail.email || '—'} />
          <Row icon={<IconReceipt size={14} />} label="Usuario SOL"      value={detail.sunatSolUser || <span className="text-gray-400 italic">No configurado</span>} />
          {detail.logo && (
            <Row icon={<IconPhoto size={14} />} label="Logo URL" value={
              <a href={detail.logo} target="_blank" rel="noreferrer" className="text-r hover:underline truncate block max-w-[260px]">
                {detail.logo}
              </a>
            } />
          )}
          <Row icon={<IconCalendar size={14} />} label="Registrada" value={formatDate(detail.createdAtUtc)} />
        </div>
      )}
    </Modal>
  );
};

export default CompanyDetailModal;
