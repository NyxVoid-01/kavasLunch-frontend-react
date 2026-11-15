import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CupSoda, Edit, History, Leaf, Minus, Plus, Trash2, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import type { DailyMenu } from '@/services/menus';
import { parseLocalDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { LOW_STOCK_THRESHOLD } from '@/components/menus/StockBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto: si cambian aquí, cambian en ambos
const CARD_CLASS = 'overflow-hidden border-2 border-primary/20 flex flex-col';
const HEADER_CLASS = 'px-4 py-3 border-b-2 border-accent/30 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5';
const BODY_CLASS = 'p-4 space-y-3 flex flex-col flex-grow';
const STOCK_ROW_CLASS = 'flex items-center justify-between gap-2';
const ACTION_HEIGHT = 'h-10';

const DISH_ROWS: { key: 'appetizer' | 'main_dish' | 'drink'; label: string; icon: LucideIcon }[] = [
  { key: 'appetizer', label: 'Entrada', icon: Leaf },
  { key: 'main_dish', label: 'Principal', icon: UtensilsCrossed },
  { key: 'drink', label: 'Bebida', icon: CupSoda },
];

interface AdminMenuCardProps {
  menu: DailyMenu;
  // Fecha ya pasada: no se ajusta el stock
  past: boolean;
  busy?: boolean;
  onEdit: (menu: DailyMenu) => void;
  onDelete: (menu: DailyMenu) => void;
  onStockStep: (menu: DailyMenu, delta: number) => void;
  onStockDetail: (menu: DailyMenu) => void;
}

// Tarjeta de un menú diario en el panel: platos, stock con ajuste rápido (RF-011) y acciones
export default function AdminMenuCard({ menu, past, busy = false, onEdit, onDelete, onStockStep, onStockDetail }: AdminMenuCardProps) {
  const soldOut = menu.stock <= 0;
  const low = !soldOut && menu.stock <= LOW_STOCK_THRESHOLD;

  return (
    <Card className={cn(CARD_CLASS, past && 'bg-muted/30')}>
      <div className={HEADER_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold first-letter:uppercase">
              {format(parseLocalDate(menu.date), "EEEE, d 'de' MMMM", { locale: es })}
            </h3>
            {past && <Badge variant="secondary">Pasado</Badge>}
          </div>
          <p className="text-lg font-bold text-primary leading-6 whitespace-nowrap">S/ {Number(menu.price).toFixed(2)}</p>
        </div>
      </div>

      <div className={BODY_CLASS}>
        <ul className="space-y-1.5 text-sm">
          {DISH_ROWS.map(({ key, label, icon: Icon }) => {
            const dish = menu[key];
            return dish ? (
              <li key={key} className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0 text-primary" />
                <span className="truncate">
                  <strong>{label}:</strong> {dish.name}
                </span>
              </li>
            ) : null;
          })}
        </ul>

        <div className={cn(STOCK_ROW_CLASS, 'rounded-xl bg-muted/60 px-3 py-2')}>
          <div>
            <p className="text-xs text-muted-foreground">Stock</p>
            <p className={cn('text-xs font-semibold leading-4', soldOut ? 'text-destructive' : low ? 'text-[#92400E]' : 'text-[#15803D]')}>
              {soldOut ? 'Agotado' : low ? 'Stock bajo' : 'Disponible'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {!past && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={busy || soldOut}
                onClick={() => onStockStep(menu, -1)}
                aria-label="Restar una unidad de stock"
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
            )}
            <span className="min-w-9 text-center text-lg font-bold" aria-live="polite">
              {menu.stock}
            </span>
            {!past && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={busy}
                onClick={() => onStockStep(menu, 1)}
                aria-label="Sumar una unidad de stock"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-1"
              onClick={() => onStockDetail(menu)}
              aria-label="Ajustar stock y ver historial"
              title="Ajustar stock y ver historial"
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Button variant="outline" className={cn(ACTION_HEIGHT, 'flex-1 font-medium')} onClick={() => onEdit(menu)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className={cn(ACTION_HEIGHT, 'w-10')}
            onClick={() => onDelete(menu)}
            aria-label="Eliminar menú"
            title="Eliminar menú"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Esqueleto de AdminMenuCard: misma estructura y medidas que la tarjeta
export function AdminMenuCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-hidden="true">
      <div className={HEADER_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-44 bg-background/60" />
          <Skeleton className="h-6 w-16 bg-background/60" />
        </div>
      </div>

      <div className={BODY_CLASS}>
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-5 w-4/5" />
          ))}
        </div>
        <Skeleton className="h-[56px] w-full rounded-xl" />
        <div className="mt-auto flex gap-2">
          <Skeleton className={cn(ACTION_HEIGHT, 'flex-1')} />
          <Skeleton className={cn(ACTION_HEIGHT, 'w-10')} />
        </div>
      </div>
    </Card>
  );
}

export function AdminMenuGridSkeleton({ count = 3, className }: { count?: number; className: string }) {
  return (
    <div className={cn('grid gap-5', className)} aria-busy="true" aria-label="Cargando menús">
      {Array.from({ length: count }).map((_, i) => (
        <AdminMenuCardSkeleton key={i} />
      ))}
    </div>
  );
}
