import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'manager' | 'admin';
  plantation?: {
    name: string;
    location?: string;
    fields?: string[];
  };
  permissions?: {
    canViewCameras: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canManageStaff: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerWithGoogle: () => Promise<void>;
  logout: () => void;
  loading: boolean;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('sads_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const resp = await apiFetch<{ token: string; user: User }>(`/api/auth/login`, { method: 'POST', body: { email, password } });
      setUser(resp.data.user);
      localStorage.setItem('sads_user', JSON.stringify(resp.data.user));
      localStorage.setItem('sads_token', resp.data.token);
    } finally {
    setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await handleGoogleAuth();
      setUser(result.user);
      localStorage.setItem('sads_user', JSON.stringify(result.user));
      localStorage.setItem('sads_token', result.token);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
    setLoading(false);
    }
  };

  const registerWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await handleGoogleAuth();
      setUser(result.user);
      localStorage.setItem('sads_user', JSON.stringify(result.user));
      localStorage.setItem('sads_token', result.token);
    } catch (error) {
      console.error('Google registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (): Promise<{ user: User; token: string }> => {
    let clientId = '';
    try {
      const resp = await apiFetch<{ clientId: string }>(`/api/auth/google-client-id`);
      clientId = resp.data.clientId;
    } catch {}
    if (!clientId) throw new Error('Google Client ID not configured');
    await new Promise<void>((resolve, reject) => {
      if (document.getElementById('google-identity')) return resolve();
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-identity';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
    // @ts-expect-error Google types loaded at runtime
    const token = await new Promise<string>((resolve, reject) => {
      // @ts-expect-error google available after script load
      if (!window.google || !window.google.accounts || !clientId) {
        reject(new Error('Google Identity not available'));
        return;
      }
      // @ts-expect-error
      const client = window.google.accounts.id;
      client.initialize({
        client_id: clientId,
        use_fedcm_for_prompt: true,
        callback: (resp: any) => {
          if (resp && resp.credential) {
            resolve(resp.credential);
          }
        }
      });
      let rejected = false;
      const timeout = setTimeout(() => {
        if (!rejected) {
          rejected = true;
          reject(new Error('Google One Tap not shown or skipped'));
        }
      }, 4000);
      client.prompt((notification: any) => {
        // Don't immediately reject; allow FedCM/popup fallbacks
        if (notification?.isDisplayed?.()) return;
        if (notification?.isDismissedMoment?.()) return;
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          if (!rejected) {
            rejected = true;
            clearTimeout(timeout);
            reject(new Error('Google One Tap not shown or skipped'));
          }
        }
      });
    });
    const response = await apiFetch<{ token: string; user: User }>(`/api/auth/google`, { method: 'POST', body: { idToken: token } });
    const data = response.data;
    return { user: data.user, token: data.token };
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const resp = await apiFetch<{ token: string; user: User }>(`/api/auth/register`, { method: 'POST', body: { name, email, password } });
      setUser(resp.data.user);
      localStorage.setItem('sads_user', JSON.stringify(resp.data.user));
      localStorage.setItem('sads_token', resp.data.token);
    } finally {
    setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('sads_user');
    localStorage.removeItem('sads_token');
  };

  const refresh = (): void => {
    const savedUser = localStorage.getItem('sads_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    register,
    registerWithGoogle,
    logout,
    loading,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};