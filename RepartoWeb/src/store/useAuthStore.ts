import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  companyId: string;
  role: 'admin' | 'user';
  initials: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.login(email.trim(), password);

      // Persistir sesión en localStorage
      localStorage.setItem('nexus_access_token', res.accessToken);
      localStorage.setItem('nexus_refresh_token', res.refreshToken);
      localStorage.setItem('nexus_company_id', res.companyId);
      localStorage.setItem('nexus_user_id', res.userId);
      localStorage.setItem('nexus_user_email', res.email);
      localStorage.setItem('nexus_user_name', res.fullName);

      const initials = res.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'US';

      set({
        user: {
          id: res.userId,
          email: res.email,
          fullName: res.fullName,
          companyId: res.companyId,
          role: 'admin',
          initials
        },
        isLoading: false
      });
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
    set({ user: null });
  },

  checkSession: () => {
    const token = localStorage.getItem('nexus_access_token');
    const email = localStorage.getItem('nexus_user_email');
    const name = localStorage.getItem('nexus_user_name');
    const companyId = localStorage.getItem('nexus_company_id');
    const userId = localStorage.getItem('nexus_user_id');

    if (token && email && name && companyId) {
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'US';

      set({
        user: {
          id: userId || '',
          email,
          fullName: name,
          companyId,
          role: 'admin',
          initials
        }
      });
    }
  }
}));
