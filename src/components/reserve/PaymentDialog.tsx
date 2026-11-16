import { useEffect, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Banknote, CheckCircle, Clock, RefreshCw, TimerOff } from 'lucide-react';
import { getErrorMessage } from '@/lib/api';
import { PAYMENT_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { processPayment, requestPayment } from '@/services/payments';
import type { PaymentMethodId, PaymentRequest } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// Con menos de este tiempo el contador se pone en rojo
const WARNING_SECONDS = 30;

export interface PaymentResult {
  paid: boolean;
  method: PaymentMethodId;
}

interface PaymentDialogProps {
  request: PaymentRequest;
  onDone: (result: PaymentResult) => void;
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const errorCode = (error: unknown) => (axios.isAxiosError(error) ? (error.response?.data as { error?: string })?.error : undefined);

// Momento límite según el reloj del dispositivo, a partir de los segundos que informa el servidor
const deadlineOf = (request: PaymentRequest) => Date.now() + request.expires_in_seconds * 1000;

/**
 * Paso de pago de Yape/Plin o tarjeta (RF-014): la solicitud se acepta solo dentro de 3 minutos.
 * Si vence, se genera otra; también se puede pasar a pagar en caja al recoger.
 */
export default function PaymentDialog({ request: initialRequest, onDone }: PaymentDialogProps) {
  const [request, setRequest] = useState(initialRequest);
  const [deadline, setDeadline] = useState(() => deadlineOf(initialRequest));
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState('');
  const [serverExpired, setServerExpired] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const total = request.window_minutes * 60;
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const expired = serverExpired || remaining === 0;

  const confirm = useMutation({
    mutationFn: () => processPayment({ reservation_id: request.reservation_id, payment_method: request.method }),
    onSuccess: () => onDone({ paid: true, method: request.method }),
    onError: (err) => {
      if (errorCode(err) === 'payment_request_expired') setServerExpired(true);
      setError(getErrorMessage(err));
    },
  });

  const renew = useMutation({
    mutationFn: () => requestPayment(request.reservation_id, request.method),
    onSuccess: (next) => {
      setRequest(next);
      setDeadline(deadlineOf(next));
      setServerExpired(false);
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  // Pagar en caja: la reserva se mantiene y el cobro se hace al entregar
  const payAtCounter = useMutation({
    mutationFn: () => processPayment({ reservation_id: request.reservation_id, payment_method: 'cash' }),
    onSuccess: () => onDone({ paid: false, method: 'cash' }),
    // Aunque falle, la reserva ya existe con el pago pendiente
    onError: () => onDone({ paid: false, method: request.method }),
  });

  const busy = confirm.isPending || renew.isPending || payAtCounter.isPending;
  const isYape = request.method === 'yape' || request.method === 'plin';

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && payAtCounter.mutate()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>Completa tu pago</DialogTitle>
          <DialogDescription>
            Tu reserva ya está separada. Confirma el pago dentro de {request.window_minutes} minutos para que sea aceptado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">{PAYMENT_LABELS[request.method]}</p>
            <p className="text-3xl font-bold text-primary">S/ {Number(request.amount).toFixed(2)}</p>
            {isYape && request.phone ? (
              <p className="mt-1 text-sm">
                Envía el monto al <strong className="text-primary">{request.phone}</strong>
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Pago simulado: no se piden datos de la tarjeta.</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Código de pago: <span className="font-mono font-semibold text-foreground">{request.transaction_code}</span>
            </p>
          </div>

          {expired ? (
            <Alert variant="destructive">
              <TimerOff className="h-4 w-4" />
              <AlertTitle>La solicitud de pago venció</AlertTitle>
              <AlertDescription>Pasaron los {request.window_minutes} minutos. Genera una nueva solicitud o paga en caja al recoger.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-1.5" aria-live="polite">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Tiempo para confirmar
                </span>
                <span className={cn('font-mono text-base font-bold', remaining <= WARNING_SECONDS ? 'text-destructive' : 'text-primary')}>
                  {formatTime(remaining)}
                </span>
              </div>
              <Progress
                value={(remaining / total) * 100}
                className={cn('h-2', remaining <= WARNING_SECONDS && '[&>div]:bg-destructive')}
                aria-label="Tiempo restante para confirmar el pago"
              />
            </div>
          )}

          {error && !expired && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {expired ? (
            <Button className="w-full h-11 font-semibold" disabled={busy} onClick={() => renew.mutate()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {renew.isPending ? 'Generando...' : 'Generar nueva solicitud'}
            </Button>
          ) : (
            <Button className="w-full h-11 font-semibold" disabled={busy} onClick={() => confirm.mutate()}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {confirm.isPending ? 'Confirmando...' : isYape ? 'Ya envié el pago' : 'Confirmar pago'}
            </Button>
          )}
          <Button variant="outline" className="w-full h-10" disabled={busy} onClick={() => payAtCounter.mutate()}>
            <Banknote className="w-4 h-4 mr-2" />
            {payAtCounter.isPending ? 'Guardando...' : 'Prefiero pagar en caja al recoger'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
