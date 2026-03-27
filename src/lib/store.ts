import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface FamilyGroup {
  id: string;
  name: string;
  members: string[];
}

interface AppState {
  user: User | null;
  accessToken: string | null;
  currentMonth: string;
  theme: 'light' | 'dark' | 'system';
  familyGroup: FamilyGroup | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setCurrentMonth: (month: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFamilyGroup: (group: FamilyGroup | null) => void;
  logout: () => void;
}

const getStoredToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  } catch {
    return null;
  }
};

const getStoredUser = () => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('spendly_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  } catch {
    return null;
  }
};

const getStoredTheme = () => {
  try {
    return typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system' : 'system';
  } catch {
    return 'system';
  }
};

export const useStore = create<AppState>((set) => ({
  user: getStoredUser(),
  accessToken: getStoredToken(),
  currentMonth: new Date().toISOString().slice(0, 7),
  theme: getStoredTheme(),
  familyGroup: null,
  setUser: (user) => {
    try {
      if (typeof window !== 'undefined') {
        if (user) {
          localStorage.setItem('spendly_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('spendly_user');
        }
      }
    } catch (error) {
      console.error('Failed to persist user:', error);
    }
    set({ user });
  },
  setAccessToken: (token) => {
    try {
      if (typeof window !== 'undefined') {
        if (token) {
          localStorage.setItem('access_token', token);
        } else {
          localStorage.removeItem('access_token');
        }
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
    set({ accessToken: token });
  },
  setCurrentMonth: (month) => set({ currentMonth: month }),
  setTheme: (theme) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
    set({ theme });
  },
  setFamilyGroup: (group) => set({ familyGroup: group }),
  logout: () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('spendly_user');
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
    set({ user: null, accessToken: null, familyGroup: null });
  },
}));