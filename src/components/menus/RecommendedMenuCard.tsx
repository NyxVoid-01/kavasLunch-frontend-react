import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DailyMenu } from '@/services/menus';
import { parseLocalDate } from '@/lib/dates';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto: si cambian aquí, cambian en ambos
const CARD_CLASS = 'bg-card rounded-2xl border-2 border-primary/30 px-3 py-2.5 space-y-1.5';
const ROW_CLASS = 'flex items-center gap-2 h-6';

interface RecommendedMenuCardProps {
  menu: DailyMenu;
  rank: number;
  onSelect: (menu: DailyMenu) => void;
}

// Tarjeta de "Recomendados de la Semana" en dos líneas: abre el detalle del menú
//   [Top 1]  Lunes 16 de nov                  S/ 12.00
//   • Pollo a la Plancha            [50 disponibles]
export default function RecommendedMenuCard({ menu, rank, onSelect }: RecommendedMenuCardProps) {
  const dateLabel = format(parseLocalDate(menu.date), "EEEE d 'de' MMM", { locale: es });

  return (
    <button
      type="button"
      onClick={() => onSelect(menu)}
      className={`${CARD_CLASS} block w-full text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      <div className={ROW_CLASS}>
        <Badge className="shrink-0 bg-primary text-primary-foreground hover:bg-primary">Top {rank}</Badge>
        <span className="flex-1 min-w-0 truncate text-sm font-semibold first-letter:uppercase" title={dateLabel}>
          {dateLabel}
        </span>
        <span className="shrink-0 text-lg font-bold text-primary leading-none">S/ {Number(menu.price).toFixed(2)}</span>
      </div>
      <div className={ROW_CLASS}>
        <span className="flex-1 min-w-0 flex items-center gap-2 text-sm font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          <span className="truncate" title={menu.main_dish?.name}>{menu.main_dish?.name}</span>
        </span>
        <Badge variant="outline" className="shrink-0 border-success text-[#15803D]">
          {menu.stock} disponibles
        </Badge>
      </div>
    </button>
  );
}

// Esqueleto de RecommendedMenuCard: misma estructura y medidas que la tarjeta
export function RecommendedMenuCardSkeleton() {
  return (
    <div className={CARD_CLASS} aria-hidden="true">
      <div className={ROW_CLASS}>
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-5 flex-1" />
        <Skeleton className="h-[18px] w-16" />
      </div>
      <div className={ROW_CLASS}>
        <Skeleton className="h-5 flex-1" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}
