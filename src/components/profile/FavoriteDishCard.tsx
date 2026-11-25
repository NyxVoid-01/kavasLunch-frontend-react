import { Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto
const CARD_CLASS = 'border-2 border-primary/20 p-4';
const BOX_CLASS = 'rounded-xl px-4 py-3';

// "Tu plato favorito": el plato principal que más ha reservado el usuario
export default function FavoriteDishCard({ dish }: { dish: string }) {
  return (
    <Card className={CARD_CLASS}>
      <h2 className="flex items-center gap-2 mb-3 font-semibold">
        <Award className="w-5 h-5 text-primary" />
        Tu Plato Favorito
      </h2>
      <div className={`${BOX_CLASS} bg-gradient-to-r from-primary/10 to-accent/10`}>
        <p className="text-xl font-bold text-primary">{dish}</p>
        <p className="text-sm text-muted-foreground">El plato que más has ordenado</p>
      </div>
    </Card>
  );
}

// Esqueleto de FavoriteDishCard: misma estructura y medidas
export function FavoriteDishCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-hidden="true">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-36" />
      </div>
      <Skeleton className={`${BOX_CLASS} h-[68px] w-full`} />
    </Card>
  );
}
