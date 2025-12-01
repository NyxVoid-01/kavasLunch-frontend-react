import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, LogOut, User, ShieldCheck, History, Home, UserCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-primary border-b-4 border-accent shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(user ? '/menus/user' : '/menus')}>
            <div className="bg-accent text-primary p-3 rounded-xl shadow-md hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-accent tracking-tight">KAVAS-LUNCH</h1>
              <p className="text-xs text-primary-foreground/90 font-medium">Comedor Universitario UPCH</p>
            </div>
          </div>
          
          {/* Navigation and User Info */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Button
                  variant={location.pathname === '/menus/user' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/menus/user')}
                  className={location.pathname === '/menus/user' ? 'bg-accent text-primary hover:bg-accent/90' : 'text-primary-foreground hover:bg-primary-foreground/10'}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Menús
                </Button>

                {user?.role !== 'admin' && (
                  <>
                    <Button
                      variant={location.pathname === '/reservations' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => navigate('/reservations')}
                      className={location.pathname === '/reservations' ? 'bg-accent text-primary hover:bg-accent/90' : 'text-primary-foreground hover:bg-primary-foreground/10'}
                    >
                      <History className="w-4 h-4 mr-2" />
                      Mis Reservas
                    </Button>
                    
                    <Button
                      variant={location.pathname === '/profile' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => navigate('/profile')}
                      className={location.pathname === '/profile' ? 'bg-accent text-primary hover:bg-accent/90' : 'text-primary-foreground hover:bg-primary-foreground/10'}
                    >
                      <UserCircle className="w-4 h-4 mr-2" />
                      Perfil
                    </Button>
                  </>
                )}

                {user?.role === 'admin' && (
                  <Button
                    variant={location.pathname.startsWith('/admin') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className={location.pathname.startsWith('/admin') ? 'bg-accent text-primary hover:bg-accent/90' : 'text-primary-foreground hover:bg-primary-foreground/10'}
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}

                {user && (
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg border border-accent/30">
                    {user.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-accent" />
                    ) : (
                      <User className="w-4 h-4 text-accent" />
                    )}
                    <span className="text-sm font-medium text-primary-foreground">{user.full_name}</span>
                    {user.role === 'admin' && (
                      <Badge className="ml-2 bg-accent text-primary">Admin</Badge>
                    )}
                  </div>
                )}

                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={logout}
                  className="bg-accent text-primary hover:bg-accent/90 font-semibold shadow-md"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
