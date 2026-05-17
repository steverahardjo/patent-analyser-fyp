import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const savedAccess = localStorage.getItem('accessToken');
    const savedRefresh = localStorage.getItem('refreshToken');
    const savedUser = localStorage.getItem('user');
    if (savedAccess && savedRefresh && savedUser) {
      setAccessToken(savedAccess);
      setRefreshToken(savedRefresh);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const saveTokens = (access: string, refresh: string, user: User) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(user);
  };

  const login = async (username: string, password: string) => {
    const res = await axios.post(`${API}/auth/login`, { username, password });
    saveTokens(res.data.access, res.data.refresh, res.data.user);
  };

  const signup = async (username: string, email: string, password: string) => {
    const res = await axios.post(`${API}/auth/signup`, { username, email, password });
    saveTokens(res.data.access, res.data.refresh, res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
