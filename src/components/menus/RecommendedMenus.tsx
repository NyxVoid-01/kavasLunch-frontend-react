import { Sparkles, TrendingUp } from 'lucide-react';
import type { DailyMenu } from '@/services/menus';
import RecommendedMenuCard, { RecommendedMenuCardSkeleton } from '@/components/menus/RecommendedMenuCard';

// Cuántos menús se recomiendan
export const RECOMMENDED_COUNT = 3;

interface RecommendedMenusProps {
  menus: DailyMenu[];
  loading: boolean;
  onSelect: (menu: DailyMenu) => void;
}

// En pantallas angostas las tarjetas se deslizan en horizontal; en anchas se apilan en el panel lateral
const SLOT_CLASS = 'w-[270px] shrink-0 snap-start lg:w-auto';

// Panel "Recomendados de la Semana"
export default function RecommendedMenus({ menus, loading, onSelect }: RecommendedMenusProps) {
  return (
    <section
      aria-labelledby="recommended-title"
      className="rounded-2xl border-2 border-primary/20 p-4 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 id="recommended-title" className="flex items-center gap-1.5 font-semibold leading-tight">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            Recomendados de la Semana
          </h2>
          <p className="text-xs text-muted-foreground">Los menús más populares y con mayor disponibilidad</p>
        </div>
      </div>

      <div className="flex gap-2.5 overflow-x-auto snap-x pb-1 lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0">
        {loading
          ? Array.from({ length: RECOMMENDED_COUNT }).map((_, i) => (
              <div key={i} className={SLOT_CLASS}>
                <RecommendedMenuCardSkeleton />
              </div>
            ))
          : menus.map((menu, idx) => (
              <div key={menu.id} className={SLOT_CLASS}>
                <RecommendedMenuCard menu={menu} rank={idx + 1} onSelect={onSelect} />
              </div>
            ))}
      </div>
    </section>
  );
}
