import { BarChart3, CalendarDays, LayoutDashboard, Package, UtensilsCrossed, type LucideIcon } from 'lucide-react';

export type AdminSectionId = 'dashboard' | 'dishes' | 'menus' | 'delivery' | 'reports';

export interface AdminSection {
  id: AdminSectionId;
  label: string;
  icon: LucideIcon;
}

// Secciones del panel de administración, en el orden de la barra lateral
export const ADMIN_SECTIONS: AdminSection[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'dishes', label: 'Platos', icon: UtensilsCrossed },
  { id: 'menus', label: 'Menús Diarios', icon: CalendarDays },
  { id: 'delivery', label: 'Despacho', icon: Package },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
];

export const adminPath = (id: AdminSectionId) => (id === 'dashboard' ? '/admin' : `/admin?view=${id}`);

export const findAdminSection = (id: string | null): AdminSection =>
  ADMIN_SECTIONS.find((section) => section.id === id) ?? ADMIN_SECTIONS[0];
