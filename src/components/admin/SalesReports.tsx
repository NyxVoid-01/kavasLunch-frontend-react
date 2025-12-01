import { useEffect, useState } from 'react';
import { getSalesReport, getAllReservations } from '@/services/admin';
import type { Reservation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, CheckCircle, Clock, Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight, BarChart3, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

export default function SalesReports() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReservations, setTotalReservations] = useState(0);
  const ITEMS_PER_PAGE = 10;
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange, currentPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to || dateRange.from, 'yyyy-MM-dd');

      // Get sales report from backend
      const salesData = await getSalesReport(startDate, endDate);
      
      // Get all reservations for detailed list
      const allReservations = await getAllReservations();
      
      // Asegurar que es un array
      const reservationsArray = Array.isArray(allReservations) ? allReservations : [];
      
      // Filter by date range
      const filteredReservations = reservationsArray.filter(r => {
        const resDate = new Date(r.reservation_date);
        return resDate >= dateRange.from && resDate <= (dateRange.to || dateRange.from);
      });

      setTotalReservations(filteredReservations.length);

      // Calculate stats
      const revenue = filteredReservations.reduce((sum, r) => {
        const price = typeof r.menu?.price === 'string' ? parseFloat(r.menu.price) : (r.menu?.price || 0);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);
      const pending = filteredReservations.filter(r => r.status === 'pending').length;
      const delivered = filteredReservations.filter(r => r.status === 'delivered').length;

      setStats({
        totalReservations: filteredReservations.length,
        totalRevenue: revenue,
        pendingOrders: pending,
        deliveredOrders: delivered,
      });

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE;
      setRecentReservations(filteredReservations.slice(from, to));
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (recentReservations.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const excelData = recentReservations.map(report => ({
      'Fecha': format(new Date(report.reservation_date), 'dd/MM/yyyy'),
      'Usuario': report.user?.full_name || report.user?.email || 'N/A',
      'Email': report.user?.email || 'N/A',
      'Estado': report.status === 'delivered' ? 'Entregado' : report.status === 'pending' ? 'Pendiente' : 'Cancelado',
      'Método de Pago': report.payment_method === 'yape' ? 'Yape/Plin' : report.payment_method === 'card' ? 'Tarjeta' : 'Efectivo',
      'Monto (S/)': typeof report.menu?.price === 'string' 
        ? parseFloat(report.menu.price).toFixed(2) 
        : report.menu?.price?.toFixed(2) || '0.00',
      'Código': report.pickup_code,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

    // Auto-width columns
    const maxWidth = 15;
    worksheet['!cols'] = Array(7).fill({ wch: maxWidth });

    const fileName = `reporte_ventas_${format(dateRange.from, 'ddMMyyyy')}_${format(dateRange.to || dateRange.from, 'ddMMyyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Reporte exportado correctamente');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>;
      case 'delivered':
        return <Badge className="bg-success text-success-foreground">Entregado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando reportes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reportes de Ventas</h2>
        
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                      {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "dd MMM yyyy", { locale: es })
                  )
                ) : (
                  <span>Seleccionar rango</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range: any) => setDateRange(range)}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>

          <Button 
            onClick={handleExportExcel} 
            variant="outline"
            disabled={recentReservations.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">S/ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Por entregar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Entregados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reservas del Periodo</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {Math.ceil(totalReservations / ITEMS_PER_PAGE)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalReservations / ITEMS_PER_PAGE), prev + 1))}
              disabled={currentPage >= Math.ceil(totalReservations / ITEMS_PER_PAGE)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReservations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay reservas en este período</p>
            ) : (
              recentReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                  <div>
                    <p className="font-semibold">{reservation.user?.full_name || reservation.user?.email || 'Usuario'}</p>
                    <p className="text-sm text-muted-foreground">
                      Código: {reservation.pickup_code} | 
                      {format(new Date(reservation.created_at), " d 'de' MMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-primary">
                      S/ {typeof reservation.menu?.price === 'string' 
                        ? parseFloat(reservation.menu.price).toFixed(2) 
                        : reservation.menu?.price?.toFixed(2) || '0.00'}
                    </p>
                    {getStatusBadge(reservation.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
