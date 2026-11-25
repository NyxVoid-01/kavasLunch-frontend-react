import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Medidas compartidas entre la tarjeta y su esqueleto
const CARD_CLASS = 'p-4';

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  caption: string;
  // Clase de color del valor (por ejemplo text-success)
  valueClassName?: string;
}

// Tarjeta de estadística (perfil, panel de administración y reportes)
export default function StatCard({ title, icon: Icon, value, caption, valueClassName = 'text-primary' }: StatCardProps) {
  return (
    <Card className={CARD_CLASS}>
      <div className="flex items-center justify-between pb-1.5">
        <h3 className="text-sm font-medium">{title}</h3>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className={cn('text-2xl font-bold leading-8', valueClassName)}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{caption}</p>
    </Card>
  );
}

// Esqueleto de StatCard: misma estructura y medidas
export function StatCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-hidden="true">
      <div className="flex items-center justify-between pb-1.5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-4 w-36 mt-1" />
    </Card>
  );
}
