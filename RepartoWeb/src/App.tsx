import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, type AuthUser } from './store/useAuthStore';

function RequirePermission({ permission, children }: { permission: string; children: React.ReactNode }) {
  const user = useAuthStore(s => s.user) as AuthUser | null;
  if (user && !user.permissions.includes(permission)) return <Navigate to="/panel" replace />;
  return <>{children}</>;
}

// Auth
import OwnerLoginPage      from './modules/auth/pages/OwnerLoginPage';
import ClientLoginPage     from './modules/auth/pages/ClientLoginPage';

// Owner
import DashboardLayout     from './layouts/DashboardLayout';
import CompaniesPage       from './modules/owner/pages/CompaniesPage';

// Client
import ClientLayout        from './layouts/ClientLayout';
import ClientDashboardPage from './modules/client/pages/DashboardPage';
import UsersPage           from './modules/client/pages/UsersPage';
import RolesPage           from './modules/client/pages/RolesPage';

function App() {
  const checkSession = useAuthStore(s => s.checkSession);
  useEffect(() => { checkSession(); }, [checkSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login"  element={<OwnerLoginPage />} />
        <Route path="/acceso" element={<ClientLoginPage />} />

        {/* Panel de cliente */}
        <Route path="/panel" element={<ClientLayout />}>
          <Route index                      element={<ClientDashboardPage />} />
          <Route path="usuarios" element={<RequirePermission permission="users.view"><UsersPage /></RequirePermission>} />
          <Route path="roles"    element={<RequirePermission permission="roles.view"><RolesPage /></RequirePermission>} />
          <Route path="*"                   element={<Navigate to="/panel" replace />} />
        </Route>

        {/* Panel del dueño — protegido por DashboardLayout */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index                    element={<Navigate to="/empresas" replace />} />
          <Route path="empresas" element={<CompaniesPage />} />
          <Route path="*"       element={<Navigate to="/empresas" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
