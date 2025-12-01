import api from '@/lib/api';

// ==================== INTERFACES ====================

export interface Dish {
  id: string;
  name: string;
  description: string;
  category: 'appetizer' | 'main' | 'drink';
  price: string | number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyMenu {
  id: string;
  date: string;
  price: string | number;
  stock: number;
  available_stock?: number; // Campo adicional del backend
  is_available?: boolean;   // Campo adicional del backend
  created_at?: string;
  updated_at?: string;
  appetizer: Dish;    // Siempre viene del backend (NO opcional)
  main_dish: Dish;    // Siempre viene del backend (NO opcional)
  drink: Dish;        // Siempre viene del backend (NO opcional)
  appetizer_id?: string;
  main_dish_id?: string;
  drink_id?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ==================== ENDPOINTS PÚBLICOS (SIN AUTH) ====================

/**
 * Obtener todos los menús públicos disponibles
 * GET /api/public/menus
 */
export const getPublicMenus = async (params?: {
  date?: string;
  available?: boolean;
}): Promise<DailyMenu[]> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.available !== undefined) queryParams.append('available', String(params.available));

  const url = `/api/public/menus${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await api.get<ApiResponse<{ menus: DailyMenu[] }>>(url);
  
  return response.data.data.menus;
};

/**
 * Obtener el menú del día actual
 * GET /api/public/menus/today
 */
export const getTodayMenu = async (): Promise<DailyMenu | null> => {
  try {
    const response = await api.get<ApiResponse<{ menu: DailyMenu | null }>>(
      '/api/public/menus/today'
    );
    return response.data.data.menu;
  } catch (error) {
    console.error('Error fetching today menu:', error);
    return null;
  }
};

/**
 * Obtener un menú específico por ID
 * GET /api/public/menus/:id
 */
export const getPublicMenuById = async (id: string): Promise<DailyMenu> => {
  const response = await api.get<ApiResponse<{ menu: DailyMenu }>>(
    `/api/public/menus/${id}`
  );
  return response.data.data.menu;
};

/**
 * Obtener todos los platos disponibles
 * GET /api/public/dishes
 */
export const getPublicDishes = async (params?: {
  category?: 'appetizer' | 'main' | 'drink';
}): Promise<Dish[]> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);

  const url = `/api/public/dishes${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await api.get<ApiResponse<{ dishes: Dish[] }>>(url);
  
  return response.data.data.dishes;
};

// ==================== ENDPOINTS DE USUARIO (CON AUTH) ====================

/**
 * Obtener menús para usuario autenticado
 * GET /api/user/menus
 */
export const getUserMenus = async (params?: {
  date?: string;
}): Promise<DailyMenu[]> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);

  const url = `/api/user/menus${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await api.get<ApiResponse<{ menus: DailyMenu[] }>>(url);
  
  return response.data.data.menus;
};

/**
 * Obtener menú del día para usuario autenticado
 * GET /api/user/menus/today
 */
export const getUserTodayMenu = async (): Promise<DailyMenu | null> => {
  try {
    const response = await api.get<ApiResponse<{ menu: DailyMenu | null }>>(
      '/api/user/menus/today'
    );
    return response.data.data.menu;
  } catch (error) {
    console.error('Error fetching user today menu:', error);
    return null;
  }
};

/**
 * Obtener menú específico para usuario autenticado
 * GET /api/user/menus/:id
 */
export const getUserMenuById = async (id: string): Promise<DailyMenu> => {
  const response = await api.get<ApiResponse<{ menu: DailyMenu }>>(
    `/api/user/menus/${id}`
  );
  return response.data.data.menu;
};
