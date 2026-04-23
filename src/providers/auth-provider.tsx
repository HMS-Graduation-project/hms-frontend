import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  hospitalId?: string | null;
}

export interface Hospital {
  id: string;
  code: string;
  name: string;
  nameAr?: string | null;
  city?: { id: string; name: string; nameAr?: string | null } | null;
}

interface AuthContextType {
  user: User | null;
  hospital: Hospital | null;
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
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));

  // Fetch hospital info whenever user has a hospitalId (and clear otherwise).
  const loadHospital = useCallback(async (u: User | null) => {
    if (!u?.hospitalId) {
      setHospital(null);
      return;
    }
    try {
      const h = await api.get<Hospital>('/v1/hospitals/me');
      setHospital(h);
    } catch {
      setHospital(null);
    }
  }, []);

  useEffect(() => {
    // On mount, if token exists, fetch current user
    if (token && !user) {
      api
        .get<User>('/v1/me')
        .then((u) => {
          setUser(u);
          void loadHospital(u);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          setToken(null);
        });
    }
  }, [token, user, loadHospital]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/v1/auth/login', { email, password });
      localStorage.setItem('access_token', res.accessToken);
      setToken(res.accessToken);
      setUser(res.user);
      await loadHospital(res.user);
    },
    [loadHospital],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/v1/auth/register', { email, password });
      localStorage.setItem('access_token', res.accessToken);
      setToken(res.accessToken);
      setUser(res.user);
      await loadHospital(res.user);
    },
    [loadHospital],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setHospital(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, hospital, token, isAuthenticated: !!token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
