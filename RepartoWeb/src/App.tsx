import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Companies from './pages/Companies';
import CreateEnterprise from './pages/CreateEnterprise';

function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/empresas" replace />} />
          <Route path="empresas" element={<Companies />} />
          <Route path="empresas/nueva" element={<CreateEnterprise />} />
          <Route path="*" element={<Navigate to="/empresas" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
