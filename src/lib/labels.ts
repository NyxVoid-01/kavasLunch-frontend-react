import type { PaymentMethodId, ReservationStatus } from '@/types';

export const PAYMENT_LABELS: Record<PaymentMethodId, string> = {
  yape: 'Yape / Plin',
  plin: 'Yape / Plin',
  credit_card: 'Tarjeta',
  cash: 'Efectivo',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
} as const;

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  expired: 'Vencido',
};

// Turno de recojo de una reserva: "13:00 - 14:00"
export const slotLabel = (reservation: { pickup_time_slot: string | null; pickup_window_end: string | null }) =>
  reservation.pickup_time_slot
    ? `${reservation.pickup_time_slot}${reservation.pickup_window_end ? ` - ${reservation.pickup_window_end}` : ''}`
    : 'Pendiente';

// Categorías de los platos: nombre y color de la insignia (colores del prototipo)
export const DISH_CATEGORY_LABELS = {
  appetizer: 'Entrada',
  main: 'Principal',
  drink: 'Bebida',
} as const;

export const DISH_CATEGORY_STYLES = {
  appetizer: 'bg-[#2563EB] text-white hover:bg-[#2563EB]',
  main: 'bg-[#15803D] text-white hover:bg-[#15803D]',
  drink: 'bg-[#9333EA] text-white hover:bg-[#9333EA]',
} as const;
