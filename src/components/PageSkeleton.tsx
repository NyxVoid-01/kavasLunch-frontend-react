import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MenuGridSkeleton } from '@/components/menus/MenusState';
import { Skeleton } from '@/components/ui/skeleton';

// Esqueleto genérico de pantalla: cabecera, título y tarjetas. Se usa cuando aún no se sabe qué pantalla se va a mostrar.
export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col" aria-busy="true" aria-label="Cargando">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>
        <MenuGridSkeleton />
      </main>
      <Footer />
    </div>
  );
}
