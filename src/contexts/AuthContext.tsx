import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '@/services/auth';
import { getErrorMessage } from '@/lib/api';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            // Opcional: Verificar token con el servidor
            try {
              const freshUser = await authService.getProfile();
              setUser(freshUser);
            } catch (error) {
              // Token inválido, limpiar
              console.error('Token inválido:', getErrorMessage(error));
              await authService.logout();
              setUser(null);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Escuchar evento de logout
    const handleLogout = () => {
      setUser(null);
      navigate('/auth');
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);

  const login = async (credentials: LoginCredentials) => {
    const authData = await authService.login(credentials);
    setUser(authData.user);
  };

  const register = async (data: RegisterData) => {
    const authData = await authService.register(data);
    setUser(authData.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/auth');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
