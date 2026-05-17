export interface Company {
  id: string;
  ruc: string;
  businessName: string;
  tradeName: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleKey: string;
  status: 'active' | 'inactive';
  lastAccess: string;
  initials: string;
  avatarColor: string;
  enterpriseId: string;
}

export type UserRole = 'superadmin' | 'admin' | 'supervisor' | 'empleado' | 'reader';

export interface Permissions {
  usuarios: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
  roles: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
  reportes: { ver: boolean; exportar: boolean };
}

export interface RolePermissions {
  roleName: string;
  roleKey: string;
  usersCount: number;
  isSystem: boolean;
  permissions: Permissions;
}
