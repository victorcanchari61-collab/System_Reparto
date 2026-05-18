import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  IconLayoutDashboard, IconUsers, IconShield,
  IconChevronLeft, IconChevronRight, IconMenu2,
  IconBuildingStore, IconLogout, IconChevronDown, IconLock,
} from '@tabler/icons-react';
import { useAuthStore } from '../store/useAuthStore';
import ToastContainer from '../components/ui/ToastContainer';

interface NavItem { to: string; icon: React.ReactNode; label: string; permission: string; }

const ACCESS_ITEMS: NavItem[] = [
  { to: '/panel/usuarios', icon: <IconUsers  size={16} />, label: 'Usuarios', permission: 'users.view' },
  { to: '/panel/roles',    icon: <IconShield size={16} />, label: 'Roles',    permission: 'roles.view' },
];

const linkCls = (isActive: boolean) =>
  `flex items-center gap-2.5 py-1.5 px-2.5 rounded-[7px] text-[13px] transition-all cursor-pointer ${
    isActive
      ? 'bg-white/20 text-white font-semibold'
      : 'text-white/70 hover:bg-white/10 hover:text-white'
  }`;

export default function ClientLayout() {
  const [open, setOpen]             = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(true);
  const { user, logout }            = useAuthStore();
  const navigate                    = useNavigate();
  const location                    = useLocation();

  const can = (perm: string) => user?.permissions?.includes(perm) ?? false;
  const visibleAccessItems = ACCESS_ITEMS.filter(item => can(item.permission));
  const isInAccessGroup    = visibleAccessItems.some(i => location.pathname.startsWith(i.to));

  useEffect(() => {
    if (!user)             navigate('/acceso',   { replace: true });
    else if (user.isOwner) navigate('/empresas', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (isInAccessGroup) setAccessOpen(true);
  }, [isInAccessGroup]);

  const textCls = open ? 'block' : 'block md:hidden';
  const handleLogout = () => { logout(); navigate('/acceso'); };

  return (
    <div className="flex h-screen bg-[var(--color-bg-secondary)] overflow-hidden">

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <nav className={[
        'bg-[#C0392B] flex flex-col overflow-hidden',
        'fixed inset-y-0 left-0 z-50 w-[240px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'transition-transform duration-200 ease-in-out',
        'md:static md:translate-x-0 md:z-auto md:shrink-0',
        'md:transition-[width] md:duration-200',
        open ? 'md:w-[190px]' : 'md:w-[52px]',
      ].join(' ')}>

        {/* Brand + toggle */}
        <div className="flex items-center gap-2 px-3 h-[50px] border-b border-white/10 shrink-0">
          <div className="w-[28px] h-[28px] bg-white/20 rounded-[7px] flex items-center justify-center shrink-0">
            <IconBuildingStore size={14} className="text-white" />
          </div>
          <span className={`text-[14px] font-semibold text-white flex-1 truncate ${textCls}`}>
            Mi Panel
          </span>
          <button
            onClick={() => mobileOpen ? setMobileOpen(false) : setOpen(v => !v)}
            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-[5px] transition-colors cursor-pointer shrink-0"
          >
            {(mobileOpen || open) ? <IconChevronLeft size={14} /> : <IconChevronRight size={14} />}
          </button>
        </div>

        {/* Nav */}
        <div className="flex flex-col flex-1 py-3 px-2 gap-0.5 overflow-y-auto">

          <p className={`text-[10px] font-medium text-white/40 tracking-wider uppercase px-[10px] pb-1 ${textCls}`}>
            General
          </p>

          <NavLink
            to="/panel"
            end
            title={!open ? 'Dashboard' : undefined}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => linkCls(isActive)}
          >
            <span className="shrink-0"><IconLayoutDashboard size={16} /></span>
            <span className={`truncate ${textCls}`}>Dashboard</span>
          </NavLink>

          {/* Grupo Accesos — solo si tiene al menos un permiso */}
          {visibleAccessItems.length > 0 && (
            <div className="pt-3">
              <p className={`text-[10px] font-medium text-white/40 tracking-wider uppercase px-[10px] pb-1 ${textCls}`}>
                Accesos
              </p>

              {/* Header desplegable (solo en sidebar expandido) */}
              <button
                onClick={() => setAccessOpen(v => !v)}
                className={`${textCls} w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-[7px] text-[13px] text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer`}
              >
                <span className="shrink-0"><IconLock size={16} /></span>
                <span className="flex-1 text-left truncate">Gestión de accesos</span>
                <IconChevronDown
                  size={13}
                  className={`shrink-0 transition-transform duration-200 ${accessOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Items: indentados en expanded, normales en collapsed */}
              <div className={`flex flex-col gap-0.5 overflow-hidden transition-all duration-200 ${
                open
                  ? accessOpen ? 'max-h-40 opacity-100 mt-0.5' : 'max-h-0 opacity-0'
                  : 'max-h-40 opacity-100'
              }`}>
                {visibleAccessItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={!open ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => linkCls(isActive) + (open ? ' pl-8' : '')}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className={`truncate ${textCls}`}>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-2 pb-3 border-t border-white/10 pt-2 shrink-0">
          <div className={`flex items-center gap-2 px-2.5 py-1.5 ${textCls}`}>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {user?.initials ?? 'U'}
            </div>
            <span className="text-[12px] text-white/80 truncate flex-1">{user?.fullName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-[7px] text-[13px] text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer w-full"
          >
            <IconLogout size={16} className="shrink-0" />
            <span className={textCls}>Cerrar sesión</span>
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center gap-3 h-[50px] px-4 bg-white border-b border-[var(--color-border-secondary)] shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <IconMenu2 size={20} />
          </button>
          <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">Mi Panel</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
