import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconBuilding, IconSettings } from '@tabler/icons-react';

export const Sidebar: React.FC = () => (
  <nav className="w-[190px] h-full bg-[#1C1C1E] flex flex-col gap-0.5 p-[14px] px-2 shrink-0 overflow-y-auto">

    <div className="text-[10px] font-medium text-white/30 tracking-wider uppercase px-[10px] pt-2 pb-1">
      General
    </div>

    <NavLink
      to="/empresas"
      className={({ isActive }) =>
        `flex items-center gap-2.5 py-1.5 px-2.5 rounded-[7px] text-[13px] transition-all cursor-pointer ${
          isActive
            ? 'bg-[#C0392B] text-white font-medium'
            : 'text-white/55 hover:bg-white/[0.07] hover:text-white/90'
        }`
      }
    >
      <IconBuilding size={15} className="shrink-0" />
      <span>Empresas</span>
    </NavLink>

    <div className="text-[10px] font-medium text-white/30 tracking-wider uppercase px-[10px] pt-[14px] pb-1">
      Sistema
    </div>

    <NavLink
      to="/settings"
      className={({ isActive }) =>
        `flex items-center gap-2.5 py-1.5 px-2.5 rounded-[7px] text-[13px] transition-all cursor-pointer ${
          isActive
            ? 'bg-[#C0392B] text-white font-medium'
            : 'text-white/55 hover:bg-white/[0.07] hover:text-white/90'
        }`
      }
    >
      <IconSettings size={15} className="shrink-0" />
      <span>Ajustes</span>
    </NavLink>

  </nav>
);

export default Sidebar;
