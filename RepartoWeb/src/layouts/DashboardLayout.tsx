import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Topnav from './Topnav';
import Sidebar from './Sidebar';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-r"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafb]">
      <Topnav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-[22px] bg-white flex flex-col gap-[18px] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
