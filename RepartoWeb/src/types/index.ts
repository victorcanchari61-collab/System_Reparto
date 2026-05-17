export type UserRole = 'superadmin' | 'admin' | 'supervisor' | 'empleado' | 'reader';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Display role name, e.g. "Admin", "Supervisor", "Empleado", "Solo lectura"
  roleKey: string; // internal key: 'admin' | 'supervisor' | 'empleado' | 'reader'
  status: 'active' | 'inactive';
  lastAccess: string;
  initials: string;
  avatarColor: string;
  enterpriseId?: string;
}

export interface Enterprise {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial';
  plan: 'Enterprise' | 'Pro' | 'Starter';
  usersCount: number;
  createdDate: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface Activity {
  id: string;
  enterpriseName: string;
  type: 'user-plus' | 'building' | 'shield';
  description: string;
  time: string;
}

export interface Permissions {
  usuarios: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
  roles: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
  reportes: {
    ver: boolean;
    exportar: boolean;
  };
}

export interface RolePermissions {
  roleName: string;
  roleKey: string;
  usersCount: number;
  isSystem: boolean;
  permissions: Permissions;
}
