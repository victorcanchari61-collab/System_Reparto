import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Topnav from './Topnav';
import Sidebar from './Sidebar';
import ToastContainer from '../components/ui/ToastContainer';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user)          navigate('/login',  { replace: true });
    else if (!user.isOwner) navigate('/panel', { replace: true });
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-r" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Topnav onMobileMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[#f9fafb]">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
