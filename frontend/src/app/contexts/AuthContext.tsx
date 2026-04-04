import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number | string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password, fullName: name })
      });
      if (res.status === 409) {
        const body = await res.json();
        return { success: false, error: body?.error || 'Este correo ya está registrado' };
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { success: false, error: body?.error || 'Error en el registro' };
      }
      // Auto-login after successful registration
      return await login(email, password);
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  };

  const login = async (email: string, password: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { success: false, error: body?.error || 'Correo o contraseña incorrectos' };
      }
      const body = await res.json();
      const token = body.token;
      const userObj = { id: body.userId, email: body.username, name: body.fullName };
      setUser(userObj);
      setToken(token);
      localStorage.setItem('auth_user', JSON.stringify(userObj));
      localStorage.setItem('auth_token', token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
