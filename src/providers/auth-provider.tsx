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
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthResponse {
  user: User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    // On mount, try to restore session from cookie
    api
      .get<User>('/v1/me')
      .then((u) => {
        setUser(u);
        void loadHospital(u);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loadHospital]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/v1/auth/login', { email, password });
      setUser(res.user);
      await loadHospital(res.user);
      return res.user;
    },
    [loadHospital],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/v1/auth/register', { email, password });
      setUser(res.user);
      await loadHospital(res.user);
      return res.user;
    },
    [loadHospital],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/auth/logout`,
        { method: 'POST', credentials: 'include' },
      );
    } catch {
      // Best-effort server logout
    }
    setUser(null);
    setHospital(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, hospital, isAuthenticated: !!user, isLoading, login, register, logout }}
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
