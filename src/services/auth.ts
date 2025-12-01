import api from '@/lib/api';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  ApiResponse,
  User 
} from '@/types';

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/login', credentials);
  
  // Laravel devuelve { success, data: { user, token } }
  if (response.data.success && response.data.data) {
    const { user, token } = response.data.data;
    
    if (user && token) {
      // Guardar token y usuario en localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    }
  }
  
  throw new Error('Error en la respuesta del servidor');
};

// Registro
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // El backend espera full_name, no transformar
  const response = await api.post('/api/auth/register', data);
  
  // Laravel devuelve { success, data: { user, token } }
  if (response.data.success && response.data.data) {
    const { user, token } = response.data.data;
    
    if (user && token) {
      // Guardar token y usuario en localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    }
  }
  
  throw new Error('Error en la respuesta del servidor');
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } finally {
    // Limpiar siempre, incluso si la petición falla
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

// Obtener perfil actual
export const getProfile = async (): Promise<User> => {
  const response = await api.get('/api/auth/profile');
  
  // Laravel devuelve { success: true, data: { user: {...} } }
  const user = response.data.data?.user || response.data.user || response.data.data || response.data;
  
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  
  throw new Error('Error al obtener perfil');
};

// Actualizar perfil
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await api.put('/api/auth/profile', data);
  
  // Laravel devuelve { success: true, data: { user: {...} } }
  const user = response.data.data?.user || response.data.user || response.data.data || response.data;
  
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  
  throw new Error('Error al actualizar perfil');
};

// Refresh token
export const refreshToken = async (): Promise<string> => {
  const response = await api.post('/api/auth/refresh');
  
  // Laravel devuelve { success, data: { token } }
  if (response.data.success && response.data.data) {
    const newToken = response.data.data.token;
    
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
      return newToken;
    }
  }
  
  throw new Error('Error al refrescar token');
};

// Obtener usuario del localStorage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Verificar si está autenticado
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};
