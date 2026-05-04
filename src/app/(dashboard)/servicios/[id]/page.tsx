import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, Car, User, Gauge, Wrench, Calendar, DollarSign, TrendingDown } from "lucide-react";
import { StatusBadge } from "@/components/servicios/status-badge";
import { StatusChanger } from "@/components/servicios/status-changer";
import { PagoRapido } from "@/components/servicios/pago-rapido";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn, formatCOP } from "@/lib/utils";

export default async function ServicioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const servicio = await prisma.servicio.findUnique({
    where: { id },
    include: {
      vehiculo: { include: { cliente: true } },
    },
  });

  if (!servicio) notFound();

  const { vehiculo } = servicio;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/servicios"
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100">Orden de Servicio</h1>
              <StatusBadge estado={servicio.estado} />
            </div>
            <p className="text-sm text-zinc-500">
              {format(servicio.fecha, "d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <Link
          href={`/servicios/${id}/editar`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Link>
      </div>

      {/* Vehicle + client info */}
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-zinc-400">
            Vehículo
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <Car className="w-4 h-4 text-zinc-400" />
              <span className="font-medium">
                {vehiculo.marca} {vehiculo.modelo}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="font-mono bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-sm font-semibold text-zinc-200">
                {vehiculo.placa}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-4 h-4 text-zinc-400" />
              <Link href={`/clientes/${vehiculo.clienteId}`} className="hover:underline">
                {vehiculo.cliente.nombre}
              </Link>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Gauge className="w-4 h-4 text-zinc-400" />
              <span>{vehiculo.kilometraje.toLocaleString()} km</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service detail */}
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-zinc-400">
            Detalles del Servicio
          </h2>

          <div className="flex items-center gap-2 text-zinc-300">
            <Wrench className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Mecánico: {servicio.mecanicoAsignado}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>Ingreso: {format(servicio.fecha, "EEEE d 'de' MMMM yyyy", { locale: es })}</span>
          </div>

          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
              Diagnóstico
            </p>
            <p className="text-zinc-300 bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-sm leading-relaxed">
              {servicio.diagnostico}
            </p>
          </div>

          {servicio.trabajoRealizado && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                Trabajo Realizado
              </p>
              <p className="text-zinc-300 bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-sm leading-relaxed">
                {servicio.trabajoRealizado}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial info */}
      {(servicio.costoTotal != null || servicio.anticipo != null) && (
        <Card className="shadow-sm border-orange-800/30">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-zinc-400">
              Información Financiera
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {servicio.costoTotal != null && (
                <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-zinc-400" />
                    <p className="text-xs text-zinc-500 font-medium">Costo del Arreglo</p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-100">
                    {formatCOP(servicio.costoTotal)}
                  </p>
                </div>
              )}
              {servicio.anticipo != null && (
                <div className="bg-orange-950/30 border border-orange-800/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-orange-400" />
                    <p className="text-xs text-orange-400 font-medium">Anticipo</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-400">
                    {formatCOP(servicio.anticipo)}
                  </p>
                  {servicio.costoTotal != null && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Saldo: <span className="text-zinc-300 font-medium">{formatCOP(servicio.costoTotal - servicio.anticipo)}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {servicio.costoTotal != null && (
              <PagoRapido
                servicioId={id}
                costoTotal={servicio.costoTotal}
                anticipo={servicio.anticipo}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Status management */}
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-zinc-400">
            Cambiar Estado
          </h2>
          <StatusChanger servicioId={id} estadoActual={servicio.estado} />
        </CardContent>
      </Card>
    </div>
  );
}
