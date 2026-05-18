export interface Company {
  id: string;
  ruc: string;
  businessName: string;
  tradeName: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CompanyModule {
  key: string;
  label: string;
  description: string;
  isEnabled: boolean;
  expiresAt: string | null;
}

/* ── Client-panel types ─────────────────────────────────── */

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAtUtc: string;
  roleId: string | null;
  roleName: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCount: number;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

export interface PermissionItem {
  key: string;
  label: string;
}

export interface PermissionGroup {
  module: string;
  label: string;
  permissions: PermissionItem[];
}
