import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Eye, Monitor, ShieldCheck } from 'lucide-react';
import { ADMIN_SECTIONS, adminPath, type AdminSection } from '@/components/admin/adminSections';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const NAV_ITEM = 'flex items-center gap-2.5 rounded-xl px-3 h-10 text-sm font-medium transition-colors';

// Marco del panel de administración: barra lateral fija con la sección actual resaltada y ruta de migas
export default function AdminLayout({ active, children }: { active: AdminSection; children: ReactNode }) {
  return (
    <div className="grid gap-6 items-start lg:grid-cols-[220px_1fr]">
      <aside className="sticky top-24">
        <Card className="border-2 border-primary/20 p-2">
          <p className="flex items-center gap-2 px-3 pt-2 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Administración
          </p>
          <nav aria-label="Secciones de administración" className="space-y-0.5">
            {ADMIN_SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = id === active.id;
              return (
                <Link
                  key={id}
                  to={adminPath(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    NAV_ITEM,
                    isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-2" />

          <Link to="/menus/user" className={cn(NAV_ITEM, 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
            <Eye className="w-4 h-4" />
            Ver menús
          </Link>
        </Card>
      </aside>

      <div className="min-w-0 space-y-4">
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/admin" className="hover:text-primary hover:underline">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-foreground">{active.label}</span>
        </nav>
        {children}
      </div>
    </div>
  );
}

// El panel de administración solo está disponible en escritorio (ERS 2.4)
export function DesktopOnlyNotice() {
  return (
    <Card className="mx-auto max-w-md border-2 border-dashed p-8 text-center">
      <Monitor className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
      <h1 className="text-lg font-semibold">El panel de administración es solo para escritorio</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ábrelo desde una computadora o amplía la ventana del navegador.</p>
      <Button asChild variant="outline" className="mt-5">
        <Link to="/menus/user">Ver menús</Link>
      </Button>
    </Card>
  );
}
