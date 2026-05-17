import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import type { User } from '../types';
import StatCard from '../components/ui/StatCard';
import {
  IconUsers,
  IconShieldCheck,
  IconActivity,
  IconUserPlus,
  IconDeviceDesktopAnalytics
} from '@tabler/icons-react';

export const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await apiClient.getUsers();
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users for dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cálculos dinámicos de los KPIs para el Tenant Admin
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const totalUsers = users.length;
  
  // Extraer roles únicos usados
  const uniqueRoles = new Set(users.map(u => u.roleKey)).size;

  return (
    <div className="flex flex-col gap-[18px]">
      
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[17px] font-medium text-gray-900 leading-none">Visión General</div>
          <div className="text-[12px] text-gray-500 mt-1">Resumen del estado y actividad de tu equipo</div>
        </div>
        <button
          onClick={() => navigate('/usuarios')}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-[13px] py-[8px] px-[15px] rounded-[var(--border-radius-md)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <IconUserPlus size={14} />
          <span>Gestionar equipo</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          title="Usuarios totales"
          value={loading ? '...' : totalUsers}
          delta="Cuentas registradas"
          icon={<IconUsers size={13} />}
        />
        <StatCard
          title="Usuarios activos"
          value={loading ? '...' : activeUsersCount}
          delta="Con acceso al sistema"
          icon={<IconActivity size={13} />}
        />
        <StatCard
          title="Roles asignados"
          value={loading ? '...' : (uniqueRoles || 1)}
          delta="Niveles de permiso en uso"
          icon={<IconShieldCheck size={13} />}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Welcome Banner */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] rounded-[var(--border-radius-lg)] p-6 md:p-8 flex items-center justify-between overflow-hidden relative shadow-md">
          <div className="absolute -right-10 -top-10 text-white/5 rotate-12 pointer-events-none">
            <IconDeviceDesktopAnalytics size={250} />
          </div>
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-r text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full">Sistema Activo</span>
            </div>
            <h2 className="text-white text-2xl font-semibold m-0 leading-tight">
              Bienvenido a tu Panel de Control
            </h2>
            <p className="text-white/60 text-[13px] max-w-[400px] leading-relaxed m-0">
              Desde aquí podrás gestionar a los miembros de tu equipo, asignarles roles personalizados y monitorear su actividad dentro de la plataforma, todo de forma segura y privada.
            </p>
            <div className="mt-2">
              <button
                onClick={() => navigate('/roles')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[12px] font-medium py-2 px-4 rounded-lg transition-all cursor-pointer backdrop-blur-sm"
              >
                Configurar permisos
              </button>
            </div>
          </div>
        </div>

        {/* Quick Activity widget */}
        <div className="bg-white border border-gray-200 rounded-[var(--border-radius-lg)] overflow-hidden shadow-sm flex flex-col">
          <div className="p-[14px] px-[18px] border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-[13px] font-semibold text-gray-900">Actividad reciente</span>
          </div>
          <div className="flex-1 p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[220px]">
             <div className="w-12 h-12 bg-r3 rounded-full flex items-center justify-center text-r4 mb-1">
               <IconActivity size={24} />
             </div>
             <div className="text-[14px] font-medium text-gray-900">Todo tranquilo por aquí</div>
             <div className="text-[12px] text-gray-500 max-w-[200px]">
               Aún no hay actividad reciente de tus empleados para mostrar en este espacio.
             </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
