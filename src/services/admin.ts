import api from '@/lib/api';
import type { DailyMenu, Dish } from '@/services/menus';
import type { PaymentMethodId, ReservationStatus } from '@/types';

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

export type DishCategory = Dish['category'];

export interface DishPayload {
  name: string;
  description: string;
  category: DishCategory;
  price: number;
  image_url?: string | null;
  is_active?: boolean;
}

export interface MenuPayload {
  date: string;
  appetizer_id?: string | null;
  main_dish_id: string;
  drink_id?: string | null;
  price: number;
  stock: number;
  is_active?: boolean;
}

// Cambio de stock registrado (RF-011)
export interface StockAudit {
  id: string;
  menu_id: string;
  old_stock: number;
  new_stock: number;
  reason: string;
  created_at: string;
  // La API devuelve al usuario que hizo el cambio
  created_by: { id: string; full_name: string } | null;
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
  return response.data.data.dishes;
};

export const createDish = async (data: DishPayload): Promise<Dish> => {
  const response = await api.post('/api/admin/dishes', data);
  return response.data.data.dish;
};

export const updateDish = async (id: string, data: Partial<DishPayload>): Promise<Dish> => {
  const response = await api.put(`/api/admin/dishes/${id}`, data);
  return response.data.data.dish;
};

export const deleteDish = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/dishes/${id}`);
};

// ============================================
// MENUS - CRUD
// ============================================

export const getAllMenus = async (): Promise<DailyMenu[]> => {
  const response = await api.get('/api/admin/menus');
  return response.data.data.menus;
};

export const createMenu = async (data: MenuPayload): Promise<DailyMenu> => {
  const response = await api.post('/api/admin/menus', data);
  return response.data.data.menu;
};

export const updateMenu = async (id: string, data: Partial<MenuPayload>): Promise<DailyMenu> => {
  const response = await api.put(`/api/admin/menus/${id}`, data);
  return response.data.data.menu;
};

export const deleteMenu = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/menus/${id}`);
};

// Cambia el stock y deja constancia del motivo en el historial
export const updateMenuStock = async (id: string, stock: number, reason: string): Promise<DailyMenu> => {
  const response = await api.put(`/api/admin/menus/${id}/stock`, { stock: Math.trunc(stock), reason });
  return response.data.data.menu;
};

// Historial de cambios de stock de un menú, del más reciente al más antiguo
export const getStockAudits = async (menuId: string): Promise<StockAudit[]> => {
  const response = await api.get('/api/admin/reports/stock-audits', { params: { menu_id: menuId } });
  return response.data.data.audits;
};

// ============================================
// RESERVAS: despacho (RF-012 y RF-013)
// ============================================

// Reserva tal como la usa el panel: usuario, turno, pago y nombres de los platos
export interface AdminReservation {
  id: string;
  code: string;
  status: ReservationStatus;
  reservation_date: string; // 'YYYY-MM-DD'
  pickup_time_slot: string | null; // 'HH:mm'
  pickup_window_end: string | null;
  payment_method: PaymentMethodId;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string | null;
  delivered_at: string | null;
  user: { id: string; full_name: string; email: string };
  menu: { id: string; price: string; appetizer: string | null; main_dish: string | null; drink: string | null };
}

export interface ReservationsSummary {
  total: number;
  pending: number;
  delivered: number;
  cancelled: number;
  expired: number;
}

export interface DayReservations {
  date: string;
  reservations: AdminReservation[];
  // Cuenta todo el día, aunque la lista venga filtrada
  summary: ReservationsSummary;
}

// Reservas de un día (por defecto, hoy), con el resumen por estado
export const getReservationsOfDay = async (date?: string): Promise<DayReservations> => {
  const response = await api.get('/api/admin/reservations', { params: date ? { date } : {} });
  return response.data.data;
};

export const cancelReservationAdmin = async (id: string): Promise<void> => {
  await api.put(`/api/admin/reservations/${id}/cancel`);
};

// Marca una reserva como entregada (no se puede entregar dos veces)
export const deliverReservation = async (id: string): Promise<AdminReservation> => {
  const response = await api.put(`/api/admin/reservations/${id}/deliver`);
  return response.data.data.reservation;
};

// Entrega por el código de la reserva (se escribe a mano o se lee del QR)
export const deliverByCode = async (code: string): Promise<AdminReservation> => {
  const response = await api.post('/api/admin/reservations/scan-qr', { code });
  return response.data.data.reservation;
};

// ============================================
// REPORTES
// ============================================

export type SalesGroup = 'day' | 'week' | 'month';

export interface SalesPoint {
  // día: 'YYYY-MM-DD' · semana: 'YYYY-MM-DD' del lunes · mes: 'YYYY-MM'
  period: string;
  total_reservations: number;
  total_revenue: number;
}

export interface SalesReport {
  group_by: SalesGroup;
  sales: SalesPoint[];
  total_revenue: number;
  total_reservations: number;
}

export interface ReservationsReport {
  summary: {
    total_reservations: number;
    // Las canceladas y vencidas no generan ingreso
    counted_reservations: number;
    total_revenue: number;
    average_reservation_value: number;
  };
  status_breakdown: Omit<ReservationsSummary, 'total'>;
  payment_methods: Record<PaymentMethodId, number>;
  reservations: AdminReservation[];
}

export const getSalesReport = async (dateFrom: string, dateTo: string, groupBy: SalesGroup): Promise<SalesReport> => {
  const response = await api.get('/api/admin/reports/sales', {
    params: { date_from: dateFrom, date_to: dateTo, group_by: groupBy },
  });
  return response.data.data;
};

export const getReservationsReport = async (dateFrom: string, dateTo: string): Promise<ReservationsReport> => {
  const response = await api.get('/api/admin/reports/reservations', { params: { date_from: dateFrom, date_to: dateTo } });
  return response.data.data;
};
