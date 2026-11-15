import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, SearchX, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { deleteDish, getAllDishes, updateDish, type DishCategory } from '@/services/admin';
import type { Dish } from '@/services/menus';
import { getErrorMessage } from '@/lib/api';
import { CARD_GRID_COLUMNS } from '@/lib/layout';
import { cn } from '@/lib/utils';
import AdminToolbar from '@/components/admin/AdminToolbar';
import DishCard, { DishGridSkeleton } from '@/components/admin/dishes/DishCard';
import DishFormDialog from '@/components/admin/dishes/DishFormDialog';
import ChipGroup, { type ChipOption } from '@/components/ChipGroup';
import ConfirmDialog from '@/components/ConfirmDialog';
import PaginationBar from '@/components/PaginationBar';
import ResultsSummary from '@/components/ResultsSummary';
import { EmptyState, ErrorState } from '@/components/StateMessages';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 12;

type CategoryFilter = 'all' | DishCategory;

const CATEGORY_OPTIONS: ChipOption<CategoryFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'appetizer', label: 'Entradas' },
  { value: 'main', label: 'Principales' },
  { value: 'drink', label: 'Bebidas' },
];

// Gestión de platos (RF-009): catálogo con altas, ediciones, activar/desactivar y eliminación
export default function DishesManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  // undefined: cerrado · null: plato nuevo · Dish: edición
  const [editing, setEditing] = useState<Dish | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Dish | null>(null);

  const { data: dishes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'dishes'],
    queryFn: getAllDishes,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return dishes.filter(
      (dish) =>
        (category === 'all' || dish.category === category) &&
        (!term || dish.name.toLowerCase().includes(term) || dish.description?.toLowerCase().includes(term))
    );
  }, [dishes, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const refreshDishes = () => {
    ['admin', 'menus'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  const toggle = useMutation({
    mutationFn: (dish: Dish) => updateDish(dish.id, { is_active: !dish.is_active }),
    onSuccess: (dish) => {
      toast.success(`Plato ${dish.is_active ? 'activado' : 'desactivado'}`);
      refreshDishes();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (dish: Dish) => deleteDish(dish.id),
    onSuccess: () => {
      toast.success('Plato eliminado');
      setDeleting(null);
      refreshDishes();
    },
    onError: (error) => {
      // Si el plato está en un menú vigente, el backend lo explica y se sugiere desactivarlo
      toast.error(getErrorMessage(error), { description: 'Puedes desactivarlo en lugar de eliminarlo.' });
      setDeleting(null);
    },
  });

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Platos</h2>
          <p className="text-sm text-muted-foreground">Catálogo de entradas, platos principales y bebidas</p>
        </div>
        <Button className="h-10 font-semibold" onClick={() => setEditing(null)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plato
        </Button>
      </div>

      <AdminToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Buscar platos..."
      >
        <ChipGroup
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={(value) => {
            setCategory(value);
            setCurrentPage(1);
          }}
          ariaLabel="Categoría"
        />
      </AdminToolbar>

      {isLoading ? (
        <DishGridSkeleton className={CARD_GRID_COLUMNS} />
      ) : isError ? (
        <ErrorState title="No se pudieron cargar los platos" onRetry={() => refetch()} />
      ) : dishes.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Aún no hay platos"
          description="Crea el primer plato para poder armar menús"
          action={{ label: 'Crear plato', onClick: () => setEditing(null) }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No se encontraron platos"
          description="Prueba con otra búsqueda o categoría"
          action={{ label: 'Quitar filtros', onClick: clearFilters }}
        />
      ) : (
        <>
          <ResultsSummary count={filtered.length} singular="plato" plural="platos" />
          <div className={cn('grid gap-5', CARD_GRID_COLUMNS)}>
            {visible.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                busy={toggle.isPending && toggle.variables?.id === dish.id}
                onEdit={setEditing}
                onToggle={(d) => toggle.mutate(d)}
                onDelete={setDeleting}
              />
            ))}
          </div>
          <PaginationBar page={page} totalPages={totalPages} onChange={setCurrentPage} />
        </>
      )}

      {editing !== undefined && <DishFormDialog key={editing?.id ?? 'new'} dish={editing} onClose={() => setEditing(undefined)} />}

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar plato"
        description={
          <>
            ¿Estás seguro de eliminar <strong>{deleting?.name}</strong>? Esta acción no se puede deshacer.
          </>
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
