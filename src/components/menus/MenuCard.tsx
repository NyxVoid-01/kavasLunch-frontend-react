import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Eye, Info, UtensilsCrossed } from 'lucide-react';
import type { DailyMenu, Dish } from '@/services/menus';
import { parseLocalDate } from '@/lib/dates';
import { getReservationAvailability } from '@/lib/reservationRules';
import { cn } from '@/lib/utils';
import DishImage from '@/components/DishImage';
import StockBadge from '@/components/menus/StockBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto: si cambian aquí, cambian en ambos
const CARD_CLASS = 'overflow-hidden border-2 border-primary/20 flex flex-col';
const HEADER_CLASS = 'px-4 py-3 border-b-2 border-accent/30 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5';
const BODY_CLASS = 'p-4 space-y-3 flex flex-col flex-grow';
const IMAGE_CLASS = 'h-36';
const DISH_LIST_CLASS = 'space-y-1.5';
const BUTTON_ROW_CLASS = 'grid grid-cols-2 gap-2';
const BUTTON_HEIGHT = 'h-11';

interface MenuCardProps {
  menu: DailyMenu;
  onReserve: (menu: DailyMenu) => void;
  onDetail: (menu: DailyMenu) => void;
}

const DISHES: { key: 'appetizer' | 'main_dish' | 'drink'; label: string; tint: string }[] = [
  { key: 'appetizer', label: 'Entrada', tint: 'bg-accent/5' },
  { key: 'main_dish', label: 'Plato Principal', tint: 'bg-primary/5' },
  { key: 'drink', label: 'Bebida', tint: 'bg-accent/5' },
];

// Tarjeta compacta de un menú: foto del plato principal y nombres de los platos.
// Las descripciones completas se ven con "Ver detalle".
export default function MenuCard({ menu, onReserve, onDetail }: MenuCardProps) {
  const availability = getReservationAvailability(menu);
  const dishes = DISHES.map((d) => ({ ...d, dish: menu[d.key] as Dish | null })).filter((d) => d.dish);
  const soldOut = menu.stock <= 0;

  return (
    <Card className={cn(CARD_CLASS, 'group transition-all hover:-translate-y-1 hover:shadow-xl')}>
      <div className={HEADER_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-primary min-w-0">
            <Calendar className="w-4 h-4 shrink-0" />
            <h3 className="font-bold first-letter:uppercase truncate">
              {format(parseLocalDate(menu.date), 'EEEE', { locale: es })}
            </h3>
          </div>
          <StockBadge stock={menu.stock} />
        </div>
        <div className="flex items-end justify-between gap-2 mt-1">
          <p className="text-xs font-medium text-muted-foreground">
            {format(parseLocalDate(menu.date), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
          <p className="text-2xl font-bold text-primary leading-none">S/ {Number(menu.price).toFixed(2)}</p>
        </div>
      </div>

      <div className={BODY_CLASS}>
        {menu.main_dish && (
          <DishImage
            dish={menu.main_dish}
            className={IMAGE_CLASS}
            imgClassName="transition-transform duration-300 group-hover:scale-110"
          />
        )}

        <div className={DISH_LIST_CLASS}>
          {dishes.map(({ key, label, tint, dish }) => (
            <div key={key} className={cn('flex items-start gap-2.5 px-2 py-1.5 rounded-xl', tint)}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] leading-4 font-bold text-primary uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold truncate">{dish!.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-2">
          {/* Motivo cuando aún no se puede reservar (p. ej. "Se reserva desde el lunes 16") */}
          {!availability.canReserve && !soldOut && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 shrink-0" />
              {availability.label}
            </p>
          )}
          <div className={BUTTON_ROW_CLASS}>
            <Button
              className={cn(BUTTON_HEIGHT, 'font-semibold bg-gradient-to-r from-primary to-[#AE4747] hover:from-[#8A1616] hover:to-[#9E4040]')}
              disabled={!availability.canReserve}
              onClick={() => onReserve(menu)}
            >
              {availability.canReserve && <UtensilsCrossed className="w-4 h-4 mr-2" />}
              {availability.canReserve ? 'Reservar' : soldOut ? 'Agotado' : 'No disponible'}
            </Button>
            <Button variant="outline" className={cn(BUTTON_HEIGHT, 'font-semibold')} onClick={() => onDetail(menu)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver detalle
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Esqueleto de MenuCard: misma estructura y medidas. Es el único esqueleto de esta tarjeta,
// así que lo usan todas las pantallas que la muestran.
export function MenuCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-hidden="true">
      <div className={HEADER_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-24 bg-background/60" />
          <Skeleton className="h-6 w-24 rounded-full bg-background/60" />
        </div>
        <div className="flex items-end justify-between gap-2 mt-1">
          <Skeleton className="h-4 w-32 bg-background/60" />
          <Skeleton className="h-6 w-24 bg-background/60" />
        </div>
      </div>

      <div className={BODY_CLASS}>
        <Skeleton className={cn(IMAGE_CLASS, 'w-full rounded-2xl')} />
        <div className={DISH_LIST_CLASS}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
        <div className={cn('mt-auto', BUTTON_ROW_CLASS)}>
          <Skeleton className={BUTTON_HEIGHT} />
          <Skeleton className={BUTTON_HEIGHT} />
        </div>
      </div>
    </Card>
  );
}
