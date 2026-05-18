import type { UserRecord, Role, RoleDetail, PermissionGroup } from '../types/models';

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

  /* ── Usuarios del tenant ─────────────────────────────── */

  getClientUsers: async (): Promise<UserRecord[]> => {
    const response = await fetch(`${BACKEND_URL}/users`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener los usuarios.');
    return await response.json();
  },

  createClientUser: async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    roleId?: string | null;
  }): Promise<UserRecord> => {
    const response = await fetch(`${BACKEND_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear el usuario.');
    }
    return await response.json();
  },

  updateUser: async (id: string, data: { fullName: string; phone: string }): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al actualizar el usuario.');
    }
  },

  assignUserRole: async (userId: string, roleId: string): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ roleId }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al asignar el rol.');
    }
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
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).detail ?? (err as any).message ?? 'Error al actualizar los módulos.');
    }
    return await response.json() as import('../types/models').CompanyModule[];
  },

  toggleUserStatus: async (userId: string): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al cambiar el estado del usuario.');
    }
  },

  /* ── Roles del tenant ────────────────────────────────── */

  getRoles: async (): Promise<Role[]> => {
    const response = await fetch(`${BACKEND_URL}/roles`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener los roles.');
    return await response.json();
  },

  getRoleById: async (id: string): Promise<RoleDetail> => {
    const response = await fetch(`${BACKEND_URL}/roles/${id}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener el rol.');
    return await response.json();
  },

  createRole: async (data: { name: string; description?: string }): Promise<Role> => {
    const response = await fetch(`${BACKEND_URL}/roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear el rol.');
    }
    return await response.json();
  },

  updateRole: async (id: string, data: { name: string; description?: string }): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/roles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al actualizar el rol.');
    }
  },

  deleteRole: async (id: string): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al eliminar el rol.');
    }
  },

  setRolePermissions: async (id: string, permissions: string[]): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/roles/${id}/permissions`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ permissions }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al guardar los permisos.');
    }
  },

  /* ── Permisos del sistema ────────────────────────────── */

  getPermissions: async (): Promise<PermissionGroup[]> => {
    const response = await fetch(`${BACKEND_URL}/permissions`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener los permisos.');
    return await response.json();
  },
};
