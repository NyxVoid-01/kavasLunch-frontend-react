import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import { deliverByCode, type AdminReservation } from '@/services/admin';
import { getErrorMessage } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Entrega por código (RF-013): el código se escribe a mano o lo carga un lector de QR; sigue abierto para el siguiente pedido
export default function DeliverByCodeDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [delivered, setDelivered] = useState<AdminReservation | null>(null);

  const deliver = useMutation({
    mutationFn: (value: string) => deliverByCode(value),
    onSuccess: (reservation) => {
      setDelivered(reservation);
      setError('');
      setCode('');
      // Cambian las listas del despacho y las cifras del panel
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (err) => {
      setDelivered(null);
      setError(getErrorMessage(err));
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = code.trim();
    if (!value) {
      setError('Ingresa el código de la reserva');
      setDelivered(null);
      return;
    }
    deliver.mutate(value);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !deliver.isPending && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>Registrar entrega por código</DialogTitle>
          <DialogDescription>Escribe el código que presenta el usuario (por ejemplo KL-ABCD1234) y se marcará como entregado.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="deliver-code">Código de reserva</Label>
            <Input
              id="deliver-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="KL-XXXXXXXX"
              autoComplete="off"
              autoFocus
              className="font-mono tracking-wider"
            />
          </div>
          <Button type="submit" className="w-full h-11 font-semibold" disabled={deliver.isPending}>
            <CheckCircle className="w-4 h-4 mr-2" />
            {deliver.isPending ? 'Registrando...' : 'Marcar como entregado'}
          </Button>
        </form>

        <div aria-live="polite">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>No se pudo entregar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {delivered && (
            <Alert className="border-success/40 bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle>Entregado: {delivered.user.full_name}</AlertTitle>
              <AlertDescription>
                {delivered.code} · {delivered.menu.main_dish}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
