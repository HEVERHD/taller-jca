import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Users, Car, Wrench, Clock, CheckCircle2, AlertCircle, Plus, UserPlus, TrendingUp, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const estadoConfig = {
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50",
  },
  EN_PROCESO: {
    label: "En Proceso",
    className: "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50",
  },
  TERMINADO: {
    label: "Terminado",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50",
  },
} as const;

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);

export default async function DashboardPage() {
  const now = new Date();
  const mesDesde = new Date(now.getFullYear(), now.getMonth(), 1);
  const mesHasta = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    totalClientes,
    totalVehiculos,
    serviciosPorEstado,
    serviciosRecientes,
    ingresosDelMes,
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.vehiculo.count(),
    prisma.servicio.groupBy({ by: ["estado"], _count: { id: true } }),
    prisma.servicio.findMany({
      where: { estado: { not: "TERMINADO" } },
      include: { vehiculo: { include: { cliente: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.servicio.findMany({
      where: { fecha: { gte: mesDesde, lte: mesHasta }, costoTotal: { not: null } },
      select: { costoTotal: true, anticipo: true },
    }),
  ]);

  const pendientes = serviciosPorEstado.find((s) => s.estado === "PENDIENTE")?._count.id ?? 0;
  const enProceso = serviciosPorEstado.find((s) => s.estado === "EN_PROCESO")?._count.id ?? 0;
  const terminados = serviciosPorEstado.find((s) => s.estado === "TERMINADO")?._count.id ?? 0;
  const totalServicios = pendientes + enProceso + terminados;

  const mesFacturado  = ingresosDelMes.reduce((s, r) => s + (r.costoTotal ?? 0), 0);
  const mesCobrado    = ingresosDelMes.reduce((s, r) => s + (r.anticipo   ?? 0), 0);
  const mesPendiente  = mesFacturado - mesCobrado;

  return (
    <div className="space-y-7 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </p>
          <h1 className="text-2xl font-bold text-foreground leading-tight">Panel de Control</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumen general del taller</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/clientes/nuevo"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-border text-foreground hover:bg-muted shrink-0"
            )}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
            <span className="sm:hidden">Cliente</span>
          </Link>
          <Link
            href="/servicios/nuevo"
            className={cn(
              buttonVariants(),
              "bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-sm shadow-orange-200 shrink-0"
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nuevo Servicio</span>
            <span className="sm:hidden">Servicio</span>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Clientes" value={totalClientes} icon={Users} color="default" />
        <KpiCard title="Vehículos" value={totalVehiculos} icon={Car} color="blue" />
        <KpiCard title="Total Servicios" value={totalServicios} icon={Wrench} color="default" />
        <KpiCard title="En Proceso" value={enProceso} icon={Clock} color="yellow" />
      </div>

      {/* Status summary */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="p-4 sm:p-5 text-center">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400 leading-none">{pendientes}</p>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">Pendientes</p>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 leading-none">{enProceso}</p>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">En Proceso</p>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">{terminados}</p>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">Terminados</p>
          </div>
        </div>
      </div>

      {/* Resumen de ingresos del mes */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <CardTitle className="text-base font-semibold text-foreground">
                Ingresos este mes
              </CardTitle>
            </div>
            <Link
              href="/ingresos"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground text-xs gap-1"
              )}
            >
              Ver detalle
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Facturado
              </p>
              <p className="text-lg font-bold text-foreground leading-none">
                {formatCOP(mesFacturado)}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Cobrado
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                {formatCOP(mesCobrado)}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Pendiente
              </p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 leading-none">
                {formatCOP(mesPendiente)}
              </p>
            </div>
          </div>
          {mesFacturado > 0 && (
            <div className="px-4 pb-4">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.round((mesCobrado / mesFacturado) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active services */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Servicios Activos</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Órdenes pendientes y en proceso</p>
            </div>
            <Link
              href="/servicios"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground text-xs gap-1"
              )}
            >
              Ver todos
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {serviciosRecientes.length === 0 ? (
            <div className="py-12 text-center">
              <Wrench className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay servicios activos</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {serviciosRecientes.map((s) => {
                const cfg = estadoConfig[s.estado];
                return (
                  <Link
                    key={s.id}
                    href={`/servicios/${s.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                        <Car className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {s.vehiculo.marca} {s.vehiculo.modelo}
                          <span className="ml-1.5 text-muted-foreground font-normal text-xs">{s.vehiculo.placa}</span>
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {s.vehiculo.cliente.nombre}
                          {s.mecanicoAsignado && (
                            <span className="ml-1.5 text-foreground/70">· {s.mecanicoAsignado}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={cfg.className}>{cfg.label}</Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
