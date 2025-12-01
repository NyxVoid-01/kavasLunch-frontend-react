import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldCheck, UtensilsCrossed, CalendarDays, Package, BarChart3, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Dashboard from '@/components/admin/Dashboard';
import DishesManagement from '@/components/admin/DishesManagement';
import MenusManagement from '@/components/admin/MenusManagement';
import DeliverySystem from '@/components/admin/DeliverySystem';
import SalesReports from '@/components/admin/SalesReports';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'dashboard';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/menus/user');
      return;
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, component: Dashboard },
    { id: 'dishes', label: 'Platos', icon: UtensilsCrossed, component: DishesManagement },
    { id: 'menus', label: 'Menús Diarios', icon: CalendarDays, component: MenusManagement },
    { id: 'delivery', label: 'Despacho', icon: Package, component: DeliverySystem },
    { id: 'reports', label: 'Reportes', icon: BarChart3, component: SalesReports },
  ];

  const CurrentComponent = modules.find(m => m.id === currentView)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Button
          variant="ghost"
          onClick={() => navigate('/menus/user')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Menús
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Panel de Administración</h1>
          </div>
          <p className="text-muted-foreground">Gestión completa del sistema KAVAS-LUNCH</p>
        </div>

        {/* Navigation Cards */}
        {currentView === 'dashboard' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {modules.slice(1).map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.id}
                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                  onClick={() => setSearchParams({ view: module.id })}
                >
                  <div className="p-6 flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{module.label}</h3>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Back to Dashboard button when in a module */}
        {currentView !== 'dashboard' && (
          <Button
            variant="outline"
            onClick={() => setSearchParams({ view: 'dashboard' })}
            className="mb-6"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        )}

        {/* Current Module */}
        <CurrentComponent />
      </main>
      <Footer />
    </div>
  );
}
