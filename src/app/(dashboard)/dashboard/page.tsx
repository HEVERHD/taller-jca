import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Users, Car, Wrench, Clock, CheckCircle2, AlertCircle, Plus, ChevronRight } from "lucide-react";
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

export default async function DashboardPage() {
  const [
    totalClientes,
    totalVehiculos,
    serviciosPorEstado,
    serviciosRecientes,
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
  ]);

  const pendientes = serviciosPorEstado.find((s) => s.estado === "PENDIENTE")?._count.id ?? 0;
  const enProceso = serviciosPorEstado.find((s) => s.estado === "EN_PROCESO")?._count.id ?? 0;
  const terminados = serviciosPorEstado.find((s) => s.estado === "TERMINADO")?._count.id ?? 0;
  const totalServicios = pendientes + enProceso + terminados;

  return (
    <div className="space-y-7 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
            {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </p>
          <h1 className="text-2xl font-bold text-zinc-100 leading-tight">Panel de Control</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Resumen general del taller</p>
        </div>
        <Link
          href="/servicios/nuevo"
          className={cn(
            buttonVariants(),
            "bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-sm shadow-orange-200 shrink-0"
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Link>
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
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 leading-none">{pendientes}</p>
            <p className="text-xs text-zinc-400 mt-1.5 font-medium">Pendientes</p>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 leading-none">{enProceso}</p>
            <p className="text-xs text-zinc-400 mt-1.5 font-medium">En Proceso</p>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 leading-none">{terminados}</p>
            <p className="text-xs text-zinc-400 mt-1.5 font-medium">Terminados</p>
          </div>
        </div>
      </div>

      {/* Active services */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-zinc-100">Servicios Activos</CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">Órdenes pendientes y en proceso</p>
            </div>
            <Link
              href="/servicios"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-zinc-500 hover:text-zinc-100 text-xs gap-1"
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
              <Wrench className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No hay servicios activos</p>
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
                        <Car className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate">
                          {s.vehiculo.marca} {s.vehiculo.modelo}
                          <span className="ml-1.5 text-zinc-400 font-normal text-xs">{s.vehiculo.placa}</span>
                        </p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {s.vehiculo.cliente.nombre}
                          {s.mecanicoAsignado && (
                            <span className="ml-1.5 text-zinc-300">· {s.mecanicoAsignado}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={cfg.className}>{cfg.label}</Badge>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
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
