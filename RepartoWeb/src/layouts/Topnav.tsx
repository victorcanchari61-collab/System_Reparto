import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { IconBuildingStore, IconLogout } from '@tabler/icons-react';

export const Topnav: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="bg-white border-b border-gray-100 flex items-center justify-between px-5 h-[50px] shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-[26px] h-[26px] bg-r rounded-[7px] flex items-center justify-center shrink-0">
          <IconBuildingStore size={14} className="text-white" />
        </div>
        <span className="text-[14px] font-medium text-gray-900">NexusAdmin</span>
        <span className="bg-r3 text-r4 text-[10px] py-[2px] px-2 rounded-full font-medium">
          Admin
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="text-[12px] text-gray-500 hidden sm:inline">
          {user.email}
        </span>
        <div className="w-[28px] h-[28px] rounded-full bg-r flex items-center justify-center text-[11px] font-medium text-white shrink-0">
          {user.initials}
        </div>
        <button
          onClick={handleLogout}
          className="border border-gray-100 rounded-[var(--border-radius-md)] py-[5px] px-2.5 text-[12px] text-gray-500 hover:bg-gray-50 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <IconLogout size={13} />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
};

export default Topnav;
