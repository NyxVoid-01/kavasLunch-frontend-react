import api from '@/lib/api';
import type { Reservation, TimeSlot } from '@/types';

// ============================================
// TIPOS PARA CREAR RESERVA
// ============================================

export interface CreateReservationData {
  menu_id: string;
  reservation_date: string;
  pickup_time_slot?: string; // 'HH:mm'; si no se envía, el servidor asigna el siguiente libre
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
 * Turnos de recojo del día para un menú, incluidos los que no se pueden elegir (llenos o terminados)
 */
export const getAvailableSlots = async (menuId: string, date: string): Promise<TimeSlot[]> => {
  const response = await api.get('/api/user/reservations/available-slots', {
    params: { menu_id: menuId, date },
  });

  const slots: { time: string; available: boolean; capacity_available: number }[] = response.data.data.slots ?? [];

  return slots.map((slot) => ({
    value: slot.time,
    label: slot.time,
    available: slot.available,
    capacity_available: slot.capacity_available,
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
