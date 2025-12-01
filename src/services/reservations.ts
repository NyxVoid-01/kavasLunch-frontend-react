import api from '@/lib/api';
import type { Reservation, TimeSlot } from '@/types';

// ============================================
// TIPOS PARA CREAR RESERVA
// ============================================

export interface CreateReservationData {
  menu_id: string;
  reservation_date: string;
  payment_method: string;
}

// ============================================
// ENDPOINTS DE USUARIO - RESERVAS
// ============================================

/**
 * Obtener todas las reservas del usuario autenticado
 */
export const getUserReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/api/user/reservations');
  return response.data.data.reservations;
};

/**
 * Crear una nueva reserva
 */
export const createReservation = async (data: CreateReservationData): Promise<Reservation> => {
  const response = await api.post('/api/user/reservations', data);
  return response.data.data.reservation;
};

/**
 * Obtener slots horarios disponibles para una fecha y menú
 */
export const getAvailableSlots = async (menuId: string, date: string): Promise<TimeSlot[]> => {
  const response = await api.get('/api/user/reservations/available-slots', {
    params: { 
      menu_id: menuId,
      date 
    }
  });
  
  // El backend devuelve available_slots con estructura diferente
  const backendSlots = response.data.data.available_slots || [];
  
  // Mapear la respuesta del backend al formato que espera el frontend
  return backendSlots.map((slot: any) => ({
    value: slot.time,
    label: slot.time,
    available: slot.capacity_available > 0
  }));
};

/**
 * Obtener detalle de una reserva específica
 */
export const getReservationById = async (id: string): Promise<Reservation> => {
  const response = await api.get(`/api/user/reservations/${id}`);
  return response.data.data.reservation;
};

/**
 * Cancelar una reserva
 */
export const cancelReservation = async (id: string): Promise<void> => {
  await api.delete(`/api/user/reservations/${id}/cancel`);
  // El backend solo devuelve {success: true, message: string}, no devuelve el objeto reservation
};
