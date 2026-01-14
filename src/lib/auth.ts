import { User } from '@/types';

const AUTH_STORAGE_KEY = 'smarthome_auth';
const USER_STORAGE_KEY = 'smarthome_user';

export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  },

  setToken: (token: string) => {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  },

  removeToken: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getUser: (): User | null => {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  setUser: (user: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  removeUser: () => {
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  clear: () => {
    authStorage.removeToken();
    authStorage.removeUser();
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getToken();
  },
};

export const checkPermission = (userRole: string, requiredRole: 'owner' | 'admin' | 'member'): boolean => {
  const roleHierarchy = {
    owner: 3,
    admin: 2,
    member: 1,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  return userLevel >= requiredLevel;
};
