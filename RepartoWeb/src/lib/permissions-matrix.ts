import type { RolePermissions, Permissions } from '../types';

export const DEFAULT_PERMISSIONS: Record<string, Permissions> = {
  admin: {
    usuarios: { ver: true, crear: true, editar: true, eliminar: true },
    roles: { ver: true, crear: true, editar: true, eliminar: false },
    reportes: { ver: true, exportar: true }
  },
  supervisor: {
    usuarios: { ver: true, crear: true, editar: true, eliminar: false },
    roles: { ver: true, crear: false, editar: false, eliminar: false },
    reportes: { ver: true, exportar: false }
  },
  empleado: {
    usuarios: { ver: true, crear: false, editar: false, eliminar: false },
    roles: { ver: false, crear: false, editar: false, eliminar: false },
    reportes: { ver: false, exportar: false }
  },
  reader: {
    usuarios: { ver: true, crear: false, editar: false, eliminar: false },
    roles: { ver: true, crear: false, editar: false, eliminar: false },
    reportes: { ver: true, exportar: false }
  }
};

export const INITIAL_ROLES: RolePermissions[] = [
  {
    roleName: 'Admin',
    roleKey: 'admin',
    usersCount: 0,
    isSystem: true,
    permissions: { ...DEFAULT_PERMISSIONS.admin }
  },
  {
    roleName: 'Supervisor',
    roleKey: 'supervisor',
    usersCount: 0,
    isSystem: false,
    permissions: { ...DEFAULT_PERMISSIONS.supervisor }
  },
  {
    roleName: 'Empleado',
    roleKey: 'empleado',
    usersCount: 0,
    isSystem: false,
    permissions: { ...DEFAULT_PERMISSIONS.empleado }
  },
  {
    roleName: 'Solo lectura',
    roleKey: 'reader',
    usersCount: 0,
    isSystem: false,
    permissions: { ...DEFAULT_PERMISSIONS.reader }
  }
];
