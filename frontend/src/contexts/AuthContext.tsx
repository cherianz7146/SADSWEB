import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../utils/api';

export interface UserPermissions {
  canViewCameras: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageStaff: boolean;
}

export interface User {
  id: string;
  userId?: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'manager' | 'admin';
  permissions?: UserPermissions;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (name: string, email: string, password: string, plantation?: string, phone?: string) => Promise<User>;
  registerWithGoogle: () => Promise<User>;
  logout: () => void;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
    // Bootstrap from token via /api/auth/me
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem('sads_token');
        if (!token) {
          setLoading(false);
          return;
        }
        const resp = await apiFetch<User>('/api/auth/me');
        setUser(resp.data);
        localStorage.setItem('sads_user', JSON.stringify(resp.data));
      } catch (error) {
        console.warn('Auth bootstrap failed:', error);
        localStorage.removeItem('sads_token');
        localStorage.removeItem('sads_user');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const resp = await apiFetch<{ token: string; user: User }>(`/api/auth/login`, { method: 'POST', body: { email, password } });
      setUser(resp.data.user);
      localStorage.setItem('sads_user', JSON.stringify(resp.data.user));
      localStorage.setItem('sads_token', resp.data.token);
      return resp.data.user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setLoading(true);
    try {
      const result = await handleGoogleAuth();
      setUser(result.user);
      localStorage.setItem('sads_user', JSON.stringify(result.user));
      localStorage.setItem('sads_token', result.token);
      return result.user;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithGoogle = async (): Promise<User> => {
    setLoading(true);
    try {
      const result = await handleGoogleAuth();
      setUser(result.user);
      localStorage.setItem('sads_user', JSON.stringify(result.user));
      localStorage.setItem('sads_token', result.token);
      return result.user;
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
    
    // Check if script is already loaded
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
    
    const token = await new Promise<string>((resolve, reject) => {
      const w: any = window as any;
      if (!w.google || !w.google.accounts || !clientId) {
        reject(new Error('Google Identity not available'));
        return;
      }
      
      try {
        const client = w.google.accounts.id;
        client.initialize({ 
          client_id: clientId, 
          callback: (resp: any) => {
            if (resp && resp.credential) {
              resolve(resp.credential);
            } else {
              reject(new Error('No credential from Google'));
            }
          }
        });
        
        // Trigger the prompt
        client.prompt();
      } catch (error: any) {
        reject(new Error(`Google Sign-In initialization failed: ${error.message}`));
      }
    });
    
    const response = await apiFetch<{ token: string; user: User }>(`/api/auth/google`, { 
      method: 'POST', 
      body: { idToken: token } 
    });
    
    const data = response.data;
    return { user: data.user, token: data.token };
  };

  const register = async (name: string, email: string, password: string, plantation?: string, phone?: string): Promise<User> => {
    setLoading(true);
    try {
      console.log('Registering user:', { name, email, plantation, phone });
      const resp = await apiFetch<{ token: string; user: User }>(`/api/auth/register`, { 
        method: 'POST', 
        body: { name, email, password, plantation, phone } 
      });
      console.log('Registration response:', resp);
      setUser(resp.data.user);
      localStorage.setItem('sads_user', JSON.stringify(resp.data.user));
      localStorage.setItem('sads_token', resp.data.token);
      return resp.data.user;
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('sads_user');
    localStorage.removeItem('sads_token');
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    register,
    registerWithGoogle,
    logout,
    loading,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};