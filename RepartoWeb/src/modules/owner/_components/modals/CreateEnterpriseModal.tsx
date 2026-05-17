import React, { useState } from 'react';
import {
  IconBuilding, IconReceipt, IconUserCheck,
  IconPhoto, IconAlertCircle, IconCheck, IconChevronRight, IconChevronLeft,
  IconShieldCheck, IconUpload, IconX,
} from '@tabler/icons-react';
import { apiClient } from '../../../../lib/api-client';
import Modal from '../../../../components/ui/Modal';
import Tabs, { type TabItem } from '../../../../components/ui/Tabs';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import CredentialsModal from './CredentialsModal';

/* ── Types ──────────────────────────────────────────────── */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreatedInfo { businessName: string; adminEmail: string; adminPassword: string; }

const TABS: TabItem[] = [
  { key: 'fiscal', label: 'Datos Fiscales', icon: <IconBuilding  size={13} /> },
  { key: 'sunat',  label: 'SUNAT',          icon: <IconReceipt   size={13} /> },
  { key: 'admin',  label: 'Administrador',  icon: <IconUserCheck size={13} /> },
];
const TAB_KEYS = TABS.map(t => t.key);

/* ── Password generator ──────────────────────────────── */

const generatePassword = (): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const nums  = '23456789';
  const syms  = '!@#$%&*';
  const all   = upper + lower + nums + syms;
  let pw = upper[Math.floor(Math.random() * upper.length)]
         + lower[Math.floor(Math.random() * lower.length)]
         + nums[Math.floor(Math.random() * nums.length)]
         + syms[Math.floor(Math.random() * syms.length)];
  for (let i = 0; i < 6; i++) pw += all[Math.floor(Math.random() * all.length)];
  return pw;
};

/* ── Form state ─────────────────────────────────────── */

const EMPTY_FORM = {
  ruc: '', businessName: '', tradeName: '', address: '',
  companyPhone: '', companyEmail: '', logo: '',
  sunatSolUser: '', sunatSolPassword: '',
  certPassword: '',
  adminName: '', adminEmail: '', adminPhone: '', adminPassword: '',
};

/* ── Componente ──────────────────────────────────────── */

const CreateEnterpriseModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('fiscal');
  const [form, setForm]           = useState(EMPTY_FORM);
  const [certFile, setCertFile]   = useState<File | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [created, setCreated]     = useState<CreatedInfo | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const currentIdx = TAB_KEYS.indexOf(activeTab);
  const isFirst    = currentIdx === 0;
  const isLast     = currentIdx === TAB_KEYS.length - 1;

  const goNext = () => !isLast  && setActiveTab(TAB_KEYS[currentIdx + 1]);
  const goPrev = () => !isFirst && setActiveTab(TAB_KEYS[currentIdx - 1]);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setCertFile(null);
    setError(null);
    setActiveTab('fiscal');
    onClose();
  };

  /* Convierte el archivo .pem/.pfx a base64 para enviarlo al API */
  const handleCertFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCertFile(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(null);

    if (form.ruc.length !== 11 || !/^\d+$/.test(form.ruc)) {
      setActiveTab('fiscal');
      setError('El RUC debe tener 11 dígitos numéricos.');
      return;
    }
    if (!form.adminPassword) {
      setActiveTab('admin');
      setError('Genera o escribe una contraseña para el administrador.');
      return;
    }

    try {
      setLoading(true);

      /* Convertir certificado a base64 si fue cargado */
      let certBase64: string | undefined;
      if (certFile) {
        certBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(certFile);
        });
      }

      await apiClient.registerCompany({
        ruc:             form.ruc,
        businessName:    form.businessName,
        tradeName:       form.tradeName || form.businessName,
        address:         form.address,
        phone:           form.companyPhone,
        companyEmail:    form.companyEmail,
        logo:            form.logo             || undefined,
        sunatSolUser:    form.sunatSolUser      || undefined,
        sunatSolPassword:form.sunatSolPassword  || undefined,
        certBase64,
        certPassword:    form.certPassword      || undefined,
        adminFullName:   form.adminName,
        adminEmail:      form.adminEmail,
        adminPhone:      form.adminPhone        || form.companyPhone,
        adminPassword:   form.adminPassword,
      });

      setCreated({
        businessName:  form.businessName,
        adminEmail:    form.adminEmail,
        adminPassword: form.adminPassword,
      });
    } catch (err: any) {
      setError(err.message || 'Error al registrar la empresa.');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsDone = () => {
    setCreated(null);
    handleClose();
    onSuccess();
  };

  return (
    <>
      {created && (
        <CredentialsModal
          businessName={created.businessName}
          adminEmail={created.adminEmail}
          adminPassword={created.adminPassword}
          onClose={handleCredentialsDone}
        />
      )}

      <Modal
        isOpen={isOpen && !created}
        onClose={handleClose}
        title="Registrar empresa cliente"
        size="lg"
        persistent
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<IconChevronLeft size={13} />}
              onClick={goPrev}
              disabled={isFirst}
            >
              Anterior
            </Button>

            {error && (
              <div className="flex items-center gap-1.5 text-[11px] text-r4 bg-r3 border border-[#F1948A] rounded-[var(--border-radius-md)] px-2.5 py-1.5 flex-1 mx-3">
                <IconAlertCircle size={13} className="shrink-0" />
                {error}
              </div>
            )}

            {!isLast ? (
              <Button
                type="button"
                size="sm"
                icon={<IconChevronRight size={13} />}
                onClick={goNext}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                form="enterprise-form"
                size="sm"
                loading={loading}
                icon={<IconCheck size={13} />}
              >
                Registrar Empresa
              </Button>
            )}
          </div>
        }
      >
        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={tab => { setError(null); setActiveTab(tab); }}
          className="-mx-5 px-5 mb-4"
        />

        <form id="enterprise-form" onSubmit={handleSubmit}>
          <div key={activeTab} className="animate-tab-content flex flex-col gap-3">

            {/* ── Tab 1: Datos Fiscales ──────────────────── */}
            {activeTab === 'fiscal' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="RUC" placeholder="20748392019" value={form.ruc} maxLength={11}
                    onChange={e => setForm(f => ({ ...f, ruc: e.target.value.replace(/\D/g, '') }))}
                    required />
                  <Input label="Razón Social" placeholder="Mi Empresa S.A.C."
                    value={form.businessName} onChange={set('businessName')} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Nombre Comercial" placeholder="Mi Empresa"
                    value={form.tradeName} onChange={set('tradeName')} />
                  <Input label="Dirección Fiscal" placeholder="Av. Principal 123"
                    value={form.address} onChange={set('address')} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Teléfono" placeholder="013442111"
                    value={form.companyPhone} onChange={set('companyPhone')} required />
                  <Input label="Correo Corporativo" type="email" placeholder="contacto@empresa.com"
                    value={form.companyEmail} onChange={set('companyEmail')} required />
                </div>
                <Input label="Logo (URL)" type="url" placeholder="https://empresa.com/logo.png"
                  value={form.logo} onChange={set('logo')}
                  rightElement={<IconPhoto size={13} className="text-gray-400" />} />
              </>
            )}

            {/* ── Tab 2: SUNAT ──────────────────────────── */}
            {activeTab === 'sunat' && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-[var(--border-radius-md)] px-3 py-2.5 text-[11px] text-blue-600">
                  Todos los campos de este tab son opcionales. Puedes completarlos después desde la configuración de la empresa.
                </div>

                {/* Credenciales SOL */}
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <IconReceipt size={11} /> Credenciales SOL
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="Usuario SOL" placeholder="MODDATOS"
                      value={form.sunatSolUser} onChange={set('sunatSolUser')} />
                    <Input label="Clave SOL" type="password" placeholder="••••••••"
                      value={form.sunatSolPassword} onChange={set('sunatSolPassword')} />
                  </div>
                </div>

                {/* Firma electrónica */}
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <IconShieldCheck size={11} /> Firma Electrónica (Certificado Digital)
                  </div>

                  {/* Drop zone para el certificado */}
                  <div className="relative">
                    <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-[var(--border-radius-md)] px-4 py-3 hover:border-r/40 hover:bg-gray-50/50 transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept=".pem,.pfx,.p12,.crt,.cer"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={handleCertFile}
                      />
                      <div className="w-8 h-8 rounded-[var(--border-radius-md)] bg-gray-100 group-hover:bg-r/10 flex items-center justify-center shrink-0 transition-colors">
                        {certFile
                          ? <IconCheck size={15} className="text-green-600" />
                          : <IconUpload size={15} className="text-gray-400 group-hover:text-r" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-gray-700 truncate">
                          {certFile ? certFile.name : 'Subir certificado digital'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {certFile
                            ? `${(certFile.size / 1024).toFixed(1)} KB`
                            : '.pem · .pfx · .p12 · .crt · .cer'
                          }
                        </div>
                      </div>
                      {certFile && (
                        <button
                          type="button"
                          onClick={e => { e.preventDefault(); setCertFile(null); }}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 z-10"
                        >
                          <IconX size={14} />
                        </button>
                      )}
                    </label>
                  </div>

                  <Input
                    label="Contraseña del certificado"
                    type="password"
                    placeholder="••••••••"
                    value={form.certPassword}
                    onChange={set('certPassword')}
                    hint="Requerida si el certificado (.pfx / .p12) tiene contraseña."
                  />
                </div>
              </>
            )}

            {/* ── Tab 3: Administrador ──────────────────── */}
            {activeTab === 'admin' && (
              <>
                <Input label="Nombre Completo" placeholder="Juan Pérez"
                  value={form.adminName} onChange={set('adminName')} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Correo (Login)" type="email" placeholder="juan@empresa.com"
                    value={form.adminEmail} onChange={set('adminEmail')} required />
                  <Input label="Teléfono" placeholder="994829310"
                    value={form.adminPhone} onChange={set('adminPhone')} />
                </div>
                <Input
                  label="Contraseña temporal"
                  placeholder="Escribe o genera"
                  value={form.adminPassword}
                  onChange={set('adminPassword')}
                  required
                  hint="Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos."
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, adminPassword: generatePassword() }))}
                      className="text-[10px] font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded cursor-pointer transition-colors whitespace-nowrap"
                    >
                      Generar
                    </button>
                  }
                />
              </>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CreateEnterpriseModal;
