import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Safe execution in SSR environments
  const isBrowser = typeof window !== 'undefined';
  const initialToken = isBrowser ? localStorage.getItem('token') : null;
  const initialUser = isBrowser ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  return {
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken,
    login: (token, user) => {
      if (isBrowser) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true });
    },
    logout: () => {
      if (isBrowser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      set({ token: null, user: null, isAuthenticated: false });
    },
    updateUser: (updatedUser) => {
      set((state) => {
        const newUser = state.user ? { ...state.user, ...updatedUser } as User : null;
        if (isBrowser && newUser) {
          localStorage.setItem('user', JSON.stringify(newUser));
        }
        return { user: newUser };
      });
    },
  };
});
