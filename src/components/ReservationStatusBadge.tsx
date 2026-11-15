import type { ReservationStatus } from '@/types';
import { RESERVATION_STATUS_LABELS } from '@/lib/labels';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-warning text-warning-foreground hover:bg-warning',
  delivered: 'bg-[#15803D] text-white hover:bg-[#15803D]',
  cancelled: 'bg-destructive text-destructive-foreground hover:bg-destructive',
  expired: 'bg-muted text-muted-foreground border-border hover:bg-muted',
};

// Estado de una reserva con los colores del prototipo
export default function ReservationStatusBadge({ status, className }: { status: ReservationStatus; className?: string }) {
  return <Badge className={cn('whitespace-nowrap', STYLES[status], className)}>{RESERVATION_STATUS_LABELS[status] ?? status}</Badge>;
}
