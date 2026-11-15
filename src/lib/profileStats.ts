import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/dates';
import type { UserReservation } from '@/types';

export interface ProfileStats {
  total: number;
  spent: number;
  pending: number;
  favoriteDay: string | null;
  favoriteDish: string | null;
}

// El valor que más se repite (null si no hay valores)
const mostFrequent = (values: string[]): string | null => {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));

  let best: string | null = null;
  counts.forEach((count, value) => {
    if (best === null || count > (counts.get(best) ?? 0)) best = value;
  });
  return best;
};

// Estadísticas del perfil a partir de las reservas del usuario
export function computeProfileStats(reservations: UserReservation[]): ProfileStats {
  const day = mostFrequent(
    reservations.map((r) => format(parseLocalDate(r.reservation_date), 'EEEE', { locale: es }))
  );
  const dish = mostFrequent(reservations.map((r) => r.menu.main_dish).filter((name): name is string => !!name));

  return {
    total: reservations.length,
    // Solo cuenta lo que ya se entregó: es lo que realmente se pagó
    spent: reservations.filter((r) => r.status === 'delivered').reduce((sum, r) => sum + Number(r.menu.price), 0),
    pending: reservations.filter((r) => r.status === 'pending').length,
    favoriteDay: day ? day.charAt(0).toUpperCase() + day.slice(1) : null,
    favoriteDish: dish,
  };
}
