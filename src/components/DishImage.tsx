import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DishImageProps {
  dish?: { name: string; image_url?: string | null } | null;
  className?: string;
  imgClassName?: string;
}

// Foto del plato. Si no tiene imagen o falla la carga, muestra un recuadro con su nombre.
export default function DishImage({ dish, className, imgClassName }: DishImageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = dish?.image_url || '';
  const showImage = !!url && failedUrl !== url;

  return (
    <div
      className={cn(
        'img-placeholder relative w-full overflow-hidden rounded-2xl flex items-center justify-center text-center text-sm font-medium text-muted-foreground',
        className
      )}
    >
      {showImage ? (
        <img
          src={url}
          alt={dish?.name ?? ''}
          loading="lazy"
          onError={() => setFailedUrl(url)}
          className={cn('absolute inset-0 w-full h-full object-cover', imgClassName)}
        />
      ) : (
        <span className="flex flex-col items-center gap-2 p-2">
          <UtensilsCrossed className="w-6 h-6" />
          {dish?.name ?? 'Plato'}
        </span>
      )}
    </div>
  );
}
