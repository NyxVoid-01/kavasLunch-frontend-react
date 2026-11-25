import { BarChart3 } from 'lucide-react';
import type { SalesGroup, SalesPoint } from '@/services/admin';
import { periodLabel } from '@/lib/exportReport';
import { EmptyState } from '@/components/StateMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TITLES: Record<SalesGroup, string> = {
  day: 'Ventas por día',
  week: 'Ventas por semana',
  month: 'Ventas por mes',
};

// Medidas compartidas entre el gráfico y su esqueleto
const ROW_CLASS = 'grid grid-cols-[110px_1fr_auto] items-center gap-3 sm:grid-cols-[150px_1fr_auto]';
const BAR_HEIGHT = 'h-5';
const SKELETON_ROWS = 5;
// Con muchos períodos la tarjeta se desplaza por dentro en vez de alargar la página
const LIST_CLASS = 'space-y-2 max-h-[360px] overflow-y-auto pr-1';

// Barras proporcionales al ingreso de cada período
export default function SalesChartCard({ sales, groupBy }: { sales: SalesPoint[]; groupBy: SalesGroup }) {
  const max = Math.max(...sales.map((s) => s.total_revenue), 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{TITLES[groupBy]}</CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <EmptyState compact icon={BarChart3} title="Sin ventas en este período" description="Solo cuentan las reservas vigentes y entregadas." />
        ) : (
          <ul className={LIST_CLASS}>
            {sales.map((point) => (
              <li key={point.period} className={ROW_CLASS}>
                <span className="text-sm text-muted-foreground truncate">{periodLabel(point.period, groupBy)}</span>
                <div
                  className={`${BAR_HEIGHT} rounded bg-muted`}
                  role="img"
                  aria-label={`${point.total_reservations} reservas, S/ ${point.total_revenue.toFixed(2)}`}
                >
                  <div
                    className="h-full rounded bg-primary"
                    style={{ width: `${max > 0 ? Math.max((point.total_revenue / max) * 100, 2) : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-right whitespace-nowrap">
                  S/ {point.total_revenue.toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">({point.total_reservations})</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// Esqueleto de SalesChartCard: mismo contenedor y filas
export function SalesChartCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader className="pb-2">
        <Skeleton className="h-7 w-40" />
      </CardHeader>
      <CardContent>
        <div className={LIST_CLASS}>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div key={i} className={ROW_CLASS}>
              <Skeleton className="h-5 w-24" />
              <Skeleton className={BAR_HEIGHT} style={{ width: `${90 - i * 15}%` }} />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
