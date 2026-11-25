import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Info } from 'lucide-react';

// Mensaje informativo según el día y la hora (banner con mensaje del día, ERS 4.x)
const messageFor = (now: Date): string => {
  const day = now.getDay(); // 0 domingo … 6 sábado
  // Solo se reserva para hoy o mañana y el comedor atiende de lunes a viernes
  if (day === 6) return 'El comedor atiende de lunes a viernes. Las reservas para el lunes se abren el domingo.';
  if (day === 0) return 'Puedes reservar para mañana, lunes. Cada reserva se recoge en su turno de 1 hora.';
  if (day === 5) {
    return now.getHours() >= 15
      ? 'Las reservas de hoy cerraron a las 15:00. El comedor vuelve a atender el lunes.'
      : 'Puedes reservar para hoy hasta las 15:00. El comedor vuelve a atender el lunes.';
  }
  if (now.getHours() >= 15) return 'Las reservas de hoy cerraron a las 15:00. Reserva ahora para mañana.';
  return 'Puedes reservar para hoy hasta las 15:00 o para mañana. Cada reserva se recoge en su turno de 1 hora.';
};

// Se recalcula cada minuto para que el aviso cambie al cierre de las 15:00 sin recargar
export default function DayBanner() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-accent/60 bg-accent/10 px-4 py-3" role="status">
      <Info className="mt-0.5 w-5 h-5 shrink-0 text-primary" />
      <div className="text-sm">
        <p className="font-semibold capitalize">{format(now, "EEEE d 'de' MMMM", { locale: es })}</p>
        <p className="text-muted-foreground">{messageFor(now)}</p>
      </div>
    </div>
  );
}
