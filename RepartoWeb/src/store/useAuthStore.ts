import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  companyId: string;
  role: 'admin' | 'user';
  initials: string;
  isOwner: boolean;
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => void;
}

const buildInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

const decodePermissions = (token: string): string[] => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const perm = payload['permission'];
    if (!perm) return [];
    return Array.isArray(perm) ? perm : [perm];
  } catch {
    return [];
  }
};

const getInitialUser = (): AuthUser | null => {
  const token     = localStorage.getItem('nexus_access_token');
  const email     = localStorage.getItem('nexus_user_email');
  const name      = localStorage.getItem('nexus_user_name');
  const companyId = localStorage.getItem('nexus_company_id');
  const userId    = localStorage.getItem('nexus_user_id');
  const isOwner   = localStorage.getItem('nexus_is_owner') === 'true';
  if (!token || !email || !name || !companyId) return null;
  return {
    id: userId || '', email, fullName: name, companyId,
    role: 'admin', initials: buildInitials(name), isOwner,
    permissions: decodePermissions(token),
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.login(email.trim(), password);

      localStorage.setItem('nexus_access_token',  res.accessToken);
      localStorage.setItem('nexus_refresh_token', res.refreshToken);
      localStorage.setItem('nexus_company_id',    res.companyId);
      localStorage.setItem('nexus_user_id',       res.userId);
      localStorage.setItem('nexus_user_email',    res.email);
      localStorage.setItem('nexus_user_name',     res.fullName);
      localStorage.setItem('nexus_is_owner',      String(res.isOwner ?? false));

      set({
        user: {
          id:          res.userId,
          email:       res.email,
          fullName:    res.fullName,
          companyId:   res.companyId,
          role:        'admin',
          initials:    buildInitials(res.fullName),
          isOwner:     res.isOwner ?? false,
          permissions: decodePermissions(res.accessToken),
        },
        isLoading: false,
      });

      return res.isOwner ?? false;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('nexus_access_token');
    localStorage.removeItem('nexus_refresh_token');
    localStorage.removeItem('nexus_company_id');
    localStorage.removeItem('nexus_user_id');
    localStorage.removeItem('nexus_user_email');
    localStorage.removeItem('nexus_user_name');
    localStorage.removeItem('nexus_is_owner');
    set({ user: null });
  },

  checkSession: () => {
    const token     = localStorage.getItem('nexus_access_token');
    const email     = localStorage.getItem('nexus_user_email');
    const name      = localStorage.getItem('nexus_user_name');
    const companyId = localStorage.getItem('nexus_company_id');
    const userId    = localStorage.getItem('nexus_user_id');
    const isOwner   = localStorage.getItem('nexus_is_owner') === 'true';

    if (token && email && name && companyId) {
      set({
        user: {
          id:          userId || '',
          email,
          fullName:    name,
          companyId,
          role:        'admin',
          initials:    buildInitials(name),
          isOwner,
          permissions: decodePermissions(token),
        },
      });
    }
  },
}));
