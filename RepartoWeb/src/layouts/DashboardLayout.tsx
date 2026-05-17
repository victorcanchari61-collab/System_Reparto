import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Topnav from './Topnav';
import Sidebar from './Sidebar';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-r" />
      </div>
    );
  }

  return (
    /* h-screen + overflow-hidden ancla la UI al viewport; min-h-0 en el hijo
       permite que flex-1 shrinkee y el scroll funcione correctamente */
    <div className="h-screen flex flex-col overflow-hidden bg-[#f9fafb]">
      <Topnav />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
