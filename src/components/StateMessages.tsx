import type { LucideIcon } from 'lucide-react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Variante compacta (dentro de ventanas) o a pantalla completa (listas)
const box = (compact: boolean) => cn('px-6 text-center border-2 border-dashed rounded-2xl', compact ? 'py-8' : 'py-16');
const iconSize = (compact: boolean) => cn('mx-auto mb-3 text-muted-foreground', compact ? 'w-10 h-10' : 'w-16 h-16 mb-4');

// Falla al cargar: con salida para reintentar
export function ErrorState({ title, onRetry, compact = false }: { title: string; onRetry: () => void; compact?: boolean }) {
  return (
    <div className={box(compact)} role="alert">
      <WifiOff className={iconSize(compact)} />
      <p className={cn('font-semibold', compact ? 'text-base' : 'text-lg')}>{title}</p>
      <p className="text-sm text-muted-foreground mt-1">No hay conexión con el servidor. Inténtalo nuevamente.</p>
      <Button variant="outline" className={compact ? 'mt-4' : 'mt-6'} onClick={onRetry}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Reintentar
      </Button>
    </div>
  );
}

// Sin resultados: siempre ofrece una salida en lugar de dejar al usuario en un callejón sin salida
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  compact?: boolean;
}) {
  return (
    <div className={box(compact)}>
      <Icon className={iconSize(compact)} />
      <p className={cn('font-semibold', compact ? 'text-base' : 'text-lg')}>{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      {action && (
        <Button variant="outline" className={compact ? 'mt-4' : 'mt-6'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
