import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconBuilding,
  IconSettings
} from '@tabler/icons-react';

export const Sidebar: React.FC = () => {
  return (
    <nav className="w-[190px] bg-sidebar p-[14px] px-2 flex flex-col gap-0.5 shrink-0 min-h-[calc(100vh-50px)]">
      <div className="text-[10px] font-medium text-white/30 tracking-wider uppercase p-[10px] pt-2 pb-1">
        General
      </div>
      <NavLink
        to="/empresas"
        className={({ isActive }) =>
          `flex items-center gap-2.5 py-1.5 px-2.5 rounded-[7px] text-[13px] text-white/55 hover:bg-white/7 hover:text-white/90 transition-all cursor-pointer ${
            isActive ? 'bg-r text-white font-medium' : ''
          }`
        }
      >
        <IconBuilding size={15} className="shrink-0" />
        <span>Empresas</span>
      </NavLink>

      <div className="text-[10px] font-medium text-white/30 tracking-wider uppercase p-[10px] pt-[14px] pb-1">
        Sistema
      </div>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center gap-2.5 py-1.5 px-2.5 rounded-[7px] text-[13px] text-white/55 hover:bg-white/7 hover:text-white/90 transition-all cursor-pointer ${
            isActive ? 'bg-r text-white font-medium' : ''
          }`
        }
      >
        <IconSettings size={15} className="shrink-0" />
        <span>Ajustes</span>
      </NavLink>
    </nav>
  );
};

export default Sidebar;
