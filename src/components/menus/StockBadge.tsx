import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const LOW_STOCK_THRESHOLD = 10;

// Disponibilidad de un menú: verde con más de 10 porciones, ámbar con pocas, rojo agotado
export default function StockBadge({ stock, className }: { stock: number; className?: string }) {
  if (stock <= 0) {
    return <Badge className={cn('bg-destructive text-destructive-foreground hover:bg-destructive', className)}>AGOTADO</Badge>;
  }

  const isLow = stock <= LOW_STOCK_THRESHOLD;
  return (
    <Badge
      variant="outline"
      className={cn(
        'whitespace-nowrap',
        isLow ? 'bg-warning/20 text-[#92400E] border-warning/50' : 'bg-success/20 text-[#15803D] border-success/50',
        className
      )}
    >
      {stock} disponibles
    </Badge>
  );
}
