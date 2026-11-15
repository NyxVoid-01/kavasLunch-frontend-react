import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CupSoda, Leaf, Receipt, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import type { DailyMenu, Dish } from '@/services/menus';
import { parseLocalDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import DishImage from '@/components/DishImage';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto: si cambian aquí, cambian en ambos
const CARD_CLASS = 'border-2 border-primary/20 shadow-xl overflow-hidden';
const HEADER_CLASS = 'px-4 py-3 space-y-1 border-b-2 border-primary/20 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15';
const BODY_CLASS = 'p-4 space-y-3';
const HERO_CLASS = 'h-32';
const ROW_CLASS = 'flex items-center gap-3 px-3 py-2 rounded-xl';
const ROW_HEIGHT = 'h-[68px]';
const TOTAL_CLASS = 'flex items-center justify-between px-3 py-2.5 rounded-xl';

const DishRow = ({
  icon: Icon,
  label,
  dish,
  highlighted = false,
}: {
  icon: LucideIcon;
  label: string;
  dish: Dish;
  highlighted?: boolean;
}) => (
  <div className={cn(ROW_CLASS, highlighted ? 'bg-primary/5 border-2 border-primary/20' : 'bg-accent/5 border border-accent/20')}>
    <span className="flex bg-primary/20 p-1.5 rounded-lg text-primary shrink-0">
      <Icon className="w-4 h-4" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] leading-4 font-bold text-primary uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold leading-snug">{dish.name}</p>
      <p className="text-xs text-muted-foreground truncate" title={dish.description}>{dish.description}</p>
    </div>
  </div>
);

// Detalles del menú que se va a reservar
export default function MenuSummaryCard({ menu }: { menu: DailyMenu }) {
  return (
    <Card className={CARD_CLASS}>
      <div className={HEADER_CLASS}>
        <div className="flex items-center gap-3">
          <span className="flex bg-primary/20 p-1.5 rounded-lg text-primary">
            <Receipt className="w-4 h-4" />
          </span>
          <h1 className="text-lg font-semibold text-primary">Detalles del Menú</h1>
        </div>
        <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground first-letter:uppercase">
          <Clock className="w-4 h-4" />
          {format(parseLocalDate(menu.date), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>

      <div className={BODY_CLASS}>
        {menu.main_dish && (
          <div className="relative rounded-xl overflow-hidden border-2 border-primary/30">
            <DishImage dish={menu.main_dish} className={cn(HERO_CLASS, 'rounded-none')} />
            <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <p className="text-white text-lg font-bold">{menu.main_dish.name}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {menu.appetizer && <DishRow icon={Leaf} label="Entrada" dish={menu.appetizer} />}
          {menu.main_dish && <DishRow icon={UtensilsCrossed} label="Plato Principal" dish={menu.main_dish} highlighted />}
          {menu.drink && <DishRow icon={CupSoda} label="Bebida" dish={menu.drink} />}
        </div>

        <div className="pt-2.5 border-t-2 border-dashed">
          <div className={cn(TOTAL_CLASS, 'bg-gradient-to-r from-primary/10 to-accent/10')}>
            <span className="font-semibold">Precio Total:</span>
            <span className="text-2xl font-bold text-primary">S/ {Number(menu.price).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Esqueleto de MenuSummaryCard: misma estructura y medidas que la tarjeta
export function MenuSummaryCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-busy="true" aria-label="Cargando menú">
      <div className={HEADER_CLASS}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg bg-background/60" />
          <Skeleton className="h-7 w-48 bg-background/60" />
        </div>
        <Skeleton className="h-5 w-56 bg-background/60" />
      </div>

      <div className={BODY_CLASS}>
        <Skeleton className={cn(HERO_CLASS, 'w-full rounded-xl')} />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className={cn(ROW_HEIGHT, 'w-full rounded-2xl')} />
          ))}
        </div>
        <div className="pt-2.5 border-t-2 border-dashed">
          <Skeleton className="h-[52px] w-full rounded-xl" />
        </div>
      </div>
    </Card>
  );
}
