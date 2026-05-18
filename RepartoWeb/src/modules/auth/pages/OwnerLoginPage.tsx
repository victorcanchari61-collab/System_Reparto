import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBuildingStore, IconBuilding, IconShield, IconUsers, IconLock, IconEye, IconEyeOff, IconLogin, IconAlertCircle } from '@tabler/icons-react';
import { useAuthStore } from '../../../store/useAuthStore';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const OwnerLoginPage: React.FC = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const { login, isLoading, user }      = useAuthStore();
  const navigate                        = useNavigate();

  useEffect(() => {
    if (user) navigate(user.isOwner ? '/empresas' : '/panel', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError('Completa todos los campos.'); return; }
    try {
      const isOwner = await login(email, password);
      navigate(isOwner ? '/empresas' : '/panel', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[820px] flex flex-col md:flex-row bg-white shadow-lg border border-gray-200 overflow-hidden rounded-[var(--border-radius-lg)]">

        {/* Panel izquierdo */}
        <div className="w-full md:w-[42%] bg-[#1C1C1E] flex flex-col justify-between p-8 md:p-[30px] text-white">
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-r rounded-[9px] flex items-center justify-center">
                <IconBuildingStore size={17} className="text-white" />
              </div>
              <span className="text-[16px] font-medium">NexusAdmin</span>
            </div>
            <div>
              <div className="text-[22px] font-medium leading-[1.3]">Gestiona tu empresa y equipo</div>
              <div className="text-[13px] text-white/50 mt-2 leading-[1.6]">
                Plataforma multi-empresa con roles, usuarios y permisos personalizados.
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                [IconBuilding, 'Empresa aislada con sus propios datos'],
                [IconShield, 'Roles y permisos configurables'],
                [IconUsers, 'Administración centralizada de usuarios'],
                [IconLock, 'Acceso seguro con JWT + Refresh Token'],
              ].map(([Icon, text]: any) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-[22px] h-[22px] bg-r/25 rounded-[6px] flex items-center justify-center shrink-0">
                    <Icon size={12} className="text-r2" />
                  </div>
                  <span className="text-[12px] text-white/55">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-white/25 mt-8 md:mt-0">© 2025 NexusAdmin</div>
        </div>

        {/* Panel derecho */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-10">
          <form onSubmit={handleSubmit} className="w-full max-w-[320px] flex flex-col gap-5">
            <div>
              <div className="text-[20px] font-semibold text-gray-900">Iniciar sesión</div>
              <div className="text-[13px] text-gray-500 mt-1">Acceso exclusivo del administrador del sistema.</div>
            </div>

            <div className="flex flex-col gap-3">
              <Input label="Correo electrónico" type="email" placeholder="victor@nexusadmin.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" autoFocus />

              <Input
                label="Contraseña"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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
                <IconAlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={isLoading} icon={<IconLogin size={14} />}>
              Iniciar sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerLoginPage;
