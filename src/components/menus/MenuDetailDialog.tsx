import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CupSoda, Info, Leaf, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import type { DailyMenu, Dish } from '@/services/menus';
import { parseLocalDate } from '@/lib/dates';
import { getReservationAvailability } from '@/lib/reservationRules';
import DishImage from '@/components/DishImage';
import StockBadge from '@/components/menus/StockBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MenuDetailDialogProps {
  menu: DailyMenu | null;
  onClose: () => void;
  onReserve: (menu: DailyMenu) => void;
}

const DishRow = ({ icon: Icon, label, dish }: { icon: LucideIcon; label: string; dish: Dish }) => (
  <div className="flex gap-3 p-2 rounded-xl bg-muted/60">
    <DishImage dish={dish} className="w-14 h-14 shrink-0 rounded-lg text-[0px] [&_svg]:w-4 [&_svg]:h-4" />
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[11px] leading-4 font-bold text-primary uppercase tracking-wide">
        <Icon className="w-3 h-3" />
        {label}
      </p>
      <p className="text-sm font-semibold">{dish.name}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{dish.description}</p>
    </div>
  </div>
);

// Detalle de un menú (RF-005): imagen ampliada, platos con descripción, precio, stock y botón de reserva.
// El botón queda fijo abajo para que siempre se vea sin desplazarse.
export default function MenuDetailDialog({ menu, onClose, onReserve }: MenuDetailDialogProps) {
  const availability = menu ? getReservationAvailability(menu) : null;

  return (
    <Dialog open={!!menu} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl flex flex-col">
        {menu && availability && (
          <>
            <DialogHeader className="px-5 pt-5 pb-3 pr-12 text-left space-y-1">
              <DialogTitle className="text-xl text-primary first-letter:uppercase">
                {format(parseLocalDate(menu.date), "EEEE, d 'de' MMMM", { locale: es })}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-bold text-primary">S/ {Number(menu.price).toFixed(2)}</span>
                <StockBadge stock={menu.stock} />
              </DialogDescription>
            </DialogHeader>

            <div className="px-5 pb-4 space-y-3 overflow-y-auto">
              {menu.main_dish && (
                <div className="relative rounded-xl overflow-hidden border-2 border-primary/30">
                  <DishImage dish={menu.main_dish} className="h-40 rounded-none" />
                  <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                    <p className="text-white font-bold">{menu.main_dish.name}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {menu.appetizer && <DishRow icon={Leaf} label="Entrada" dish={menu.appetizer} />}
                {menu.main_dish && <DishRow icon={UtensilsCrossed} label="Plato Principal" dish={menu.main_dish} />}
                {menu.drink && <DishRow icon={CupSoda} label="Bebida" dish={menu.drink} />}
              </div>

              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 mt-px shrink-0" />
                Las reservas se hacen para hoy o mañana, de lunes a viernes, hasta las 15:00.
              </p>
            </div>

            <div className="px-5 py-3 border-t bg-background">
              <Button
                className="w-full h-11 font-semibold bg-gradient-to-r from-primary to-[#AE4747] hover:from-[#8A1616] hover:to-[#9E4040]"
                disabled={!availability.canReserve}
                onClick={() => onReserve(menu)}
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                {availability.label}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
