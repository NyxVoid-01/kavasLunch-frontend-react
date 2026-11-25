import { addDays, format, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/dates';

// Mismas reglas que el backend (TimeSlotService::validateReservationDate):
// solo hoy o mañana, de lunes a viernes, y hoy solo hasta las 15:00.
export const RESERVATION_CLOSING_HOUR = 15;

export interface ReservationAvailability {
  canReserve: boolean;
  // Texto para el botón de reserva
  label: string;
}

export const getReservationAvailability = (
  menu: { date: string; stock: number },
  now: Date = new Date()
): ReservationAvailability => {
  const today = format(now, 'yyyy-MM-dd');
  const tomorrow = format(addDays(now, 1), 'yyyy-MM-dd');
  const menuDate = parseLocalDate(menu.date);

  if (menu.stock <= 0) return { canReserve: false, label: 'Agotado' };
  if (menu.date < today) return { canReserve: false, label: 'Fecha pasada' };
  if (isWeekend(menuDate)) return { canReserve: false, label: 'Solo días laborables' };
  if (menu.date === today && now.getHours() >= RESERVATION_CLOSING_HOUR) {
    return { canReserve: false, label: 'Reservas cerradas por hoy' };
  }
  if (menu.date > tomorrow) {
    const opensOn = format(addDays(menuDate, -1), "EEEE d", { locale: es });
    return { canReserve: false, label: `Se reserva desde el ${opensOn}` };
  }
  return { canReserve: true, label: 'Reservar Este Menú' };
};

// Misma regla que el backend (TimeSlotService::validateCancellation): una reserva pendiente
// solo se cancela antes de las 10:00 del día de la reserva.
export const CANCEL_DEADLINE_HOUR = 10;

export const canCancelReservation = (
  reservation: { status: string; reservation_date: string },
  now: Date = new Date()
): boolean => {
  if (reservation.status !== 'pending') return false;
  const deadline = parseLocalDate(reservation.reservation_date);
  deadline.setHours(CANCEL_DEADLINE_HOUR, 0, 0, 0);
  return now < deadline;
};
