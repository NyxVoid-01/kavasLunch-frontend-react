import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/dates';
import { PAYMENT_LABELS, PAYMENT_STATUS_LABELS, RESERVATION_STATUS_LABELS } from '@/lib/labels';
import type { UserReservation } from '@/types';

const PRIMARY: [number, number, number] = [154, 25, 25]; // #9A1919
const ACCENT: [number, number, number] = [255, 191, 0]; // #FFBF00
const MUTED: [number, number, number] = [110, 100, 100];

// Genera y descarga el comprobante de una reserva en PDF (RF-007).
// jsPDF se carga solo al pedir el comprobante para no pesar en la carga inicial.
export async function downloadReceipt(reservation: UserReservation, holder: { name: string; email: string }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const width = doc.internal.pageSize.getWidth();
  const margin = 12;
  let y = 0;

  // Cabecera
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, width, 30, 'F');
  doc.setFillColor(...ACCENT);
  doc.rect(0, 30, width, 1.5, 'F');
  doc.setTextColor(...ACCENT);
  doc.setFont('helvetica', 'bold').setFontSize(20).text('KAVAS-LUNCH', margin, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal').setFontSize(10).text('Comprobante de reserva · Comedor Universitario UPCH', margin, 22);

  // Código de recojo
  y = 44;
  doc.setTextColor(...MUTED).setFontSize(9).text('CÓDIGO DE RECOJO', width / 2, y, { align: 'center' });
  doc.setTextColor(...PRIMARY).setFont('helvetica', 'bold').setFontSize(26).text(reservation.code, width / 2, y + 11, { align: 'center' });
  doc.setDrawColor(...PRIMARY).setLineWidth(0.4).roundedRect(margin, y - 6, width - margin * 2, 20, 3, 3);

  // Datos de la reserva
  y = 74;
  const row = (label: string, value: string, bold = false) => {
    doc.setTextColor(...MUTED).setFont('helvetica', 'normal').setFontSize(9).text(label, margin, y);
    doc.setTextColor(30, 30, 30).setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(10).text(value, width - margin, y, { align: 'right' });
    y += 7;
  };
  const dateLabel = format(parseLocalDate(reservation.reservation_date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  const slot = reservation.pickup_time_slot
    ? `${reservation.pickup_time_slot}${reservation.pickup_window_end ? ` - ${reservation.pickup_window_end}` : ''}`
    : 'Por asignar';

  row('Titular', holder.name);
  row('Correo', holder.email);
  row('Fecha', dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1));
  row('Horario de recojo', slot, true);
  row('Estado', RESERVATION_STATUS_LABELS[reservation.status]);

  y += 2;
  doc.setDrawColor(220, 215, 215).line(margin, y, width - margin, y);
  y += 7;
  doc.setTextColor(...PRIMARY).setFont('helvetica', 'bold').setFontSize(9).text('TU MENÚ', margin, y);
  y += 7;
  if (reservation.menu.appetizer) row('Entrada', reservation.menu.appetizer);
  if (reservation.menu.main_dish) row('Plato principal', reservation.menu.main_dish, true);
  if (reservation.menu.drink) row('Bebida', reservation.menu.drink);

  y += 2;
  doc.line(margin, y, width - margin, y);
  y += 8;
  row('Método de pago', PAYMENT_LABELS[reservation.payment_method] ?? reservation.payment_method);
  row('Estado del pago', PAYMENT_STATUS_LABELS[reservation.payment_status]);
  doc.setTextColor(...PRIMARY).setFont('helvetica', 'bold').setFontSize(14);
  doc.text('TOTAL', margin, y + 3);
  doc.text(`S/ ${Number(reservation.menu.price).toFixed(2)}`, width - margin, y + 3, { align: 'right' });

  // Pie
  const footerY = doc.internal.pageSize.getHeight() - 16;
  doc.setTextColor(...MUTED).setFont('helvetica', 'normal').setFontSize(8);
  doc.text('Presenta este código al recoger tu pedido. Llega 5 minutos antes de tu horario.', width / 2, footerY, { align: 'center' });
  doc.text('Universidad Peruana Cayetano Heredia · KAVAS-LUNCH', width / 2, footerY + 5, { align: 'center' });

  doc.save(`comprobante-${reservation.code}.pdf`);
}
