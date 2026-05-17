import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import {
  IconBuildingStore,
  IconBuilding,
  IconShield,
  IconUsers,
  IconLock,
  IconArrowLeft,
  IconInfoCircle,
  IconCheck,
  IconLoader
} from '@tabler/icons-react';

export const CreateEnterprise: React.FC = () => {
  const [ruc, setRuc] = useState('');
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [address, setAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Generador de contraseñas dinámico y visualmente interactivo que cumple con las reglas del backend .NET Identity
  const generatePassword = (e: React.MouseEvent) => {
    e.preventDefault();
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const specials = '!@#$%&*';
    
    let result = '';
    result += upper.charAt(Math.floor(Math.random() * upper.length));
    result += lower.charAt(Math.floor(Math.random() * lower.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    result += specials.charAt(Math.floor(Math.random() * specials.length));
    
    const allChars = upper + lower + numbers + specials;
    for (let i = 0; i < 6; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    setTempPassword(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (ruc.length !== 11 || !/^\d+$/.test(ruc)) {
      setError('El RUC debe tener exactamente 11 dígitos numéricos.');
      return;
    }
    if (!name.trim()) {
      setError('La Razón Social es obligatoria.');
      return;
    }
    if (!address.trim()) {
      setError('La dirección de la empresa es obligatoria.');
      return;
    }
    if (!companyPhone.trim()) {
      setError('El teléfono de la empresa es obligatorio.');
      return;
    }
    if (!companyEmail.trim()) {
      setError('El correo corporativo de la empresa es obligatorio.');
      return;
    }
    if (!adminName.trim()) {
      setError('El nombre completo del administrador es obligatorio.');
      return;
    }
    if (!adminEmail.trim()) {
      setError('El correo del administrador es obligatorio.');
      return;
    }
    if (!tempPassword) {
      setError('Debes generar o escribir una contraseña para el administrador.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Registrar empresa y administrador en el backend real en .NET C#
      await apiClient.registerCompany({
        ruc,
        businessName: name,
        tradeName: tradeName || name,
        address,
        phone: companyPhone,
        companyEmail,
        adminFullName: adminName,
        adminEmail,
        adminPhone: adminPhone || companyPhone,
        adminPassword: tempPassword
      });

      setSuccessMsg('Empresa registrada correctamente.');
      setTimeout(() => navigate('/empresas'), 1500);
      
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al registrar la empresa en el backend.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="app w-full max-w-[1000px] min-h-[650px] flex flex-col md:flex-row bg-white shadow-lg overflow-hidden border border-gray-200">
        
        {/* Left Side: Dark Hero Panel */}
        <div className="w-full md:w-[35%] bg-[#1C1C1E] flex flex-col justify-between p-8 md:p-[30px] text-white">
          <div className="flex flex-col gap-7">
            
            <button
              onClick={() => navigate('/empresas')}
              className="flex items-center gap-1.5 cursor-pointer text-white/50 hover:text-white text-[12px] bg-transparent border-none p-0 transition-colors self-start"
            >
              <IconArrowLeft size={13} />
              <span>Volver a empresas</span>
            </button>

            <div className="flex items-center gap-[9px] mt-2">
              <div className="w-8 h-8 bg-r rounded-[9px] flex items-center justify-center">
                <IconBuildingStore size={17} className="text-white" />
              </div>
              <span className="text-[16px] font-medium tracking-tight text-white">Nexus SaaS</span>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <div className="text-[22px] font-medium leading-[1.3] text-white">
                Registra una empresa cliente
              </div>
              <div className="text-[13px] text-white/50 leading-[1.6]">
                Crea la empresa y su usuario administrador. Ellos gestionarán sus propios usuarios y roles.
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-[22px] h-[22px] bg-r/25 rounded-[6px] flex items-center justify-center shrink-0">
                  <IconBuilding size={12} className="text-r2" />
                </div>
                <span className="text-[12px] text-white/55">Base de datos aislada y privada</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-[22px] h-[22px] bg-r/25 rounded-[6px] flex items-center justify-center shrink-0">
                  <IconShield size={12} className="text-r2" />
                </div>
                <span className="text-[12px] text-white/55">Roles y permisos configurables</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-[22px] h-[22px] bg-r/25 rounded-[6px] flex items-center justify-center shrink-0">
                  <IconUsers size={12} className="text-r2" />
                </div>
                <span className="text-[12px] text-white/55">Agrega a tus propios empleados</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-[22px] h-[22px] bg-r/25 rounded-[6px] flex items-center justify-center shrink-0">
                  <IconLock size={12} className="text-r2" />
                </div>
                <span className="text-[12px] text-white/55">Cumplimiento y seguridad nivel Enterprise</span>
              </div>
            </div>
          </div>
          
          <div className="text-[11px] text-white/25 mt-8 md:mt-0">
            © 2025 Nexus SaaS · Todos los derechos reservados
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="flex-1 bg-white flex flex-col p-8 md:p-10 overflow-y-auto">
          <div className="mb-6">
            <div className="text-[18px] font-medium text-gray-900 leading-tight">
              Registrar nueva empresa cliente
            </div>
            <div className="text-[13px] text-gray-500 mt-1">
              Ingresa los datos fiscales de tu empresa y crea tu usuario administrador.
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 bg-r3 border border-[#F1948A] rounded-[var(--border-radius-md)] p-3 text-[12px] text-r4">
              <IconInfoCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-[var(--border-radius-md)] p-3 text-[12px] text-emerald-800">
              <IconCheck size={15} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Sección 1: Datos de la Empresa */}
            <div className="flex flex-col gap-3">
              <div className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider pb-1 border-b border-gray-100">
                1. Datos Fiscales de la Empresa
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500" htmlFor="company-ruc">RUC (11 dígitos) *</label>
                  <input
                    id="company-ruc"
                    type="text"
                    maxLength={11}
                    placeholder="Ej. 20748392019"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500" htmlFor="company-name">Razón Social *</label>
                  <input
                    id="company-name"
                    type="text"
                    placeholder="Ej. Mi Empresa S.A.C."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500" htmlFor="company-address">Dirección Fiscal *</label>
                  <input
                    id="company-address"
                    type="text"
                    placeholder="Av. Principal 123"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500" htmlFor="company-tradename">Nombre Comercial (Opcional)</label>
                  <input
                    id="company-tradename"
                    type="text"
                    placeholder="Mi Empresa"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500" htmlFor="company-phone">Teléfono de Contacto *</label>
                  <input
                    id="company-phone"
                    type="text"
                    placeholder="Ej. 013442111"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500" htmlFor="company-email">Correo Corporativo *</label>
                  <input
                    id="company-email"
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Administrador del Sistema */}
            <div className="flex flex-col gap-3">
              <div className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider pb-1 border-b border-gray-100 flex items-center gap-1.5">
                2. Administrador de la Empresa
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-500" htmlFor="admin-name">Nombre Completo del Administrador *</label>
                <input
                  id="admin-name"
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500" htmlFor="admin-email">Correo del Administrador (Login) *</label>
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="juan@empresa.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500" htmlFor="admin-phone">Teléfono del Administrador</label>
                  <input
                    id="admin-phone"
                    type="text"
                    placeholder="Ej. 994829310"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-500" htmlFor="admin-pw">Contraseña de Administrador *</label>
                <div className="flex gap-1.5">
                  <input
                    id="admin-pw"
                    type="text"
                    placeholder="Escribe o presiona generar"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[12px] bg-white text-gray-900 focus:outline-none focus:border-r font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="bg-[#f9f9f9] border border-gray-200 py-2 px-[15px] rounded-[var(--border-radius-md)] text-[11px] text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer font-medium whitespace-nowrap"
                  >
                    Generar Seguro
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5">Debe incluir minúsculas, mayúsculas, números y símbolos.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-r hover:bg-r4 text-white font-medium text-[13px] py-3 rounded-[var(--border-radius-md)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader size={14} className="animate-spin" />
                    <span>Procesando registro seguro…</span>
                  </>
                ) : (
                  <>
                    <IconCheck size={14} />
                    <span>Crear Cuenta Corporativa</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEnterprise;
