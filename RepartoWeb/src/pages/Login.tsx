import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  IconBuildingStore,
  IconBuilding,
  IconShield,
  IconUsers,
  IconLock,
  IconEye,
  IconEyeOff,
  IconLogin,
  IconAlertCircle
} from '@tabler/icons-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isLoading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="app w-full max-w-[820px] min-h-[500px] flex flex-col md:flex-row bg-white shadow-lg overflow-hidden border border-gray-200">
        
        {/* Left Side: Dark Hero Panel */}
        <div className="w-full md:w-[42%] bg-[#1C1C1E] flex flex-col justify-between p-8 md:p-[30px] text-white">
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-[9px]">
              <div className="w-8 h-8 bg-r rounded-[9px] flex items-center justify-center">
                <IconBuildingStore size={17} className="text-white" />
              </div>
              <span className="text-[16px] font-medium tracking-tight text-white">NexusAdmin</span>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <div className="text-[22px] font-medium leading-[1.3] text-white">
                Gestiona tu empresa y equipo de trabajo
              </div>
              <div className="text-[13px] text-white/50 leading-[1.6]">
                Plataforma multi-empresa con roles, usuarios y permisos personalizados para cada cliente.
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-[22px] h-[22px] bg-r/25 rounded-[6px] flex items-center justify-center shrink-0">
                  <IconBuilding size={12} className="text-r2" />
                </div>
                <span className="text-[12px] text-white/55">Empresa aislada con sus propios datos</span>
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
                <span className="text-[12px] text-white/55">Administración centralizada de usuarios</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-[22px] h-[22px] bg-r/25 rounded-[6px] flex items-center justify-center shrink-0">
                  <IconLock size={12} className="text-r2" />
                </div>
                <span className="text-[12px] text-white/55">Acceso seguro con JWT + Refresh Token</span>
              </div>
            </div>
          </div>
          
          <div className="text-[11px] text-white/25 mt-8 md:mt-0">
            © 2025 NexusAdmin · Todos los derechos reservados
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="flex-1 bg-white flex items-center justify-center p-8 md:p-10">
          <form onSubmit={handleLoginSubmit} className="w-full max-w-[320px] flex flex-col gap-5">
            <div>
              <div className="text-[20px] font-semibold text-gray-900 leading-tight">
                Iniciar sesión
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                Ingresa con las credenciales de tu empresa.
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] text-gray-500 font-medium" htmlFor="email-input">
                  Correo electrónico
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="victor@nexusadmin.com"
                  className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2.5 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-r transition-colors"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] text-gray-500 font-medium" htmlFor="pw-input">
                    Contraseña
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="pw-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2.5 pr-10 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-r transition-colors"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-none border-none p-0 cursor-pointer flex items-center justify-center"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message banner */}
            {error && (
              <div className="flex items-center gap-1.5 bg-r3 border border-[#F1948A] rounded-[var(--border-radius-md)] p-2.5 px-3 text-[12px] text-r4">
                <IconAlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              id="login-submit-btn"
              className="bg-r hover:bg-r4 text-white font-medium text-[13px] py-3 rounded-[var(--border-radius-md)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              <IconLogin size={14} />
              <span>{isLoading ? 'Verificando credenciales…' : 'Iniciar sesión'}</span>
            </button>

            <div className="text-[12px] text-gray-500 text-center">
              ¿Empresa nueva?{' '}
              <span
                onClick={() => navigate('/register')}
                className="text-r hover:text-r4 cursor-pointer font-semibold transition-colors"
              >
                Registra tu empresa aquí
              </span>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
