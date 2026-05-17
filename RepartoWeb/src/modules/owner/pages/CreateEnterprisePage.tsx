import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconBuildingStore, IconBuilding, IconShield, IconUsers,
  IconLock, IconArrowLeft, IconCheck, IconReceipt, IconPhoto
} from '@tabler/icons-react';
import { apiClient } from '../../../lib/api-client';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import FormSection from '../../../components/form/FormSection';
import FormGrid from '../../../components/form/FormGrid';
import CredentialsModal from '../_components/modals/CredentialsModal';

interface CreatedInfo { businessName: string; adminEmail: string; adminPassword: string; }

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

const CreateEnterprisePage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ruc: '', businessName: '', tradeName: '', address: '',
    companyPhone: '', companyEmail: '', logo: '',
    sunatSolUser: '', sunatSolPassword: '',
    adminName: '', adminEmail: '', adminPhone: '', adminPassword: '',
  });
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [created, setCreated]     = useState<CreatedInfo | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleGenerate = () => setForm(f => ({ ...f, adminPassword: generatePassword() }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(null);

    if (form.ruc.length !== 11 || !/^\d+$/.test(form.ruc)) { setError('El RUC debe tener 11 dígitos.'); return; }
    if (!form.adminPassword) { setError('Genera o escribe una contraseña.'); return; }

    try {
      setLoading(true);
      await apiClient.registerCompany({
        ruc: form.ruc,
        businessName: form.businessName,
        tradeName: form.tradeName || form.businessName,
        address: form.address,
        phone: form.companyPhone,
        companyEmail: form.companyEmail,
        logo: form.logo || undefined,
        sunatSolUser: form.sunatSolUser || undefined,
        sunatSolPassword: form.sunatSolPassword || undefined,
        adminFullName: form.adminName,
        adminEmail: form.adminEmail,
        adminPhone: form.adminPhone || form.companyPhone,
        adminPassword: form.adminPassword,
      });
      setCreated({ businessName: form.businessName, adminEmail: form.adminEmail, adminPassword: form.adminPassword });
    } catch (err: any) {
      setError(err.message || 'Error al registrar la empresa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {created && (
        <CredentialsModal
          businessName={created.businessName}
          adminEmail={created.adminEmail}
          adminPassword={created.adminPassword}
          onClose={() => navigate('/empresas')}
        />
      )}

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[1050px] flex flex-col md:flex-row bg-white shadow-lg border border-gray-200 rounded-[var(--border-radius-lg)] overflow-hidden">

          {/* Panel izquierdo */}
          <div className="w-full md:w-[30%] bg-[#1C1C1E] flex flex-col justify-between p-7 text-white shrink-0">
            <div className="flex flex-col gap-6">
              <button onClick={() => navigate('/empresas')}
                className="flex items-center gap-1.5 text-white/50 hover:text-white text-[12px] bg-transparent border-none p-0 cursor-pointer self-start">
                <IconArrowLeft size={13} /> Volver
              </button>

              <div className="flex items-center gap-2.5 mt-1">
                <div className="w-8 h-8 bg-r rounded-[9px] flex items-center justify-center">
                  <IconBuildingStore size={16} className="text-white" />
                </div>
                <span className="text-[15px] font-medium">Nexus SaaS</span>
              </div>

              <div>
                <div className="text-[20px] font-medium leading-[1.3]">Registra una empresa cliente</div>
                <div className="text-[12px] text-white/50 mt-2 leading-[1.6]">
                  Crea la empresa y su admin. Ellos gestionarán su propio equipo.
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  [IconBuilding, 'Base de datos aislada'],
                  [IconShield, 'Rol Admin creado automáticamente'],
                  [IconUsers, 'El cliente gestiona su equipo'],
                  [IconLock, 'Seguridad Enterprise'],
                ].map(([Icon, text]: any) => (
                  <div key={text} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-r/25 rounded-[5px] flex items-center justify-center shrink-0">
                      <Icon size={11} className="text-r2" />
                    </div>
                    <span className="text-[11px] text-white/55">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-white/25 mt-6">© 2025 Nexus SaaS</div>
          </div>

          {/* Panel derecho */}
          <div className="flex-1 p-7 md:p-9 overflow-y-auto">
            <div className="mb-5">
              <div className="text-[17px] font-semibold text-gray-900">Registrar empresa cliente</div>
              <div className="text-[12px] text-gray-400 mt-0.5">Datos fiscales, facturación y administrador.</div>
            </div>

            {error && (
              <div className="mb-5 bg-r3 border border-[#F1948A] rounded-[var(--border-radius-md)] px-3 py-2.5 text-[12px] text-r4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Datos fiscales */}
              <section className="flex flex-col gap-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                  1. Datos Fiscales
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="RUC (11 dígitos) *" placeholder="20748392019" value={form.ruc} maxLength={11}
                    onChange={e => setForm(f => ({ ...f, ruc: e.target.value.replace(/\D/g, '') }))} required />
                  <Input label="Razón Social *" placeholder="Mi Empresa S.A.C." value={form.businessName}
                    onChange={set('businessName')} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Nombre Comercial" placeholder="Mi Empresa" value={form.tradeName}
                    onChange={set('tradeName')} />
                  <Input label="Dirección Fiscal *" placeholder="Av. Principal 123" value={form.address}
                    onChange={set('address')} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Teléfono *" placeholder="013442111" value={form.companyPhone}
                    onChange={set('companyPhone')} required />
                  <Input label="Correo Corporativo *" type="email" placeholder="contacto@empresa.com"
                    value={form.companyEmail} onChange={set('companyEmail')} required />
                </div>
                <Input label={`Logo (URL)`} type="url" placeholder="https://empresa.com/logo.png"
                  value={form.logo} onChange={set('logo')}
                  rightElement={<IconPhoto size={13} className="text-gray-400" />} />
              </section>

              {/* SUNAT */}
              <section className="flex flex-col gap-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-1.5">
                  <IconReceipt size={12} /> 2. Facturación SUNAT (opcional)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Usuario SOL" placeholder="MODDATOS" value={form.sunatSolUser}
                    onChange={set('sunatSolUser')} />
                  <Input label="Clave SOL" type="password" placeholder="••••••••"
                    value={form.sunatSolPassword} onChange={set('sunatSolPassword')} />
                </div>
                <p className="text-[10px] text-gray-400">Puedes completar esto después desde la configuración de la empresa.</p>
              </section>

              {/* Administrador */}
              <section className="flex flex-col gap-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                  3. Administrador de la Empresa
                </div>
                <Input label="Nombre Completo *" placeholder="Juan Pérez" value={form.adminName}
                  onChange={set('adminName')} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Correo (Login) *" type="email" placeholder="juan@empresa.com"
                    value={form.adminEmail} onChange={set('adminEmail')} required />
                  <Input label="Teléfono" placeholder="994829310" value={form.adminPhone}
                    onChange={set('adminPhone')} />
                </div>
                <Input label="Contraseña temporal *" placeholder="Escribe o genera"
                  value={form.adminPassword} onChange={set('adminPassword')} required
                  hint="Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos."
                  rightElement={
                    <button type="button" onClick={handleGenerate}
                      className="text-[10px] font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded cursor-pointer transition-colors whitespace-nowrap">
                      Generar
                    </button>
                  }
                />
              </section>

              <div className="pt-2 border-t border-gray-100">
                <Button type="submit" fullWidth loading={loading} icon={<IconCheck size={14} />}>
                  Registrar Empresa
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateEnterprisePage;
