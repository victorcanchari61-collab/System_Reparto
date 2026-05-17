import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Auth
import OwnerLoginPage      from './modules/auth/pages/OwnerLoginPage';
import ClientLoginPage     from './modules/auth/pages/ClientLoginPage';

// Owner
import DashboardLayout     from './layouts/DashboardLayout';
import CompaniesPage       from './modules/owner/pages/CompaniesPage';

// Client
import ClientPanelPage     from './modules/client/pages/ClientPanelPage';

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
        <Route path="/panel" element={<ClientPanelPage />} />

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
