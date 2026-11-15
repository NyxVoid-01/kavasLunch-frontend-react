import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface AdminToolbarProps {
  // Si se omite, no se muestra el buscador
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  // Filtros (chips) que van junto al buscador
  children?: ReactNode;
}

// Barra de herramientas de las listas del panel: búsqueda y filtros en una sola línea
export default function AdminToolbar({ search, onSearchChange, searchPlaceholder, children }: AdminToolbarProps) {
  return (
    <Card className="flex flex-wrap items-center gap-3 border-2 border-primary/20 p-3">
      {onSearchChange && (
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}
      {children}
    </Card>
  );
}
