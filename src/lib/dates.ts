import { format } from 'date-fns';

// El backend envía las fechas como 'YYYY-MM-DD'. new Date('YYYY-MM-DD') las toma
// como UTC y en Lima (UTC-5) muestra el día anterior; aquí se leen como fecha local.
export const parseLocalDate = (dateStr: string): Date => {
  const cleanDate = dateStr.split('T')[0];
  return new Date(cleanDate + 'T00:00:00');
};

// Fecha de hoy en formato 'YYYY-MM-DD' según la hora local
export const todayISO = (): string => format(new Date(), 'yyyy-MM-dd');
