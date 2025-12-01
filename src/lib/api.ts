import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError, ApiResponse } from '@/types';

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Interceptor de solicitud - Agregar token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta - Manejo de errores globales
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Token expirado - Limpiar sesión
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Redirigir al login (esto lo manejará el AuthContext)
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    // Error de servidor
    if (error.response?.status === 500) {
      console.error('Error del servidor:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Helper para extraer mensajes de error
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    
    // Errores de validación
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const firstError = Object.values(errors)[0];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
    
    // Mensaje de error del servidor
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // Error de red
    if (axiosError.message === 'Network Error') {
      return 'No se puede conectar con el servidor. Verifica tu conexión.';
    }
    
    return axiosError.message;
  }
  
  return 'Ha ocurrido un error inesperado';
};

// Helper para manejar respuestas de la API
export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.message || 'Error en la respuesta de la API');
  }
  return response.data;
};

export default api;
