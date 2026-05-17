import React, { useState } from 'react';
import { IconCheck, IconCopy, IconBuilding, IconExternalLink } from '@tabler/icons-react';
import Button from '../../../../components/ui/Button';

interface Props {
  businessName: string;
  adminEmail: string;
  adminPassword: string;
  onClose: () => void;
}

const CredentialsModal: React.FC<Props> = ({ businessName, adminEmail, adminPassword, onClose }) => {
  const [copied, setCopied] = useState(false);
  const clientLoginUrl = `${window.location.origin}/acceso`;

  const handleCopy = () => {
    const text = `Empresa: ${businessName}\nURL de acceso: ${clientLoginUrl}\nEmail: ${adminEmail}\nContraseña: ${adminPassword}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-[var(--border-radius-lg)] shadow-xl w-full max-w-md p-7 flex flex-col gap-5">

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center">
            <IconCheck size={22} className="text-emerald-500" />
          </div>
          <div className="text-[15px] font-semibold text-gray-900">Empresa registrada</div>
          <div className="text-[12px] text-gray-400">
            Comparte estos accesos con el administrador de{' '}
            <span className="font-medium text-gray-700">{businessName}</span>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-[var(--border-radius-md)] divide-y divide-gray-200 text-[12px]">
          {[
            { label: 'URL de acceso', value: clientLoginUrl, isLink: true },
            { label: 'Email', value: adminEmail, mono: true },
            { label: 'Contraseña', value: adminPassword, mono: true },
          ].map(({ label, value, isLink, mono }) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5 gap-4">
              <span className="text-gray-400 shrink-0">{label}</span>
              {isLink ? (
                <a href={value} target="_blank" rel="noreferrer"
                  className="text-r flex items-center gap-1 hover:underline truncate">
                  {value} <IconExternalLink size={11} className="shrink-0" />
                </a>
              ) : (
                <span className={`font-medium text-gray-900 ${mono ? 'font-mono' : ''} truncate`}>{value}</span>
              )}
            </div>
          ))}
        </div>

        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-[var(--border-radius-md)] px-3 py-2">
          ⚠ Guarda esta contraseña ahora. No se mostrará de nuevo.
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" fullWidth icon={<IconCopy size={13} />} onClick={handleCopy}>
            {copied ? 'Copiado' : 'Copiar datos'}
          </Button>
          <Button variant="primary" fullWidth icon={<IconBuilding size={13} />} onClick={onClose}>
            Ir a empresas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsModal;
