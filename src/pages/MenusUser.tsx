import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserMenus, MENUS_REFRESH_MS, type DailyMenu } from '@/services/menus';
import { isInDateFilter, type MenuDateFilter } from '@/lib/dates';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaginationBar from '@/components/PaginationBar';
import MenuCard from '@/components/menus/MenuCard';
import MenuDetailDialog from '@/components/menus/MenuDetailDialog';
import MenuFilters, { type FilterOption } from '@/components/menus/MenuFilters';
import RecommendedMenus, { RECOMMENDED_COUNT } from '@/components/menus/RecommendedMenus';
import { MenuGridSkeleton, MenusEmpty, MenusError, MenusSummary } from '@/components/menus/MenusState';
import { CARD_GRID_COLUMNS } from '@/lib/layout';

// 12 llena filas completas con 2, 3 o 4 columnas de tarjetas
const ITEMS_PER_PAGE = 12;

type UserDateFilter = Exclude<MenuDateFilter, 'all'>;
type StockFilter = 'all' | 'available' | 'out';

const DATE_OPTIONS: FilterOption<UserDateFilter>[] = [
  { value: 'today-tomorrow', label: 'Hoy y Mañana' },
  { value: 'this-week', label: 'Esta Semana' },
  { value: 'next-week', label: 'Próxima Semana' },
];

const STOCK_OPTIONS: FilterOption<StockFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponibles' },
  { value: 'out', label: 'Agotados' },
];

export default function MenusUser() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<UserDateFilter>('today-tomorrow');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailMenu, setDetailMenu] = useState<DailyMenu | null>(null);
  // Mientras el usuario no toque los filtros, se elige la fecha más útil automáticamente
  const filtersTouched = useRef(false);

  // La ruta ya exige sesión (ProtectedRoute); el stock se refresca solo (RF-004)
  const { data: allMenus = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['menus', 'user'],
    queryFn: () => getUserMenus(),
    refetchInterval: MENUS_REFRESH_MS,
  });

  const changeDate = (value: UserDateFilter) => {
    filtersTouched.current = true;
    setDateFilter(value);
  };
  const changeStock = (value: StockFilter) => {
    filtersTouched.current = true;
    setStockFilter(value);
  };
  const showWholeWeek = () => {
    filtersTouched.current = true;
    setDateFilter('this-week');
    setStockFilter('all');
  };

  // Primera impresión útil: si hoy y mañana no hay menús (fin de semana, feriado), mostrar la semana que sí tiene
  useEffect(() => {
    if (filtersTouched.current || isLoading || allMenus.length === 0) return;
    if (allMenus.some((m) => isInDateFilter(m.date, 'today-tomorrow'))) return;
    const fallback = (['this-week', 'next-week'] as const).find((f) => allMenus.some((m) => isInDateFilter(m.date, f)));
    if (fallback) setDateFilter(fallback);
  }, [allMenus, isLoading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, stockFilter]);

  const menus = useMemo(
    () =>
      allMenus
        .filter((menu) => isInDateFilter(menu.date, dateFilter))
        .filter((menu) =>
          stockFilter === 'available' ? menu.stock > 0 : stockFilter === 'out' ? menu.stock === 0 : true
        ),
    [allMenus, dateFilter, stockFilter]
  );

  const totalPages = Math.max(1, Math.ceil(menus.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginatedMenus = menus.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Recomendados de la semana: no dependen de los filtros. Los 3 con más porciones; si la semana ya pasó, la próxima.
  const weekMenus = useMemo(() => {
    const thisWeek = allMenus.filter((m) => isInDateFilter(m.date, 'this-week'));
    return thisWeek.length > 0 ? thisWeek : allMenus.filter((m) => isInDateFilter(m.date, 'next-week'));
  }, [allMenus]);

  const recommendedMenus = useMemo(
    () => weekMenus.filter((m) => m.stock > 0).sort((a, b) => b.stock - a.stock).slice(0, RECOMMENDED_COUNT),
    [weekMenus]
  );

  // Si no hay más menús que los recomendados, el panel solo repetiría la lista y se oculta
  const showRecommended = isLoading || weekMenus.length > RECOMMENDED_COUNT;

  const handleReserve = (menu: DailyMenu) => navigate(`/reserve/${menu.id}`);


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <h1 className="inline-block text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-[#E0A100] bg-clip-text text-transparent">
            Menús Disponibles
          </h1>
          <p className="text-muted-foreground">Reserva tu almuerzo con anticipación y ahorra tiempo</p>
        </div>

        <div className="grid gap-6 items-start lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
          {/* Panel lateral: filtros y recomendados. Fijo al desplazarse en pantallas anchas */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <MenuFilters
              date={dateFilter}
              dateOptions={DATE_OPTIONS}
              onDateChange={changeDate}
              stock={stockFilter}
              stockOptions={STOCK_OPTIONS}
              onStockChange={changeStock}
            />
            {showRecommended && (
              <RecommendedMenus menus={recommendedMenus} loading={isLoading} onSelect={setDetailMenu} />
            )}
          </aside>

          {/* Resultados */}
          <section className="min-w-0" aria-label="Menús disponibles">
            {isLoading ? (
              <MenuGridSkeleton />
            ) : isError ? (
              <MenusError onRetry={() => refetch()} />
            ) : menus.length === 0 ? (
              <MenusEmpty onReset={showWholeWeek} />
            ) : (
              <>
                <MenusSummary count={menus.length} />
                <div className={cn('grid gap-5 mb-6', CARD_GRID_COLUMNS)}>
                  {paginatedMenus.map((menu) => (
                    <MenuCard key={menu.id} menu={menu} onReserve={handleReserve} onDetail={setDetailMenu} />
                  ))}
                </div>

                <PaginationBar page={page} totalPages={totalPages} onChange={setCurrentPage} />
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />

      <MenuDetailDialog menu={detailMenu} onClose={() => setDetailMenu(null)} onReserve={handleReserve} />
    </div>
  );
}
