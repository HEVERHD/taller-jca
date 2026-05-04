import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Plus, Gauge, User, Wrench } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { EstadoServicio } from "@/generated/prisma/enums";

const estadoConfig: Record<EstadoServicio, { label: string; className: string }> = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-950/60 text-amber-400 border border-amber-800/40" },
  EN_PROCESO: { label: "En Proceso", className: "bg-blue-950/60 text-blue-400 border border-blue-800/40" },
  TERMINADO: { label: "Terminado", className: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" },
};

export default async function VehiculoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id },
    include: {
      cliente: true,
      servicios: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vehiculo) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/vehiculos"
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              {vehiculo.marca} {vehiculo.modelo}
            </h1>
            <p className="text-sm text-zinc-500">Placa: {vehiculo.placa}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/servicios/nuevo?vehiculoId=${id}`}
            className={cn(buttonVariants({ size: "sm" }), "bg-orange-500 hover:bg-orange-600 text-white border-0")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Servicio
          </Link>
          <Link
            href={`/vehiculos/${id}/editar`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Link>
        </div>
      </div>

      {/* Info */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-6">
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
            <div className="flex items-center gap-2 text-zinc-400">
              <Wrench className="w-4 h-4 text-zinc-400" />
              <span>{vehiculo.servicios.length} servicio{vehiculo.servicios.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Historial de Servicios</h2>
        {vehiculo.servicios.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-10 text-center text-zinc-400">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              <p>No hay servicios registrados para este vehículo</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {vehiculo.servicios.map((s) => (
              <Card key={s.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold line-clamp-1">
                        {s.diagnostico}
                      </CardTitle>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {format(s.fecha, "d MMM yyyy", { locale: es })} · {s.mecanicoAsignado}
                      </p>
                    </div>
                    <Badge className={`shrink-0 ${estadoConfig[s.estado].className}`}>
                      {estadoConfig[s.estado].label}
                    </Badge>
                  </div>
                </CardHeader>
                {s.trabajoRealizado && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-zinc-400">{s.trabajoRealizado}</p>
                  </CardContent>
                )}
                <CardContent className="pt-0 pb-3">
                  <Link
                    href={`/servicios/${s.id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs h-7")}
                  >
                    Ver detalle →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
