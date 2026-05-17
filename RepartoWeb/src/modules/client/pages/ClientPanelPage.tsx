import React from 'react';
import { IconTruck } from '@tabler/icons-react';
import { useAuthStore } from '../../../store/useAuthStore';
import Button from '../../../components/ui/Button';

const ClientPanelPage: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
      <div className="w-14 h-14 bg-r rounded-[14px] flex items-center justify-center">
        <IconTruck size={28} className="text-white" />
      </div>
      <div className="text-center">
        <div className="text-[20px] font-semibold text-gray-900">Bienvenido, {user?.fullName}</div>
        <div className="text-[13px] text-gray-400 mt-1">Tu panel empresarial está en construcción.</div>
      </div>
      <Button variant="ghost" onClick={logout} className="mt-2">Cerrar sesión</Button>
    </div>
  );
};

export default ClientPanelPage;
