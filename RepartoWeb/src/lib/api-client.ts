import type { User } from '../types';

const BACKEND_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiClient = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Credenciales incorrectas o usuario inactivo.');
      }
      throw new Error('Error al conectar con el servidor de autenticación.');
    }

    return await response.json();
  },

  registerCompany: async (data: {
    ruc: string;
    businessName: string;
    tradeName: string;
    address: string;
    phone: string;
    companyEmail: string;
    logo?: string;
    sunatSolUser?: string;
    sunatSolPassword?: string;
    certBase64?: string;
    certPassword?: string;
    adminFullName: string;
    adminEmail: string;
    adminPhone: string;
    adminPassword?: string;
  }) => {
    const response = await fetch(`${BACKEND_URL}/auth/register-company`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ruc: data.ruc,
        businessName: data.businessName,
        tradeName: data.tradeName,
        address: data.address,
        phone: data.phone,
        companyEmail: data.companyEmail,
        logo: data.logo || null,
        sunatSolUser: data.sunatSolUser || null,
        sunatSolPassword: data.sunatSolPassword || null,
        certBase64: data.certBase64 || null,
        certPassword: data.certPassword || null,
        adminFullName: data.adminFullName,
        adminEmail: data.adminEmail,
        adminPhone: data.adminPhone,
        adminPassword: data.adminPassword || 'Admin123!'
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.errors?.[0] || 'Error al registrar la empresa en el backend.');
    }

    return await response.json();
  },

  getUsers: async (): Promise<User[]> => {
    const token = localStorage.getItem('nexus_access_token');
    
    if (token) {
      try {
        const response = await fetch(`${BACKEND_URL}/users`, {
          method: 'GET',
          headers: getHeaders()
        });
        if (response.ok) {
          const apiUsers = await response.json();
          return apiUsers.map((u: any) => {
            const initials = u.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
            const redPalette = ['#C0392B', '#E74C3C', '#922B21', '#641E16'];
            
            let hash = 0;
            for (let i = 0; i < u.email.length; i++) {
              hash = u.email.charCodeAt(i) + ((hash << 5) - hash);
            }
            const avatarColor = redPalette[Math.abs(hash) % redPalette.length];
            return {
              id: u.id,
              name: u.fullName,
              email: u.email,
              role: u.email.includes('admin') ? 'Admin' : 'Empleado',
              roleKey: u.email.includes('admin') ? 'admin' : 'empleado',
              status: u.isActive ? 'active' : 'inactive',
              lastAccess: 'hace poco',
              initials: initials,
              avatarColor: avatarColor,
              enterpriseId: localStorage.getItem('nexus_company_id') || 'custom-tenant'
            };
          });
        }
      } catch (err) {
        console.error('Error fetching real users:', err);
      }
    }
    return [];
  },

  createUser: async (data: {
    name: string;
    email: string;
    roleKey: string;
    phone?: string;
    password?: string;
  }): Promise<User> => {
    const token = localStorage.getItem('nexus_access_token');
    
    if (token) {
      const response = await fetch(`${BACKEND_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          phone: data.phone || '999999999',
          password: data.password || 'Admin123!'
        })
      });

      if (response.ok) {
        const apiUser = await response.json();
        const initials = apiUser.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

        return {
          id: apiUser.id,
          name: apiUser.fullName,
          email: apiUser.email,
          role: data.roleKey === 'admin' ? 'Admin' : 'Empleado',
          roleKey: data.roleKey,
          status: apiUser.isActive ? 'active' : 'inactive',
          lastAccess: 'nunca',
          initials: initials,
          avatarColor: '#C0392B',
          enterpriseId: localStorage.getItem('nexus_company_id') || 'custom-tenant'
        };
      } else {
        const errRes = await response.json();
        throw new Error(errRes.message || errRes.errors?.[0] || 'Error al crear usuario en el backend.');
      }
    }
    throw new Error('Sesión no válida o sin token de autorización.');
  },

  getCompany: async (id: string) => {
    const response = await fetch(`${BACKEND_URL}/companies/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener la empresa.');
    return await response.json();
  },

  updateCompany: async (id: string, data: {
    businessName: string; tradeName?: string; address: string;
    phone: string; companyEmail: string; logo?: string;
    sunatSolUser?: string; sunatSolPassword?: string;
  }) => {
    const response = await fetch(`${BACKEND_URL}/companies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar la empresa.');
  },

  toggleCompanyStatus: async (id: string): Promise<{ id: string; isActive: boolean }> => {
    const response = await fetch(`${BACKEND_URL}/companies/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error al cambiar el estado.');
    return await response.json();
  },

  getCompanies: async () => {
    const response = await fetch(`${BACKEND_URL}/companies`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener las empresas.');
    return await response.json();
  },

  getCompanyModules: async (companyId: string) => {
    const response = await fetch(`${BACKEND_URL}/companies/${companyId}/modules`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener los módulos.');
    return await response.json();
  },

  updateCompanyModules: async (companyId: string, modules: { key: string; isEnabled: boolean }[]) => {
    const response = await fetch(`${BACKEND_URL}/companies/${companyId}/modules`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ modules }),
    });
    if (!response.ok) throw new Error('Error al actualizar los módulos.');
  },

  toggleUserStatus: async (userId: string): Promise<boolean> => {
    const token = localStorage.getItem('nexus_access_token');
    
    if (token) {
      const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        return true;
      }
      throw new Error('Error al cambiar el estado del usuario en el backend.');
    }
    return false;
  }
};
