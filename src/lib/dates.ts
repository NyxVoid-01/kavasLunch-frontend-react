import { addDays, addWeeks, endOfDay, endOfWeek, format, startOfDay, startOfWeek } from 'date-fns';

// El backend envía las fechas como 'YYYY-MM-DD'. new Date('YYYY-MM-DD') las toma
// como UTC y en Lima (UTC-5) muestra el día anterior; aquí se leen como fecha local.
export const parseLocalDate = (dateStr: string): Date => {
  const cleanDate = dateStr.split('T')[0];
  return new Date(cleanDate + 'T00:00:00');
};

// Fecha de hoy en formato 'YYYY-MM-DD' según la hora local
export const todayISO = (): string => format(new Date(), 'yyyy-MM-dd');

export type MenuDateFilter = 'today-tomorrow' | 'this-week' | 'next-week' | 'all';

// ¿La fecha 'YYYY-MM-DD' de un menú cae en el rango elegido en los filtros?
export const isInDateFilter = (dateStr: string, filter: MenuDateFilter, now: Date = new Date()): boolean => {
  const date = parseLocalDate(dateStr);
  switch (filter) {
    case 'today-tomorrow':
      return date >= startOfDay(now) && date <= endOfDay(addDays(now, 1));
    case 'this-week':
      return date >= startOfWeek(now, { weekStartsOn: 1 }) && date <= endOfWeek(now, { weekStartsOn: 1 });
    case 'next-week': {
      const next = addWeeks(now, 1);
      return date >= startOfWeek(next, { weekStartsOn: 1 }) && date <= endOfWeek(next, { weekStartsOn: 1 });
    }
    default:
      return true;
  }
};
