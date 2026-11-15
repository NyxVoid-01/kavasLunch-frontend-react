import type { ComponentType } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminLayout, { DesktopOnlyNotice } from '@/components/admin/AdminLayout';
import { findAdminSection, type AdminSectionId } from '@/components/admin/adminSections';
import Dashboard from '@/components/admin/Dashboard';
import DeliverySystem from '@/components/admin/DeliverySystem';
import DishesManagement from '@/components/admin/DishesManagement';
import MenusManagement from '@/components/admin/MenusManagement';
import SalesReports from '@/components/admin/SalesReports';

const SECTION_COMPONENTS: Record<AdminSectionId, ComponentType> = {
  dashboard: Dashboard,
  dishes: DishesManagement,
  menus: MenusManagement,
  delivery: DeliverySystem,
  reports: SalesReports,
};

// Panel de administración. La ruta ya exige rol de administrador (ProtectedRoute).
export default function Admin() {
  const [searchParams] = useSearchParams();
  const section = findAdminSection(searchParams.get('view'));
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const Section = SECTION_COMPONENTS[section.id];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        {isDesktop ? (
          <AdminLayout active={section}>
            <Section />
          </AdminLayout>
        ) : (
          <DesktopOnlyNotice />
        )}
      </main>
      <Footer />
    </div>
  );
}
