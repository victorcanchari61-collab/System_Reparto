import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconTruck, IconAlertCircle, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useAuthStore } from '../../../store/useAuthStore';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ClientLoginPage: React.FC = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const { login, isLoading }      = useAuthStore();
  const navigate                  = useNavigate();

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email.trim(), password);
      navigate('/panel');
    } catch {
      setError('Credenciales incorrectas o usuario inactivo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[820px] flex flex-col md:flex-row bg-white shadow-lg border border-gray-200 overflow-hidden rounded-[var(--border-radius-lg)]">

        {/* Panel izquierdo */}
        <div className="w-full md:w-[40%] bg-[#1C1C1E] flex flex-col justify-between p-8 md:p-[30px] text-white">
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-r rounded-[9px] flex items-center justify-center">
                <IconTruck size={17} className="text-white" />
              </div>
              <span className="text-[16px] font-medium">Sistema Reparto</span>
            </div>
            <div>
              <div className="text-[22px] font-medium leading-[1.3]">Accede a tu panel empresarial</div>
              <div className="text-[13px] text-white/50 mt-2 leading-[1.6]">
                Ingresa con las credenciales que te proporcionó el administrador.
              </div>
            </div>
          </div>
          <div className="text-[11px] text-white/25">© 2025 Nexus SaaS · Acceso para empresas cliente</div>
        </div>

        {/* Panel derecho */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-10">
          <form onSubmit={handleSubmit} className="w-full max-w-[300px] flex flex-col gap-5">
            <div>
              <div className="text-[20px] font-semibold text-gray-900">Iniciar sesión</div>
              <div className="text-[13px] text-gray-500 mt-1">Usa el correo y contraseña de tu cuenta.</div>
            </div>

            <div className="flex flex-col gap-3">
              <Input label="Correo electrónico" type="email" placeholder="tu@empresa.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" autoFocus required />

              <Input
                label="Contraseña"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                rightElement={
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                    {showPw ? <IconEyeOff size={13} /> : <IconEye size={13} />}
                  </button>
                }
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 bg-r3 border border-[#F1948A] rounded-[var(--border-radius-md)] px-3 py-2.5 text-[12px] text-r4">
                <IconAlertCircle size={14} className="shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={isLoading}>Ingresar</Button>

            <p className="text-[11px] text-gray-400 text-center">
              ¿Problemas? Contacta al administrador de tu empresa.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientLoginPage;
