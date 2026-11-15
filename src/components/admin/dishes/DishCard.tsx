import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Dish } from '@/services/menus';
import { DISH_CATEGORY_LABELS, DISH_CATEGORY_STYLES } from '@/lib/labels';
import { cn } from '@/lib/utils';
import DishImage from '@/components/DishImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto: si cambian aquí, cambian en ambos
const CARD_CLASS = 'overflow-hidden border-2 border-primary/20 flex flex-col';
const BODY_CLASS = 'p-4 space-y-3 flex flex-col flex-grow';
const IMAGE_CLASS = 'h-28';
const ACTION_HEIGHT = 'h-10';

interface DishCardProps {
  dish: Dish;
  busy?: boolean;
  onEdit: (dish: Dish) => void;
  onToggle: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
}

// Tarjeta de un plato del catálogo: categoría, estado, precio y acciones
export default function DishCard({ dish, busy = false, onEdit, onToggle, onDelete }: DishCardProps) {
  return (
    <Card className={cn(CARD_CLASS, !dish.is_active && 'opacity-60')}>
      <div className={BODY_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug line-clamp-2">{dish.name}</h3>
          <p className="text-lg font-bold text-primary leading-6 whitespace-nowrap">S/ {Number(dish.price).toFixed(2)}</p>
        </div>

        <div className="flex gap-1.5">
          <Badge className={DISH_CATEGORY_STYLES[dish.category]}>{DISH_CATEGORY_LABELS[dish.category]}</Badge>
          <Badge variant={dish.is_active ? 'default' : 'secondary'}>{dish.is_active ? 'Activo' : 'Inactivo'}</Badge>
        </div>

        <DishImage dish={dish} className={IMAGE_CLASS} />

        <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">{dish.description}</p>

        <div className="mt-auto flex gap-2">
          <Button variant="outline" className={cn(ACTION_HEIGHT, 'flex-1 font-medium')} disabled={busy} onClick={() => onEdit(dish)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(ACTION_HEIGHT, 'w-10')}
            disabled={busy}
            onClick={() => onToggle(dish)}
            aria-label={dish.is_active ? `Desactivar ${dish.name}` : `Activar ${dish.name}`}
            title={dish.is_active ? 'Desactivar' : 'Activar'}
          >
            {dish.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className={cn(ACTION_HEIGHT, 'w-10')}
            disabled={busy}
            onClick={() => onDelete(dish)}
            aria-label={`Eliminar ${dish.name}`}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Esqueleto de DishCard: misma estructura y medidas que la tarjeta
export function DishCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-hidden="true">
      <div className={BODY_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-[22px] w-16 rounded-full" />
          <Skeleton className="h-[22px] w-14 rounded-full" />
        </div>
        <Skeleton className={cn(IMAGE_CLASS, 'w-full rounded-2xl')} />
        <Skeleton className="h-8 w-full" />
        <div className="mt-auto flex gap-2">
          <Skeleton className={cn(ACTION_HEIGHT, 'flex-1')} />
          <Skeleton className={cn(ACTION_HEIGHT, 'w-10')} />
          <Skeleton className={cn(ACTION_HEIGHT, 'w-10')} />
        </div>
      </div>
    </Card>
  );
}

export function DishGridSkeleton({ count = 3, className }: { count?: number; className: string }) {
  return (
    <div className={cn('grid gap-5', className)} aria-busy="true" aria-label="Cargando platos">
      {Array.from({ length: count }).map((_, i) => (
        <DishCardSkeleton key={i} />
      ))}
    </div>
  );
}
