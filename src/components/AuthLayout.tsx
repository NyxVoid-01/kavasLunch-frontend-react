import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import UpchLogo from '@/components/UpchLogo';
import Footer from '@/components/Footer';

// Marco común de las pantallas de acceso: logo, título, contenido centrado y pie
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <main className="w-full max-w-md mx-auto px-4 py-12 space-y-6 flex-grow flex flex-col justify-center">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Link to="/" aria-label="Ir al inicio" className="flex">
              <UpchLogo className="h-24" />
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-primary">KAVAS-LUNCH</h1>
          <p className="text-muted-foreground">Sistema de Reservas del Comedor Universitario UPCH</p>
        </div>

        {children}
      </main>
      <Footer />
    </div>
  );
}
