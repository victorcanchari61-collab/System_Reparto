import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconBuilding, IconSettings, IconBuildingStore,
  IconChevronLeft, IconChevronRight,
} from '@tabler/icons-react';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem { to: string; icon: React.ReactNode; label: string; }

const GENERAL: NavItem[] = [
  { to: '/empresas', icon: <IconBuilding size={16} />, label: 'Empresas' },
];
const SISTEMA: NavItem[] = [
  { to: '/settings', icon: <IconSettings size={16} />, label: 'Ajustes' },
];

const linkClass = (isActive: boolean) =>
  `flex items-center gap-2.5 py-1.5 px-2.5 rounded-[7px] text-[13px] transition-all cursor-pointer ${
    isActive
      ? 'bg-white/20 text-white font-semibold'
      : 'text-white/70 hover:bg-white/10 hover:text-white'
  }`;

export const Sidebar: React.FC<SidebarProps> = ({
  open, onToggle, mobileOpen = false, onMobileClose,
}) => {
  /* Text/label visibility:
     - Desktop collapsed: hidden on md+, visible inside mobile overlay
     - Desktop expanded / mobile overlay: always visible             */
  const textCls = open ? 'block' : 'block md:hidden';

  const handleToggleBtn = () => mobileOpen ? onMobileClose?.() : onToggle();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <nav
        className={[
          'bg-[#C0392B] flex flex-col overflow-hidden',
          /* Mobile: fixed overlay, slides in/out with transform */
          'fixed inset-y-0 left-0 z-50 w-[240px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-200 ease-in-out',
          /* Desktop (md+): static in flow, width animates */
          'md:static md:translate-x-0 md:z-auto md:shrink-0',
          'md:transition-[width] md:duration-200',
          open ? 'md:w-[190px]' : 'md:w-[52px]',
        ].join(' ')}
      >
        {/* ── Brand + toggle ── */}
        <div className="flex items-center gap-2 px-3 h-[50px] border-b border-white/10 shrink-0">
          <div className="w-[28px] h-[28px] bg-white/20 rounded-[7px] flex items-center justify-center shrink-0">
            <IconBuildingStore size={14} className="text-white" />
          </div>

          <span className={`text-[14px] font-semibold text-white flex-1 truncate ${textCls}`}>
            NexusAdmin
          </span>

          <button
            onClick={handleToggleBtn}
            title={open ? 'Contraer' : 'Expandir'}
            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-[5px] transition-colors cursor-pointer shrink-0"
          >
            {(mobileOpen || open) ? <IconChevronLeft size={14} /> : <IconChevronRight size={14} />}
          </button>
        </div>

        {/* ── Nav ── */}
        <div className="flex flex-col flex-1 py-3 px-2 gap-0.5">

          <p className={`text-[10px] font-medium text-white/40 tracking-wider uppercase px-[10px] pb-1 ${textCls}`}>
            General
          </p>

          {GENERAL.map(item => (
            <NavLink key={item.to} to={item.to} title={!open ? item.label : undefined}
              onClick={onMobileClose}
              className={({ isActive }) => linkClass(isActive)}>
              <span className="shrink-0">{item.icon}</span>
              <span className={`truncate ${textCls}`}>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-3">
            <p className={`text-[10px] font-medium text-white/40 tracking-wider uppercase px-[10px] pb-1 ${textCls}`}>
              Sistema
            </p>

            {SISTEMA.map(item => (
              <NavLink key={item.to} to={item.to} title={!open ? item.label : undefined}
                onClick={onMobileClose}
                className={({ isActive }) => linkClass(isActive)}>
                <span className="shrink-0">{item.icon}</span>
                <span className={`truncate ${textCls}`}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
