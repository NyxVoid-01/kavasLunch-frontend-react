import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, CalendarX, CupSoda, Leaf, RefreshCw, UtensilsCrossed, WifiOff, type LucideIcon } from 'lucide-react';
import type { DailyMenu, Dish } from '@/services/menus';
import { parseLocalDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import DishImage from '@/components/DishImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto: si cambian aquí, cambian en ambos
const CARD_CLASS = 'overflow-hidden border-2 border-primary/20 shadow-2xl';
const HEADER_CLASS = 'p-4 space-y-1 bg-gradient-to-br from-primary/15 to-accent/25 border-b-2 border-accent/30';
const BODY_CLASS = 'p-4';
const SECTION_CLASS = 'space-y-1.5 py-2.5 first:pt-0';
const IMAGE_CLASS = 'h-32';
const BUTTON_CLASS = 'w-full mt-2 h-11';

const MenuSection = ({ icon: Icon, label, dish, withImage = false }: { icon: LucideIcon; label: string; dish: Dish; withImage?: boolean }) => (
  <div className={SECTION_CLASS}>
    <p className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </p>
    {withImage && <DishImage dish={dish} className={IMAGE_CLASS} />}
    <p className="font-semibold">{dish.name}</p>
    <p className="text-xs text-muted-foreground">{dish.description}</p>
  </div>
);

// Tarjeta "Menú del Día" del inicio: el menú de hoy o, si hoy no hay, el próximo publicado
export default function TodayMenuCard({ menu, isToday }: { menu: DailyMenu; isToday: boolean }) {
  return (
    <Card className={CARD_CLASS}>
      <CardHeader className={HEADER_CLASS}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <CardTitle className="text-lg text-primary first-letter:uppercase truncate">
              {format(parseLocalDate(menu.date), 'EEEE, d MMM', { locale: es })}
            </CardTitle>
            {!isToday && <Badge className="shrink-0 bg-accent text-primary hover:bg-accent">Próximo menú</Badge>}
          </div>
          <span className="text-2xl font-bold text-primary whitespace-nowrap">S/ {Number(menu.price).toFixed(2)}</span>
        </div>
        <CardDescription className="text-sm">
          {menu.stock > 0 ? `${menu.stock} porciones disponibles` : 'Agotado'}
        </CardDescription>
      </CardHeader>
      <CardContent className={BODY_CLASS}>
        <div className="divide-y">
          {menu.appetizer && <MenuSection icon={Leaf} label="Entrada" dish={menu.appetizer} />}
          {menu.main_dish && <MenuSection icon={UtensilsCrossed} label="Plato Principal" dish={menu.main_dish} withImage />}
          {menu.drink && <MenuSection icon={CupSoda} label="Bebida" dish={menu.drink} />}
        </div>
        <Button
          asChild
          className={cn(BUTTON_CLASS, 'text-base bg-gradient-to-r from-primary to-[#B4530A] hover:from-[#8A1616] hover:to-[#9E4A09]')}
        >
          <Link to="/menus">
            Ver Todos los Menús <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Esqueleto de TodayMenuCard: misma estructura y medidas que la tarjeta
export function TodayMenuCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-busy="true" aria-label="Cargando menú">
      <CardHeader className={HEADER_CLASS}>
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-7 w-40 bg-background/60" />
          <Skeleton className="h-8 w-24 bg-background/60" />
        </div>
        <Skeleton className="h-5 w-44 bg-background/60" />
      </CardHeader>
      <CardContent className={BODY_CLASS}>
        <div className="divide-y">
          {[false, true, false].map((withImage, i) => (
            <div key={i} className={SECTION_CLASS}>
              <Skeleton className="h-4 w-28" />
              {withImage && <Skeleton className={cn(IMAGE_CLASS, 'w-full rounded-2xl')} />}
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
        <Skeleton className={BUTTON_CLASS} />
      </CardContent>
    </Card>
  );
}

// Tarjeta para cuando no hay menú que mostrar: sin conexión o sin menús publicados
export function TodayMenuCardMessage({ kind, onRetry }: { kind: 'error' | 'empty'; onRetry: () => void }) {
  const isError = kind === 'error';
  const Icon = isError ? WifiOff : CalendarX;

  return (
    <Card className={CARD_CLASS}>
      <CardContent className="p-6 pt-8 text-center" role={isError ? 'alert' : undefined}>
        <Icon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-lg font-semibold">{isError ? 'No se pudo cargar el menú' : 'Aún no hay menú publicado'}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {isError
            ? 'No hay conexión con el servidor. Inténtalo nuevamente en unos momentos.'
            : 'Vuelve pronto para ver el menú del comedor'}
        </p>
        {isError ? (
          <Button variant="outline" className={cn(BUTTON_CLASS, 'mt-5')} onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
          </Button>
        ) : (
          <Button asChild variant="outline" className={cn(BUTTON_CLASS, 'mt-5')}>
            <Link to="/menus">
              Ver Todos los Menús <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
