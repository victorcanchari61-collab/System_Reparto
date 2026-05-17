import React, { useState, useEffect } from 'react';

import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../store/useAuthStore';
import type { User } from '../types';
import Badge from '../components/ui/Badge';
import ButtonPrimary from '../components/ui/ButtonPrimary';
import ButtonGhost from '../components/ui/ButtonGhost';
import {
  IconUserPlus,
  IconSearch,
  IconX,
  IconCheck,
  IconInfoCircle,
  IconLoader,
  IconBuildingStore
} from '@tabler/icons-react';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  
  // Form State for new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRoleKey, setNewUserRoleKey] = useState('empleado');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);


  const authUser = useAuthStore((state) => state.user);

  // Derivar nombre de empresa dinámico si es administrador logueado
  const companyName = authUser?.role === 'admin' 
    ? (localStorage.getItem('nexus_user_name')?.split(' ').slice(1).join(' ') || 'Mi Empresa S.A.') 
    : 'TechAlpha S.A.';
  const companyDomain = authUser?.role === 'admin' 
    ? (authUser.email.split('@')[1] || 'miempresa.com') 
    : 'techalpha.com';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Generador de contraseñas dinámico que cumple con las reglas de Identity
  const generatePassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const specials = '!@#$%&*';
    
    let result = '';
    result += upper.charAt(Math.floor(Math.random() * upper.length));
    result += lower.charAt(Math.floor(Math.random() * lower.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    result += specials.charAt(Math.floor(Math.random() * specials.length));
    
    const allChars = upper + lower + numbers + specials;
    for (let i = 0; i < 6; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    setNewUserPassword(result);
  };

  const handleOpenAddModal = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRoleKey('empleado');
    setNewUserPhone('');
    generatePassword();
    setModalError(null);
    setShowAddUserModal(true);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newUserName.trim()) {
      setModalError('El nombre completo es obligatorio.');
      return;
    }
    if (!newUserEmail.trim()) {
      setModalError('El correo electrónico es obligatorio.');
      return;
    }
    if (!newUserPhone.trim()) {
      setModalError('El teléfono es obligatorio.');
      return;
    }
    if (!newUserPassword.trim()) {
      setModalError('Debes ingresar o generar una contraseña.');
      return;
    }

    try {
      setIsSubmittingUser(true);
      await apiClient.createUser({
        name: newUserName,
        email: newUserEmail,
        roleKey: newUserRoleKey,
        phone: newUserPhone,
        password: newUserPassword
      });
      
      setShowAddUserModal(false);
      await fetchUsers();
    } catch (err: any) {
      setModalError(err.message || 'Ocurrió un error al registrar el usuario en el backend.');
      console.error(err);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      setLoading(true);
      await apiClient.toggleUserStatus(userId);
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getRoleBadge = (roleKey: string, roleName: string) => {
    if (roleKey === 'admin') return <Badge variant="primary">{roleName}</Badge>;
    return <Badge variant="gray">{roleName}</Badge>;
  };

  const getStatusBadge = (status: User['status']) => {
    if (status === 'active') return <Badge variant="green">Activo</Badge>;
    return <Badge variant="amber">Inactivo</Badge>;
  };

  return (
    <div className="flex flex-col gap-[18px] relative">
      
      {/* Top Header & Entity Detail */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-gray-500">
           <IconBuildingStore size={15}/>
           <span className="text-[13px] font-medium">Panel de Administración Tenant</span>
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] rounded-[10px] bg-r flex items-center justify-center text-[14px] font-medium text-white shrink-0 shadow-sm">
              {companyName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[19px] font-semibold text-gray-900 leading-none">{companyName}</div>
              <div className="text-[12px] text-gray-500 mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span>Dominio: {companyDomain}</span>
                <span>•</span>
                <span>Licencia Activa</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleOpenAddModal}
            className="bg-r hover:bg-r4 text-white font-medium text-[13px] py-[8px] px-[15px] rounded-[var(--border-radius-md)] flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm"
          >
            <IconUserPlus size={14} />
            <span>Agregar usuario</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-[var(--border-radius-lg)] overflow-hidden shadow-sm mt-2">
        <div className="p-[13px] px-[18px] border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[14px] font-semibold text-gray-900">Equipo de Trabajo ({users.length})</span>
          
          <div className="flex items-center gap-1.5 bg-[#f9f9f9] border border-gray-200 rounded-[7px] py-[5px] px-2.5">
            <IconSearch size={13} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empleado…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent text-[12px] text-gray-900 outline-none w-[130px] focus:w-[160px] transition-all"
              aria-label="Buscar usuario"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="py-14 text-center text-gray-500 text-[13px] flex flex-col items-center justify-center gap-2">
              <IconLoader size={20} className="animate-spin text-r" />
              <span>Cargando usuarios desde PostgreSQL...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-[13px]">
              No se encontraron usuarios en tu empresa.
            </div>
          ) : (
            <table className="w-full border-collapse min-w-[550px] table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-[11px] font-semibold text-gray-500 text-left py-2.5 px-[18px] w-[38%] tracking-wider uppercase">Empleado</th>
                  <th className="text-[11px] font-semibold text-gray-500 text-left py-2.5 px-[18px] w-[18%] tracking-wider uppercase">Rol</th>
                  <th className="text-[11px] font-semibold text-gray-500 text-left py-2.5 px-[18px] w-[16%] tracking-wider uppercase">Estado</th>
                  <th className="text-[11px] font-semibold text-gray-500 text-left py-2.5 px-[18px] w-[22%] tracking-wider uppercase">Último acceso</th>
                  <th className="py-2.5 px-[18px] w-[10%] text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-[#FEF9FE]/30 transition-colors last:border-b-0"
                  >
                    <td className="py-[11px] px-[18px] text-[13px] text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-[27px] h-[27px] rounded-[7px] flex items-center justify-center text-[10px] font-medium text-white shrink-0"
                          style={{ backgroundColor: u.avatarColor }}
                        >
                          {u.initials}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-medium truncate text-gray-900 leading-normal">{u.name}</div>
                          <div className="text-[11px] text-gray-400 truncate leading-normal">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-[11px] px-[18px] text-[13px] text-gray-900">
                      {getRoleBadge(u.roleKey, u.role)}
                    </td>
                    <td className="py-[11px] px-[18px] text-[13px] text-gray-900">
                      {getStatusBadge(u.status)}
                    </td>
                    <td className="py-[11px] px-[18px] text-[12px] text-gray-500">
                      {u.lastAccess}
                    </td>
                    <td className="py-[11px] px-[18px] text-center">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`text-[11px] font-medium py-1 px-2.5 rounded-[5px] transition-all cursor-pointer border-none bg-transparent ${
                          u.status === 'active'
                            ? 'text-r hover:bg-r/10 hover:text-r4'
                            : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspender' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Dynamic Modal dialog: Agregar usuario */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--border-radius-lg)] border border-gray-200 w-full max-w-[400px] shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="bg-gray-50 border-b border-gray-200 p-[14px] px-5 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-gray-900">Nuevo miembro del equipo</span>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5 rounded-full hover:bg-gray-200 transition-all border-none bg-transparent"
              >
                <IconX size={16} />
              </button>
            </div>

            {modalError && (
              <div className="m-4 mb-0 flex items-start gap-2 bg-r3 border border-[#F1948A] rounded-[var(--border-radius-md)] p-3 text-[12px] text-r4">
                <IconInfoCircle size={15} className="shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-[12px] text-gray-500 mb-1" htmlFor="modal-user-name">Nombre completo *</label>
                <input
                  id="modal-user-name"
                  type="text"
                  placeholder="Ej. María García"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-r"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[12px] text-gray-500 mb-1" htmlFor="modal-user-email">Correo electrónico corporativo *</label>
                <input
                  id="modal-user-email"
                  type="email"
                  placeholder="user@tuempresa.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-r"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-500 mb-1" htmlFor="modal-user-phone">Teléfono Móvil *</label>
                  <input
                    id="modal-user-phone"
                    type="text"
                    placeholder="Ej. 994829103"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-r"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-500 mb-1" htmlFor="modal-user-role">Nivel de Acceso *</label>
                  <select
                    id="modal-user-role"
                    value={newUserRoleKey}
                    onChange={(e) => setNewUserRoleKey(e.target.value)}
                    className="w-full border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-r cursor-pointer"
                  >
                    <option value="admin">Administrador</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="empleado">Empleado</option>
                    <option value="reader">Solo lectura</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[12px] text-gray-500 mb-1" htmlFor="modal-user-pw">Contraseña de acceso *</label>
                <div className="flex gap-1.5">
                  <input
                    id="modal-user-pw"
                    type="text"
                    placeholder="Escribe o presiona generar"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-[var(--border-radius-md)] p-2 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-r font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); generatePassword(); }}
                    className="bg-[#f9f9f9] border border-gray-200 py-2 px-3 rounded-[var(--border-radius-md)] text-[12px] text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  >
                    Generar
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-2 pt-4 border-t border-gray-100">
                <ButtonGhost
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1"
                  disabled={isSubmittingUser}
                >
                  Cancelar
                </ButtonGhost>
                <ButtonPrimary
                  type="submit"
                  className="flex-[2] justify-center"
                  disabled={isSubmittingUser}
                >
                  {isSubmittingUser ? (
                    <>
                      <IconLoader size={14} className="animate-spin mr-1" />
                      <span>Registrando…</span>
                    </>
                  ) : (
                    <>
                      <IconCheck size={14} />
                      <span>Registrar en Sistema</span>
                    </>
                  )}
                </ButtonPrimary>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
