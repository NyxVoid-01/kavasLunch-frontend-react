import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, CalendarDays, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { deleteMenu, getAllDishes, getAllMenus, updateMenuStock } from '@/services/admin';
import type { DailyMenu } from '@/services/menus';
import { getErrorMessage } from '@/lib/api';
import { parseLocalDate, todayISO } from '@/lib/dates';
import { CARD_GRID_COLUMNS } from '@/lib/layout';
import { cn } from '@/lib/utils';
import AdminToolbar from '@/components/admin/AdminToolbar';
import AdminMenuCard, { AdminMenuGridSkeleton } from '@/components/admin/menus/AdminMenuCard';
import MenuFormDialog from '@/components/admin/menus/MenuFormDialog';
import StockDialog from '@/components/admin/menus/StockDialog';
import ChipGroup, { type ChipOption } from '@/components/ChipGroup';
import ConfirmDialog from '@/components/ConfirmDialog';
import PaginationBar from '@/components/PaginationBar';
import ResultsSummary from '@/components/ResultsSummary';
import { EmptyState, ErrorState } from '@/components/StateMessages';
import { LOW_STOCK_THRESHOLD } from '@/components/menus/StockBadge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 12;

type RangeFilter = 'upcoming' | 'past' | 'all';

const RANGE_OPTIONS: ChipOption<RangeFilter>[] = [
  { value: 'upcoming', label: 'Próximos' },
  { value: 'past', label: 'Pasados' },
  { value: 'all', label: 'Todos' },
];

// Gestión de menús diarios (RF-010 y RF-011): publicar, editar, eliminar y controlar el stock
export default function MenusManagement() {
  const queryClient = useQueryClient();
  const [range, setRange] = useState<RangeFilter>('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  // undefined: cerrado · null: menú nuevo · DailyMenu: edición
  const [editing, setEditing] = useState<DailyMenu | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<DailyMenu | null>(null);
  const [stockMenuId, setStockMenuId] = useState<string | null>(null);

  const menusQuery = useQuery({ queryKey: ['admin', 'menus'], queryFn: getAllMenus });
  const dishesQuery = useQuery({ queryKey: ['admin', 'dishes'], queryFn: getAllDishes });
  const menus = useMemo(() => menusQuery.data ?? [], [menusQuery.data]);
  const today = todayISO();

  const filtered = useMemo(() => {
    const upcoming = menus.filter((m) => m.date >= today).sort((a, b) => a.date.localeCompare(b.date) || Number(a.price) - Number(b.price));
    const past = menus.filter((m) => m.date < today).sort((a, b) => b.date.localeCompare(a.date));
    return range === 'upcoming' ? upcoming : range === 'past' ? past : [...upcoming, ...past];
  }, [menus, range, today]);

  // Alerta de stock bajo (RF-011): menús próximos con pocas unidades o agotados
  const lowStock = useMemo(() => menus.filter((m) => m.date >= today && m.stock <= LOW_STOCK_THRESHOLD), [menus, today]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const stockMenu = menus.find((m) => m.id === stockMenuId) ?? null;

  const refresh = () => {
    ['admin', 'menus'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  const step = useMutation({
    mutationFn: ({ menu, delta }: { menu: DailyMenu; delta: number }) =>
      updateMenuStock(menu.id, menu.stock + delta, 'Ajuste rápido (±1)'),
    onSuccess: refresh,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (menu: DailyMenu) => deleteMenu(menu.id),
    onSuccess: () => {
      toast.success('Menú eliminado');
      setDeleting(null);
      refresh();
    },
    onError: (error) => {
      // Si ya tiene reservas, el backend lo explica y se sugiere dejar el stock en 0
      toast.error(getErrorMessage(error), { description: 'Puedes poner su stock en 0 para que no se pueda reservar.' });
      setDeleting(null);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Menús Diarios</h2>
          <p className="text-sm text-muted-foreground">Publica los menús de cada día y controla su stock</p>
        </div>
        <Button className="h-10 font-semibold" onClick={() => setEditing(null)} disabled={!dishesQuery.data}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Menú
        </Button>
      </div>

      {lowStock.length > 0 && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {lowStock.length} {lowStock.length === 1 ? 'menú con stock bajo' : 'menús con stock bajo'}
          </AlertTitle>
          <AlertDescription>
            {lowStock
              .slice(0, 6)
              .map((m) => `${format(parseLocalDate(m.date), "EEEE d", { locale: es })} (${m.stock <= 0 ? 'agotado' : m.stock})`)
              .join(' · ')}
            {lowStock.length > 6 && ' …'}
          </AlertDescription>
        </Alert>
      )}

      <AdminToolbar>
        <ChipGroup
          value={range}
          options={RANGE_OPTIONS}
          onChange={(value) => {
            setRange(value);
            setCurrentPage(1);
          }}
          ariaLabel="Fechas"
        />
      </AdminToolbar>

      {menusQuery.isLoading ? (
        <AdminMenuGridSkeleton className={CARD_GRID_COLUMNS} />
      ) : menusQuery.isError ? (
        <ErrorState title="No se pudieron cargar los menús" onRetry={() => menusQuery.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={menus.length === 0 ? 'Aún no hay menús' : range === 'past' ? 'No hay menús pasados' : 'No hay menús próximos'}
          description={menus.length === 0 || range === 'upcoming' ? 'Publica un menú para que los usuarios puedan reservar' : undefined}
          action={{ label: 'Nuevo menú', onClick: () => setEditing(null) }}
        />
      ) : (
        <>
          <ResultsSummary count={filtered.length} singular="menú" plural="menús" />
          <div className={cn('grid gap-5', CARD_GRID_COLUMNS)}>
            {visible.map((menu) => (
              <AdminMenuCard
                key={menu.id}
                menu={menu}
                past={menu.date < today}
                busy={step.isPending && step.variables?.menu.id === menu.id}
                onEdit={setEditing}
                onDelete={setDeleting}
                onStockStep={(m, delta) => step.mutate({ menu: m, delta })}
                onStockDetail={(m) => setStockMenuId(m.id)}
              />
            ))}
          </div>
          <PaginationBar page={page} totalPages={totalPages} onChange={setCurrentPage} />
        </>
      )}

      {editing !== undefined && dishesQuery.data && (
        <MenuFormDialog
          key={editing?.id ?? 'new'}
          menu={editing}
          menus={menus}
          dishes={dishesQuery.data}
          onClose={() => setEditing(undefined)}
        />
      )}
      {stockMenu && <StockDialog key={stockMenu.id} menu={stockMenu} onClose={() => setStockMenuId(null)} />}

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar menú"
        description={
          deleting && (
            <>
              ¿Eliminar el menú del{' '}
              <strong>{format(parseLocalDate(deleting.date), "EEEE d 'de' MMMM", { locale: es })}</strong>
              {deleting.main_dish ? ` (${deleting.main_dish.name})` : ''}? Esta acción no se puede deshacer.
            </>
          )
        }
        confirmLabel="Eliminar"
        busyLabel="Eliminando..."
        busy={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
