import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

// Página no encontrada: ofrece volver al inicio según la sesión
const NotFound = () => {
  const { user } = useAuth();
  const home = user ? (user.role === 'admin' ? '/admin' : '/menus/user') : '/menus';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <SearchX className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
          <p className="text-5xl font-bold text-primary">404</p>
          <h1 className="mt-2 text-xl font-semibold">No encontramos esta página</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Es posible que el enlace esté mal escrito o que la página ya no exista.
          </p>
          <Button asChild className="mt-6 h-11 font-semibold">
            <Link to={home}>
              <Home className="w-4 h-4 mr-2" />
              {user ? 'Volver a mi inicio' : 'Ver los menús'}
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
