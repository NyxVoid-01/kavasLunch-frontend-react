import type { LucideIcon } from 'lucide-react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Falla al cargar: con salida para reintentar
export function ErrorState({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div className="py-16 px-6 text-center border-2 border-dashed rounded-2xl" role="alert">
      <WifiOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground mt-2">No hay conexión con el servidor. Inténtalo nuevamente.</p>
      <Button variant="outline" className="mt-6" onClick={onRetry}>
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
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="py-16 px-6 text-center border-2 border-dashed rounded-2xl">
      <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
      {action && (
        <Button variant="outline" className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
