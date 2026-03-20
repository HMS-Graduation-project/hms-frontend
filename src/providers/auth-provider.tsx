import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthResponse {
  accessToken: string;
  user: User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));

  useEffect(() => {
    // On mount, if token exists, fetch current user
    if (token && !user) {
      api.get<User>('/v1/me').then(setUser).catch(() => {
        localStorage.removeItem('access_token');
        setToken(null);
      });
    }
  }, [token, user]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/v1/auth/login', { email, password });
    localStorage.setItem('access_token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/v1/auth/register', { email, password });
    localStorage.setItem('access_token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
