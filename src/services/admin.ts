import api from '@/lib/api';
import type { Dish, DailyMenu, Reservation } from '@/types';

// ============================================
// TIPOS PARA ADMIN
// ============================================

export interface DashboardStats {
  today_reservations: number;
  pending_reservations: number;
  delivered_reservations: number;
  today_revenue: number;
  total_dishes: number;
  active_menus: number;
  low_stock_menus: number;
}

export interface CreateDishData {
  name: string;
  description: string;
  category: 'appetizer' | 'main' | 'drink';
  price: number;
  image_url?: string;
}

export interface CreateMenuData {
  date: string;
  appetizer_id?: string;
  main_dish_id?: string;
  drink_id?: string;
  price: number;
  stock: number;
}

// ============================================
// DASHBOARD
// ============================================

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/api/admin/dashboard/stats');
  return response.data.data || response.data;
};

// ============================================
// DISHES - CRUD
// ============================================

export const getAllDishes = async (): Promise<Dish[]> => {
  const response = await api.get('/api/admin/dishes');
  return response.data.data?.dishes || response.data.data || response.data;
};

export const getDishById = async (id: string): Promise<Dish> => {
  const response = await api.get(`/api/admin/dishes/${id}`);
  return response.data.data.dish;
};

export const createDish = async (data: CreateDishData): Promise<Dish> => {
  const response = await api.post('/api/admin/dishes', data);
  return response.data.data?.dish || response.data.data || response.data;
};

export const updateDish = async (id: string, data: Partial<CreateDishData>): Promise<Dish> => {
  const response = await api.put(`/api/admin/dishes/${id}`, data);
  return response.data.data?.dish || response.data.data || response.data;
};

export const deleteDish = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/dishes/${id}`);
};

// ============================================
// MENUS - CRUD
// ============================================

export const getAllMenus = async (): Promise<DailyMenu[]> => {
  const response = await api.get('/api/admin/menus');
  return response.data.data?.menus || response.data.data || response.data;
};

export const getMenuById = async (id: string): Promise<DailyMenu> => {
  const response = await api.get(`/api/admin/menus/${id}`);
  return response.data.data.menu;
};

export const createMenu = async (data: CreateMenuData): Promise<DailyMenu> => {
  const response = await api.post('/api/admin/menus', data);
  return response.data.data?.menu || response.data.data || response.data;
};

export const updateMenu = async (id: string, data: Partial<CreateMenuData>): Promise<DailyMenu> => {
  const response = await api.put(`/api/admin/menus/${id}`, data);
  return response.data.data.menu;
};

export const deleteMenu = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/menus/${id}`);
};

export const updateMenuStock = async (id: string, stock: number, reason?: string): Promise<DailyMenu> => {
  const response = await api.put(`/api/admin/menus/${id}/stock`, { 
    stock: parseInt(String(stock), 10),
    reason: reason || 'Ajuste manual desde panel de administración'
  });
  return response.data.data?.menu || response.data.data || response.data;
};

// ============================================
// RESERVATIONS - Admin Management
// ============================================

export const getAllReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/api/admin/reservations');
  const result = response.data.data?.reservations || response.data.data || response.data || [];
  return Array.isArray(result) ? result : [];
};

export const getTodayReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/api/admin/reservations/today');
  return response.data.data?.reservations || response.data.data || response.data || [];
};

export const getReservationsByTimeslot = async (date?: string): Promise<any> => {
  const params = date ? { date } : {};
  const response = await api.get('/api/admin/reservations/by-timeslot', { params });
  return response.data.data;
};

export const getAdminReservationById = async (id: string): Promise<Reservation> => {
  const response = await api.get(`/api/admin/reservations/${id}`);
  return response.data.data.reservation;
};

export const cancelReservationAdmin = async (id: string): Promise<void> => {
  await api.put(`/api/admin/reservations/${id}/cancel`);
};

export const deliverReservation = async (id: string): Promise<Reservation> => {
  const response = await api.put(`/api/admin/reservations/${id}/deliver`);
  return response.data.data?.reservation || response.data.data || response.data;
};

export const scanQRCode = async (code: string): Promise<any> => {
  const response = await api.post('/api/admin/reservations/scan-qr', { code });
  return response.data.data;
};

// ============================================
// REPORTS
// ============================================

export const getReservationsReport = async (dateFrom?: string, dateTo?: string): Promise<any> => {
  const params: any = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  
  const response = await api.get('/api/admin/reports/reservations', { params });
  return response.data.data;
};

export const getSalesReport = async (dateFrom?: string, dateTo?: string): Promise<any> => {
  const params: any = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  
  const response = await api.get('/api/admin/reports/sales', { params });
  return response.data.data;
};

export const getStockAudits = async (): Promise<any> => {
  const response = await api.get('/api/admin/reports/stock-audits');
  return response.data.data;
};
