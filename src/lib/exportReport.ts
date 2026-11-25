import { format } from 'date-fns';
import type { AdminReservation, SalesGroup, SalesPoint } from '@/services/admin';
import { parseLocalDate } from '@/lib/dates';
import { PAYMENT_LABELS, PAYMENT_STATUS_LABELS, RESERVATION_STATUS_LABELS, slotLabel } from '@/lib/labels';

// Texto del período de una venta agrupada: día, semana (lunes) o mes
export const periodLabel = (period: string, groupBy: SalesGroup): string => {
  if (groupBy === 'month') return format(parseLocalDate(`${period}-01`), 'MM/yyyy');
  const date = format(parseLocalDate(period), 'dd/MM/yyyy');
  return groupBy === 'week' ? `Semana del ${date}` : date;
};

interface ExportParams {
  dateFrom: string;
  dateTo: string;
  groupBy: SalesGroup;
  reservations: AdminReservation[];
  sales: SalesPoint[];
}

// Genera el Excel del reporte (hojas «Reservas» y «Ventas»). La librería se carga solo al exportar.
export async function exportReportToExcel({ dateFrom, dateTo, groupBy, reservations, sales }: ExportParams): Promise<void> {
  const XLSX = await import('xlsx');

  const reservationRows = reservations.map((r) => ({
    Fecha: format(parseLocalDate(r.reservation_date), 'dd/MM/yyyy'),
    Código: r.code,
    Usuario: r.user.full_name,
    Correo: r.user.email,
    Turno: slotLabel(r),
    Estado: RESERVATION_STATUS_LABELS[r.status],
    'Método de pago': PAYMENT_LABELS[r.payment_method],
    'Estado de pago': PAYMENT_STATUS_LABELS[r.payment_status],
    'Monto (S/)': Number(r.menu.price),
  }));

  const salesRows = sales.map((s) => ({
    Período: periodLabel(s.period, groupBy),
    Reservas: s.total_reservations,
    'Ingresos (S/)': s.total_revenue,
  }));

  const workbook = XLSX.utils.book_new();
  const reservationsSheet = XLSX.utils.json_to_sheet(reservationRows);
  reservationsSheet['!cols'] = [12, 14, 24, 30, 14, 12, 16, 16, 12].map((wch) => ({ wch }));
  const salesSheet = XLSX.utils.json_to_sheet(salesRows);
  salesSheet['!cols'] = [22, 10, 14].map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(workbook, reservationsSheet, 'Reservas');
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Ventas');

  XLSX.writeFile(workbook, `reporte_${dateFrom}_${dateTo}.xlsx`);
}
