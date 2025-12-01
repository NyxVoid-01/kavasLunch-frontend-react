// Tipos de datos principales de la aplicación

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  category: 'appetizer' | 'main' | 'drink';
  price: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyMenu {
  id: string;
  date: string;
  appetizer_id?: string;
  main_dish_id?: string;
  drink_id?: string;
  price: string | number;
  stock: number;
  available_stock?: number;
  is_active?: boolean;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
  // Relaciones - SIEMPRE vienen del backend Laravel
  appetizer: Dish;
  main_dish: Dish;
  drink: Dish;
}

export interface Reservation {
  id: string;
  user_id?: string;
  daily_menu_id?: string;
  code?: string; // Código de recojo del backend
  reservation_date: string;
  quantity?: number;
  total_price?: string; // Para compatibilidad
  status: 'pending' | 'confirmed' | 'cancelled' | 'delivered';
  payment_status?: 'pending' | 'paid';
  payment_method?: string; // cash, card, yape
  time_slot?: string; // Para compatibilidad
  time_slot_display?: string;
  pickup_time_slot?: string; // Campo del backend Laravel
  pickup_time_slot_full?: string;
  pickup_window_end?: string;
  qr_code?: string;
  qr_code_url?: string;
  expired_at?: string;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string;
  // Relaciones
  user?: User;
  daily_menu?: DailyMenu;
  menu?: { // Estructura que viene del backend Laravel
    id: string;
    date: string;
    price: string | number;
    appetizer?: Dish;
    main_dish?: Dish;
    drink?: Dish;
  };
  payment?: Payment;
}

export interface Payment {
  id: string;
  reservation_id: string;
  amount: string;
  payment_method: 'cash' | 'card' | 'transfer';
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  instructions?: string;
}

export interface ProcessPaymentData {
  reservation_id: string;
  payment_method: 'yape' | 'credit_card' | 'cash';
  payment_proof_url?: string; // Para Yape/Plin
  card_number?: string; // Para tarjeta
  card_expiry?: string; // Para tarjeta
  card_cvv?: string; // Para tarjeta
}

export interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
}

// Tipos de respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  full_name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

// Dashboard Stats (Admin)
export interface DashboardStats {
  total_users: number;
  total_reservations: number;
  today_reservations: number;
  total_revenue: string;
  pending_reservations: number;
}
