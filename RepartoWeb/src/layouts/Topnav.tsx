import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { IconLogout, IconMenu2 } from '@tabler/icons-react';

interface Props {
  onMobileMenuClick?: () => void;
}

export const Topnav: React.FC<Props> = ({ onMobileMenuClick }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;

  return (
    <div className="bg-white border-b border-gray-100 flex items-center gap-2.5 px-5 h-[50px] shrink-0">
      {/* Hamburger — only on mobile */}
      <button
        onClick={onMobileMenuClick}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-[var(--border-radius-md)] text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
        aria-label="Abrir menú"
      >
        <IconMenu2 size={18} />
      </button>

      <div className="flex-1" />

      <span className="text-[12px] text-gray-500 hidden sm:inline">{user.email}</span>

      <div className="w-[28px] h-[28px] rounded-full bg-[#C0392B] flex items-center justify-center text-[11px] font-medium text-white shrink-0">
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
  );
};

export default Topnav;
