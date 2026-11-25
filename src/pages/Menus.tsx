import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicMenus, MENUS_REFRESH_MS, type DailyMenu } from '@/services/menus';
import { isInDateFilter, type MenuDateFilter } from '@/lib/dates';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LOW_STOCK_THRESHOLD } from '@/components/menus/StockBadge';
import PaginationBar from '@/components/PaginationBar';
import MenuCard from '@/components/menus/MenuCard';
import MenuDetailDialog from '@/components/menus/MenuDetailDialog';
import MenuFilters, { type FilterOption } from '@/components/menus/MenuFilters';
import { MenuGridSkeleton, MenusEmpty, MenusError, MenusSummary } from '@/components/menus/MenusState';
import { CARD_GRID_COLUMNS } from '@/lib/layout';

// 12 llena filas completas con 2, 3 o 4 columnas de tarjetas
const ITEMS_PER_PAGE = 12;

type StockFilter = 'all' | 'available' | 'low-stock';

const DATE_OPTIONS: FilterOption<MenuDateFilter>[] = [
  { value: 'today-tomorrow', label: 'Hoy y Mañana' },
  { value: 'this-week', label: 'Esta Semana' },
  { value: 'next-week', label: 'Próxima Semana' },
  { value: 'all', label: 'Todos' },
];

const STOCK_OPTIONS: FilterOption<StockFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Solo Disponibles' },
  { value: 'low-stock', label: 'Pocas Unidades' },
];

export default function Menus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<MenuDateFilter>('today-tomorrow');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailMenu, setDetailMenu] = useState<DailyMenu | null>(null);

  // Página pública: no requiere sesión; se pide al intentar reservar
  const { data: allMenus = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['menus', 'public'],
    queryFn: () => getPublicMenus(),
    refetchInterval: MENUS_REFRESH_MS,
  });

  const menus = useMemo(
    () =>
      allMenus
        .filter((menu) => isInDateFilter(menu.date, dateFilter))
        .filter((menu) =>
          stockFilter === 'available' ? menu.stock > 0
          : stockFilter === 'low-stock' ? menu.stock > 0 && menu.stock <= LOW_STOCK_THRESHOLD
          : true
        ),
    [allMenus, dateFilter, stockFilter]
  );

  const totalPages = Math.max(1, Math.ceil(menus.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginatedMenus = menus.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const changeDate = (value: MenuDateFilter) => {
    setDateFilter(value);
    setCurrentPage(1);
  };
  const changeStock = (value: StockFilter) => {
    setStockFilter(value);
    setCurrentPage(1);
  };

  const showAll = () => {
    setCurrentPage(1);
    setDateFilter('all');
    setStockFilter('all');
  };

  const handleReserve = (menu: DailyMenu) => {
    if (!user) {
      toast.error('Debes iniciar sesión para reservar');
      navigate('/auth');
      return;
    }
    navigate(`/reserve/${menu.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Menús de la Semana</h1>
          <p className="text-muted-foreground">Reserva tu almuerzo con anticipación y recoge con tu código</p>
        </div>

        <div className="grid gap-6 items-start lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
          <aside className="lg:sticky lg:top-24">
            <MenuFilters
              date={dateFilter}
              dateOptions={DATE_OPTIONS}
              onDateChange={changeDate}
              stock={stockFilter}
              stockOptions={STOCK_OPTIONS}
              onStockChange={changeStock}
            />
          </aside>

          <section className="min-w-0" aria-label="Menús de la semana">
            {isLoading ? (
              <MenuGridSkeleton />
            ) : isError ? (
              <MenusError onRetry={() => refetch()} />
            ) : menus.length === 0 ? (
              <MenusEmpty onReset={showAll} />
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
