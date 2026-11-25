import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDown, ArrowUp, History, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getStockAudits, updateMenuStock, type StockAudit } from '@/services/admin';
import type { DailyMenu } from '@/services/menus';
import { getErrorMessage, getFieldErrors } from '@/lib/api';
import { parseLocalDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { EmptyState, ErrorState } from '@/components/StateMessages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre cada fila del historial y su esqueleto
const ROW_CLASS = 'flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2';
const ICON_BOX = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg';

function StockAuditRow({ audit }: { audit: StockAudit }) {
  const delta = audit.new_stock - audit.old_stock;
  const up = delta > 0;

  return (
    <li className={ROW_CLASS}>
      <span className={cn(ICON_BOX, up ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive')}>
        {up ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {audit.old_stock} → {audit.new_stock}{' '}
          <span className={cn('font-medium', up ? 'text-success' : 'text-destructive')}>
            ({up ? '+' : ''}
            {delta})
          </span>
        </p>
        <p className="text-xs text-muted-foreground truncate" title={audit.reason}>
          {audit.reason}
        </p>
      </div>
      <div className="text-right text-xs text-muted-foreground shrink-0">
        <p>{format(new Date(audit.created_at), "d MMM, HH:mm", { locale: es })}</p>
        <p className="max-w-[110px] truncate">{audit.created_by?.full_name ?? 'Sistema'}</p>
      </div>
    </li>
  );
}

function StockAuditRowSkeleton() {
  return (
    <li className={ROW_CLASS} aria-hidden="true">
      <Skeleton className={ICON_BOX} />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </li>
  );
}

interface StockDialogProps {
  menu: DailyMenu;
  onClose: () => void;
}

// Ajuste de stock con motivo e historial de cambios del menú (RF-011)
export default function StockDialog({ menu, onClose }: StockDialogProps) {
  const queryClient = useQueryClient();
  const [stock, setStock] = useState(String(menu.stock));
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const history = useQuery({
    queryKey: ['admin', 'stock-audits', menu.id],
    queryFn: () => getStockAudits(menu.id),
  });

  const save = useMutation({
    mutationFn: () => updateMenuStock(menu.id, Number(stock), reason.trim()),
    onSuccess: (updated) => {
      toast.success('Stock actualizado');
      setReason('');
      setStock(String(updated.stock));
      ['admin', 'menus'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
    onError: (error) => {
      const fields = getFieldErrors(error);
      if (Object.keys(fields).length > 0) setErrors(fields);
      else toast.error(getErrorMessage(error));
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (stock.trim() === '' || !Number.isInteger(Number(stock)) || Number(stock) < 0) next.stock = 'El stock debe ser un número entero mayor o igual a 0';
    if (!reason.trim()) next.reason = 'Indica el motivo del cambio de stock';
    if (!next.stock && Number(stock) === menu.stock) next.stock = 'Ingresa una cantidad distinta a la actual';
    setErrors(next);
    if (Object.keys(next).length === 0) save.mutate();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !save.isPending && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>Stock del menú</DialogTitle>
          <DialogDescription className="first-letter:uppercase">
            {format(parseLocalDate(menu.date), "EEEE d 'de' MMMM", { locale: es })} · {menu.main_dish?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3" noValidate>
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stock-value">Nuevo stock</Label>
              <Input
                id="stock-value"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  setErrors((current) => ({ ...current, stock: '' }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock-reason">Motivo *</Label>
              <Input
                id="stock-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErrors((current) => ({ ...current, reason: '' }));
                }}
                placeholder="Ej: Reposición, merma, corrección"
                maxLength={255}
              />
            </div>
          </div>
          {(errors.stock || errors.reason) && (
            <p className="text-sm text-destructive" role="alert">
              {errors.stock || errors.reason}
            </p>
          )}
          <Button type="submit" className="w-full h-10 font-semibold" disabled={save.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {save.isPending ? 'Guardando...' : `Guardar (actual: ${menu.stock})`}
          </Button>
        </form>

        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <History className="w-4 h-4 text-primary" />
            Historial de cambios
          </h3>
          {history.isLoading ? (
            <ul className="space-y-1.5" aria-busy="true" aria-label="Cargando historial">
              {[0, 1, 2].map((i) => (
                <StockAuditRowSkeleton key={i} />
              ))}
            </ul>
          ) : history.isError ? (
            <ErrorState compact title="No se pudo cargar el historial" onRetry={() => history.refetch()} />
          ) : history.data && history.data.length > 0 ? (
            <ul className="space-y-1.5 max-h-60 overflow-y-auto">
              {history.data.map((audit) => (
                <StockAuditRow key={audit.id} audit={audit} />
              ))}
            </ul>
          ) : (
            <EmptyState compact icon={History} title="Sin cambios registrados" description="Aquí aparecerán los ajustes de stock de este menú" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
