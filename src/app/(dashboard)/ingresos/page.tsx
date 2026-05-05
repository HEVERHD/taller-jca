import { prisma } from "@/lib/prisma";
import { format, startOfMonth, endOfMonth, lastDayOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { TrendingUp, ChevronRight, Banknote, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Periodo = "quincena1" | "quincena2" | "mes" | "mes_anterior";

function getPeriodRange(periodo: Periodo): { from: Date; to: Date; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (periodo) {
    case "quincena1":
      return {
        from: new Date(year, month, 1, 0, 0, 0),
        to: new Date(year, month, 15, 23, 59, 59),
        label: `1 – 15 de ${format(now, "MMMM yyyy", { locale: es })}`,
      };
    case "quincena2": {
      const last = lastDayOfMonth(now).getDate();
      return {
        from: new Date(year, month, 16, 0, 0, 0),
        to: new Date(year, month, last, 23, 59, 59),
        label: `16 – ${last} de ${format(now, "MMMM yyyy", { locale: es })}`,
      };
    }
    case "mes_anterior": {
      const prev = subMonths(now, 1);
      return {
        from: startOfMonth(prev),
        to: endOfMonth(prev),
        label: format(prev, "MMMM yyyy", { locale: es }),
      };
    }
    default:
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
        label: format(now, "MMMM yyyy", { locale: es }),
      };
  }
}

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);

export default async function IngresosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo = "mes" } = await searchParams;
  const { from, to, label } = getPeriodRange(periodo as Periodo);

  const servicios = await prisma.servicio.findMany({
    where: {
      fecha: { gte: from, lte: to },
      costoTotal: { not: null },
    },
    include: { vehiculo: { include: { cliente: true } } },
    orderBy: { fecha: "desc" },
  });

  const totalFacturado = servicios.reduce((s, r) => s + (r.costoTotal ?? 0), 0);
  const totalCobrado   = servicios.reduce((s, r) => s + (r.anticipo   ?? 0), 0);
  const totalPendiente = totalFacturado - totalCobrado;
  const pctCobrado     = totalFacturado > 0 ? Math.round((totalCobrado / totalFacturado) * 100) : 0;

  const periodos = [
    { key: "quincena1",   label: "Quincena 1 (1–15)"  },
    { key: "quincena2",   label: "Quincena 2 (16–fin)" },
    { key: "mes",         label: "Mes actual"          },
    { key: "mes_anterior",label: "Mes anterior"        },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ingresos</h1>
        <p className="text-sm text-muted-foreground mt-0.5 capitalize">{label}</p>
      </div>

      {/* Selector de período */}
      <div className="flex flex-wrap gap-2">
        {periodos.map((p) => (
          <Link
            key={p.key}
            href={`/ingresos?periodo=${p.key}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              periodo === p.key
                ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:border-orange-600 hover:text-white"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Total Facturado
            </p>
            <p className="text-2xl font-bold text-foreground leading-none">
              {formatCOP(totalFacturado)}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="pt-5 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Total Cobrado
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">
              {formatCOP(totalCobrado)}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">{pctCobrado}% del total</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="pt-5 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Saldo Pendiente
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 leading-none">
              {formatCOP(totalPendiente)}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">Por cobrar</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progreso de cobro */}
      {totalFacturado > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progreso de cobro</span>
            <span>{pctCobrado}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${pctCobrado}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de servicios */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base font-semibold text-foreground">
            Servicios del período
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {servicios.length === 0 ? (
            <div className="py-12 text-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay servicios con costo registrado en este período
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {servicios.map((s) => {
                const saldo = (s.costoTotal ?? 0) - (s.anticipo ?? 0);
                const pagado = saldo <= 0;
                return (
                  <Link
                    key={s.id}
                    href={`/servicios/${s.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        pagado
                          ? "bg-emerald-100 dark:bg-emerald-950/50"
                          : "bg-amber-100 dark:bg-amber-950/50"
                      )}>
                        {pagado
                          ? <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          : <Clock3   className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {s.vehiculo.marca} {s.vehiculo.modelo}
                          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                            {s.vehiculo.placa}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {s.vehiculo.cliente.nombre}
                          {" · "}
                          {format(new Date(s.fecha), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          {formatCOP(s.costoTotal ?? 0)}
                        </p>
                        {pagado ? (
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Pagado
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Debe {formatCOP(saldo)}
                          </p>
                        )}
                      </div>
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
