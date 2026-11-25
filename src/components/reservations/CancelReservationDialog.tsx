import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { UserReservation } from '@/types';
import { parseLocalDate } from '@/lib/dates';
import ConfirmDialog from '@/components/ConfirmDialog';

interface CancelReservationDialogProps {
  reservation: UserReservation | null;
  cancelling: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Confirmación antes de cancelar una reserva
export default function CancelReservationDialog({ reservation, cancelling, onConfirm, onClose }: CancelReservationDialogProps) {
  return (
    <ConfirmDialog
      open={!!reservation}
      title="Cancelar reserva"
      description={
        reservation && (
          <>
            ¿Estás seguro de que deseas cancelar la reserva <strong>{reservation.code}</strong> del{' '}
            {format(parseLocalDate(reservation.reservation_date), "d 'de' MMMM", { locale: es })}? La porción volverá al stock y no
            podrás deshacerlo.
          </>
        )
      }
      confirmLabel="Sí, cancelar"
      busyLabel="Cancelando..."
      busy={cancelling}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
