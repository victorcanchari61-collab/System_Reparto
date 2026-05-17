import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_ROLES } from '../lib/permissions-matrix';
import { apiClient } from '../lib/api-client';
import type { RolePermissions, Permissions, User } from '../types';
import ButtonPrimary from '../components/ui/ButtonPrimary';
import Badge from '../components/ui/Badge';
import {
  IconArrowLeft,
  IconPlus,
  IconShieldCheck,
  IconUserCheck,
  IconUser,
  IconEye,
  IconPencil,
  IconCheck
} from '@tabler/icons-react';

export const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RolePermissions[]>(INITIAL_ROLES);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('admin');
  const [showToast, setShowToast] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await apiClient.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error loading users for roles page:', err);
      }
    };
    loadUsers();
  }, []);

  // Obtener rol seleccionado actualmente
  const activeRole = roles.find((r) => r.roleKey === selectedRoleKey) || roles[0];

  const handleRoleSelect = (roleKey: string) => {
    setSelectedRoleKey(roleKey);
  };

  const getRoleUsersCount = (roleKey: string) => {
    return users.filter((u) => u.roleKey === roleKey).length;
  };

  // Toggle de un checkbox de permiso específico en tiempo real
  const handlePermissionToggle = (
    category: keyof Permissions,
    action: string
  ) => {
    setRoles((prevRoles) =>
      prevRoles.map((r) => {
        if (r.roleKey === selectedRoleKey) {
          const categoryPermissions = { ...r.permissions[category] };
          // Toggle del valor booleano
          (categoryPermissions as any)[action] = !(categoryPermissions as any)[action];
          
          return {
            ...r,
            permissions: {
              ...r.permissions,
              [category]: categoryPermissions
            }
          };
        }
        return r;
      })
    );
  };

  const handleSaveChanges = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const getRoleIcon = (roleKey: string) => {
    switch (roleKey) {
      case 'admin':
        return <IconShieldCheck size={16} className="text-r shrink-0" />;
      case 'supervisor':
        return <IconUserCheck size={16} className="text-gray-400 shrink-0" />;
      case 'empleado':
        return <IconUser size={16} className="text-gray-400 shrink-0" />;
      default:
        return <IconEye size={16} className="text-gray-400 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col gap-[18px] relative">
      
      {/* Top Header Breadcrumb */}
      <div>
        <button
          onClick={() => navigate('/empresas/detalle')}
          className="flex items-center gap-1.5 cursor-pointer text-gray-500 hover:text-gray-800 text-[12px] mb-2 bg-transparent border-none p-0 transition-colors"
        >
          <IconArrowLeft size={13} />
          <span>Volver</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[17px] font-medium text-gray-900 leading-none">Roles y permisos</div>
            <div className="text-[12px] text-gray-500 mt-1.5">TechAlpha gestiona sus propios roles</div>
          </div>
          <button
            onClick={() => {}}
            className="bg-r hover:bg-r4 text-white font-medium text-[13px] py-[8px] px-[15px] rounded-[var(--border-radius-md)] flex items-center gap-1.5 transition-colors cursor-pointer border-none"
          >
            <IconPlus size={14} />
            <span>Nuevo rol</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-[14px]">
        
        {/* Left Sidebar Card: Roles List */}
        <div className="bg-white border border-gray-200 rounded-[var(--border-radius-lg)] overflow-hidden shadow-sm h-fit">
          <div className="p-[13px] px-[18px] border-b border-gray-100">
            <span className="text-[13px] font-medium text-gray-900">Roles ({roles.length})</span>
          </div>
          <div className="flex flex-col">
            {roles.map((r) => {
              const isSelected = r.roleKey === selectedRoleKey;
              return (
                <div
                  key={r.roleKey}
                  onClick={() => handleRoleSelect(r.roleKey)}
                  className={`p-3 px-[15px] flex items-center justify-between border-b border-gray-100 last:border-b-0 cursor-pointer transition-all ${
                    isSelected ? 'bg-r3' : 'hover:bg-[#FEF9FE]/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getRoleIcon(r.roleKey)}
                    <div>
                      <div className="text-[13px] font-medium text-gray-900">{r.roleName}</div>
                      <div className="text-[11px] text-gray-400">{getRoleUsersCount(r.roleKey)} usuarios</div>
                    </div>
                  </div>
                  {r.isSystem ? (
                    <Badge variant="primary">Sistema</Badge>
                  ) : (
                    <button
                      className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-all cursor-pointer inline-flex items-center justify-center border-none bg-transparent"
                      aria-label="Editar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconPencil size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Card: Permissions Matrix Checklist */}
        <div className="bg-white border border-gray-200 rounded-[var(--border-radius-lg)] p-[18px] flex flex-col gap-3.5 shadow-sm">
          <div className="pb-1">
            <div className="text-[14px] font-medium text-gray-900" id="role-title">
              {activeRole.roleName}
            </div>
            <div className="text-[12px] text-gray-500 mt-0.5">
              Permisos asignados
            </div>
          </div>

          {/* Group 1: Users Permissions */}
          <div className="border border-gray-200 rounded-[var(--border-radius-md)] overflow-hidden">
            <div className="bg-r3 border-b border-[#F1948A] py-1.75 px-3.25 text-[11px] font-medium text-r4 uppercase tracking-wider">
              Usuarios
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.usuarios.ver}
                  onChange={() => handlePermissionToggle('usuarios', 'ver')}
                  className="accent-r w-3.5 h-3.5"
                />
                Ver usuarios
              </label>
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 border-b border-gray-100 sm:border-l border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.usuarios.crear}
                  onChange={() => handlePermissionToggle('usuarios', 'crear')}
                  className="accent-r w-3.5 h-3.5"
                />
                Crear usuarios
              </label>
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 border-b border-gray-100 sm:border-b-0 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.usuarios.editar}
                  onChange={() => handlePermissionToggle('usuarios', 'editar')}
                  className="accent-r w-3.5 h-3.5"
                />
                Editar usuarios
              </label>
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 sm:border-l border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.usuarios.eliminar}
                  onChange={() => handlePermissionToggle('usuarios', 'eliminar')}
                  className="accent-r w-3.5 h-3.5"
                />
                Eliminar usuarios
              </label>
            </div>
          </div>

          {/* Group 2: Roles Permissions */}
          <div className="border border-gray-200 rounded-[var(--border-radius-md)] overflow-hidden">
            <div className="bg-r3 border-b border-[#F1948A] py-1.75 px-3.25 text-[11px] font-medium text-r4 uppercase tracking-wider">
              Roles
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.roles.ver}
                  onChange={() => handlePermissionToggle('roles', 'ver')}
                  className="accent-r w-3.5 h-3.5"
                />
                Ver roles
              </label>
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 border-b border-gray-100 sm:border-l border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.roles.crear}
                  onChange={() => handlePermissionToggle('roles', 'crear')}
                  className="accent-r w-3.5 h-3.5"
                />
                Crear roles
              </label>
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 border-b border-gray-100 sm:border-b-0 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.roles.editar}
                  onChange={() => handlePermissionToggle('roles', 'editar')}
                  className="accent-r w-3.5 h-3.5"
                />
                Editar roles
              </label>
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 sm:border-l border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.roles.eliminar}
                  onChange={() => handlePermissionToggle('roles', 'eliminar')}
                  className="accent-r w-3.5 h-3.5"
                />
                Eliminar roles
              </label>
            </div>
          </div>

          {/* Group 3: Reports Permissions */}
          <div className="border border-gray-200 rounded-[var(--border-radius-md)] overflow-hidden">
            <div className="bg-r3 border-b border-[#F1948A] py-1.75 px-3.25 text-[11px] font-medium text-r4 uppercase tracking-wider">
              Reportes
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.reportes.ver}
                  onChange={() => handlePermissionToggle('reportes', 'ver')}
                  className="accent-r w-3.5 h-3.5"
                />
                Ver reportes
              </label>
              <label className="flex items-center gap-2 py-2 px-3.25 text-[12px] text-gray-700 sm:border-l border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeRole.permissions.reportes.exportar}
                  onChange={() => handlePermissionToggle('reportes', 'exportar')}
                  className="accent-r w-3.5 h-3.5"
                />
                Exportar datos
              </label>
            </div>
          </div>

          {/* Save Action Buttons Row */}
          <div className="flex justify-end mt-2">
            <ButtonPrimary onClick={handleSaveChanges} className="w-full sm:w-auto px-6 cursor-pointer">
              <IconCheck size={14} />
              <span>Guardar cambios</span>
            </ButtonPrimary>
          </div>
        </div>

      </div>

      {/* Floating success toast notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-[#E9F7EF] border border-[#A9DFBF] rounded-[var(--border-radius-md)] p-3 px-5 text-[13px] text-[#1E8449] font-medium flex items-center gap-2 shadow-xl z-50">
          <IconCheck size={16} className="text-[#1E8449]" />
          <span>¡Matriz de permisos guardada con éxito!</span>
        </div>
      )}

    </div>
  );
};

export default Roles;
