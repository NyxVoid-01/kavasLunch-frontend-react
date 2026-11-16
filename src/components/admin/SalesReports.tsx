import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { CheckCircle, Clock, Download, Package, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { getReservationsReport, getSalesReport, type SalesGroup } from '@/services/admin';
import { getErrorMessage } from '@/lib/api';
import { exportReportToExcel } from '@/lib/exportReport';
import AdminToolbar from '@/components/admin/AdminToolbar';
import ReportReservationsCard, { ReportReservationsCardSkeleton } from '@/components/admin/reports/ReportReservationsCard';
import SalesChartCard, { SalesChartCardSkeleton } from '@/components/admin/reports/SalesChartCard';
import ChipGroup, { type ChipOption } from '@/components/ChipGroup';
import PaginationBar from '@/components/PaginationBar';
import StatCard, { StatCardSkeleton } from '@/components/StatCard';
import { ErrorState } from '@/components/StateMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ITEMS_PER_PAGE = 10;
const ISO = 'yyyy-MM-dd';

type Preset = 'today' | 'week' | 'month' | 'custom';

const PRESET_OPTIONS: ChipOption<Preset>[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'custom', label: 'Personalizado' },
];

const GROUP_OPTIONS: ChipOption<SalesGroup>[] = [
  { value: 'day', label: 'Por día' },
  { value: 'week', label: 'Por semana' },
  { value: 'month', label: 'Por mes' },
];

// Rango de fechas ('YYYY-MM-DD') de cada atajo
const presetRange = (preset: Exclude<Preset, 'custom'>): { from: string; to: string } => {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: format(now, ISO), to: format(now, ISO) };
    case 'week':
      return { from: format(startOfWeek(now, { weekStartsOn: 1 }), ISO), to: format(endOfWeek(now, { weekStartsOn: 1 }), ISO) };
    case 'month':
      return { from: format(startOfMonth(now), ISO), to: format(endOfMonth(now), ISO) };
  }
};

export default function SalesReports() {
  const [preset, setPreset] = useState<Preset>('month');
  const [range, setRange] = useState(() => presetRange('month'));
  const [groupBy, setGroupBy] = useState<SalesGroup>('day');
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const invalidRange = range.from > range.to;

  const sales = useQuery({
    queryKey: ['admin', 'sales-report', range.from, range.to, groupBy],
    queryFn: () => getSalesReport(range.from, range.to, groupBy),
    enabled: !invalidRange,
  });
  const report = useQuery({
    queryKey: ['admin', 'reservations-report', range.from, range.to],
    queryFn: () => getReservationsReport(range.from, range.to),
    enabled: !invalidRange,
  });

  const reservations = useMemo(() => report.data?.reservations ?? [], [report.data]);
  const totalPages = Math.max(1, Math.ceil(reservations.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = reservations.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const choosePreset = (next: Preset) => {
    setPreset(next);
    setCurrentPage(1);
    if (next !== 'custom') setRange(presetRange(next));
  };

  const changeDate = (key: 'from' | 'to', value: string) => {
    if (!value) return;
    setPreset('custom');
    setCurrentPage(1);
    setRange((prev) => ({ ...prev, [key]: value }));
  };

  const exportExcel = async () => {
    if (!report.data || !sales.data) return;
    setExporting(true);
    try {
      await exportReportToExcel({
        dateFrom: range.from,
        dateTo: range.to,
        groupBy,
        reservations: report.data.reservations,
        sales: sales.data.sales,
      });
      toast.success('Reporte exportado correctamente');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  const loading = !invalidRange && (sales.isLoading || report.isLoading);
  const failed = !invalidRange && (sales.isError || report.isError);
  const ready = !invalidRange && !!sales.data && !!report.data;
  const status = report.data?.status_breakdown;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Reportes de Ventas</h2>
          <p className="text-sm text-muted-foreground">Ingresos y reservas por período</p>
        </div>
        <Button variant="outline" className="h-10 font-semibold" onClick={exportExcel} disabled={!ready || exporting || reservations.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exportando...' : 'Exportar Excel'}
        </Button>
      </div>

      <AdminToolbar>
        <ChipGroup value={preset} options={PRESET_OPTIONS} onChange={choosePreset} ariaLabel="Período" />
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="report-from" className="text-sm font-medium">
            Desde
          </label>
          <Input id="report-from" type="date" value={range.from} onChange={(e) => changeDate('from', e.target.value)} className="w-auto" />
          <label htmlFor="report-to" className="text-sm font-medium">
            Hasta
          </label>
          <Input id="report-to" type="date" value={range.to} min={range.from} onChange={(e) => changeDate('to', e.target.value)} className="w-auto" />
        </div>
        <div className="flex basis-full">
          <ChipGroup value={groupBy} options={GROUP_OPTIONS} onChange={(value) => setGroupBy(value)} ariaLabel="Agrupar ventas" />
        </div>
        {invalidRange && (
          <p role="alert" className="basis-full text-sm font-medium text-destructive">
            La fecha «Desde» no puede ser posterior a «Hasta».
          </p>
        )}
      </AdminToolbar>

      {invalidRange ? null : failed ? (
        <ErrorState
          title="No se pudo cargar el reporte"
          onRetry={() => {
            sales.refetch();
            report.refetch();
          }}
        />
      ) : loading || !ready ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Cargando reporte">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <SalesChartCardSkeleton />
          <ReportReservationsCardSkeleton />
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Reservas" icon={Package} value={report.data.summary.total_reservations} caption="En el período seleccionado" />
            <StatCard
              title="Ingresos Totales"
              icon={TrendingUp}
              value={`S/ ${report.data.summary.total_revenue.toFixed(2)}`}
              caption={`${report.data.summary.counted_reservations} reservas vigentes o entregadas`}
              valueClassName="text-success"
            />
            <StatCard title="Pendientes" icon={Clock} value={status?.pending ?? 0} caption="Por entregar" valueClassName="text-warning" />
            <StatCard title="Entregados" icon={CheckCircle} value={status?.delivered ?? 0} caption="Completados" valueClassName="text-success" />
          </div>

          <SalesChartCard sales={sales.data.sales} groupBy={groupBy} />
          <ReportReservationsCard reservations={visible} total={reservations.length} />
          <PaginationBar page={page} totalPages={totalPages} onChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
